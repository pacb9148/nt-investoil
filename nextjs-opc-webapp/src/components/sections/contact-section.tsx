'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Clock, Send, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { contactFormSchema, type ContactFormData } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COMPANY_INFO } from '@/lib/constants/investoil';

export function ContactSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      honeypot: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setServerError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.error || 'Error al enviar el mensaje');
      }

      setIsSubmitted(true);
      reset();
    } catch (err: any) {
      setServerError(err.message || 'Error de conexión. Inténtalo de nuevo.');
    }
  };

  return (
    <section id="contact" className="py-24 border-t border-border bg-surf/40 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="accent">COMUNICACIÓN DIRECTA</Badge>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
              Contacto
            </h2>
            <p className="text-base text-text-muted leading-relaxed">
              ¿Qué necesitas saber sobre nuestras operaciones o especificaciones de producto? Escríbenos y te responderemos en menos de 24 horas laborables.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-border bg-card">
                <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-text">Correo Electrónico</h3>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-xs text-text-muted hover:text-accent transition-colors"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-border bg-card">
                <div className="p-2.5 rounded-lg bg-warm/10 border border-warm/20 text-warm shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-text">Horario de Atención</h3>
                  <p className="text-xs text-text-muted">
                    {COMPANY_INFO.schedule}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-border bg-card">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-text">Confidencialidad</h3>
                  <p className="text-xs text-text-muted">
                    Toda la información y acuerdos comerciales se rigen bajo estrictos acuerdos de no divulgación (NDA).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl border border-border bg-card/90 shadow-xl backdrop-blur-md">
              <div className="mb-6 space-y-1">
                <h3 className="font-heading font-bold text-xl text-text">
                  Cuéntanos qué necesitas
                </h3>
                <p className="text-xs text-text-muted">
                  Completa los campos a continuación para solicitar cotización o información contractual.
                </p>
              </div>

              {isSubmitted ? (
                <div className="py-12 text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 mx-auto rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-text">
                    ¡Mensaje recibido con éxito!
                  </h4>
                  <p className="text-sm text-text-muted max-w-sm mx-auto">
                    Nuestro equipo de operaciones revisará tu solicitud y te contactará a la brevedad.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4"
                  >
                    Enviar otra consulta
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {/* Honeypot field for anti-spam */}
                  <input
                    type="text"
                    {...register('honeypot')}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {serverError && (
                    <div className="p-3.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nombre *"
                      placeholder="Tu nombre completo"
                      {...register('name')}
                      error={errors.name?.message}
                    />

                    <Input
                      label="Email *"
                      type="email"
                      placeholder="tu@empresa.com"
                      {...register('email')}
                      error={errors.email?.message}
                    />
                  </div>

                  <Input
                    label="Asunto / Producto de interés"
                    placeholder="Ej. Cotización Pet Coke cargamento 50.000 MT"
                    {...register('subject')}
                    error={errors.subject?.message}
                  />

                  <Textarea
                    label="Mensaje *"
                    rows={4}
                    placeholder="Detalles sobre volumen, destino, especificaciones o requerimientos logísticos..."
                    {...register('message')}
                    error={errors.message?.message}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="accent"
                      size="lg"
                      isLoading={isSubmitting}
                      className="w-full gap-2 shadow-glow-accent"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar mensaje</span>
                    </Button>
                  </div>

                  <p className="text-[11px] text-text-subtle text-center pt-2">
                    Al enviar aceptas nuestra política de privacidad. Tus datos se usan únicamente para responderte.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
