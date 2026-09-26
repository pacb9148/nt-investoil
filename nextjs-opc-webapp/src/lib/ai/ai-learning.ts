import { getAiSettings, saveAiSettings } from './ai-service';
import { LearnedExperienceItem, TrainingFaqItem } from './ai-types';
import { consolidateCluster, isIdentifiedExperience, planExperienceReview } from './ai-learning-review';

// Con una tabla filtrable y la auto-revisión, 50 se quedaba corto: se perdía historial útil.
export const MAX_LEARNED_EXPERIENCES = 500;
// La auto-revisión se lanza sola al acumular tantas experiencias anónimas sin fusionar…
const AUTO_REVIEW_MIN_CANDIDATES = 30;
// …y como mucho una vez cada tantas horas.
const AUTO_REVIEW_MIN_HOURS = 6;

export interface LearningIdentity {
  sessionId?: string;
  name?: string;
  company?: string;
  email?: string;
}

/** Al superar el tope se descartan primero las anónimas más antiguas: el historial particular se protege. */
function trimExperiences(list: LearnedExperienceItem[]): LearnedExperienceItem[] {
  let excess = list.length - MAX_LEARNED_EXPERIENCES;
  if (excess <= 0) return list;
  const dropIds = new Set<string>();
  const oldestFirst = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const e of oldestFirst) {
    if (excess <= 0) break;
    if (!isIdentifiedExperience(e) && e.source !== 'manual_training') {
      dropIds.add(e.id);
      excess--;
    }
  }
  return list.filter((e) => !dropIds.has(e.id)).slice(0, MAX_LEARNED_EXPERIENCES);
}

/**
 * Detector heurístico de idioma para interacciones de Oli
 */
export function detectLanguage(text: string): 'es' | 'en' | 'pt' | 'fr' | 'other' {
  const lower = text.toLowerCase();
  
  // Inglés
  if (
    /\b(the|is|are|you|can|how|what|where|price|barrel|purchase|buyer|seller|delivery|fuel|oil|crude|procedure|terms)\b/.test(
      lower
    )
  ) {
    return 'en';
  }

  // Portugués
  if (
    /\b(voce|você|para|como|onde|comprar|oleo|óleo|combustivel|combustível|preco|preço|empresa|navio|porto)\b/.test(
      lower
    )
  ) {
    return 'pt';
  }

  // Francés
  if (
    /\b(le|la|les|pourquoi|comment|prix|carburant|petrole|pétrole|achat|vendeur|livraison|bureau)\b/.test(
      lower
    )
  ) {
    return 'fr';
  }

  // Español por defecto
  return 'es';
}

/**
 * Clasificador temático de consultas petroleras
 */
export function inferTopic(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('en590') || lower.includes('diesel') || lower.includes('diésel') || lower.includes('ulsd')) {
    return 'Diésel EN590 / ULSD';
  }
  if (lower.includes('jet') || lower.includes('a-1') || lower.includes('aviac') || lower.includes('astm')) {
    return 'Jet Fuel A-1 (Aviation)';
  }
  if (lower.includes('merey') || lower.includes('brent') || lower.includes('crudo') || lower.includes('crude')) {
    return 'Crudos (Merey / Brent)';
  }
  if (lower.includes('coque') || lower.includes('coke') || lower.includes('pet coke') || lower.includes('anodo') || lower.includes('ánodo')) {
    return 'Pet Coke (Coque)';
  }
  if (lower.includes('icpo') || lower.includes('procedimiento') || lower.includes('kyc') || lower.includes('bcl') || lower.includes('fco') || lower.includes('spa')) {
    return 'Procedimiento Comercial / ICPO';
  }
  if (lower.includes('barco') || lower.includes('tanquero') || lower.includes('vlcc') || lower.includes('sts') || lower.includes('flete') || lower.includes('maritim')) {
    return 'Logística Marítima / STS';
  }
  if (lower.includes('precio') || lower.includes('price') || lower.includes('comisi') || lower.includes('descuento') || lower.includes('discount') || lower.includes('trato') || lower.includes('ncnda')) {
    return 'Escalamiento Comercial / Precios';
  }
  if (lower.includes('sede') || lower.includes('donde') || lower.includes('oficina') || lower.includes('houston') || lower.includes('madrid') || lower.includes('bogota') || lower.includes('bogotá') || lower.includes('delaware')) {
    return 'Identidad & Sedes Corporativas';
  }
  if (lower.includes('autoridad') || lower.includes('director') || lower.includes('ceo') || lower.includes('quienes') || lower.includes('quiénes') || lower.includes('villalobos')) {
    return 'Gobierno Corporativo / Directiva';
  }

  return 'Consultas Generales de Mercado';
}

