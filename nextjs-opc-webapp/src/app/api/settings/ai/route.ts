import { NextResponse } from 'next/server';
import { getAiSettings, saveAiSettings } from '@/lib/ai/ai-service';
import { AiSettingsConfig } from '@/lib/ai/ai-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAiSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<AiSettingsConfig>;
    const current = await getAiSettings();
    
    const updated: AiSettingsConfig = {
      ...current,
      ...body,
      providers: body.providers || current.providers,
    };

    await saveAiSettings(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error al guardar' },
      { status: 500 }
    );
  }
}
