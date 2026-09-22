import fs from 'fs';
import path from 'path';
import { LegalPageData } from '@/app/api/content/legales/route';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'legal-pages.json');

export function getLegalPage(slug: string): LegalPageData | null {
  try {
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
