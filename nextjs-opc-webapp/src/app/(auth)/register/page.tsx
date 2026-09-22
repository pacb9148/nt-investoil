'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BrandLogo } from '@/components/layout/brand-logo';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: 'editor',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      setRegistered(true);
    } catch (err: any) {
      setAuthError(err.message || 'Error al procesar el registro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <BrandLogo variant="logo" size={50} className="justify-center" />
          <h1 className="font-heading font-extrabold text-2xl text-text">
            Registro de Operador
          </h1>
          <p className="text-xs text-text-muted">
            Solicitud de acceso al panel de Invest Oil LLC
          </p>
        </div>

        <Card className="border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Crear Cuenta</CardTitle>
            <CardDescription className="text-xs">
              Ingresa tus datos para registrar una cuenta con rol de editor.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {registered ? (
              <div className="text-center py-6 space-y-3 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
                <h3 className="font-heading font-bold text-base text-text">
                  ¡Registro recibido!
                </h3>
                <p className="text-xs text-text-muted">
                  Revisa tu correo para confirmar tu dirección o inicia sesión directamente.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="accent" size="sm" className="w-full">
                      Ir a Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {authError && (
                  <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <Input
                    label="Nombre Completo"
                    placeholder="Tu nombre y apellidos"
                    {...register('fullName')}
                    error={errors.fullName?.message}
                  />

                  <Input
                    label="Correo Electrónico"
                    type="email"
                    placeholder="usuario@investoil.es"
                    {...register('email')}
                    error={errors.email?.message}
                  />

                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    {...register('password')}
                    error={errors.password?.message}
                  />

                  <Button
                    type="submit"
                    variant="accent"
                    className="w-full gap-2 shadow-glow-accent"
                    isLoading={isSubmitting}
                  >
                    <span>Completar Registro</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                <div className="pt-2 text-center text-xs text-text-muted">
                  <span>¿Ya tienes una cuenta? </span>
                  <Link href="/login" className="text-accent hover:underline font-semibold">
                    Iniciar sesión
                  </Link>
                </div>
              </>
            )}
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
