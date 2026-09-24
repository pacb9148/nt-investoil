import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getTeamMembers, saveTeamMembers } from '@/lib/db/db-service';
import type { TeamMember } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getTeamMembers();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const members = Array.isArray(body) ? body : body?.members;

    if (!Array.isArray(members)) {
      return NextResponse.json({ error: 'Formato inválido. Se espera un array de miembros.' }, { status: 400 });
    }

    await saveTeamMembers(members);
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
