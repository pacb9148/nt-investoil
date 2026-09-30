import { NextResponse } from 'next/server';
import { fixDomainInStoredSections } from '@/lib/db/db-service';
import { hasPostgresDb } from '@/lib/db/pg-client';

export const dynamic = 'force-dynamic';

// Utilidad puntual de administrador: corrige un dominio ya guardado en producción (todo lo que un
// admin haya guardado desde los formularios) tras una migración de dominio del sitio. Solo POST a
// propósito, para que no se dispare por accidente al visitar la URL.
export async function POST() {
  try {
    if (!hasPostgresDb()) {
      return NextResponse.json(
        { success: false, error: 'No hay conexión activa a PostgreSQL (DATABASE_URL / POSTGRES_URL no configurada).' },
        { status: 503 }
      );
    }

    const summary = await fixDomainInStoredSections('investoil.es', 'investoil.us');
    return NextResponse.json({ success: true, ...summary });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error inesperado al corregir el dominio.' },
      { status: 500 }
    );
  }
}
