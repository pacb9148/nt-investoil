import { cookies } from 'next/headers';
import type { Language } from './translations';

/** Idioma elegido por el visitante (cookie NEXT_LOCALE que fija el selector); español por defecto. */
export function getServerLanguage(): Language {
  try {
    return cookies().get('NEXT_LOCALE')?.value === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}
