import { queryPg, hasPostgresDb } from '@/lib/db/pg-client';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { detectLanguage, inferTopic } from './ai-learning';

export interface UserProfileMemory {
  id: string; // sessionId o ID de cliente
  name?: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  preferredLanguage: 'es' | 'en' | 'pt' | 'fr' | 'other';
  productsOfInterest: string[];
  estimatedVolume?: string;
  targetPortOrIncoterm?: string;
  qualificationStage:
    | 'lead_nuevo'
    | 'interes_producto'
    | 'cualificacion_tecnica'
    | 'listo_para_mesa_negocios'
    | 'escalado_humano';
  conversationStyle: 'ejecutivo' | 'tecnico' | 'directo' | 'cordial';
  firstSeenAt: string;
  lastInteractionAt: string;
  interactionCount: number;
  notes: string[];
}

const MEMORIES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'ai-user-memories.json');

/**
 * Asegura la creación de la tabla ai_user_memories en PostgreSQL si existe conexión
 */
let dbTableEnsured = false;
async function ensureDbTable(): Promise<void> {
  if (dbTableEnsured || !hasPostgresDb()) return;
  try {
    await queryPg(`
      CREATE TABLE IF NOT EXISTS ai_user_memories (
        id VARCHAR(120) PRIMARY KEY,
        name VARCHAR(255),
        company VARCHAR(255),
        role VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(100),
        preferred_language VARCHAR(20) DEFAULT 'es',
        products_of_interest JSONB DEFAULT '[]'::jsonb,
        estimated_volume VARCHAR(150),
        target_port_incoterm VARCHAR(150),
        qualification_stage VARCHAR(60) DEFAULT 'lead_nuevo',
        conversation_style VARCHAR(60) DEFAULT 'ejecutivo',
        first_seen_at TIMESTAMPTZ DEFAULT NOW(),
        last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
        interaction_count INT DEFAULT 1,
        notes JSONB DEFAULT '[]'::jsonb,
        raw_profile JSONB
      );
    `);
    dbTableEnsured = true;
  } catch (err) {
    console.warn('[AI User Memory] No se pudo asegurar la tabla PostgreSQL:', err);
  }
}

/**
 * Lee todas las memorias guardadas en archivo JSON (modo local)
 */