/**
 * Sintetiza un aprendizaje o concepto clave a partir de la interacción
 */
function extractInsight(query: string, reply: string, topic: string): string {
  const querySummary = query.length > 90 ? `${query.slice(0, 87)}...` : query;
  return `Consulta sobre [${topic}]: "${querySummary}". Oli respondió conforme a la base oficial, afianzando la claridad institucional sobre requerimientos técnicos y escalamiento comercial.`;
}

/**
 * Procesa en segundo plano una interacción para alimentar la memoria de Oli
 */
export async function processInteractionForLearning(
  userQuery: string,
  agentReply: string,
  identity: LearningIdentity = {}
): Promise<void> {
  try {
    const settings = await getAiSettings();

    // Solo aprender si el modo continuo está activo (por defecto sí)
    if (settings.enableContinuousLearning === false) return;

    const trimmedQuery = userQuery.trim();
    if (trimmedQuery.length < 5) return;

    const existingExperiences = settings.learnedExperiences || [];
    const identified = Boolean(identity.name || identity.company || identity.email);

    // Misma consulta del mismo usuario (o de cualquier anónimo): no se duplica, se cuenta.
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const queryNorm = norm(trimmedQuery);
    const duplicate = existingExperiences.find(
      (exp) =>
        norm(exp.userQuery) === queryNorm &&
        (identified ? exp.sessionId === identity.sessionId : !isIdentifiedExperience(exp))
    );
    if (duplicate) {
      const now = new Date().toISOString();
      await saveAiSettings({
        ...settings,
        learnedExperiences: existingExperiences.map((e) =>
          e.id === duplicate.id ? { ...e, occurrences: (e.occurrences ?? 1) + 1, lastSeenAt: now } : e
        ),
      });
      return;
    }

    const language = detectLanguage(trimmedQuery);
    const topic = inferTopic(trimmedQuery);
    const insight = extractInsight(trimmedQuery, agentReply, topic);
    const now = new Date().toISOString();

    const newExperience: LearnedExperienceItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      lastSeenAt: now,
      userQuery: trimmedQuery,
      replySummary: agentReply.length > 200 ? `${agentReply.slice(0, 197)}...` : agentReply,
      topic,
      language,
      insight,
      status: 'approved', // Auto-aprobado para enriquecer la memoria proactiva
      source: 'user_interaction',
      occurrences: 1,
      ...(identity.sessionId ? { sessionId: identity.sessionId } : {}),
      ...(identity.name ? { userName: identity.name } : {}),
      ...(identity.company ? { userCompany: identity.company } : {}),
      ...(identity.email ? { userEmail: identity.email } : {}),
    };

    await saveAiSettings({
      ...settings,
      learnedExperiences: trimExperiences([newExperience, ...existingExperiences]),
    });

    console.log(`[Oli Learning] Nueva experiencia aprendida incorporada con éxito [Tema: ${topic}, Idioma: ${language}]`);

    await maybeAutoReview();
  } catch (err) {
    console.error('[Oli Learning] Error procesando aprendizaje continuo:', err);
  }
}

