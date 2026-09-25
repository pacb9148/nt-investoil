import { getAiSettings } from './ai-service';
import { ConfiguredModelItem } from './ai-types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function resolveApiKey(model: ConfiguredModelItem): string {
  if (model.apiKey && model.apiKey.trim().length > 0) {
    return model.apiKey.trim();
  }
  const pid = (model.providerId || '').toLowerCase();
  if (pid === 'openrouter') return process.env.OPENROUTER_API_KEY || '';
  if (pid === 'anthropic') return process.env.ANTHROPIC_API_KEY || '';
  if (pid === 'openai') return process.env.OPENAI_API_KEY || '';
  if (pid === 'deepseek') return process.env.DEEPSEEK_API_KEY || '';
  if (pid === 'nvidia') return process.env.NVIDIA_API_KEY || '';
  if (pid === 'google-ai-studio' || pid === 'gemini') return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (pid === 'groq') return process.env.GROQ_API_KEY || '';
  if (pid === 'mistral') return process.env.MISTRAL_API_KEY || '';
  if (pid === 'together') return process.env.TOGETHER_API_KEY || '';
  return '';
}

async function callSingleModel(
  model: ConfiguredModelItem & { effectiveApiKey: string },
  messages: ChatMessage[],
  fullSystemPrompt: string
): Promise<string> {
  const timeoutMs = 12000; // 12s de espera máxima por proveedor
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (model.apiStyle === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'x-api-key': model.effectiveApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: model.modelName || 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: fullSystemPrompt,
          messages: messages.filter((m) => m.role !== 'system').map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 150)}`);
      }

      const data = await res.json();
      if (data.content && data.content[0]?.text) {
        return data.content[0].text;
      }
      throw new Error('Respuesta vacía de Anthropic');
    }

    if (model.apiStyle === 'gemini') {
      const modelName = model.modelName || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${model.effectiveApiKey}`;
      
      const userText = messages
        .filter((m) => m.role !== 'system')
        .map((m) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
        .join('\n\n');

      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: fullSystemPrompt }] },
          contents: [{ parts: [{ text: userText }] }],
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 150)}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
      throw new Error('Respuesta vacía de Gemini');
    }

    // OpenAI-compatible (OpenRouter, OpenAI, DeepSeek, Nvidia, Groq, Mistral, Together, Ollama, etc.)
    const baseUrl = model.baseUrl || 'https://api.openai.com/v1';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${model.effectiveApiKey}`,
    };
    if (model.providerId === 'openrouter') {
      headers['HTTP-Referer'] = 'https://investoil.es';
      headers['X-Title'] = 'Invest Oil LLC Assistant';
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify({
        model: model.modelName,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages.filter((m) => m.role !== 'system'),
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 150)}`);
    }

    const data = await res.json();
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    throw new Error('Respuesta vacía de proveedor compatible con OpenAI');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function executeAiChat(messages: ChatMessage[]): Promise<string> {
  const settings = await getAiSettings();
  const models = settings.models || [];

  // Construir el prompt de sistema enriquecido con la Base de Conocimiento y FAQs de entrenamiento
  const systemPromptChunks: string[] = [settings.systemPrompt || ''];

  if (settings.knowledgeBase && settings.knowledgeBase.trim()) {
    systemPromptChunks.push(
      `--- BASE DE CONOCIMIENTO CORPORATIVA Y ESPECIFICACIONES ---\n${settings.knowledgeBase.trim()}`
    );
  }

  if (Array.isArray(settings.trainingFaqs) && settings.trainingFaqs.length > 0) {
    const faqsText = settings.trainingFaqs
      .filter((f) => f.question && f.answer)
      .map((f, i) => `[Ejemplo ${i + 1}]\nPregunta: ${f.question}\nRespuesta oficial: ${f.answer}`)
      .join('\n\n');
    if (faqsText) {
      systemPromptChunks.push(
        `--- PREGUNTAS FRECUENTES Y RESPUESTAS ENTRENADAS (SÉ FIEL A ESTAS RESPUESTAS) ---\n${faqsText}`
      );
    }
  }

  const fullSystemPrompt = systemPromptChunks.filter(Boolean).join('\n\n');

  // Ordenar los modelos para la cascada:
  // El modelo activo (isActiveEngine o activeModelId) tiene prioridad 1; luego el resto de los disponibles
  const candidateModels = [...models];
  const primaryIndex = candidateModels.findIndex(
    (m) => m.isActiveEngine || m.id === settings.activeModelId
  );
  let orderedModels: ConfiguredModelItem[] = [];
  if (primaryIndex !== -1) {
    const [primary] = candidateModels.splice(primaryIndex, 1);
    orderedModels = [primary, ...candidateModels];
  } else {
    orderedModels = candidateModels;
  }

  // Filtrar modelos que tengan clave de API configurada (en el modelo o en variables de entorno)
  const availableModels = orderedModels
    .map((m) => ({ ...m, effectiveApiKey: resolveApiKey(m) }))
    .filter((m) => m.effectiveApiKey.length > 0 && m.status !== 'inactive');

  // CASCADA DE SALTO ENTRE MODELOS DISPONIBLES:
  // Si un modelo falla, salta de inmediato al siguiente modelo disponible hasta obtener respuesta
  if (availableModels.length > 0) {
    for (let i = 0; i < availableModels.length; i++) {
      const model = availableModels[i];
      try {
        console.log(`[AI Failover] Probando modelo [${i + 1}/${availableModels.length}]: ${model.providerName} (${model.modelName})`);
        const reply = await callSingleModel(model, messages, fullSystemPrompt);
        if (reply && reply.trim().length > 0) {
          console.log(`[AI Failover] Éxito con proveedor: ${model.providerName} (${model.modelName})`);
          return cleanMarkdownResponse(reply);
        }
      } catch (err: any) {
        console.warn(
          `[AI Failover] Falló modelo "${model.providerName} (${model.modelName})": ${err.message}. Saltando al siguiente modelo disponible...`
        );
      }
    }
  }

  // Última línea de defensa infalible: Base de Conocimiento oficial calibrada (nunca falla)
  console.log('[AI Failover] Activando contingencia de Base de Conocimiento Corporativa...');
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const rawReply = generateKnowledgeBaseResponse(lastUserMessage, settings);
  return cleanMarkdownResponse(rawReply);
}

