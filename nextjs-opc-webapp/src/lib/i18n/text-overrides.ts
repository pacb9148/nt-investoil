import { translations, type Language, type TranslationDictionary } from './translations';

export const TEXT_OVERRIDES_SECTION = 'text_overrides';

// Un texto personalizado puede ser cadena vacía (el dueño quiso vaciarlo); `null` solo viaja del admin a la
// API para pedir que se borre la personalización y vuelva el texto original.
export type TextOverrides = Partial<Record<Language, Record<string, string | null>>>;

export interface TextCatalogItem {
  /** Ruta dentro del diccionario de traducciones, p. ej. `products.title`. */
  path: string;
  group: string;
  label: string;
  long?: boolean;
}

// Solo textos que la landing LEE de este diccionario (verificado en los componentes públicos).
// Titulares con editor propio (Hero, Actualidad, Servicios, Equipo, FAQ...) no se repiten aquí: dos
// editores para el mismo texto acabarían pisándose.
export const TEXT_CATALOG: TextCatalogItem[] = [
  { path: 'products.tag', group: 'Portafolio de Productos', label: 'Etiqueta superior' },
  { path: 'products.title', group: 'Portafolio de Productos', label: 'Titular' },
  { path: 'products.subtitle', group: 'Portafolio de Productos', label: 'Subtítulo', long: true },
  { path: 'products.quoteTitle', group: 'Portafolio de Productos', label: 'Título del bloque de cotización' },
  { path: 'products.specsTitle', group: 'Portafolio de Productos', label: 'Título de especificaciones' },

  { path: 'contact.email', group: 'Formulario de Contacto', label: 'Título de la tarjeta de correo' },
  { path: 'contact.fullName', group: 'Formulario de Contacto', label: 'Campo: nombre' },
  { path: 'contact.interest', group: 'Formulario de Contacto', label: 'Campo: interés' },
  { path: 'contact.message', group: 'Formulario de Contacto', label: 'Campo: mensaje' },
  { path: 'contact.submit', group: 'Formulario de Contacto', label: 'Botón de envío' },
  { path: 'contact.submitting', group: 'Formulario de Contacto', label: 'Texto mientras se envía' },
  { path: 'contact.success', group: 'Formulario de Contacto', label: 'Mensaje de envío correcto', long: true },
  { path: 'contact.error', group: 'Formulario de Contacto', label: 'Mensaje de error', long: true },
  { path: 'cta.privacyNotice', group: 'Formulario de Contacto', label: 'Aviso de confidencialidad', long: true },

  { path: 'common.contactUs', group: 'Botones comunes', label: 'Botón «Contactar»' },
];

/** Los tres textos de cabecera del formulario se editan desde la página de Contacto. */
export const CONTACT_HEADER_PATHS = ['contact.tag', 'contact.title', 'contact.subtitle'];

export const ALLOWED_OVERRIDE_PATHS = new Set([...TEXT_CATALOG.map((i) => i.path), ...CONTACT_HEADER_PATHS]);

function getAtPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

/** Texto original del diccionario (el que se ve si no hay texto personalizado). */
export function defaultText(lang: Language, path: string): string {
  const v = getAtPath(translations[lang], path);
  return typeof v === 'string' ? v : '';
}

/** Devuelve una copia del diccionario con los textos personalizados aplicados (solo rutas permitidas y existentes). */
export function applyTextOverrides(dict: TranslationDictionary, overrides?: Record<string, string | null>): TranslationDictionary {
  if (!overrides || Object.keys(overrides).length === 0) return dict;
  const copy = JSON.parse(JSON.stringify(dict)) as Record<string, unknown>;
  for (const [path, value] of Object.entries(overrides)) {
    if (!ALLOWED_OVERRIDE_PATHS.has(path) || typeof value !== 'string') continue;
    const keys = path.split('.');
    const last = keys.pop() as string;
    const parent = getAtPath(copy, keys.join('.'));
    if (parent && typeof parent === 'object' && typeof (parent as Record<string, unknown>)[last] === 'string') {
      (parent as Record<string, unknown>)[last] = value;
    }
  }
  return copy as unknown as TranslationDictionary;
}
