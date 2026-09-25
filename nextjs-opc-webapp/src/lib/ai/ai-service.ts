import fs from 'fs';
import path from 'path';
import { AiSettingsConfig, DEFAULT_AI_SETTINGS } from './ai-types';
import { hasPostgresDb, queryPg } from '../db/pg-client';

function getAiSettingsPath(): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'data', 'ai-settings.json'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data', 'ai-settings.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

export async function getAiSettings(): Promise<AiSettingsConfig> {
  // 1. Intentar desde PostgreSQL si está disponible
  if (hasPostgresDb()) {
    try {
      const res = await queryPg(
        "SELECT content FROM landing_sections WHERE id = 'ai_settings_config' LIMIT 1"
      );
      if (res && res.rows.length > 0 && res.rows[0].content) {
        return {
          ...DEFAULT_AI_SETTINGS,
          ...res.rows[0].content,
        };
      }
    } catch {
      // Continuar a fallback de archivo
    }
  }

  // 2. Fallback desde archivo JSON
  try {
    const dataFile = getAiSettingsPath();
    if (fs.existsSync(dataFile)) {
      const content = fs.readFileSync(dataFile, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        ...DEFAULT_AI_SETTINGS,
        ...parsed,
        models: parsed.models || DEFAULT_AI_SETTINGS.models,
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
    const dataFile = getAiSettingsPath();
    const dir = path.dirname(dataFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFile, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar ai-settings.json:', err);
  }

  // 2. Guardar en PostgreSQL
  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO landing_sections (id, content, updated_at)
         VALUES ('ai_settings_config', $1, NOW())
         ON CONFLICT (id) DO UPDATE SET
           content = EXCLUDED.content,
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