/**
 * Limpia caracteres de markdown crudo (asteriscos de negrita excesivos, numerales de encabezados)
 * para presentar una respuesta limpia, fluida y legible en la ventana de chat del orbe.
 */
export function cleanMarkdownResponse(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '') // Quitar # de títulos
    .replace(/\*\*(.*?)\*\*/g, '$1') // Quitar **negrita**
    .replace(/\*(.*?)\*/g, '$1') // Quitar *cursiva*
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1') // Quitar _subrayado_
    .replace(/^>\s+/gm, '') // Quitar blockquotes
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // Quitar backticks de código
    .replace(/\n{3,}/g, '\n\n') // Normalizar saltos de línea
    .trim();
}

function generateKnowledgeBaseResponse(query: string, settings?: any): string {
  const q = query.toLowerCase().trim();
  const isEn = /\b(who|what|where|how|when|why|price|pricing|deal|negotiat|team|director|executive|leadership|buy|purchase|sell|supplier|contact|office|address|commission|fee|royalty|discount|procedure)\b/i.test(query);

  // 1. EVALUAR COINCIDENCIA CON PREGUNTAS ENTRENADAS (trainingFaqs)
  if (settings && Array.isArray(settings.trainingFaqs)) {
    for (const faq of settings.trainingFaqs) {
      if (!faq.question || !faq.answer) continue;
      const faqQ = faq.question.toLowerCase().trim();
      if (q === faqQ || q.includes(faqQ) || faqQ.includes(q)) {
        return faq.answer;
      }
      const queryTokens = q.split(/\s+/).filter((w: string) => w.length > 3);
      const faqTokens = faqQ.split(/\s+/).filter((w: string) => w.length > 3);
      if (queryTokens.length > 0 && faqTokens.length > 0) {
        const shared = queryTokens.filter((token: string) => faqTokens.includes(token));
        const matchRatio = shared.length / Math.min(queryTokens.length, faqTokens.length);
        if (matchRatio >= 0.6) {
          return faq.answer;
        }
      }
    }
  }

  // 2. ESCALAMIENTO OBLIGATORIO A HUMANO: NEGOCIACIÓN, PRECIOS, COMISIONES Y REGALÍAS
  if (
    q.includes('negociar') ||
    q.includes('negociacion') ||
    q.includes('negociación') ||
    q.includes('precio') ||
    q.includes('cotiz') ||
    q.includes('descuento') ||
    q.includes('comision') ||
    q.includes('comisión') ||
    q.includes('comisiones') ||
    q.includes('regalia') ||
    q.includes('regalía') ||
    q.includes('regalias') ||
    q.includes('regalías') ||
    q.includes('ncnda') ||
    q.includes('imfpa') ||
    q.includes('cerrar trato') ||
    q.includes('acuerdo') ||
    q.includes('price') ||
    q.includes('pricing') ||
    q.includes('negotiat') ||
    q.includes('discount') ||
    q.includes('commission') ||
    q.includes('royalt') ||
    q.includes('deal')
  ) {
    if (isEn) {
      return `Pricing, commercial agreements, commissions, and contractual terms are strictly negotiated and finalized by our executive directors. As an AI assistant, I am not authorized to set prices or commit commercial terms.\n\nPlease submit your corporate profile and formal request to trading@investoil.es or complete our website contact form at https://investoil.es/#contact so an executive officer can assist you directly.`;
    }
    return `Como asistente virtual no tengo autorización para fijar precios, pactar comisiones de intermediación, acordar regalías ni cerrar acuerdos comerciales. Dichas materias son gestionadas exclusivamente por nuestros directores comerciales.\n\nLe invitamos a remitir el perfil de su empresa y requerimiento a trading@investoil.es o a través del formulario de contacto oficial en https://investoil.es/#contact para que un ejecutivo comercial le atienda de manera directa.`;
  }

  // 3. AUTORIDADES Y CONSEJO DIRECTIVO
  if (
    q.includes('autoridad') ||
    q.includes('autoridades') ||
    q.includes('directiv') ||
    q.includes('directores') ||
    q.includes('consejo') ||
    q.includes('dueño') ||
    q.includes('dueno') ||
    q.includes('ceo') ||
    q.includes('liderazgo') ||
    q.includes('quienes mandan') ||
    q.includes('quien dirige') ||
    q.includes('quién dirige') ||
    q.includes('quien lidera') ||
    q.includes('quién lidera') ||
    q.includes('rufino') ||
    q.includes('villalobos') ||
    q.includes('team') ||
    q.includes('leadership') ||
    q.includes('executive') ||
    q.includes('board')
  ) {
    if (isEn) {
      return `Invest Oil LLC is led by an executive board comprising:\n- Rufino Antonio Villalobos: CEO & Managing Director.\n- Dr. Marcus Vance: Chief Operating Officer (COO).\n- Elena Rostova: Chief Financial Officer (CFO).\n- Carlos Mendoza: VP Maritime Logistics.\n- Sarah Jenkins: Chief Compliance Officer (KYC/AML).\n- Ahmad Al-Mansoor: Senior Advisor (MENA Markets).`;
    }
    return `Invest Oil LLC cuenta con un consejo directivo encabezado por:\n- Rufino Antonio Villalobos: Director Ejecutivo / CEO & Managing Director.\n- Dr. Marcus Vance: Director de Operaciones Globales (COO).\n- Elena Rostova: Directora de Finanzas & Riesgo (CFO).\n- Carlos Mendoza: Vicepresidente de Logística Marítima.\n- Sarah Jenkins: Directora de Cumplimiento & KYC (CCO).\n- Ahmad Al-Mansoor: Asesor Senior de Mercados MENA.`;
  }

  // 4. PROCEDIMIENTO PARA INICIAR RELACIONES COMERCIALES / COMPRAS
  if (
    q.includes('procedimiento') ||
    q.includes('como comprar') ||
    q.includes('cómo comprar') ||
    q.includes('requisito') ||
    q.includes('requisitos') ||
    q.includes('iniciar relacion') ||
    q.includes('iniciar relación') ||
    q.includes('empezar a trabajar') ||
    q.includes('pasos para') ||
    q.includes('icpo') ||
    q.includes('onboarding') ||
    q.includes('procedure') ||
    q.includes('how to buy') ||
    q.includes('how to start') ||
    q.includes('requirements')
  ) {
    if (isEn) {
      return `To establish commercial relations with Invest Oil LLC, the standard procedure is:\n1. Submit an Irrevocable Corporate Purchase Order (ICPO) with banking coordinates.\n2. Pass KYC/AML corporate vetting led by our Compliance Department.\n3. Provide financial verification (Bank Comfort Letter - BCL or Proof of Funds - POF).\n4. Receive Full Corporate Offer (FCO) and draft contract (SPA) with independent inspection (SGS/Saybolt).\n\nFormal inquiries are processed via trading@investoil.es or our contact form.`;
    }
    return `El procedimiento oficial para iniciar operaciones comerciales con Invest Oil LLC comprende:\n1. Emisión de una Orden Corporativa Irrevocable (ICPO) membretada con coordenadas bancarias.\n2. Evaluación y debida diligencia de cumplimiento normativo (KYC / AML).\n3. Verificación de solvencia financiera (Bank Comfort Letter - BCL o POF).\n4. Emisión de oferta corporativa (FCO) y contrato de compraventa (SPA) con inspección independiente (SGS o Saybolt).\n\nLas solicitudes se procesan formalmente a través de trading@investoil.es o nuestro formulario web.`;
  }

  // 5. IDENTIDAD CORPORATIVA Y JURISDICCIÓN (DELAWARE USA)
  if (
    q.includes('delaware') ||
    q.includes('valencia') ||
    q.includes('inmobiliaria') ||
    q.includes('homonimo') ||
    q.includes('homónimo') ||
    q.includes('jurisdiccion') ||
    q.includes('jurisdicción') ||
    q.includes('legal')
  ) {
    if (isEn) {
      return `Invest Oil LLC is an international energy trading and logistics firm incorporated and registered under the laws of the State of Delaware, United States of America. Global operations are coordinated from Houston (USA), Madrid (Spain), and Bogotá (Colombia). The company has no relationship with real estate entities or dissolved local firms in Valencia, Spain.`;
    }
    return `Invest Oil LLC es una firma internacional de trading y logística de hidrocarburos constituida y registrada bajo las leyes del Estado de Delaware, Estados Unidos de América. Nuestras operaciones globales se coordinan desde Houston (EE. UU.), Madrid (España) y Bogotá (Colombia). La empresa no posee ningún vínculo con entidades inmobiliarias ni sociedades de Valencia (España).`;
  }

  // 6. UBICACIÓN, SEDES Y CONTACTO
  if (
    q.includes('ubicacion') ||
    q.includes('ubicación') ||
    q.includes('donde estan') ||
    q.includes('dónde están') ||
    q.includes('donde queda') ||
    q.includes('oficina') ||
    q.includes('sedes') ||
    q.includes('sede') ||
    q.includes('direccion') ||
    q.includes('dirección') ||
    q.includes('telefono') ||
    q.includes('teléfono') ||
    q.includes('contacto') ||
    q.includes('houston') ||
    q.includes('madrid') ||
    q.includes('bogota') ||
    q.includes('bogotá') ||
    q.includes('location') ||
    q.includes('where are') ||
    q.includes('headquarters') ||
    q.includes('address')
  ) {
    if (isEn) {
      return `Invest Oil LLC has its registered legal headquarters in Delaware, USA, and coordinates global commercial operations from Houston (Global HQ), Madrid (European Desk), and Bogotá (Latin America Desk).\n\nFor executive inquiries, please complete our contact form at https://investoil.es/#contact or email trading@investoil.es.`;
    }
    return `Invest Oil LLC cuenta con sede legal registrada en Delaware (EE. UU.) y coordina sus operaciones comerciales globales desde Houston (Sede Global), Madrid (European Desk) y Bogotá (Latin America Desk).\n\nPara coordinar reuniones ejecutivas o consultas formales, le invitamos a utilizar el formulario de contacto en https://investoil.es/#contact o escribir a trading@investoil.es.`;
  }

  // 7. PRODUCTOS ESPECÍFICOS
  if (q.includes('diésel') || q.includes('diesel') || q.includes('en590')) {
    if (isEn) {
      return `We supply Ultra Low Sulfur Diesel (ULSD) EN590 10 ppm (cetane > 51) for spot deliveries and annual long-term contracts (LTR) under FOB and CIF terms, backed by independent SGS/Saybolt inspection.`;
    }
    return `Comercializamos Diésel Ultra Bajo Azufre (ULSD) EN590 10 ppm (cetano > 51) en operaciones Spot y contratos anuales (LTR) bajo términos FOB y CIF, respaldados por certificación SGS o Saybolt.`;
  }

  if (q.includes('jet') || q.includes('a1') || q.includes('a-1') || q.includes('aviation') || q.includes('aviacion') || q.includes('aviación')) {
    if (isEn) {
      return `We facilitate Aviation Kerosene Colonial Grade 54 (Jet Fuel A-1) complying with ASTM D1655 international standards for commercial aviation under secure FOB and CIF logistics.`;
    }
    return `Facilitamos asignaciones de Aviation Kerosene Colonial Grade 54 (Jet Fuel A-1) bajo estándar internacional ASTM D1655 para aviación comercial en terminales FOB e itinerarios marítimos CIF.`;
  }

  if (q.includes('pet coke') || q.includes('coque')) {
    if (isEn) {
      return `Invest Oil LLC supplies Green Petroleum Coke (Anode Grade for aluminum smelting and Fuel Grade for cement manufacturing) with high calorific value and controlled sulfur parameters.`;
    }
    return `Suministramos Coque de Petróleo Verde (Pet Coke) grado ánodo para aluminio y grado combustible para la industria cementera, con alto poder calorífico y bajo contenido de azufre.`;
  }

  if (q.includes('merey') || q.includes('crudo') || q.includes('crude') || q.includes('brent') || q.includes('wti')) {
    if (isEn) {
      return `We manage scheduled shipments of heavy Merey 16 crude (16° API) for deep conversion refineries, as well as reference light crudes (Brent Blend and WTI) with indexation to international benchmarks.`;
    }
    return `Gestionamos cargamentos programados de crudo pesado Merey 16 (16° API) para refinerías de conversión profunda, así como crudos ligeros referenciales (Brent Blend y WTI) indexados a marcadores oficiales.`;
  }

  // 8. PETICIÓN EXPLÍCITA DE EXTENDER / MÁS INFORMACIÓN
  if (
    q.includes('extender') ||
    q.includes('ampliar') ||
    q.includes('mas info') ||
    q.includes('más info') ||
    q.includes('detallar') ||
    q.includes('detalles') ||
    q.includes('more details') ||
    q.includes('elaborate') ||
    q.includes('expand')
  ) {
    if (isEn) {
      return `Invest Oil LLC specializes in comprehensive physical energy trading and logistics. Key operational capabilities include:\n- Products: ULSD EN590 10 ppm, Jet A-1 (ASTM D1655), Merey 16, Brent, Pet Coke, VLSFO, and LNG.\n- Global Desks: Houston (Texas), Madrid (Spain), and Bogotá (Colombia).\n- Logistics: Ship-to-ship (STS) transfers, chartering of VLCC/Aframax tankers, and bonded port storage in Rotterdam, Houston, and Fujairah.\n- Compliance: Full adherence to IMO 2020 low-sulfur mandates and stringent international AML/OFAC sanctions screenings.`;
    }
    return `Invest Oil LLC se especializa en la facilitación integral y logística de commodities energéticos físicos. Nuestras capacidades clave comprenden:\n- Catálogo: Diésel EN590 10 ppm, Jet A-1 (ASTM D1655), Crudo Merey 16, Brent, Pet Coke, VLSFO y GNL.\n- Desks operativos: Houston (Texas), Madrid (España) y Bogotá (Colombia).\n- Logística: Transferencias buque a buque (STS), fletamento de tanqueros VLCC/Aframax y almacenamiento en terminales estratégicas (Rotterdam, Houston, Fujairah).\n- Compliance: Cumplimiento riguroso de la normativa marítima IMO 2020 y protocolos de verificación AML/OFAC.`;
  }

  // DEFAULT CONCISO
  if (isEn) {
    return `Welcome to Invest Oil LLC — Petroleum and Derivates Markets.\n\nWe are a Delaware (USA) registered firm facilitating international transactions in crude oil and refined petroleum products (EN590 Diesel, Jet Fuel A-1, Merey 16, Brent, Pet Coke, and LNG).\n\nHow may we assist your commercial or technical inquiries today?`;
  }

  return `Bienvenido a Invest Oil LLC — Petroleum and Derivates Markets.\n\nSomos una firma registrada en Delaware (EE. UU.) facilitadora en el mercado internacional de crudo y derivados del petróleo (Diésel EN590, Jet Fuel A-1, Merey 16, Brent, Pet Coke y GNL).\n\n¿En qué especificación o consulta operativa podemos asistirle hoy?`;
}