export interface ReviewSummary {
  dryRun: boolean;
  /** Experiencias redundantes que se fusionan. */
  mergedCount: number;
  /** Conceptos consolidados resultantes. */
  conceptsCount: number;
  /** Líneas nuevas añadidas a la base de conocimiento. */
  kbAdded: number;
  /** Experiencias que se conservan (historial particular, notas manuales y consultas únicas). */
  untouched: number;
  concepts: Array<{ topic: string; representative: string; occurrences: number; members: number }>;
  knowledgeBase?: string;
}

const KB_HEADER = 'CONCEPTOS APRENDIDOS Y EXPERIENCIAS CLAVE DE TRADING:';

/**
 * Auto-revisión de la memoria de Oli: funde en conceptos consolidados las consultas anónimas
 * redundantes y vuelca lo importante a la base de conocimiento. No toca el historial de usuarios
 * identificados ni las notas manuales. Con `dryRun` solo calcula lo que haría.
 */
export async function runExperienceReview(options: { dryRun?: boolean } = {}): Promise<ReviewSummary> {
  const dryRun = options.dryRun === true;
  const settings = await getAiSettings();
  const experiences = settings.learnedExperiences || [];
  const plan = planExperienceReview(experiences);
  const consolidated = plan.clusters.map(consolidateCluster);

  let knowledgeBase = settings.knowledgeBase || '';
  let kbAdded = 0;
  const newLines: string[] = [];
  for (const { experience, kbLine } of consolidated) {
    // Idempotente: si la consulta ya figura en la base de conocimiento no se repite.
    if (!knowledgeBase.includes(`"${experience.userQuery.slice(0, 60)}`)) {
      newLines.push(kbLine);
      kbAdded++;
    }
  }

  const summary: ReviewSummary = {
    dryRun,
    mergedCount: plan.mergedCount,
    conceptsCount: consolidated.length,
    kbAdded,
    untouched: plan.untouched,
    concepts: consolidated.map(({ experience }) => ({
      topic: experience.topic,
      representative: experience.userQuery,
      occurrences: experience.occurrences ?? 1,
      members: (experience.variants?.length ?? 0) + 1,
    })),
  };
  if (dryRun) return summary;

  if (newLines.length > 0) {
    knowledgeBase = knowledgeBase.includes(KB_HEADER)
      ? `${knowledgeBase.trimEnd()}\n${newLines.join('\n')}\n`
      : `${knowledgeBase.trimEnd()}\n\n${KB_HEADER}\n${newLines.join('\n')}\n`;
  }

  const mergedIds = new Set(plan.clusters.flatMap((c) => c.members.map((m) => m.id)));
  const kept = experiences.filter((e) => !mergedIds.has(e.id));
  const previous = settings.learningReview;

  await saveAiSettings({
    ...settings,
    knowledgeBase,
    learnedExperiences: [...consolidated.map((c) => c.experience), ...kept],
    learningReview: {
      lastRunAt: new Date().toISOString(),
      lastMergedCount: plan.mergedCount,
      lastConceptsCount: consolidated.length,
      lastKbAdded: kbAdded,
      totalRuns: (previous?.totalRuns ?? 0) + 1,
    },
  });

  return { ...summary, knowledgeBase };
}

/** Lanza la auto-revisión sola cuando se acumulan suficientes consultas anónimas sin fusionar. */
async function maybeAutoReview(): Promise<void> {
  const settings = await getAiSettings();
  const last = settings.learningReview?.lastRunAt;
  if (last && Date.now() - new Date(last).getTime() < AUTO_REVIEW_MIN_HOURS * 3600 * 1000) return;

  const candidates = (settings.learnedExperiences || []).filter(
    (e) => !isIdentifiedExperience(e) && e.source === 'user_interaction' && e.status === 'approved'
  );
  if (candidates.length < AUTO_REVIEW_MIN_CANDIDATES) return;

  const plan = planExperienceReview(settings.learnedExperiences || []);
  if (plan.clusters.length === 0) return;
  await runExperienceReview();
}

