'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BrandLogo } from '@/components/layout/brand-logo';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor introduce tu correo electrónico');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw new Error(error.message);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <BrandLogo variant="logo" size={50} className="justify-center" />
          <h1 className="font-heading font-extrabold text-2xl text-text">
            Recuperar Contraseña
          </h1>
          <p className="text-xs text-text-muted">
            Restablece el acceso a tu cuenta administrativa
          </p>
        </div>

        <Card className="border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Instrucciones por Correo</CardTitle>
            <CardDescription className="text-xs">
              Te enviaremos un enlace seguro para restablecer tu contraseña.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {sent ? (
              <div className="text-center py-6 space-y-3 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
                <h3 className="font-heading font-bold text-base text-text">
                  Enlace enviado
                </h3>
                <p className="text-xs text-text-muted">
                  Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones para crear una nueva clave.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Volver a Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Correo Electrónico"
                    type="email"
                    placeholder="admin@investoil.es"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    variant="accent"
                    className="w-full gap-2 shadow-glow-accent"
                    isLoading={loading}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Enviar Enlace de Recuperación</span>
                  </Button>
                </form>

                <div className="pt-2 text-center text-xs">
                  <Link href="/login" className="text-text-muted hover:text-text transition-colors">
                    &larr; Volver al inicio de sesión
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
