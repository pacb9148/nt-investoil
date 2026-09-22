'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextItem {
  key: string;
  section: string;
  label: string;
  defaultEs: string;
  defaultEn: string;
  isLong?: boolean;
}

const TEXTOS_CATALOGO: TextItem[] = [
  // Portada & Navegación
  { key: 'nav_cta', section: 'Navegación', label: 'Botón Portal Clientes', defaultEs: 'Portal Clientes', defaultEn: 'Client Portal' },
  { key: 'hero_eyebrow', section: 'Portada', label: 'Eyebrow / Kicker', defaultEs: 'INFRAESTRUCTURA Y TRADING ENERGÉTICO GLOBAL', defaultEn: 'GLOBAL ENERGY TRADING & INFRASTRUCTURE' },
  { key: 'hero_cta_1', section: 'Portada', label: 'Botón Primario', defaultEs: 'Explorar Servicios Petroleros', defaultEn: 'Explore Petroleum Services' },
  { key: 'hero_cta_2', section: 'Portada', label: 'Botón Secundario', defaultEs: 'Ver Catálogo de Productos', defaultEn: 'View Products Catalog' },

  // Secciones
  { key: 'services_title', section: 'Servicios', label: 'Titular de Servicios', defaultEs: 'Servicios Integrales para la Industria Energética', defaultEn: 'Comprehensive Energy Industry Services' },
  { key: 'services_subtitle', section: 'Servicios', label: 'Subtítulo de Servicios', defaultEs: 'Acompañamos cada fase de la cadena de suministro con infraestructura de vanguardia, inteligencia comercial y rigor normativo.', defaultEn: 'Supporting every stage of the supply chain with cutting-edge infrastructure, market intelligence, and regulatory rigor.', isLong: true },

  { key: 'products_title', section: 'Productos', label: 'Titular de Productos', defaultEs: 'Crudos y Derivados de Alta Pureza', defaultEn: 'High-Grade Crude and Refined Products' },
  { key: 'products_subtitle', section: 'Productos', label: 'Subtítulo de Productos', defaultEs: 'Suministro confiable bajo estándares internacionales ASTM, GOST y especificaciones técnicas garantizadas.', defaultEn: 'Reliable supply adhering to ASTM, GOST standards and certified technical specifications.', isLong: true },

  { key: 'operations_title', section: 'Operaciones', label: 'Titular de Operaciones', defaultEs: 'Presencia en Hubs Energéticos Estratégicos', defaultEn: 'Presence in Key Global Energy Hubs' },
  { key: 'team_title', section: 'Consejo Directivo', label: 'Titular de Equipo', defaultEs: 'Consejo Directivo y Dirección Ejecutiva', defaultEn: 'Board of Directors & Executive Leadership' },
  { key: 'testimonials_title', section: 'Testimonios', label: 'Titular de Testimonios', defaultEs: 'Lo que dicen nuestros socios y clientes', defaultEn: 'Trusted by Global Industry Leaders' },

  // Cierre y Contacto
  { key: 'cta_title', section: 'Cierre', label: 'Titular de Cierre', defaultEs: 'Impulse sus Operaciones Energéticas con Invest Oil LLC', defaultEn: 'Advance Your Energy Operations with Invest Oil LLC' },
  { key: 'cta_button', section: 'Cierre', label: 'Botón Principal de Cierre', defaultEs: 'Iniciar Diálogo Comercial', defaultEn: 'Initiate Commercial Discussion' },
  { key: 'cta_guarantee', section: 'Cierre', label: 'Línea de Garantías', defaultEs: 'Garantía contractual de suministro · Cumplimiento Incoterms 2020 · Verificación SGS / Intertek', defaultEn: 'Contractual supply guarantee · Incoterms 2020 compliance · SGS / Intertek inspection verified', isLong: true },
];

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function TextosPage() {
  const [langTab, setLangTab] = useState<'es' | 'en'>('es');
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const sections = Array.from(new Set(TEXTOS_CATALOGO.map((t) => t.section)));

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [`${key}_${langTab}`]: val }));
  };

  const handleReset = (key: string) => {
    setValues((prev) => {
      const next = { ...prev };
      delete next[`${key}_${langTab}`];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Contenido</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Textos de la Landing & Internacionalización
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Personaliza titulares, subtítulos y llamadas a la acción de cada sección en Español e Inglés.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-card p-1 text-xs font-mono self-start">
          <button
            type="button"
            onClick={() => setLangTab('es')}
            className={cn(
              'px-3 py-1 rounded font-semibold transition-all',
              langTab === 'es' ? 'bg-accent text-bg shadow-sm' : 'text-text-muted hover:text-text'
            )}
          >
            Español (ES)
          </button>
          <button
            type="button"
            onClick={() => setLangTab('en')}
            className={cn(
              'px-3 py-1 rounded font-semibold transition-all',
              langTab === 'en' ? 'bg-accent text-bg shadow-sm' : 'text-text-muted hover:text-text'
            )}
          >
            English (EN)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {sections.map((sec) => {
          const items = TEXTOS_CATALOGO.filter((t) => t.section === sec);
          return (
            <div key={sec} className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                Sección: {sec}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const fieldKey = `${item.key}_${langTab}`;
                  const defaultVal = langTab === 'es' ? item.defaultEs : item.defaultEn;
                  const currentVal = values[fieldKey] !== undefined ? values[fieldKey] : '';

                  return (
                    <div key={item.key} className={item.isLong ? 'md:col-span-2' : ''}>
                      <div className="flex items-center justify-between mb-1">
                        <label className={LABEL}>{item.label}</label>
                        {currentVal && (
                          <button
                            type="button"
                            onClick={() => handleReset(item.key)}
                            className="text-[10px] text-text-subtle hover:text-accent font-mono flex items-center gap-1"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Restablecer</span>
                          </button>
                        )}
                      </div>
                      {item.isLong ? (
                        <textarea
                          rows={2}
                          value={currentVal}
                          onChange={(e) => handleChange(item.key, e.target.value)}
                          placeholder={defaultVal}
                          className={cn(INPUT, 'resize-y')}
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => handleChange(item.key, e.target.value)}
                          placeholder={defaultVal}
                          className={INPUT}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Textos bilingües actualizados correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Textos</span>
          </button>
        </div>
      </form>
    </div>
  );
}
