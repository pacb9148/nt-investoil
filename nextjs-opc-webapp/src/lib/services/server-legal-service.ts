import fs from 'fs';
import path from 'path';
import { LegalPageData } from '@/app/api/content/legales/route';
import { getSectionContent, getSectionFromPg, saveSectionToPg } from '@/lib/services/content-service';
import { hasPostgresDb } from '@/lib/db/pg-client';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'legal-pages.json');

// Páginas cuyo texto se reescribió (versión 2, estilo corporativo energético); la de fraude se conserva.
const LEGAL_V2_SLUGS = [
  'terminos-y-condiciones',
  'aviso-de-privacidad',
  'politica-de-cookies',
  'accesibilidad',
  'opciones-de-privacidad',
];
let legalSeedChecked = false;

/**
 * Una sola vez (marca `legal_seed_v2`) vuelca a la base de datos el texto nuevo de las páginas legales,
 * porque la base es la fuente y no se lee el JSON. Después manda lo que se edite en el panel.
 */
async function ensureLegalSeeded(): Promise<void> {
  if (legalSeedChecked || !hasPostgresDb()) return;
  legalSeedChecked = true;
  try {
    if (await getSectionFromPg('legal_seed_v2')) return;
    if (!fs.existsSync(DATA_PATH)) return;
    const seed = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')) as Record<string, LegalPageData>;
    const current = (await getSectionFromPg<Record<string, LegalPageData>>('legal-pages')) || {};
    const merged: Record<string, LegalPageData> = { ...seed, ...current };
    for (const slug of LEGAL_V2_SLUGS) if (seed[slug]) merged[slug] = seed[slug];
    await saveSectionToPg('legal-pages', merged);
    await saveSectionToPg('legal_seed_v2', { done: true });
  } catch (e) {
    legalSeedChecked = false;
    console.error('[legal] No se pudo sembrar el texto legal v2:', e);
  }
}

export async function getLegalPages(): Promise<Record<string, LegalPageData>> {
  await ensureLegalSeeded();
  return getSectionContent<Record<string, LegalPageData>>('legal-pages', {});
}

export async function getLegalPage(slug: string): Promise<LegalPageData | null> {
  try {
    // 1. Intentar leer de PostgreSQL como fuente principal
    const pgData = await getLegalPages();
    if (pgData && pgData[slug]) {
      return pgData[slug];
    }

    // 2. Fallback local solo sin base de datos: con ella, una página ausente es que no existe
    if (!hasPostgresDb() && fs.existsSync(DATA_PATH)) {
      const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
      if (data[slug]) {
        return data[slug] as LegalPageData;
      }
    }
  } catch (e) {
    console.error('Error leyendo página legal en servidor:', e);
  }
  return null;
}
