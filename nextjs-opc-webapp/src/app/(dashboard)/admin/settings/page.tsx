'use client';

import React, { useState } from 'react';
import { Save, CheckCircle, Shield, Globe, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COMPANY_INFO } from '@/lib/constants/investoil';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState(COMPANY_INFO.name);
  const [tagline, setTagline] = useState(COMPANY_INFO.tagline);
  const [email, setEmail] = useState(COMPANY_INFO.email);
  const [schedule, setSchedule] = useState(COMPANY_INFO.schedule);
  const [linkedin, setLinkedin] = useState(COMPANY_INFO.linkedin);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="pb-6 border-b border-border">
        <Badge variant="accent">CONFIGURACIÓN GENERAL</Badge>
        <h1 className="font-heading font-extrabold text-2xl text-text mt-1">
          Configuración & Metadatos
        </h1>
        <p className="text-xs text-text-muted">
          Ajusta la información corporativa, SEO global y datos de contacto de Invest Oil LLC.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg border border-accent/40 bg-accent/10 text-accent text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Configuración actualizada correctamente.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 bg-card space-y-4">
          <h3 className="font-heading font-bold text-base text-text border-b border-border/80 pb-2">
            Identidad Corporativa
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre de la Compañía"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
            <Input
              label="Lema / Tagline Oficial"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email de Contacto Oficial"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Horario de Atención"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </div>

          <Input
            label="Perfil de LinkedIn"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </Card>

        <Card className="p-6 bg-card space-y-4">
          <h3 className="font-heading font-bold text-base text-text border-b border-border/80 pb-2">
            Seguridad & Credenciales Supabase
          </h3>

          <div className="space-y-3 text-xs text-text-muted">
            <p>
              El proyecto está conectado a través de las variables de entorno de Next.js en Vercel.
            </p>
            <div className="p-3 rounded-lg bg-surf border border-border font-mono text-[11px] space-y-1">
              <div>NEXT_PUBLIC_SUPABASE_URL: Configurado</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: Protegido (SSR)</div>
              <div>SUPABASE_SERVICE_ROLE_KEY: Solo Servidor</div>
            </div>
          </div>
        </Card>

        <Button type="submit" variant="accent" size="lg" className="gap-2 shadow-glow-accent">
          <Save className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </Button>
      </form>
    </div>
  );
}
