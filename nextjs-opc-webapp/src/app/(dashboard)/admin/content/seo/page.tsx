'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Upload,
  Loader2,
  AlertCircle,
  Share2,
  Globe,
  Building2,
  MapPin,
  Search,
  Code2,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandingSeoConfig, CorporateOperatingHub } from '@/types/content';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

const DEFAULT_SEO: LandingSeoConfig = {
  legal_name: 'Invest Oil LLC',
  brand_name: 'Invest Oil',
  jurisdiction: 'Delaware, United States',
  company_type: 'Limited Liability Company (LLC) / Corporation',
  industry: 'Petroleum, Crude Oil, Refined Products Trading & Maritime Logistics',
  legal_address: {
    region: 'Delaware',
    country: 'United States',
    country_code: 'US',
  },
  operating_hubs: [
    {
      city: 'Delaware',
      state: 'DE',
      country: 'United States',
      role: 'Sede Corporativa Legal (Registered Headquarters)',
      address: 'State of Delaware, United States',
    },
    {
      city: 'Houston',
      state: 'Texas',
      country: 'United States',
      role: 'Commercial Operations & Energy Desk',
      address: '1000 Louisiana St, Suite 4000, Houston, TX 77002',
    },
    {
      city: 'Madrid',
      country: 'España',
      role: 'European Operations Desk',
      address: 'Paseo de la Castellana 95, Planta 15, 28046 Madrid',
    },
    {
      city: 'Bogotá',
      country: 'Colombia',
      role: 'Latin America Operations Desk',
      address: 'Carrera 7 # 71-21, Torre B, Bogotá D.C.',
    },
  ],
  disambiguation_note:
    'Invest Oil LLC es una corporación legalmente constituida y registrada en el Estado de Delaware, Estados Unidos de América, especializada exclusivamente en el comercio internacional de petróleo, crudo y derivados energéticos. No tiene ninguna relación societaria ni patrimonial con empresas inmobiliarias o firmas locales extintas de Valencia (España) ni de otras jurisdicciones homónimas.',
  meta_title: 'Invest Oil LLC — Soluciones Globales en Comercio y Logística de Petróleo',
  meta_title_en: 'Invest Oil LLC — Global Energy Trading & Petroleum Logistics (Delaware, USA)',
  meta_description:
    'Invest Oil LLC es una firma energética con sede corporativa en Delaware, EE. UU., especializada en comercialización de crudo, Jet Fuel A1, EN590, almacenamiento y financiamiento estructurado.',
  meta_description_en:
    'Invest Oil LLC is a Delaware, USA incorporated energy company specializing in crude oil trading, Jet Fuel A1, EN590, maritime logistics and structured energy facilitation.',
  keywords:
    'Invest Oil LLC, trading de petroleo Delaware, brent blend, merey 16, pet coke, jet fuel a1, diesel en590, fletamento maritimo, houston oil desk, crude oil trading Delaware',
  keywords_en:
    'Invest Oil LLC, Delaware USA energy corporation, crude oil trading, brent, merey 16, jet fuel a1, en590 diesel, maritime logistics, houston petroleum desk',
  canonical_url: 'https://investoil.es',
  og_image: '/images/branding/corporate-card-logo.jpeg',
  contact_email: 'info@investoil.es',
  telephone: '+1 (713) 555-0190',
  linkedin_url: 'https://www.linkedin.com/company/invest-oil-llc',
  geo_region: 'US-DE',
  geo_placename: 'Delaware, United States',
};

