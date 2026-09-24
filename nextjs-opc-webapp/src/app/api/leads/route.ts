import { NextRequest, NextResponse } from 'next/server';
import { getLeads, saveLead } from '@/lib/db/db-service';
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