async function readLocalMemories(): Promise<Record<string, UserProfileMemory>> {
  try {
    if (!existsSync(MEMORIES_FILE_PATH)) {
      return {};
    }
    const data = await readFile(MEMORIES_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Escribe las memorias en archivo JSON
 */
async function writeLocalMemories(memories: Record<string, UserProfileMemory>): Promise<void> {
  try {
    await writeFile(MEMORIES_FILE_PATH, JSON.stringify(memories, null, 2), 'utf-8');
  } catch (err) {
    console.error('[AI User Memory] Error escribiendo ai-user-memories.json:', err);
  }
}

/**
 * Obtiene el perfil de memoria de un usuario/sesión
 */
export async function getUserMemory(sessionId: string): Promise<UserProfileMemory | null> {
  if (!sessionId) return null;

  if (hasPostgresDb()) {
    try {
      await ensureDbTable();
      const res = await queryPg(
        `SELECT raw_profile FROM ai_user_memories WHERE id = $1 LIMIT 1`,
        [sessionId]
      );
      if (res && res.rows && res.rows.length > 0 && res.rows[0].raw_profile) {
        return res.rows[0].raw_profile as UserProfileMemory;
      }
    } catch (err) {
      console.warn('[AI User Memory] Error leyendo de Postgres, usando JSON:', err);
    }
  }

  const local = await readLocalMemories();
  return local[sessionId] || null;
}

/**
 * Guarda o actualiza el perfil de memoria de un usuario
 */
export async function saveUserMemory(profile: UserProfileMemory): Promise<void> {
  if (!profile || !profile.id) return;

  // 1. Guardar en JSON local
  try {
    const local = await readLocalMemories();
    local[profile.id] = profile;
    await writeLocalMemories(local);
  } catch (err) {
    console.error('[AI User Memory] Error guardando en local:', err);
  }

  // 2. Guardar en PostgreSQL si está disponible
  if (hasPostgresDb()) {
    try {
      await ensureDbTable();
      await queryPg(
        `INSERT INTO ai_user_memories (
          id, name, company, role, email, phone, preferred_language,
          products_of_interest, estimated_volume, target_port_incoterm,
          qualification_stage, conversation_style, first_seen_at,
          last_interaction_at, interaction_count, notes, raw_profile
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          company = EXCLUDED.company,
          role = EXCLUDED.role,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          preferred_language = EXCLUDED.preferred_language,
          products_of_interest = EXCLUDED.products_of_interest,
          estimated_volume = EXCLUDED.estimated_volume,
          target_port_incoterm = EXCLUDED.target_port_incoterm,
          qualification_stage = EXCLUDED.qualification_stage,
          conversation_style = EXCLUDED.conversation_style,
          last_interaction_at = EXCLUDED.last_interaction_at,
          interaction_count = EXCLUDED.interaction_count,
          notes = EXCLUDED.notes,
          raw_profile = EXCLUDED.raw_profile;`,
        [
          profile.id,
          profile.name || null,
          profile.company || null,
          profile.role || null,
          profile.email || null,
          profile.phone || null,
          profile.preferredLanguage,
          JSON.stringify(profile.productsOfInterest || []),
          profile.estimatedVolume || null,
          profile.targetPortOrIncoterm || null,
          profile.qualificationStage,
          profile.conversationStyle,
          profile.firstSeenAt,
          profile.lastInteractionAt,
          profile.interactionCount,
          JSON.stringify(profile.notes || []),
          JSON.stringify(profile),
        ]
      );
    } catch (err) {
      console.warn('[AI User Memory] Error sincronizando con PostgreSQL:', err);
    }
  }
}

/**
 * Analiza el mensaje recibido y extrae entidades del prospecto para enriquecer su perfil
 */
export async function extractAndEnrichMemory(
  sessionId: string,
  userMessage: string,
  existingProfile?: UserProfileMemory | null
): Promise<UserProfileMemory> {
  const now = new Date().toISOString();
  const current: UserProfileMemory = existingProfile || {
    id: sessionId,
    preferredLanguage: detectLanguage(userMessage),
    productsOfInterest: [],
    qualificationStage: 'lead_nuevo',
    conversationStyle: 'ejecutivo',
    firstSeenAt: now,
    lastInteractionAt: now,
    interactionCount: 0,
    notes: [],
  };

  current.lastInteractionAt = now;
  current.interactionCount += 1;
  current.preferredLanguage = detectLanguage(userMessage);

  const text = userMessage.trim();
  const lower = text.toLowerCase();

  // 1. Detección de Nombre
  if (!current.name) {
    const nameMatch =
      text.match(/(?:mi nombre es|me llamo|soy|habla)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i) ||
      text.match(/(?:my name is|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      const detectedName = nameMatch[1].trim();
      if (!['Invest', 'Oil', 'Oli', 'Hola', 'Buenos', 'Buenas'].includes(detectedName)) {
        current.name = detectedName;
      }
    }
  }

  // 2. Detección de Empresa / Organización
  if (!current.company) {
    const companyMatch =
      text.match(/(?:de la empresa|de la compañía|represento a|de parte de|en)\s+([A-Z0-9ÁÉÍÓÚÑ][\w\s&.-]{2,30}?)(?=[,.\n]|\s+y\s|\s+para\s|$)/i) ||
      text.match(/(?:from company|with|at|representing)\s+([A-Z0-9][\w\s&.-]{2,30}?)(?=[,.\n]|\s+and\s|\s+for\s|$)/i);
    if (companyMatch && companyMatch[1]) {
      const comp = companyMatch[1].trim();
      if (!comp.toLowerCase().includes('invest oil') && comp.length >= 3) {
        current.company = comp;
      }
    }
  }

  // 3. Detección de Correo Electrónico
  if (!current.email) {
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    if (emailMatch) {
      current.email = emailMatch[0].toLowerCase();
    }
  }

  // 4. Detección de Teléfono / WhatsApp
  if (!current.phone) {
    const phoneMatch = text.match(/(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
    if (phoneMatch && phoneMatch[0].length >= 8) {
      current.phone = phoneMatch[0].trim();
    }
  }

  // 5. Productos de interés comercial
  const productPatterns: { name: string; regex: RegExp }[] = [
    { name: 'Diésel EN590 10PPM', regex: /\b(en590|en-590|diesel 10|diésel 10|ulsd)\b/i },
    { name: 'Jet Fuel A-1 (Aviation Kerosene)', regex: /\b(jet a1|jet a-1|jet fuel|aviation kerosene)\b/i },
    { name: 'Crudo Merey 16 / Blend', regex: /\b(merey|merey 16|crudo pesado|heavy crude)\b/i },
    { name: 'Crudo Ligero / Brent / WTI', regex: /\b(brent|wti|light crude|crudo ligero)\b/i },
    { name: 'Petroleum Coke (Coque de Petróleo)', regex: /\b(coque|pet coke|petcoke|anodo|ánodo)\b/i },
    { name: 'Virgin Fuel Oil D6 / M100', regex: /\b(d6|fuel oil|m100|virgin fuel)\b/i },
  ];

  for (const p of productPatterns) {
    if (p.regex.test(lower) && !current.productsOfInterest.includes(p.name)) {
      current.productsOfInterest.push(p.name);
    }
  }

  // 6. Volúmenes solicitados
  const volMatch = text.match(/(\d{1,3}(?:[.,]\d{3})*|\d+)\s*(?:mt|toneladas|tonnes|metric tons|bbl|barriles|barrels|galones|gallons)\b/i);
  if (volMatch) {
    current.estimatedVolume = volMatch[0].trim();
  }

  // 7. Puertos / Incoterms
  const incotermMatch = text.match(/\b(fob|cif|tto|cfr|rotterdam|houston|fujairah|singapore|jurong|panama|algeciras)\b/gi);
  if (incotermMatch) {
    const terms = Array.from(new Set(incotermMatch.map((t) => t.toUpperCase()))).join(' / ');
    current.targetPortOrIncoterm = terms;
  }

  // 8. Etapas de cualificación (Setter Comercial B2B)
  if (
    lower.includes('contrato') ||
    lower.includes('spa') ||
    lower.includes('icpo') ||
    lower.includes('bcl') ||
    lower.includes('comprar') ||
    lower.includes('purchase') ||
    lower.includes('precio') ||
    lower.includes('quote')
  ) {
    if (current.productsOfInterest.length > 0 && current.estimatedVolume) {
      current.qualificationStage = 'listo_para_mesa_negocios';
    } else if (current.productsOfInterest.length > 0) {
      current.qualificationStage = 'cualificacion_tecnica';
    } else {
      current.qualificationStage = 'interes_producto';
    }
  }

  // Guardar cambios persistentes
  await saveUserMemory(current);

  return current;
}

/**
 * Construye las directivas de Setter Comercial B2B personalizadas con la memoria del usuario
 */
export function buildSetterInstructionPrompt(profile?: UserProfileMemory | null): string {
  if (!profile) {
    return `
--- ROL DE SETTER COMERCIAL B2B (INVEST OIL LLC) ---
Actúas como "Oli", el setter comercial B2B inteligente de Invest Oil LLC.
Tu objetivo relacional es:
1. Dar una bienvenida cordial y profesional en el mismo idioma en que te escriban.
2. Identificar el perfil del interlocutor: nombre, empresa y si es comprador final o mandatario autorizado.
3. Cualificar la necesidad: producto (EN590 10ppm, Jet A-1, Merey 16, Pet Coke), volumen estimado, puerto de entrega o Incoterm (FOB / CIF).
4. Explicar los procedimientos estándar de la empresa: emisión de ICPO bancarizada corporativa con BCL/RWA, verificación KYC/AML y emisión de FCO.
5. Cuando el prospecto esté calificado o requiera iniciar una negociación de precios, contratos (SPA), regalías o comisiones: escalar educadamente indicando que remita sus datos y documentación oficial a la mesa de negocios en business@investoil.es.
`.trim();
  }

  const clientInfoParts: string[] = [];
  if (profile.name) clientInfoParts.push(`Nombre del interlocutor: ${profile.name}`);
  if (profile.company) clientInfoParts.push(`Empresa: ${profile.company}`);
  if (profile.email) clientInfoParts.push(`Email registrado: ${profile.email}`);
  if (profile.productsOfInterest.length > 0) {
    clientInfoParts.push(`Productos de interés: ${profile.productsOfInterest.join(', ')}`);
  }
  if (profile.estimatedVolume) {
    clientInfoParts.push(`Volumen estimado: ${profile.estimatedVolume}`);
  }
  if (profile.targetPortOrIncoterm) {
    clientInfoParts.push(`Puerto / Incoterm: ${profile.targetPortOrIncoterm}`);
  }
  clientInfoParts.push(`Etapa de cualificación: ${profile.qualificationStage}`);

  return `
--- MEMORIA ACTIVA DEL CLIENTE (INTERACCIÓN #${profile.interactionCount}) ---
${clientInfoParts.join('\n')}

--- DIRECTIVAS DE SETTER COMERCIAL B2B PARA ESTA CONVERSACIÓN ---
1. Trato personalizado: Si conoces su nombre (${profile.name || 'el cliente'}), salúdalo amablemente por su nombre o empresa. Mantén coherencia con lo conversado previamente sin hacerlo repetir información básica.
2. Nutrición y cualificación: Si aún no ha especificado volumen o puerto de entrega (FOB o CIF), pregúntaselo con elegancia ejecutiva.
3. Protocolo de cierre: Si el prospecto ya tiene definido producto y volumen o solicita cotizaciones, términos de pago o borrador de contrato (SPA): indícale con precisión que el procedimiento oficial de Invest Oil LLC requiere la emisión de una ICPO corporativa bancarizada con BCL a nombre de Invest Oil LLC dirigida a la mesa de negocios comercial: business@investoil.es, donde un directivo humano formalizará la operación.
4. Idioma: Responde siempre en el idioma del interlocutor (${profile.preferredLanguage.toUpperCase()}).
`.trim();
}
