import fs from 'fs';
import path from 'path';
import { LegalPageData } from '@/app/api/content/legales/route';
import { getSectionContent } from '@/lib/services/content-service';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'legal-pages.json');

export async function getLegalPage(slug: string): Promise<LegalPageData | null> {
  try {
    // 1. Intentar leer de PostgreSQL como fuente principal
    const pgData = await getSectionContent<Record<string, LegalPageData>>('legal-pages', {});
    if (pgData && pgData[slug]) {
      return pgData[slug];
    }

    // 2. Fallback local si la BD aún no tiene esa página
    if (fs.existsSync(DATA_PATH)) {
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
