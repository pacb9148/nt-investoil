'use client';

import React, { useState } from 'react';
import { Star, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StarRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function StarRow({ label, value, onChange }: StarRowProps) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-xs text-text-muted flex-1">{label}</span>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            className="p-0.5 focus:outline-none"
            aria-label={`${n} de 5 estrellas`}
          >
            <Star
              className={cn(
                'w-5 h-5 transition-colors',
                n <= display ? 'text-accent fill-accent' : 'text-text-subtle'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export interface CompanyRatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEn: boolean;
  /** Nombre y correo ya recogidos por el formulario de contacto, para asociar la valoración sin volver a pedirlos. */
  name?: string;
  email?: string;
}

export function CompanyRatingModal({ open, onOpenChange, isEn, name, email }: CompanyRatingModalProps) {
  const [whatWeDo, setWhatWeDo] = useState(0);
  const [howWeDoIt, setHowWeDoIt] = useState(0);
  const [results, setResults] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = whatWeDo > 0 && howWeDoIt > 0 && results > 0;

  const reset = () => {
    setWhatWeDo(0);
    setHowWeDoIt(0);
    setResults(0);
    setComment('');
    setSubmitted(false);
    setError(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Pequeño respiro para que no se vea el formulario reiniciarse durante la animación de salida.
    setTimeout(reset, 300);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          what_we_do: whatWeDo,
          how_we_do_it: howWeDoIt,
          results,
          comment: comment.trim() || undefined,
          name: name || undefined,
          email: email || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || (isEn ? 'Could not save your rating' : 'No se pudo guardar tu valoración'));
      }
      setSubmitted(true);
      setTimeout(handleClose, 2200);
    } catch (err: any) {
      setError(err.message || (isEn ? 'Could not save your rating' : 'No se pudo guardar tu valoración'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title={isEn ? 'Rate our company' : 'Valora nuestra empresa'}
      description={
        isEn
          ? 'Your message is on its way. A quick rating helps us keep improving.'
          : 'Tu mensaje ya está en camino. Una valoración rápida nos ayuda a seguir mejorando.'
      }
    >
      {submitted ? (
        <div className="py-6 text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto text-accent">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-text">
            {isEn ? 'Thank you for your feedback!' : '¡Gracias por tu valoración!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="divide-y divide-border/60">
            <StarRow label={isEn ? 'What we do' : 'Lo que hacemos'} value={whatWeDo} onChange={setWhatWeDo} />
            <StarRow label={isEn ? 'How we do it' : 'Cómo lo hacemos'} value={howWeDoIt} onChange={setHowWeDoIt} />
            <StarRow label={isEn ? 'Our results' : 'Nuestros resultados'} value={results} onChange={setResults} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder={isEn ? 'Anything you would like to add (optional)' : 'Algo que quieras añadir (opcional)'}
            className="w-full bg-surf border border-border text-text rounded-lg px-3 py-2 text-xs focus:border-accent focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs text-text-subtle hover:text-text transition-colors"
            >
              {isEn ? 'Skip' : 'Omitir'}
            </button>
            <Button
              type="button"
              variant="accent"
              size="sm"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
              className="gap-2 text-xs font-bold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEn ? 'Sending...' : 'Enviando...'}</span>
                </>
              ) : (
                <>
                  <span>{isEn ? 'Send rating' : 'Enviar valoración'}</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
