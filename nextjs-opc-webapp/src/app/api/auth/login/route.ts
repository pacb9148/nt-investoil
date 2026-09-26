import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  encodeSessionToken,
  type AdminSession,
} from '@/lib/auth/session';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyUserCredentials, recordUserLogin } from '@/lib/db/db-service';

// In-memory rate limiting and brute force protection
interface AttemptRecord {
  count: number;
  lockedUntil: number;
}
const attemptsMap = new Map<string, AttemptRecord>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const key = `${ip}:${cleanEmail}`;

    const now = Date.now();
    const record = attemptsMap.get(key) || { count: 0, lockedUntil: 0 };

    if (record.lockedUntil > now) {
      const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return NextResponse.json(
        {
          error: `Protocolo de seguridad activo: demasiados intentos fallidos. Reintenta en ${waitSeconds} segundos.`,
          locked: true,
          retryAfter: waitSeconds,
        },
        { status: 429 }
      );
    }

    let isValid = false;
    let userName = 'Administrador de Trading';
    let userRole = 'superadmin';

    // 1. Verificar contra Base de Datos Local de Usuarios (users.json)
    try {
      const dbUser = await verifyUserCredentials(cleanEmail, String(password));
      if (dbUser) {
        isValid = true;
        userName = dbUser.name || 'Operador Autorizado';
        userRole = dbUser.role || 'superadmin';
        await recordUserLogin(cleanEmail);
      }
    } catch (err) {
      console.warn('Error en verificación de base de datos local:', err);
    }

    // 2. Verificar contra Supabase si está disponible
    if (!isValid && isSupabaseConfigured()) {
      try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data?.user) {
          isValid = true;
          userName = data.user.user_metadata?.full_name || 'Operador Autorizado';
          userRole = data.user.user_metadata?.role || 'admin';
        }
      } catch (err) {
        console.warn('Fallback a autenticación local autorizada');
      }
    }

    // 3. Fallback de emergencia a credenciales maestras autorizadas de Invest Oil LLC
    if (!isValid) {
      const adminEmailMatches =
        cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        cleanEmail === 'admin@investoil.es' ||
        cleanEmail === 'admin@investoil.com' ||
        cleanEmail === 'business@investoil.es' ||
        cleanEmail === 'compliance@investoil.es';

      const adminPasswordMatches =
        password === DEFAULT_ADMIN_PASSWORD ||
        password === 'InvestOil2026!*' ||
        password === 'InvestOil2026!#' ||
        password === 'admin1234' ||
        (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);

      if (adminEmailMatches && adminPasswordMatches) {
        isValid = true;
        userName = cleanEmail.includes('compliance')
          ? 'Oficial de Cumplimiento & KYC'
          : 'Director de Operaciones & Trading';
        userRole = cleanEmail.includes('compliance') ? 'compliance_kyc' : 'superadmin';
        try {
          await recordUserLogin(cleanEmail);
        } catch {}
      }
    }

    if (!isValid) {
      record.count += 1;
      if (record.count >= 5) {
        record.lockedUntil = now + 60 * 1000; // 60 segundos de bloqueo
        attemptsMap.set(key, record);
        return NextResponse.json(
          {
            error: 'Has superado el límite de 5 intentos. Acceso bloqueado preventivamente por 60 segundos por protocolo de seguridad.',
            locked: true,
            retryAfter: 60,
          },
          { status: 429 }
        );
      }
      attemptsMap.set(key, record);
      const remainingAttempts = 5 - record.count;
      return NextResponse.json(
        {
          error: `Credenciales inválidas. Te quedan ${remainingAttempts} intento(s) antes del bloqueo de seguridad.`,
        },
        { status: 401 }
      );
    }

    // Limpiar récord de intentos al autenticar exitosamente
    attemptsMap.delete(key);

    // Calcular expiración: 7 días con rememberMe, 24 horas normal
    const sessionDurationMs = rememberMe
      ? 7 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

    const session: AdminSession = {
      email: cleanEmail,
      role: userRole,
      name: userName,
      createdAt: now,
      expiresAt: now + sessionDurationMs,
    };

    const token = encodeSessionToken(session);

    const response = NextResponse.json({
      success: true,
      message: 'Autenticación autorizada exitosamente',
      user: {
        email: cleanEmail,
        name: userName,
        role: userRole,
      },
    });

    const isHttps =
      request.nextUrl.protocol === 'https:' ||
      request.headers.get('x-forwarded-proto') === 'https';

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(sessionDurationMs / 1000),
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor de autenticación' },
      { status: 500 }
    );
  }
}
