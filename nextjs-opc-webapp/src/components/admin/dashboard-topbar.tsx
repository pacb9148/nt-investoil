'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Bell, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export function DashboardTopbar({
  userEmail = 'admin@investoil.es',
  userName = 'Administrador',
}: {
  userEmail?: string;
  userName?: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (typeof window !== 'undefined') {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch (e) {
      // Ignored
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-border bg-surf/80 px-6 flex items-center justify-between shrink-0 backdrop-blur-md">
      {/* Left title / badge */}
      <div className="flex items-center gap-3">
        <h1 className="font-heading font-bold text-sm text-text">
          Invest Oil Backoffice
        </h1>
        <Badge variant="accent">PROD</Badge>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* User Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs">
          <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="font-semibold text-text leading-tight">{userName}</div>
            <div className="text-[10px] text-text-muted leading-tight">{userEmail}</div>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-xs text-text-muted hover:text-rose-400 gap-1.5"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  );
}
