import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { DashboardTopbar } from '@/components/admin/dashboard-topbar';
import { ADMIN_COOKIE_NAME, decodeSessionToken } from '@/lib/auth/session';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  let session = sessionToken ? decodeSessionToken(sessionToken) : null;

  // Verificar si la sesión expiró
  if (session && session.expiresAt && Date.now() > session.expiresAt) {
    session = null;
  }

  if (!session && isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        session = {
          email: user.email || 'admin@investoil.es',
          name: user.user_metadata?.full_name || 'Operador Autorizado',
          role: user.user_metadata?.role || 'admin',
          createdAt: Date.now(),
          expiresAt: Date.now() + 86400000,
        };
      }
    } catch {}
  }

  if (!session) {
    redirect('/login?next=/admin');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopbar userEmail={session.email} userName={session.name} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
