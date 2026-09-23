import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth/session';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function POST() {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
  }

  const response = NextResponse.json({ success: true, message: 'Sesión finalizada' });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
