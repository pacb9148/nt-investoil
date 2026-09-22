import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { DEFAULT_SITE_SETTINGS, type SiteSettingsData } from '@/lib/services/site-settings';

export const dynamic = 'force-dynamic';

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'site-settings.json');

export async function GET() {
  try {
    const raw = await readFile(SETTINGS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(DEFAULT_SITE_SETTINGS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SiteSettingsData>;

    let current = DEFAULT_SITE_SETTINGS;
    try {
      const raw = await readFile(SETTINGS_FILE, 'utf-8');
      current = JSON.parse(raw);
    } catch {
      // Usar defaults
    }

    const updated: SiteSettingsData = {
      companyName: body.companyName || current.companyName,
      email: body.email || current.email,
      copyright: body.copyright || current.copyright,
      offices: Array.isArray(body.offices) && body.offices.length > 0 ? body.offices : current.offices,
    };

    await writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');

    // Revalidar rutas que usan footer y layout
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/settings');

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error al guardar ajustes del sitio:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al guardar ajustes' },
      { status: 500 }
    );
  }
}
