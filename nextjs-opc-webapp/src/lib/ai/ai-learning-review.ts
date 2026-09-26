import type { LearnedExperienceItem } from './ai-types';

// Historial particular: si se conoce quién es el usuario, la experiencia nunca se fusiona ni se borra.
export function isIdentifiedExperience(exp: LearnedExperienceItem): boolean {
  return Boolean(exp.userName || exp.userCompany || exp.userEmail);
}

const STOPWORDS = new Set([
  'que', 'los', 'las', 'del', 'con', 'una', 'uno', 'por', 'para', 'como', 'donde', 'cual', 'cuales', 'quien',
  'este', 'esta', 'esto', 'son', 'ser', 'hay', 'nos', 'les', 'mas', 'muy', 'pero', 'sus', 'ustedes', 'puedo',
  'the', 'and', 'for', 'you', 'can', 'how', 'what', 'where', 'are', 'your', 'with', 'from', 'this', 'that',
  'hola', 'buenas', 'favor', 'quiero', 'quisiera', 'necesito', 'dame', 'dime',
]);

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Palabras significativas de una consulta (sin acentos, stopwords ni plurales simples). */
export function significantTokens(text: string): Set<string> {
  const tokens = stripAccents(text.toLowerCase())
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
    .map((t) => (t.length > 4 && t.endsWith('s') ? t.slice(0, -1) : t));
  return new Set(tokens);
}

export function querySimilarity(a: string, b: string): number {
  const ta = significantTokens(a);
  const tb = significantTokens(b);
  if (ta.size < 2 || tb.size < 2) return stripAccents(a.toLowerCase()).trim() === stripAccents(b.toLowerCase()).trim() ? 1 : 0;
  let common = 0;
  ta.forEach((t) => {
    if (tb.has(t)) common++;
  });
  const union = ta.size + tb.size - common;
  return common / union;
}

const SIMILARITY_THRESHOLD = 0.55;

export interface ReviewCluster {
  topic: string;
  language: string;
  members: LearnedExperienceItem[];
}

export interface ReviewPlan {
  clusters: ReviewCluster[];
  /** Experiencias que se conservan tal cual (identificadas, únicas, manuales). */
  untouched: number;
  mergedCount: number;
}

/**
 * Agrupa las experiencias anónimas redundantes (mismo tema e idioma y consultas casi iguales).
 * Las de usuarios identificados y las notas manuales quedan fuera: no se tocan.
 */
export function planExperienceReview(experiences: LearnedExperienceItem[]): ReviewPlan {
  const candidates = experiences.filter(
    (e) =>
      !isIdentifiedExperience(e) &&
      e.status === 'approved' &&
      (e.source === 'user_interaction' || e.source === 'consolidated')
  );

  const clusters: ReviewCluster[] = [];
  for (const exp of candidates) {
    const home = clusters.find(
      (c) =>
        c.topic === exp.topic &&
        c.language === exp.language &&
        c.members.some((m) => querySimilarity(m.userQuery, exp.userQuery) >= SIMILARITY_THRESHOLD)
    );
    if (home) home.members.push(exp);
    else clusters.push({ topic: exp.topic, language: exp.language, members: [exp] });
  }

  const redundant = clusters.filter((c) => c.members.length > 1);
  const mergedCount = redundant.reduce((n, c) => n + c.members.length, 0);
  return { clusters: redundant, untouched: experiences.length - mergedCount, mergedCount };
}

const short = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 3)}...` : s);

/** Une un grupo redundante en una sola experiencia consolidada y su línea para la base de conocimiento. */
export function consolidateCluster(cluster: ReviewCluster): { experience: LearnedExperienceItem; kbLine: string } {
  // Representante: la formulación más repetida; a igualdad, la más reciente.
  const sorted = [...cluster.members].sort(
    (a, b) => (b.occurrences ?? 1) - (a.occurrences ?? 1) || b.createdAt.localeCompare(a.createdAt)
  );
  const rep = sorted[0];
  const total = cluster.members.reduce((n, m) => n + (m.occurrences ?? 1), 0);
  const variants = Array.from(
    new Set(cluster.members.flatMap((m) => [m.userQuery, ...(m.variants || [])]).filter((q) => q !== rep.userQuery))
  ).slice(0, 8);
  const lastSeenAt = cluster.members
    .map((m) => m.lastSeenAt || m.createdAt)
    .sort()
    .pop() as string;

  const insight = `Consulta recurrente [${cluster.topic}] (${total} veces, ${variants.length + 1} formulaciones): "${short(rep.userQuery, 140)}". Respuesta oficial: ${short(rep.replySummary, 220)}`;

  return {
    experience: {
      id: `exp-cons-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: cluster.members.map((m) => m.createdAt).sort()[0],
      lastSeenAt,
      userQuery: rep.userQuery,
      replySummary: rep.replySummary,
      topic: cluster.topic,
      language: cluster.language,
      insight,
      status: 'approved',
      source: 'consolidated',
      occurrences: total,
      variants,
    },
    kbLine: `- ${insight}`,
  };
}
