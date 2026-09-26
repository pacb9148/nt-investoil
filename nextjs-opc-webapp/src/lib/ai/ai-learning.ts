import { getAiSettings, saveAiSettings } from './ai-service';
import { LearnedExperienceItem, TrainingFaqItem } from './ai-types';

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
export async function processInteractionForLearning(userQuery: string, agentReply: string): Promise<void> {
  try {
    const settings = await getAiSettings();

    // Solo aprender si el modo continuo está activo (por defecto sí)
    if (settings.enableContinuousLearning === false) return;

    const trimmedQuery = userQuery.trim();
    if (trimmedQuery.length < 5) return;

    const existingExperiences = settings.learnedExperiences || [];

    // Evitar duplicados casi idénticos
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const queryNorm = norm(trimmedQuery);
    const isDuplicate = existingExperiences.some((exp) => norm(exp.userQuery) === queryNorm);
    if (isDuplicate) return;

    const language = detectLanguage(trimmedQuery);
    const topic = inferTopic(trimmedQuery);
    const insight = extractInsight(trimmedQuery, agentReply, topic);

    const newExperience: LearnedExperienceItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      userQuery: trimmedQuery,
      replySummary: agentReply.length > 200 ? `${agentReply.slice(0, 197)}...` : agentReply,
      topic,
      language,
      insight,
      status: 'approved', // Auto-aprobado para enriquecer la memoria proactiva
      source: 'user_interaction',
    };

    // Mantener un historial de las últimas 50 experiencias más relevantes
    const updatedExperiences = [newExperience, ...existingExperiences].slice(0, 50);

    await saveAiSettings({
      ...settings,
      learnedExperiences: updatedExperiences,
    });

    console.log(`[Oli Learning] Nueva experiencia aprendida incorporada con éxito [Tema: ${topic}, Idioma: ${language}]`);
  } catch (err) {
    console.error('[Oli Learning] Error procesando aprendizaje continuo:', err);
  }
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

    const updatedExperiences = [newExp, ...(settings.learnedExperiences || [])].slice(0, 50);

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
