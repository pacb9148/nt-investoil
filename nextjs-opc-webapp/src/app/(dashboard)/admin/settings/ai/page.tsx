'use client';

import React, { useState, useEffect } from 'react';
import { AiSettingsConfig, AiProviderConfig, DEFAULT_AI_SETTINGS } from '@/lib/ai/ai-types';
import { Cpu, Key, CheckCircle, Save, Sparkles, AlertCircle, Bot, Globe, ShieldCheck } from 'lucide-react';

export default function AiSettingsPage() {
  const [settings, setSettings] = useState<AiSettingsConfig>(DEFAULT_AI_SETTINGS);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('openrouter');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetch('/api/settings/ai')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          setSelectedProviderId(data.settings.activeProviderId || 'openrouter');
        }
      })
      .catch((err) => console.error('Error al cargar config de IA:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleProviderChange = (field: keyof AiProviderConfig, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      providers: prev.providers.map((p) => {
        if (p.id === selectedProviderId) {
          return { ...p, [field]: value };
        }
        return p;
      }),
    }));
  };

  const currentProvider = settings.providers.find((p) => p.id === selectedProviderId) || settings.providers[0];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Error al guardar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestChat = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '¿Cuál es la especificación del Diésel EN590 que comercializan?',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data.reply);
      } else {
        setTestResult(`Error: ${data.error}`);
      }
    } catch {
      setTestResult('Error al conectar con el servicio de IA.');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-amber-500" />
            Configuración de Proveedores de IA
          </h1>
          <p className="text-sm text-zinc-400">
            Orquestación multi-proveedor y multi-modelo para el Agente Inteligente de Atención al Público de Invest Oil LLC.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-amber-400 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar Configuración
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400 text-sm">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>Configuración guardada exitosamente y sincronizada con la base de datos persistente.</span>
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Lista de Proveedores */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Proveedores Disponibles
          </label>
          <div className="space-y-2">
            {settings.providers.map((p) => {
              const isSelected = p.id === selectedProviderId;
              const isActiveEngine = settings.activeProviderId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProviderId(p.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/5'
                      : 'border-white/10 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white flex items-center gap-2">
                      <Bot className={`h-4 w-4 ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`} />
                      {p.name}
                    </span>
                    {isActiveEngine && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                        Motor Activo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Configuración del Proveedor Seleccionado */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" />
                  {currentProvider.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{currentProvider.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      activeProviderId: currentProvider.id,
                    }))
                  }
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                    settings.activeProviderId === currentProvider.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                  }`}
                >
                  {settings.activeProviderId === currentProvider.id
                    ? '✓ Proveedor Activo en Front'
                    : 'Establecer como Activo'}
                </button>
              </div>
            </div>

            {/* Inputs del Proveedor */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>API Key</span>
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> Encriptación segura en servidor
                  </span>
                </label>
                <input
                  type="password"
                  value={currentProvider.apiKey || ''}
                  onChange={(e) => handleProviderChange('apiKey', e.target.value)}
                  placeholder={`sk-... (Clave de ${currentProvider.name})`}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Modelo por Defecto
                </label>
                <select
                  value={currentProvider.defaultModel}
                  onChange={(e) => handleProviderChange('defaultModel', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                >
                  {currentProvider.availableModels.map((m) => (
                    <option key={m} value={m} className="bg-zinc-900 text-zinc-200">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Base URL (Endpoint API)
                </label>
                <input
                  type="text"
                  value={currentProvider.baseUrl || ''}
                  onChange={(e) => handleProviderChange('baseUrl', e.target.value)}
                  placeholder="https://api..."
                  className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Test de Prueba */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Verificar respuesta del agente:</span>
                <button
                  type="button"
                  onClick={handleTestChat}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  {isTesting ? 'Probando...' : 'Ejecutar Test'}
                </button>
              </div>

              {testResult && (
                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-zinc-300 leading-relaxed">
                  <div className="font-semibold text-amber-400 mb-1 flex items-center gap-1">
                    <Bot className="h-3.5 w-3.5" /> Respuesta simulada / API:
                  </div>
                  {testResult}
                </div>
              )}
            </div>
          </div>

          {/* System Prompt Global */}
          <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-500" />
                System Prompt Global del Agente
              </label>
              <span className="text-xs text-zinc-500">Instrucciones base de Invest Oil LLC</span>
            </div>
            <textarea
              rows={5}
              value={settings.systemPrompt}
              onChange={(e) => setSettings((prev) => ({ ...prev, systemPrompt: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-zinc-950 p-3.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
