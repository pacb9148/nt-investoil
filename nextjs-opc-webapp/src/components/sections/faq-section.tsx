'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/language-context';
import { FAQ_EN, localized } from '@/lib/i18n/content-en';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-01',
    question: '¿Cuáles son los procedimientos habituales para la compra de crudo o derivados?',
    answer: 'Operamos bajo estándares internacionales (Incoterms 2020: FOB, CIF, CFR). Los compradores deben remitir LOI/ICPO corporativo formal, documentación de cumplimiento KYC y carta de crédito irrevocable emitida o confirmada por banca top 50 internacional.',
  },
  {
    id: 'faq-02',
    question: '¿Qué garantías de calidad e inspección ofrece Invest Oil LLC?',
    answer: 'Todos nuestros cargamentos son inspeccionados y certificados por firmas independientes de primer nivel como SGS, Intertek o Saybolt en el puerto de carga antes de la emisión del Bill of Lading (B/L).',
  },
  {
    id: 'faq-03',
    question: '¿En qué puertos y hubs disponen de capacidad de entrega?',
    answer: 'Mantenemos presencia y acuerdos en Houston (US Gulf Coast), Rotterdam, Fujairah, Singapur y terminales marítimas estratégicas en el Caribe y Sudamérica para entrega ágil.',
  },
  {
    id: 'faq-04',
    question: '¿Cómo se gestiona el riesgo ante la volatilidad de precios en contratos a plazo?',
    answer: 'Diseñamos contratos indexados a marcadores internacionales (Brent, WTI, Argus, Platts) con fórmulas de diferencial transparentes y coberturas financieras estructuradas según el perfil de cada operación.',
  },
];

export function FaqSection({ customBg }: { customBg?: string }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [openId, setOpenId] = useState<string | null>('faq-01');

  useEffect(() => {

    fetch('/api/content/faq')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<FaqItem[]>;
      if (Array.isArray(customEvent.detail)) setFaqs(customEvent.detail);
    };

    window.addEventListener('investoil_faqs_updated', handleUpdate);
    return () => window.removeEventListener('investoil_faqs_updated', handleUpdate);
  }, []);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="py-24 border-t border-border/80 relative transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="accent">{isEn ? 'QUESTIONS ANSWERED' : 'RESOLUCIÓN DE DUDAS'}</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            {isEn ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            {isEn
              ? 'Operational answers on purchasing procedures, quality certification, logistics and contracting.'
              : 'Respuestas operativas sobre procedimientos de compra, certificación de calidad, logística y contratación.'}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <Card
                key={faq.id}
                className="overflow-hidden border-border/80 bg-card/60 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-sm text-text hover:text-accent transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-accent shrink-0" />
                    <span>{localized(faq, 'question', isEn, FAQ_EN, faq.id)}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-text-subtle shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-text-muted leading-relaxed border-t border-border/40 font-sans">
                    {localized(faq, 'answer', isEn, FAQ_EN, faq.id)}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