/**
 * Promueve una experiencia aprendida a Pregunta Frecuente Oficial (Training FAQ)
 */
export async function promoteExperienceToFaq(
  experienceId: string,
  customAnswer?: string
): Promise<{ success: boolean; newFaq?: TrainingFaqItem; error?: string }> {
  try {
    const settings = await getAiSettings();
    const experiences = settings.learnedExperiences || [];
    const target = experiences.find((e) => e.id === experienceId);

    if (!target) {
      return { success: false, error: 'Experiencia no encontrada' };
    }

    const newFaq: TrainingFaqItem = {
      id: `faq-learned-${Date.now()}`,
      question: target.userQuery,
      answer: customAnswer || target.replySummary,
      category: target.topic,
    };

    const updatedFaqs = [...(settings.trainingFaqs || []), newFaq];
    const updatedExperiences = experiences.map((e) =>
      e.id === experienceId ? { ...e, status: 'approved' as const } : e
    );

    await saveAiSettings({
      ...settings,
      trainingFaqs: updatedFaqs,
      learnedExperiences: updatedExperiences,
    });

    return { success: true, newFaq };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al promover experiencia a FAQ' };
  }
}

/**
 * Incorpora un concepto o experiencia a la Base de Conocimiento de Oli
 */
export async function addExperienceToKnowledgeBase(
  experienceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAiSettings();
    const experiences = settings.learnedExperiences || [];
    const target = experiences.find((e) => e.id === experienceId);

    if (!target) {
      return { success: false, error: 'Experiencia no encontrada' };
    }

    const currentKb = settings.knowledgeBase || '';
    const sectionHeader = '\n\nCONCEPTOS APRENDIDOS Y EXPERIENCIAS CLAVE DE TRADING:\n';
    const bullet = `- [${target.topic}]: ${target.insight}\n`;

    let updatedKb = currentKb;
    if (updatedKb.includes('CONCEPTOS APRENDIDOS Y EXPERIENCIAS CLAVE DE TRADING:')) {
      updatedKb += bullet;
    } else {
      updatedKb += sectionHeader + bullet;
    }

    const updatedExperiences = experiences.map((e) =>
      e.id === experienceId ? { ...e, status: 'approved' as const } : e
    );

    await saveAiSettings({
      ...settings,
      knowledgeBase: updatedKb,
      learnedExperiences: updatedExperiences,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al incorporar a Base de Conocimiento' };
  }
}

/**
 * Permite registrar manualmente una experiencia o nota de trading
 */
export async function addManualExperience(
  data: Omit<LearnedExperienceItem, 'id' | 'createdAt'>
): Promise<{ success: boolean; item?: LearnedExperienceItem; error?: string }> {
  try {
    const settings = await getAiSettings();
    const newExp: LearnedExperienceItem = {
      id: `exp-man-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...data,
    };

    const updatedExperiences = trimExperiences([newExp, ...(settings.learnedExperiences || [])]);

    await saveAiSettings({
      ...settings,
      learnedExperiences: updatedExperiences,
    });

    return { success: true, item: newExp };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al guardar experiencia manual' };
  }
}

/**
 * Elimina una experiencia aprendida
 */
export async function deleteLearnedExperience(
  experienceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAiSettings();
    const filtered = (settings.learnedExperiences || []).filter((e) => e.id !== experienceId);

    await saveAiSettings({
      ...settings,
      learnedExperiences: filtered,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar experiencia' };
  }
}

/**
 * Elimina varias experiencias de una vez (selección múltiple de la tabla)
 */
export async function deleteLearnedExperiences(
  ids: string[]
): Promise<{ success: boolean; deleted?: number; error?: string }> {
  try {
    const settings = await getAiSettings();
    const remove = new Set(ids);
    const before = settings.learnedExperiences || [];
    const filtered = before.filter((e) => !remove.has(e.id));

    await saveAiSettings({ ...settings, learnedExperiences: filtered });

    return { success: true, deleted: before.length - filtered.length };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar experiencias' };
  }
}
