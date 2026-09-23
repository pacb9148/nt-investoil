'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Cpu,
} from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { BrandLogo } from '@/components/layout/brand-logo';
import { LanguageSelector } from '@/components/layout/language-selector';
import { useLanguage } from '@/lib/i18n/language-context';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams?.get('next') || '/admin';
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [activeSession, setActiveSession] = useState<{ email: string; name: string } | null>(null);

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setActiveSession(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleQuickFill = () => {
    setValue('email', 'admin@investoil.es');
    setValue('password', 'InvestOil2026!*');
    setAuthError(null);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setActiveSession(null);
    } catch {
      // Ignorar
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          rememberMe,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.locked) {
          setIsLocked(true);
        }
        throw new Error(json.error || (isEn ? 'Authentication failed' : 'Error al autenticar'));
      }

      // Éxito: redireccionar al backoffice
      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setAuthError(err.message || (isEn ? 'Unexpected error' : 'Error inesperado'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030508] relative overflow-hidden select-none font-sans">
      {/* 1. Orbes luminosos de fondo inspirados en el diseño de referencia (magenta/ámbar/petróleo) */}
      <div className="absolute top-[12%] -left-[5%] w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#d946ef] to-[#c026d3] opacity-60 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] -right-[5%] w-[460px] h-[460px] rounded-full bg-gradient-to-bl from-[#f59e0b] via-[#ea580c] to-[#e11d48] opacity-60 blur-[140px] pointer-events-none" />
      <div className="absolute top-[28%] right-[15%] w-[18px] h-[18px] rounded-full bg-[#ec4899] shadow-[0_0_20px_#ec4899] pointer-events-none opacity-80" />
      <div className="absolute bottom-[35%] left-[18%] w-[14px] h-[14px] rounded-full bg-[#f59e0b] shadow-[0_0_15px_#f59e0b] pointer-events-none opacity-80" />

      {/* Selector de idioma flotante en esquina superior derecha */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector />
      </div>

      {/* 2. Tarjeta Glassmorphic Central de Alta Fidelidad */}
      <div className="w-full max-w-[440px] relative z-10">
        <div className="relative rounded-[32px] border border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-8 sm:p-9 space-y-6">
          {/* Header con Sello Petrolero */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <BrandLogo variant="seal" size={54} />
            </div>
            <h1 className="font-heading font-extrabold text-3xl text-white tracking-tight">
              {isEn ? 'Login' : 'Acceso Backoffice'}
            </h1>
            <p className="text-xs text-white/60">
              {isEn
                ? 'Welcome back please login to your account.'
                : 'Credenciales autorizadas de Operaciones & Trading.'}
            </p>
          </div>

          {/* Banner de sesión existente si ya está autenticado */}
          {activeSession && (
            <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isEn ? 'Active session detected' : 'Sesión activa detectada'}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">{activeSession.email}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/admin"
                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-center border border-emerald-500/30 transition-colors"
                >
                  {isEn ? 'Go to Dashboard →' : 'Ir al Backoffice →'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-colors"
                >
                  {isEn ? 'Log out' : 'Cerrar sesión'}
                </button>
              </div>
            </div>
          )}

          {/* Mensajes de error o bloqueo de seguridad */}
          {authError && (
            <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-300 text-xs flex items-center gap-2.5 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="leading-tight">{authError}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Botón de acceso de prueba / credenciales sugeridas */}
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="text-white/50">{isEn ? 'Operator credentials' : 'Credenciales autorizadas'}</span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-amber-400 hover:text-amber-300 font-mono transition-colors underline"
              >
                {isEn ? 'Auto-fill demo credentials' : 'Autocompletar credenciales'}
              </button>
            </div>

            {/* Input Usuario / Email */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder={isEn ? 'User Name / Email' : 'Email corporativo'}
                  disabled={isSubmitting || isLocked}
                  {...register('email')}
                  className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
                />
                <Mail className="w-4 h-4 text-white/40 absolute right-3.5 top-4 pointer-events-none" />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-400 pl-1">{errors.email.message}</p>
              )}
            </div>

            {/* Input Contraseña */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={isEn ? 'Password' : 'Contraseña de operador'}
                  disabled={isSubmitting || isLocked}
                  {...register('password')}
                  className="w-full h-12 px-4 pr-10 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-white/50 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400 pl-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-rose-500 focus:ring-rose-500/40 accent-rose-600"
                />
                <span className="text-xs text-white/70">
                  {isEn ? 'Remember me' : 'Recordar sesión'}
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                {isEn ? 'Forgot password?' : '¿Olvidó contraseña?'}
              </Link>
            </div>

            {/* Botón Principal con Gradiente */}
            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#d91e4a] via-[#e11d48] to-[#f43f5e] hover:from-[#c7173e] hover:to-[#e11d48] text-white text-sm font-bold shadow-[0_8px_25px_rgba(225,29,72,0.45)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span>{isEn ? 'Authenticating...' : 'Verificando seguridad...'}</span>
              ) : (
                <>
                  <span>{isEn ? 'Login' : 'Acceder al Panel'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Enlace de Solicitud de Acceso */}
          <div className="text-center pt-2">
            <p className="text-xs text-white/60">
              {isEn ? "Don't have an account? " : '¿No tienes cuenta de operador? '}
              <Link
                href="/register"
                className="text-white hover:text-amber-400 font-semibold transition-colors underline"
              >
                {isEn ? 'Sign up' : 'Solicitar acceso'}
              </Link>
            </p>
          </div>

          {/* Badges de Protocolo de Seguridad Petrolera */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 256-Bit</span>
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Invest Oil Vault</span>
            </span>
          </div>
        </div>

        {/* Volver al portal */}
        <div className="text-center pt-6">
          <Link
            href="/"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            &larr; {isEn ? 'Back to corporate site' : 'Volver al portal público'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030508] flex items-center justify-center text-white/50 font-mono text-xs">
          Cargando protocolo seguro de acceso...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
