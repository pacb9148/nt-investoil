import { NextResponse } from 'next/server';
import { migrateAllJsonToPostgres } from '@/lib/db/migration-service';
import { hasPostgresDb } from '@/lib/db/pg-client';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    if (!hasPostgresDb()) {
      return NextResponse.json(
        {
          success: false,
          error: 'No hay conexión activa a la base de datos PostgreSQL (DATABASE_URL / POSTGRES_URL no configurada).',
        },
        { status: 503 }
      );
    }

    const summary = await migrateAllJsonToPostgres();
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error inesperado durante la migración.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
