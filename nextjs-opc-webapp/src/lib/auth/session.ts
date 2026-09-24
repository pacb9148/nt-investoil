export const ADMIN_COOKIE_NAME = 'investoil_admin_session';

export interface AdminSession {
  email: string;
  role: string;
  name: string;
  createdAt: number;
  expiresAt: number;
}

// Credenciales oficiales de administración de Invest Oil LLC
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@investoil.es';
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'InvestOil2026!*';

// Clave secreta para firmar/verificar sesión
const SESSION_SECRET = process.env.SESSION_SECRET || 'investoil-llc-super-secure-production-jwt-token-2026-sha256';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function toBase64Url(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64url');
  }
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(base64url: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64url, 'base64url').toString('utf8');
  }
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

export function encodeSessionToken(session: AdminSession): string {
  const json = JSON.stringify(session);
  const base64 = toBase64Url(json);
  const signature = simpleHash(`${base64}.${SESSION_SECRET}`);
  return `${base64}.${signature}`;
}

export function decodeSessionToken(token: string): AdminSession | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64, signature] = parts;
  const expectedSig = simpleHash(`${base64}.${SESSION_SECRET}`);
  if (signature !== expectedSig) return null;

  try {
    const json = fromBase64Url(base64);
    const session: AdminSession = JSON.parse(json);
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null; // Expirado
    }
    return session;
  } catch {
    return null;
  }
}
