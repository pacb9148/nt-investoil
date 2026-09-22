import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import type { TeamMember } from '@/types';

export const dynamic = 'force-dynamic';

const TEAM_FILE = path.join(process.cwd(), 'src', 'data', 'team.json');

export async function GET() {
  try {
    const raw = await readFile(TEAM_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const members = (await request.json()) as TeamMember[];

    if (!Array.isArray(members)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    await writeFile(TEAM_FILE, JSON.stringify(members, null, 2), 'utf-8');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/team');

    return NextResponse.json({ success: true, members });
  } catch (error) {
    console.error('Error al guardar equipo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
