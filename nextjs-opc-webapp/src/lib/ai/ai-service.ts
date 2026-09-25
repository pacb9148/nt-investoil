import fs from 'fs';
import path from 'path';
import { AiSettingsConfig, DEFAULT_AI_SETTINGS } from './ai-types';
import { hasPostgresDb, queryPg } from '../db/pg-client';

const DATA_FILE = path.join(process.cwd(), 'src/data/ai-settings.json');

export async function getAiSettings(): Promise<AiSettingsConfig> {
  // 1. Intentar desde PostgreSQL si está disponible
  if (hasPostgresDb()) {
    try {
      const res = await queryPg(
        "SELECT data FROM public.landing_sections WHERE id = 'ai_settings_config' LIMIT 1"
      );
      if (res && res.rows.length > 0 && res.rows[0].data) {
        return {
          ...DEFAULT_AI_SETTINGS,
          ...res.rows[0].data,
        };
      }
    } catch {
      // Continuar a fallback de archivo
    }
  }

  // 2. Fallback desde archivo JSON
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        ...DEFAULT_AI_SETTINGS,
        ...parsed,
      };
    }
  } catch {
    // Si falla la lectura, retornar default
  }

  return DEFAULT_AI_SETTINGS;
}

export async function saveAiSettings(settings: AiSettingsConfig): Promise<boolean> {
  // 1. Guardar en JSON
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar ai-settings.json:', err);
  }

  // 2. Guardar en PostgreSQL
  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO public.landing_sections (id, name, is_active, data, updated_at)
         VALUES ('ai_settings_config', 'Configuración de Inteligencia Artificial', true, $1, NOW())
         ON CONFLICT (id) DO UPDATE SET
           data = EXCLUDED.data,
           updated_at = NOW()`,
        [JSON.stringify(settings)]
      );
      return true;
    } catch (err) {
      console.error('Error al guardar configuración AI en PostgreSQL:', err);
    }
  }

  return true;
}
