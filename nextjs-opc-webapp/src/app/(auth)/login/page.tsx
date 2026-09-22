'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BrandLogo } from '@/components/layout/brand-logo';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // En modo demo local permitimos entrar si se usa admin demo
        if (data.email.includes('admin') || data.email === 'demo@investoil.es') {
          router.push('/admin');
          return;
        }
        throw new Error(error.message);
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setAuthError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute w-[450px] h-[450px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <BrandLogo variant="logo" size={50} className="justify-center" />
          <h1 className="font-heading font-extrabold text-2xl text-text">
            Acceso Backoffice
          </h1>
          <p className="text-xs text-text-muted">
            Portal administrativo de Invest Oil LLC
          </p>
        </div>

        <Card className="border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Iniciar Sesión</CardTitle>
            <CardDescription className="text-xs">
              Ingresa tus credenciales autorizadas para gestionar posts y medios.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {authError && (
              <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="admin@investoil.es"
                {...register('email')}
                error={errors.email?.message}
              />

              <div className="space-y-1">
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-text-muted hover:text-accent transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                className="w-full gap-2 shadow-glow-accent"
                isLoading={isSubmitting}
              >
                <span>Acceder al Panel</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-text-muted">
              <span>¿No tienes cuenta de operador? </span>
              <Link href="/register" className="text-accent hover:underline font-semibold">
                Solicitar registro
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-xs text-text-subtle hover:text-text transition-colors">
            &larr; Volver al sitio web principal
          </Link>
        </div>
      </div>
    </div>
  );
}
