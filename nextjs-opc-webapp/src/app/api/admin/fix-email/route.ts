import { NextResponse } from 'next/server';
import { fixEmailAliasInStoredSections } from '@/lib/db/db-service';
import { hasPostgresDb } from '@/lib/db/pg-client';

export const dynamic = 'force-dynamic';

// Utilidad puntual de administrador: corrige un correo ya retirado pero aún guardado en producción
// (p. ej. info@investoil.us tras unificarlo en business@investoil.us). Solo POST a propósito, para
// que no se dispare por accidente al visitar la URL.
export async function POST() {
  try {
    if (!hasPostgresDb()) {
      return NextResponse.json(
        { success: false, error: 'No hay conexión activa a PostgreSQL (DATABASE_URL / POSTGRES_URL no configurada).' },
        { status: 503 }
      );
    }

    const summary = await fixEmailAliasInStoredSections('info@investoil.us', 'business@investoil.us');
    return NextResponse.json({ success: true, ...summary });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error inesperado al corregir el correo.' },
      { status: 500 }
    );
  }
}
