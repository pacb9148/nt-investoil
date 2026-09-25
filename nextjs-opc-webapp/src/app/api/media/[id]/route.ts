import { NextRequest, NextResponse } from 'next/server';
import { deleteMediaItem } from '@/lib/db/db-service';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const target = decodeURIComponent(params.id);
    await deleteMediaItem(target);
    return NextResponse.json({ success: true, message: 'Elemento multimedia eliminado' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al eliminar medio' }, { status: 500 });
  }
}
