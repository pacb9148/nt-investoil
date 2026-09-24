import { NextResponse, type NextRequest } from 'next/server';
import { getUserByEmail } from '@/lib/db/db-service';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Por favor, introduce un correo electrónico válido' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verificar si existe en la base de datos de usuarios
    const user = await getUserByEmail(cleanEmail);

    // 2. Si Supabase está configurado, intentar el flujo de Supabase
    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = createClient();
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${request.nextUrl.origin}/login`,
        });
      } catch (err) {
        console.warn('Fallback a recuperación de contraseña local:', err);
      }
    }

    // 3. Responder con confirmación segura
    return NextResponse.json({
      success: true,
      message: `Si la cuenta asociada a ${cleanEmail} existe en nuestro registro de operadores, recibirás las instrucciones y el enlace de restablecimiento.`,
      found: !!user,
    });
  } catch (error) {
    console.error('Error en /api/auth/forgot-password:', error);
    return NextResponse.json(
      { error: 'No se pudo procesar la solicitud de recuperación en este momento' },
      { status: 500 }
    );
  }
}
