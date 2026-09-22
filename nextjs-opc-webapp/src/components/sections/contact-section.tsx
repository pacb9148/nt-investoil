'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Clock, Send, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { contactFormSchema, type ContactFormData } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COMPANY_INFO } from '@/lib/constants/investoil';
import { useLanguage } from '@/lib/i18n/language-context';

export function ContactSection() {
  const { t } = useLanguage();
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
        throw new Error(result.error || t.contact.error);
      }

      setIsSubmitted(true);
      reset();
    } catch (err: any) {
      setServerError(err.message || t.contact.error);
    }
  };

  return (
    <section id="contact" className="py-24 border-t border-border bg-surf/40 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="accent">{t.contact.tag}</Badge>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
              {t.contact.title}
            </h2>
            <p className="text-base text-text-muted leading-relaxed">
              {t.contact.subtitle}
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-border bg-card">
                <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-text">
                    {t.contact.email}
                  </h3>
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
                  <h3 className="font-heading font-bold text-sm text-text">Sedes Internacionales</h3>
                  <p className="text-xs text-text-muted">
                    Houston (EE. UU.) · Madrid (España) · Bogotá (Colombia)
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
                    {t.cta.privacyNotice}
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
                  {t.contact.title}
                </h3>
                <p className="text-xs text-text-muted">
                  {t.contact.subtitle}
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-8 rounded-xl bg-accent/10 border border-accent/30 text-center space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto text-accent">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-text">
                    {t.contact.success}
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 text-xs"
                  >
                    Enviar otra consulta
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {serverError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* Honeypot anti-spam */}
                  <input
                    type="text"
                    {...register('honeypot')}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Input
                        label={t.contact.fullName}
                        placeholder="ej. Robert Vance"
                        {...register('name')}
                        error={errors.name?.message}
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        label={t.contact.email}
                        type="email"
                        placeholder="nombre@empresa.com"
                        {...register('email')}
                        error={errors.email?.message}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Input
                      label={t.contact.interest}
                      placeholder="ej. Suministro Jet Fuel A1 / FOB Houston"
                      {...register('subject')}
                      error={errors.subject?.message}
                    />
                  </div>

                  <div className="space-y-1">
                    <Textarea
                      label={t.contact.message}
                      placeholder="Detalla los volúmenes requeridos (bbls o MT), especificaciones técnicas y puerto de entrega..."
                      rows={4}
                      {...register('message')}
                      error={errors.message?.message}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full justify-center gap-2 shadow-glow-accent text-xs font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.contact.submitting}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.contact.submit}</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