export default function SeoEditorPage() {
  const [formData, setFormData] = useState<LandingSeoConfig>(DEFAULT_SEO);
  const [activeTab, setActiveTab] = useState<'corporate' | 'metadata' | 'social' | 'schema'>('corporate');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/content/seo')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setFormData((prev) => ({
            ...prev,
            ...data,
            legal_address: {
              ...prev.legal_address,
              ...(data.legal_address || {}),
            },
            operating_hubs:
              Array.isArray(data.operating_hubs) && data.operating_hubs.length > 0
                ? data.operating_hubs
                : prev.operating_hubs,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || 'Error al subir imagen social');
      }

      setFormData((prev) => ({ ...prev, og_image: resData.url }));
      setStatusMessage(`✓ Imagen "${file.name}" cargada para Open Graph.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddHub = () => {
    setFormData((prev) => ({
      ...prev,
      operating_hubs: [
        ...prev.operating_hubs,
        {
          city: '',
          state: '',
          country: '',
          role: 'Oficina Operativa',
          address: '',
        },
      ],
    }));
  };

  const handleUpdateHub = (index: number, field: keyof CorporateOperatingHub, value: string) => {
    setFormData((prev) => {
      const hubs = [...prev.operating_hubs];
      hubs[index] = { ...hubs[index], [field]: value };
      return { ...prev, operating_hubs: hubs };
    });
  };

  const handleRemoveHub = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      operating_hubs: prev.operating_hubs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/content/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al guardar datos de SEO');

      setStatusMessage('✓ Metadatos de SEO, identidad corporativa Delaware y Schema.org actualizados correctamente.');
      setTimeout(() => setStatusMessage(null), 4500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar metadatos');
    } finally {
      setSaving(false);
    }
  };

  // Generador de Schema.org JSON-LD corporativo en tiempo real
  const generatedSchemaLd = {
    '@context': 'https://schema.org',
    '@type': ['Corporation', 'Organization'],
    '@id': `${formData.canonical_url || 'https://investoil.es'}/#organization`,
    name: formData.brand_name || 'Invest Oil',
    legalName: formData.legal_name || 'Invest Oil LLC',
    alternateName: ['Invest Oil', 'InvestOil LLC', 'Invest Oil Delaware'],
    url: formData.canonical_url || 'https://investoil.es',
    logo: `${formData.canonical_url || 'https://investoil.es'}/images/branding/logo.png`,
    image: formData.og_image?.startsWith('http')
      ? formData.og_image
      : `${formData.canonical_url || 'https://investoil.es'}${formData.og_image || '/images/branding/corporate-card-logo.jpeg'}`,
    description: formData.meta_description,
    disambiguatingDescription: formData.disambiguation_note,
    address: {
      '@type': 'PostalAddress',
      addressRegion: formData.legal_address.region || 'Delaware',
      addressCountry: formData.legal_address.country_code || 'US',
    },
    location: formData.operating_hubs.map((hub) => ({
      '@type': 'Place',
      name: `${hub.city} — ${hub.role}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: hub.city,
        ...(hub.state ? { addressRegion: hub.state } : {}),
        addressCountry: hub.country,
        streetAddress: hub.address,
      },
    })),
    areaServed: 'Global',
    knowsAbout: [
      'Crude Oil Trading',
      'Petroleum Refined Products',
      'Jet Fuel A1',
      'Diesel EN590',
      'Maritime Freight Chartering',
      'Pet Coke',
      'Energy Commodities Facilitation',
    ],
    email: formData.contact_email,
    telephone: formData.telephone || undefined,
    sameAs: formData.linkedin_url ? [formData.linkedin_url] : [],
  };

  const copySchemaJson = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedSchemaLd, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Contenido</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center gap-2">
            <span>Identidad Corporativa, SEO & Schema.org</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent/15 border border-accent/30 text-accent font-semibold">
              Delaware, USA
            </span>
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configura la sede legal oficial en Delaware (USA), centros operativos, metadatos para Google / AI Overviews y la tarjeta Open Graph para redes sociales.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || uploading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Guardando...' : 'Guardar Todo'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selector de Pestañas */}
      <div className="flex flex-wrap gap-2 border-b border-border/70 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('corporate')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all',
            activeTab === 'corporate'
              ? 'bg-accent text-bg font-bold shadow-sm'
              : 'bg-card/70 border border-border text-text-muted hover:text-text hover:border-accent/40'
          )}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>1. Identidad Legal & Delaware USA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metadata')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all',
            activeTab === 'metadata'
              ? 'bg-accent text-bg font-bold shadow-sm'
              : 'bg-card/70 border border-border text-text-muted hover:text-text hover:border-accent/40'
          )}
        >
          <Search className="w-3.5 h-3.5" />
          <span>2. Metadatos de Búsqueda (ES / EN)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all',
            activeTab === 'social'
              ? 'bg-accent text-bg font-bold shadow-sm'
              : 'bg-card/70 border border-border text-text-muted hover:text-text hover:border-accent/40'
          )}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>3. Tarjeta Social Open Graph</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all',
            activeTab === 'schema'
              ? 'bg-accent text-bg font-bold shadow-sm'
              : 'bg-card/70 border border-border text-text-muted hover:text-text hover:border-accent/40'
          )}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>4. Schema.org JSON-LD (Google & AI)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: IDENTIDAD LEGAL & DELAWARE USA */}
        {/* ========================================================================= */}
        {activeTab === 'corporate' && (
          <div className="space-y-6">
            {/* Aviso Anti-Confusión Google */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs text-text space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Desambiguación Crítica para Google Search e Inteligencia Artificial</span>
              </div>
              <p className="text-text-muted leading-relaxed">
                Este módulo establece inequívocamente la personería jurídica de <strong>Invest Oil LLC</strong> constituida en <strong>Delaware, Estados Unidos</strong>. Corrige y evita que motores de búsqueda o asistentes de IA (Google AI Overviews, Perplexity, ChatGPT) confundan la firma con sociedades inmobiliarias o empresas extintas de Valencia (España) u otros homónimos.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Parámetros de Constitución y Registro</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Razón Social Legal (Legal Corporate Name)</label>
                  <input
                    type="text"
                    value={formData.legal_name}
                    onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                    className={INPUT}
                    placeholder="Invest Oil LLC"
                    required
                  />
                  <span className="text-[10px] text-text-subtle font-mono mt-1 block">
                    Nombre oficial registrado ante las autoridades mercantiles.
                  </span>
                </div>

                <div>
                  <label className={LABEL}>Nombre Comercial / Marca (Brand Name)</label>
                  <input
                    type="text"
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    className={INPUT}
                    placeholder="Invest Oil"
                    required
                  />
                  <span className="text-[10px] text-text-subtle font-mono mt-1 block">
                    Denominación comercial visible de la compañía.
                  </span>
                </div>

                <div>
                  <label className={LABEL}>Jurisdicción Legal / Estado de Constitución</label>
                  <input
                    type="text"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className={INPUT}
                    placeholder="Delaware, United States"
                    required
                  />
                  <span className="text-[10px] text-text-subtle font-mono mt-1 block">
                    Estado y país de registro legal de la corporación.
                  </span>
                </div>

                <div>
                  <label className={LABEL}>Tipo de Sociedad / Entidad Jurídica</label>
                  <input
                    type="text"
                    value={formData.company_type}
                    onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                    className={INPUT}
                    placeholder="Limited Liability Company (LLC) / Corporation"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={LABEL}>Industria y Objeto Social Principal</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className={INPUT}
                    placeholder="Petroleum, Crude Oil, Refined Products Trading & Maritime Logistics"
                  />
                </div>
              </div>

              {/* Nota de Desambiguación */}
              <div className="pt-2">
                <label className={LABEL}>
                  Declaración Formal de Desambiguación (Inyectada en Schema.org disambiguatingDescription)
                </label>
                <textarea
                  rows={3}
                  value={formData.disambiguation_note}
                  onChange={(e) => setFormData({ ...formData, disambiguation_note: e.target.value })}
                  className={INPUT}
                  placeholder="Invest Oil LLC es una corporación registrada en Delaware, EE. UU..."
                />
                <span className="text-[10px] text-text-subtle font-mono mt-1 block">
                  Esta nota se envía a Google para clarificar que no existe vínculo con empresas inmobiliarias o entidades locales de Valencia.
                </span>
              </div>
            </div>

            {/* Hubs y Sedes Operativas */}
            <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Sede Principal & Centros Operativos Globales</span>
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Especifica la sede legal en Delaware y los desks de operaciones (Houston, Madrid, Bogotá).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddHub}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent text-accent text-xs font-mono font-medium transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Sede</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.operating_hubs.map((hub, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-border bg-card/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-3">
                      <label className="text-[9px] font-mono uppercase text-text-subtle block mb-1">Ciudad / Estado</label>
                      <input
                        type="text"
                        value={hub.city}
                        onChange={(e) => handleUpdateHub(idx, 'city', e.target.value)}
                        className={INPUT}
                        placeholder="Ciudad (ej. Houston)"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[9px] font-mono uppercase text-text-subtle block mb-1">País</label>
                      <input
                        type="text"
                        value={hub.country}
                        onChange={(e) => handleUpdateHub(idx, 'country', e.target.value)}
                        className={INPUT}
                        placeholder="País (ej. United States)"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[9px] font-mono uppercase text-text-subtle block mb-1">Rol / Designación</label>
                      <input
                        type="text"
                        value={hub.role}
                        onChange={(e) => handleUpdateHub(idx, 'role', e.target.value)}
                        className={INPUT}
                        placeholder="Rol (ej. Sede Legal / Desk)"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[9px] font-mono uppercase text-text-subtle block mb-1">Dirección / Detalle</label>
                      <input
                        type="text"
                        value={hub.address}
                        onChange={(e) => handleUpdateHub(idx, 'address', e.target.value)}
                        className={INPUT}
                        placeholder="Dirección física"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end sm:pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveHub(idx)}
                        disabled={formData.operating_hubs.length <= 1}
                        className="p-2 text-text-subtle hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                        title="Eliminar sede"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: METADATOS DE BÚSQUEDA (ES / EN) */}
        {/* ========================================================================= */}
        {activeTab === 'metadata' && (
          <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Etiquetas de Título y Descripción para Buscadores (Bilingüe)</span>
            </h3>

            {/* Español */}
            <div className="p-4 rounded-lg border border-border bg-card/40 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold block">
                🇪🇸 Versión en Español
              </span>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={LABEL}>Título Meta (Title Tag ES)</label>
                  <span
                    className={cn(
                      'text-[10px] font-mono',
                      formData.meta_title.length >= 50 && formData.meta_title.length <= 65
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    )}
                  >
                    {formData.meta_title.length} / 60 caracteres recomendados
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className={INPUT}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={LABEL}>Meta Descripción (ES)</label>
                  <span
                    className={cn(
                      'text-[10px] font-mono',
                      formData.meta_description.length >= 120 && formData.meta_description.length <= 160
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    )}
                  >
                    {formData.meta_description.length} / 155 caracteres recomendados
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className={INPUT}
                  required
                />
              </div>

              <div>
                <label className={LABEL}>Palabras Clave (Keywords ES, separadas por coma)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className={INPUT}
                />
              </div>
            </div>

            {/* Inglés */}
            <div className="p-4 rounded-lg border border-border bg-card/40 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold block">
                🇺🇸 Versión en Inglés (English Version)
              </span>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={LABEL}>Título Meta (Title Tag EN)</label>
                  <span className="text-[10px] font-mono text-text-subtle">
                    {(formData.meta_title_en || '').length} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.meta_title_en || ''}
                  onChange={(e) => setFormData({ ...formData, meta_title_en: e.target.value })}
                  className={INPUT}
                  placeholder="Invest Oil LLC — Global Energy Trading & Petroleum Logistics (Delaware, USA)"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={LABEL}>Meta Descripción (EN)</label>
                  <span className="text-[10px] font-mono text-text-subtle">
                    {(formData.meta_description_en || '').length} caracteres
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={formData.meta_description_en || ''}
                  onChange={(e) => setFormData({ ...formData, meta_description_en: e.target.value })}
                  className={INPUT}
                  placeholder="Invest Oil LLC is a Delaware, USA incorporated energy company..."
                />
              </div>

              <div>
                <label className={LABEL}>Palabras Clave (Keywords EN)</label>
                <input
                  type="text"
                  value={formData.keywords_en || ''}
                  onChange={(e) => setFormData({ ...formData, keywords_en: e.target.value })}
                  className={INPUT}
                />
              </div>
            </div>

            {/* Geotags y Canónica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className={LABEL}>URL Canónica</label>
                <input
                  type="url"
                  value={formData.canonical_url}
                  onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                  className={INPUT}
                  placeholder="https://investoil.es"
                />
              </div>

              <div>
                <label className={LABEL}>Geotag Región (geo.region)</label>
                <input
                  type="text"
                  value={formData.geo_region || 'US-DE'}
                  onChange={(e) => setFormData({ ...formData, geo_region: e.target.value })}
                  className={INPUT}
                  placeholder="US-DE"
                />
              </div>

              <div>
                <label className={LABEL}>Geotag Ubicación (geo.placename)</label>
                <input
                  type="text"
                  value={formData.geo_placename || 'Delaware, United States'}
                  onChange={(e) => setFormData({ ...formData, geo_placename: e.target.value })}
                  className={INPUT}
                  placeholder="Delaware, United States"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TARJETA SOCIAL OPEN GRAPH & REDES */}
        {/* ========================================================================= */}
        {activeTab === 'social' && (
          <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>Tarjeta Social Open Graph (Vista Previa en Redes Sociales y Chat)</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className={LABEL}>URL de Imagen Social Open Graph (Recomendado 1200x630)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.og_image}
                      onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                      className={INPUT}
                      placeholder="/images/branding/corporate-card-logo.jpeg"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-accent text-bg hover:bg-accent-400 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{uploading ? 'Subiendo...' : 'Subir Imagen...'}</span>
                    </button>
                  </div>
                </div>

                {/* Accesos rápidos a imágenes de marca */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-text-subtle">Fondos y sellos predeterminados:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, og_image: '/images/branding/corporate-card-logo.jpeg' })}
                      className={cn(
                        'px-2.5 py-1 rounded text-[10px] font-mono border transition-all',
                        formData.og_image === '/images/branding/corporate-card-logo.jpeg'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-semibold'
                          : 'bg-card border-border hover:border-amber-500/50 text-text-muted hover:text-text'
                      )}
                    >
                      Sello Ámbar Corporativo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, og_image: '/images/branding/seal-transparent.png' })}
                      className={cn(
                        'px-2.5 py-1 rounded text-[10px] font-mono border transition-all',
                        formData.og_image === '/images/branding/seal-transparent.png'
                          ? 'bg-accent/20 border-accent text-accent font-semibold'
                          : 'bg-card border-border hover:border-accent/50 text-text-muted hover:text-text'
                      )}
                    >
                      Sello Oficial
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, og_image: '/images/branding/logo.png' })}
                      className={cn(
                        'px-2.5 py-1 rounded text-[10px] font-mono border transition-all',
                        formData.og_image === '/images/branding/logo.png'
                          ? 'bg-accent/20 border-accent text-accent font-semibold'
                          : 'bg-card border-border hover:border-accent/50 text-text-muted hover:text-text'
                      )}
                    >
                      Logotipo Horizontal
                    </button>
                  </div>
                </div>

                {/* Contacto Oficial y Redes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className={LABEL}>Email de Contacto Oficial</label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className={INPUT}
                      placeholder="info@investoil.es"
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Teléfono Corporativo</label>
                    <input
                      type="text"
                      value={formData.telephone || ''}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className={INPUT}
                      placeholder="+1 (713) 555-0190"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={LABEL}>Perfil de LinkedIn Oficial (sameAs)</label>
                    <input
                      type="url"
                      value={formData.linkedin_url || ''}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className={INPUT}
                      placeholder="https://www.linkedin.com/company/invest-oil-llc"
                    />
                  </div>
                </div>
              </div>

              {/* Simulación en Vivo */}
              <div className="lg:col-span-5 flex flex-col p-4 rounded-xl border border-border bg-black/50">
                <span className="text-[10px] font-mono text-text-subtle uppercase mb-2 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-accent" />
                  <span>Simulación en redes (WhatsApp / LinkedIn / Twitter)</span>
                </span>

                <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-lg">
                  <div className="w-full h-36 bg-slate-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={formData.og_image || '/images/branding/corporate-card-logo.jpeg'}
                      alt="Previsualización Open Graph"
                      className="w-full h-full object-contain filter drop-shadow-md"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="p-3.5 space-y-1">
                    <span className="text-[10px] font-mono text-text-subtle uppercase tracking-wider block">
                      investoil.es · Delaware, USA
                    </span>
                    <p className="text-xs font-bold text-text truncate">
                      {formData.meta_title}
                    </p>
                    <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                      {formData.meta_description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SCHEMA.ORG JSON-LD (GOOGLE & AI) */}
        {/* ========================================================================= */}
        {activeTab === 'schema' && (
          <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  <span>Schema.org JSON-LD Estructurado Generado en Vivo</span>
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Este bloque se inyecta automáticamente en el &lt;head&gt; de todas las páginas para alimentar el Knowledge Graph de Google y las IA generativas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copySchemaJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent text-accent text-xs font-mono font-medium transition-all"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar JSON-LD'}</span>
                </button>
                <a
                  href="https://search.google.com/test/rich-results"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent text-text-muted hover:text-text text-xs font-mono font-medium transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Rich Results Test</span>
                </a>
              </div>
            </div>

            <div className="relative rounded-lg border border-border bg-black/80 p-4 font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-[460px] leading-relaxed">
              <pre>{JSON.stringify(generatedSchemaLd, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Botón flotante inferior de guardado */}
        <div className="flex justify-end pt-3 border-t border-border">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Guardando...' : 'Guardar Todos los Metadatos y Schema.org'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
