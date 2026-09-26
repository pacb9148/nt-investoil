import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, decodeSessionToken } from '@/lib/auth/session';
import { isSupabaseConfigured } from '@/lib/supabase/config';

// Escrituras de la API que el público sí necesita (formulario, chat, «me gusta», sesión).
const PUBLIC_API_WRITES = [
  /^\/api\/auth\//,
  /^\/api\/contact$/,
  /^\/api\/ai\/chat$/,
  /^\/api\/posts\/[^/]+\/like$/,
];

// Lecturas de la API que exponen datos internos (usuarios, leads, claves de IA…).
const PRIVATE_API_READS = [
  /^\/api\/users/,
  /^\/api\/leads/,
  /^\/api\/settings\/ai/,
  /^\/api\/admin\//,
  /^\/api\/ai\/learning/,
  /^\/api\/system-status/,
  /^\/api\/news-agent/,
  /^\/api\/media\/usage/,
];

function apiRequiresSession(pathname: string, method: string): boolean {
  if (!pathname.startsWith('/api/')) return false;
  if (PRIVATE_API_READS.some((re) => re.test(pathname))) return true;
  const isRead = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
  if (isRead) return false;
  return !PUBLIC_API_WRITES.some((re) => re.test(pathname));
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const needsApiSession = apiRequiresSession(pathname, request.method);
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password');

  // Si no es ruta de auth ni de admin, pasar inmediatamente sin llamadas de red (Rendimiento 0ms)
  if (!isAdminRoute && !isAuthRoute && !needsApiSession) {
    return NextResponse.next();
  }

  // 1. Verificar cookie de sesión segura firmada
  let isAuthenticated = false;
  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (sessionToken) {
    const session = decodeSessionToken(sessionToken);
    if (session) {
      isAuthenticated = true;
    }
  }

  // 2. Si no hay sesión local pero Supabase está configurado con credenciales reales, verificar con Supabase
  if (!isAuthenticated && isSupabaseConfigured()) {
    try {
      const { createServerClient } = await import('@supabase/ssr');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;
      }
    } catch {
      // Ignorar fallo de red
    }
  }

  // 3a. La API de gestión exige sesión: sin esto cualquiera podía borrar archivos o leer usuarios.
  if (needsApiSession && !isAuthenticated) {
    return NextResponse.json({ error: 'No autorizado. Inicie sesión en el backoffice.' }, { status: 401 });
  }

  // 3. Proteger estrictamente las rutas del backoffice
  if (isAdminRoute && !isAuthenticated) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Si ya está autenticado e intenta acceder a registro/recuperación, enviar al panel
  if (isAuthenticated && (pathname.startsWith('/register') || pathname.startsWith('/forgot-password'))) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}
