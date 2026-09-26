import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { DEFAULT_SITE_SETTINGS, type SiteSettingsData } from '@/lib/services/site-settings';

export const dynamic = 'force-dynamic';

function getSettingsFilePath(): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'data', 'site-settings.json'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data', 'site-settings.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

import { getSectionFromPg, saveSectionToPg, saveLandingFooter } from '@/lib/services/content-service';

export async function GET() {
  try {
    // 1. Intentar leer desde PostgreSQL (fuente primaria y persistente)
    const pgData = await getSectionFromPg<SiteSettingsData>('site_settings');
    if (pgData && typeof pgData === 'object') {
      return NextResponse.json({ ...DEFAULT_SITE_SETTINGS, ...pgData });
    }

    // 2. Fallback a archivo JSON local si no está en BD
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      return NextResponse.json({ ...DEFAULT_SITE_SETTINGS, ...data });
    }
    return NextResponse.json(DEFAULT_SITE_SETTINGS);
  } catch {
    return NextResponse.json(DEFAULT_SITE_SETTINGS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SiteSettingsData>;

    // 1. Obtener estado actual desde PostgreSQL o fallback
    let current = { ...DEFAULT_SITE_SETTINGS };
    try {
      const pgData = await getSectionFromPg<SiteSettingsData>('site_settings');
      if (pgData) {
        current = { ...current, ...pgData };
      } else {
        const filePath = getSettingsFilePath();
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          current = { ...current, ...JSON.parse(raw) };
        }
      }
    } catch {
      // Usar defaults
    }

    const updated: SiteSettingsData = {
      companyName: body.companyName ?? current.companyName,
      email: body.email ?? current.email,
      schedule: body.schedule ?? current.schedule,
      copyright: body.copyright ?? current.copyright,
      copyrightEn: body.copyrightEn ?? current.copyrightEn,
      footerLogoUrl: body.footerLogoUrl ?? current.footerLogoUrl,
      footerTagline: body.footerTagline ?? current.footerTagline,
      footerTaglineEn: body.footerTaglineEn ?? current.footerTaglineEn,
      linkedinUrl: body.linkedinUrl ?? current.linkedinUrl,
      certificationsText: body.certificationsText ?? current.certificationsText,
      offices: Array.isArray(body.offices) && body.offices.length > 0 ? body.offices : current.offices,
    };

    // 2. Persistir en PostgreSQL de forma definitiva
    await saveSectionToPg('site_settings', updated);
    await saveLandingFooter({
      brand: {
        name: updated.companyName,
        tagline: updated.footerTagline,
        tagline_en: updated.footerTaglineEn,
        logo_url: updated.footerLogoUrl,
      },
      headquarters: updated.offices,
      copyright: updated.copyright,
      legal_notice: updated.certificationsText,
    });

    // 3. Escribir en archivo local de respaldo si el entorno lo permite
    try {
      const filePath = getSettingsFilePath();
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {}

    // 4. Revalidar rutas que usan footer y layout
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/settings');
    revalidatePath('/admin/content/footer');

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error al guardar ajustes del sitio:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al guardar ajustes' },
      { status: 500 }
    );
  }
}
