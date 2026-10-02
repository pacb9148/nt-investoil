import { NextRequest, NextResponse } from 'next/server';
import { deleteLead, getLeads, saveLead } from '@/lib/db/db-service';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json(leads);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al obtener leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lead = await saveLead(body);
    revalidatePath('/admin');
    revalidatePath('/admin/leads');
    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al registrar lead' }, { status: 500 });
  }
}

// El middleware exige sesión de administrador para todo DELETE bajo /api.
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el id del mensaje' }, { status: 400 });
    const existed = await deleteLead(id);
    if (!existed) return NextResponse.json({ error: 'El mensaje ya no existe' }, { status: 404 });
    revalidatePath('/admin');
    revalidatePath('/admin/leads');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al eliminar el mensaje' }, { status: 500 });
  }
}
