'use client';

import React, { useState, useEffect } from 'react';
import {
  ConfiguredModelItem,
  ProviderPresetId,
  PRESET_PROVIDERS,
  DEFAULT_AI_SETTINGS,
  AiSettingsConfig,
  ApiStyle,
  TrainingFaqItem,
} from '@/lib/ai/ai-types';
import {
  Bot,
  Key,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Radio,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Volume2,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Terminal,
  Brain,
  BookOpen,
  HelpCircle,
  Plus,
  Send,
  Save,
  Loader2,
  FileText,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AiSettingsPage() {
  const [settings, setSettings] = useState<AiSettingsConfig>(DEFAULT_AI_SETTINGS);
  const [activeMainTab, setActiveMainTab] = useState<'training' | 'credentials'>('training');
  const [selectedPreset, setSelectedPreset] = useState<ProviderPresetId>('nvidia');

  // Estado del Formulario de Credenciales
  const [providerName, setProviderName] = useState('Nvidia NIM');
  const [apiStyle, setApiStyle] = useState<ApiStyle>('openai-compatible');
  const [baseUrl, setBaseUrl] = useState('https://integrate.api.nvidia.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelName, setModelName] = useState('nvidia/llama-3.1-nemotron-70b-instruct');
  const [costPer1M, setCostPer1M] = useState<number>(0.0);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [category, setCategory] = useState<'text' | 'audio' | 'image'>('text');
  const [tags, setTags] = useState<string[]>(['razona', 'grande']);

  // Estado de Entrenamiento / Base de Conocimiento
  const [systemPromptInput, setSystemPromptInput] = useState(DEFAULT_AI_SETTINGS.systemPrompt);
  const [knowledgeBaseInput, setKnowledgeBaseInput] = useState(DEFAULT_AI_SETTINGS.knowledgeBase || '');
  const [trainingFaqsList, setTrainingFaqsList] = useState<TrainingFaqItem[]>(DEFAULT_AI_SETTINGS.trainingFaqs || []);

  // Nueva FAQ en edición
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('General');

  // Simulador / Chat de prueba en vivo
  const [testUserQuery, setTestUserQuery] = useState('');
  const [testChatReply, setTestChatReply] = useState<string | null>(null);
  const [isTestChatting, setIsTestChatting] = useState(false);

  // UI state
  const [showCodeAccordion, setShowCodeAccordion] = useState(false);
  const [snippetCode, setSnippetCode] = useState('');
  const [activeTabCategory, setActiveTabCategory] = useState<'all' | 'text' | 'audio' | 'image'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/settings/ai')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          setSystemPromptInput(data.settings.systemPrompt || DEFAULT_AI_SETTINGS.systemPrompt);
          setKnowledgeBaseInput(data.settings.knowledgeBase || DEFAULT_AI_SETTINGS.knowledgeBase || '');
          setTrainingFaqsList(data.settings.trainingFaqs || DEFAULT_AI_SETTINGS.trainingFaqs || []);
        }
      })
      .catch((err) => console.error('Error al cargar config de IA:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectPreset = (presetId: ProviderPresetId) => {
    setSelectedPreset(presetId);
    const preset = PRESET_PROVIDERS.find((p) => p.id === presetId);
    if (preset) {
      setProviderName(preset.defaultName);
      setApiStyle(preset.defaultApiStyle);
      setBaseUrl(preset.defaultBaseUrl);
      setModelName(preset.defaultModel);
      setCategory(preset.category);
      setTags(preset.tags);
    }
  };

  // Guardar configuración de entrenamiento (System Prompt + Knowledge Base + FAQs)
  const handleSaveTraining = async () => {
    setIsSaving(true);
    const updatedSettings: AiSettingsConfig = {
      ...settings,
      systemPrompt: systemPromptInput.trim(),
      knowledgeBase: knowledgeBaseInput.trim(),
      trainingFaqs: trainingFaqsList,
    };

    try {
      const res = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(updatedSettings);
        setNotification({
          type: 'success',
          message: '✓ Base de Conocimiento, System Prompt y Datos de Entrenamiento actualizados correctamente.',
        });
        setTimeout(() => setNotification(null), 4000);
      } else {
        throw new Error(data.error || 'Error al guardar');
      }
    } catch {
      setNotification({ type: 'error', message: 'Error al guardar el entrenamiento del agente.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Añadir una nueva FAQ de entrenamiento
  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
      alert('Por favor ingresa tanto la pregunta como la respuesta oficial esperada.');
      return;
    }

    const newFaq: TrainingFaqItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      category: newFaqCategory.trim() || 'General',
    };

    setTrainingFaqsList((prev) => [newFaq, ...prev]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const handleRemoveFaq = (id: string) => {
    setTrainingFaqsList((prev) => prev.filter((f) => f.id !== id));
  };

  // Probar el agente en vivo con la Base de Conocimiento actual
  const handleSimulateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUserQuery.trim()) return;

    setIsTestChatting(true);
    setTestChatReply(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testUserQuery.trim() }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setTestChatReply(data.reply);
      } else {
        setTestChatReply(`Error: ${data.error || 'Sin respuesta del agente'}`);
      }
    } catch {
      setTestChatReply('Fallo al conectar con el endpoint de IA.');
    } finally {
      setIsTestChatting(false);
    }
  };

  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim()) {
      alert('El identificador del modelo es obligatorio.');
      return;
    }

    setIsSaving(true);
    const newModel: ConfiguredModelItem = {
      id: `mod-${Date.now().toString(36)}`,
      providerId: selectedPreset,
      providerName,
      modelName: modelName.trim(),
      category,
      apiStyle,
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      costPer1MTokens: Number(costPer1M) || 0,
      visibility,
      tags: tags.length > 0 ? tags : ['rápido'],
      isActiveEngine: settings.models.length === 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedModels = [newModel, ...settings.models];
    const newSettings: AiSettingsConfig = {
      ...settings,
      models: updatedModels,
    };

    try {
      const res = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(newSettings);
        setApiKey('');
        setNotification({ type: 'success', message: `Modelo "${newModel.modelName}" registrado exitosamente.` });
        setTimeout(() => setNotification(null), 4000);
      }
    } catch {
      setNotification({ type: 'error', message: 'Error al registrar credencial.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (modelId: string) => {
    const updated = settings.models.map((m) => ({
      ...m,
      isActiveEngine: m.id === modelId,
    }));
    const newSettings = {
      ...settings,
      activeModelId: modelId,
      models: updated,
    };
    setSettings(newSettings);

    await fetch('/api/settings/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
  };

  const handleToggleVisibility = async (modelId: string) => {
    const updated = settings.models.map((m) => {
      if (m.id === modelId) {
        return {
          ...m,
          visibility: m.visibility === 'public' ? ('private' as const) : ('public' as const),
        };
      }
      return m;
    });
    const newSettings = { ...settings, models: updated };
    setSettings(newSettings);

    await fetch('/api/settings/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('¿Deseas quitar este modelo de la lista de credenciales?')) return;
    const updated = settings.models.filter((m) => m.id !== modelId);
    const newSettings = { ...settings, models: updated };
    setSettings(newSettings);

    await fetch('/api/settings/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
  };

  const handleTestModel = async (model: ConfiguredModelItem) => {
    setTestingId(model.id);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Verificación de conectividad Invest Oil LLC',
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setTestResults((prev) => ({
          ...prev,
          [model.id]: '✓ Respuesta recibida con éxito (200 OK)',
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [model.id]: `Error: ${data.error || 'Fallo de inferencia'}`,
        }));
      }
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [model.id]: 'Fallo de conexión al endpoint.',
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleCopyKey = (id: string, keyVal: string) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const filteredModels = settings.models.filter((m) => {
    if (activeTabCategory === 'all') return true;
    return m.category === activeTabCategory;
  });

  const textCount = settings.models.filter((m) => m.category === 'text').length;
  const audioCount = settings.models.filter((m) => m.category === 'audio').length;
  const imageCount = settings.models.filter((m) => m.category === 'image').length;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 max-w-6xl mx-auto">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center gap-2.5">
            <Bot className="h-6 w-6 text-accent" />
            <span>Configuración & Entrenamiento de Inteligencia Artificial</span>
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Entrena al Agente Oficial con datos precisos de la compañía (sedes en Delaware, productos, Incoterms) y administra tus proveedores de LLMs.
          </p>
        </div>

        {activeMainTab === 'training' && (
          <button
            onClick={handleSaveTraining}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50 shrink-0"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Guardando...' : 'Guardar Entrenamiento'}</span>
          </button>
        )}
      </div>

      {notification && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 text-sm font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Selector de Pestaña Principal */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        <button
          type="button"
          onClick={() => setActiveMainTab('training')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all',
            activeMainTab === 'training'
              ? 'bg-accent text-bg font-bold shadow-sm'
              : 'bg-card/70 border border-border text-text-muted hover:text-text hover:border-accent/40'
          )}
        >
          <Brain className="w-4 h-4" />
          <span>1. 🧠 Base de Conocimiento & Entrenamiento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('credentials')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all',
            activeMainTab === 'credentials'
              ? 'bg-accent text-bg font-bold shadow-sm'
              : 'bg-card/70 border border-border text-text-muted hover:text-text hover:border-accent/40'
          )}
        >
          <Key className="w-4 h-4" />
          <span>2. 🔑 Proveedores de IA & Modelos</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-bold">
            {settings.models.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: ENTRENAMIENTO & BASE DE CONOCIMIENTO (KNOWLEDGE BASE)            */}
      {/* ========================================================================= */}
      {activeMainTab === 'training' && (
        <div className="space-y-6">
          {/* Tarjeta Informativa de Guía */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs text-text space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Instrucción y Calibración de Precisión para el Agente Oficial</span>
            </div>
            <p className="text-text-muted leading-relaxed">
              En este módulo defines exactamente <strong>qué sabe</strong> el agente y <strong>cómo debe responder</strong> a clientes y refinerías. Toda la información que agregues aquí se inyecta como contexto primario en las consultas del Orbe 3D público y en las respuestas de IA, evitando alucinaciones o confusiones de sedes geográficas.
            </p>
          </div>

          {/* Bloque A: Instrucciones de Rol y Comportamiento (System Prompt) */}
          <div className="rounded-2xl border border-border bg-surf/50 p-6 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>A. Prompt del Sistema (Personalidad, Rol y Tono Ejecutivo)</span>
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Define el rol del asistente, protocolo de atención y directrices de respuesta.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSystemPromptInput(DEFAULT_AI_SETTINGS.systemPrompt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent text-accent text-xs font-mono font-medium transition-all shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restablecer Prompt Recomendado</span>
              </button>
            </div>

            <div>
              <textarea
                rows={5}
                value={systemPromptInput}
                onChange={(e) => setSystemPromptInput(e.target.value)}
                className="w-full rounded-xl bg-card/80 border border-border px-4 py-3 text-xs text-text focus:outline-none focus:border-accent transition-colors font-mono leading-relaxed"
                placeholder="Eres el Asistente Oficial e Inteligente de Invest Oil LLC..."
              />
              <span className="text-[10px] text-text-subtle font-mono mt-1 block">
                {systemPromptInput.length} caracteres
              </span>
            </div>
          </div>

          {/* Bloque B: Base de Conocimiento Corporativa y Datos Precisos (Knowledge Base) */}
          <div className="rounded-2xl border border-border bg-surf/50 p-6 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>B. Base de Conocimiento Corporativa (Datos Precisos para Entrenar al Agente)</span>
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Ingresa aquí los datos reales de la empresa: sede Delaware USA, hubs, especificaciones ASTM D1655, EN590, Pet Coke, Incoterms, ICPO y compliance.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setKnowledgeBaseInput(DEFAULT_AI_SETTINGS.knowledgeBase || '')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent text-accent text-xs font-mono font-medium transition-all shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Cargar Plantilla Petrolera Completa</span>
              </button>
            </div>

            <div>
              <textarea
                rows={12}
                value={knowledgeBaseInput}
                onChange={(e) => setKnowledgeBaseInput(e.target.value)}
                className="w-full rounded-xl bg-card/80 border border-border px-4 py-3 text-xs text-text focus:outline-none focus:border-accent transition-colors font-mono leading-relaxed"
                placeholder="IDENTIDAD CORPORATIVA Y JURISDICCIÓN:&#10;- Razón Social: Invest Oil LLC...&#10;- Sede Legal: Delaware, Estados Unidos...&#10;- Desks: Houston, Madrid, Bogotá...&#10;&#10;CATÁLOGO DE PRODUCTOS:&#10;1. Diésel EN590 10 ppm...&#10;2. Jet Fuel A-1 (ASTM D1655)..."
              />
              <span className="text-[10px] text-text-subtle font-mono mt-1 block">
                {knowledgeBaseInput.length} caracteres de contexto corporativo entrenado
              </span>
            </div>
          </div>

          {/* Bloque C: Preguntas y Respuestas Calibradas (Few-Shot Q&A de Entrenamiento) */}
          <div className="rounded-2xl border border-border bg-surf/50 p-6 space-y-5 shadow-lg">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>C. Preguntas Frecuentes y Respuestas Calibradas (Exact Q&A)</span>
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Configura preguntas típicas de clientes y la respuesta exacta que el agente debe brindar.
              </p>
            </div>

            {/* Formulario para añadir nueva FAQ */}
            <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3">
              <span className="text-[10px] font-mono uppercase text-accent font-bold block">
                + Añadir Nueva Pregunta & Respuesta Entrenada
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="text-[9px] font-mono uppercase text-text-subtle block mb-1">
                    Pregunta del Usuario o Cliente
                  </label>
                  <input
                    type="text"
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    placeholder="Ej: ¿Dónde está la sede legal de Invest Oil LLC?"
                    className="w-full rounded-lg bg-card border border-border px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="text-[9px] font-mono uppercase text-text-subtle block mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={newFaqCategory}
                    onChange={(e) => setNewFaqCategory(e.target.value)}
                    placeholder="Ej: Sede / Productos"
                    className="w-full rounded-lg bg-card border border-border px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="sm:col-span-12">
                  <label className="text-[9px] font-mono uppercase text-text-subtle block mb-1">
                    Respuesta Oficial Exacta que debe dar el Agente
                  </label>
                  <textarea
                    rows={2}
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    placeholder="Ej: Invest Oil LLC es una compañía registrada en Delaware, Estados Unidos, con desks en Houston, Madrid y Bogotá..."
                    className="w-full rounded-lg bg-card border border-border px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir a la Base Entrenada</span>
                </button>
              </div>
            </div>

            {/* Listado de FAQs Entrenadas */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono text-text-subtle uppercase">
                {trainingFaqsList.length} preguntas calibradas en memoria:
              </span>

              {trainingFaqsList.map((faq) => (
                <div
                  key={faq.id}
                  className="p-3.5 rounded-xl border border-border bg-card/40 hover:bg-card/70 transition-all space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                          {faq.category || 'General'}
                        </span>
                        <p className="text-xs font-bold text-text">{faq.question}</p>
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed pl-1 border-l-2 border-accent/40">
                        {faq.answer}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(faq.id)}
                      className="text-text-subtle hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                      title="Eliminar pregunta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloque D: Probador / Simulador de Chat en Vivo */}
          <div className="rounded-2xl border border-border bg-surf/50 p-6 space-y-4 shadow-lg">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>D. Probar y Simular Respuesta del Agente en Tiempo Real</span>
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Hazle una pregunta de prueba para verificar cómo responde el agente antes de publicar o guardar.
              </p>
            </div>

            <form onSubmit={handleSimulateChat} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={testUserQuery}
                  onChange={(e) => setTestUserQuery(e.target.value)}
                  placeholder="Ej: ¿Dónde está ubicada la empresa y qué diésel venden?"
                  className="flex-1 rounded-xl bg-card border border-border px-4 py-2.5 text-xs text-text focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={isTestChatting || !testUserQuery.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50 shrink-0"
                >
                  {isTestChatting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isTestChatting ? 'Consultando...' : 'Enviar Prueba'}</span>
                </button>
              </div>

              {testChatReply && (
                <div className="p-4 rounded-xl border border-accent/30 bg-accent/5 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[10px] font-mono text-accent font-bold">
                    <span>Respuesta del Asistente Oficial:</span>
                    <span className="text-emerald-400">✓ Inferencia Generada</span>
                  </div>
                  <p className="text-xs text-text leading-relaxed whitespace-pre-line font-sans">
                    {testChatReply}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Botón Inferior de Guardar */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveTraining}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Guardando...' : 'Guardar Todo el Entrenamiento y Base de Conocimiento'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PROVEEDORES DE IA & CREDENCIALES (MODO TRADICIONAL)               */}
      {/* ========================================================================= */}
      {activeMainTab === 'credentials' && (
        <div className="space-y-8">
          {/* Formulario: Agregar Credencial de Plataforma */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md p-6 sm:p-7 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                <Key className="h-5 w-5 text-amber-500" />
                Agregar credencial de plataforma
              </h2>
              <span className="text-xs text-zinc-400 font-mono">Invest Oil LLC · Multi-Model AI</span>
            </div>

            {/* Acordeón opcional de pegar código */}
            <div className="rounded-xl border border-white/5 bg-zinc-950/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowCodeAccordion(!showCodeAccordion)}
                className="w-full flex items-center justify-between p-3.5 text-xs text-amber-400/90 font-medium hover:bg-white/5 transition"
              >
                <span className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-amber-500" />
                  <span>• 📋 Pegar el código del proveedor (Python, Node, LangChain o curl)</span>
                </span>
                {showCodeAccordion ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showCodeAccordion && (
                <div className="p-4 border-t border-white/5 space-y-3">
                  <textarea
                    rows={3}
                    value={snippetCode}
                    onChange={(e) => setSnippetCode(e.target.value)}
                    placeholder="Pega un comando curl o fragmento de código con la base URL y API key..."
                    className="w-full rounded-lg border border-white/10 bg-zinc-950 p-3 text-xs text-zinc-300 font-mono placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Puedes pegar directamente un payload de configuración de API y se auto-completarán los campos disponibles.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveCredential} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Proveedor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-amber-500" />
                    <span>Proveedor</span>
                  </label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => handleSelectPreset(e.target.value as ProviderPresetId)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                  >
                    {PRESET_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Categoría */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                    <span>Categoría</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'text' | 'audio' | 'image')}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                  >
                    <option value="text">Texto / Chat (LLM)</option>
                    <option value="audio">Voz / Audio (TTS / STT)</option>
                    <option value="image">Imagen / Generación</option>
                  </select>
                </div>

                {/* 3. Nombre del Modelo */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                    <span>Nombre o ID del modelo</span>
                    <span className="text-[10px] text-amber-400/80 font-normal">Obligatorio</span>
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="ej. nvidia/llama-3.1-nemotron-70b-instruct"
                    required
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Fila 2: API Key y URL Base */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Clave de API */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Clave de API</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">Cifrada en reposo</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="nvapi-..., sk-..., AIza..."
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    >
                      {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Base URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-amber-500" />
                    <span>URL Base del Proveedor</span>
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://integrate.api.nvidia.com/v1"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Fila 3: Visibilidad, Costo y Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Visibilidad</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="public">Pública (Disponible)</option>
                    <option value="private">Privada (Solo Admin)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Costo / 1M Tokens ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPer1M}
                    onChange={(e) => setCostPer1M(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Etiquetas (tags)</label>
                  <input
                    type="text"
                    value={tags.join(', ')}
                    onChange={(e) => setTags(e.target.value.split(',').map((t) => t.trim()))}
                    placeholder="razona, grande, rápido"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Botón Agregar Credencial */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
                >
                  <Key className="h-4 w-4" />
                  <span>{isSaving ? 'Registrando...' : 'Registrar credencial'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Listado de Modelos Registrados */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md p-6 sm:p-7 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Bot className="h-5 w-5 text-amber-500" />
                <span>Credenciales registradas por el usuario</span>
                <span className="text-xs text-zinc-400 font-normal">({settings.models.length} modelos)</span>
              </h2>

              {/* Pestañas de Filtro por Categoría */}
              <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTabCategory('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTabCategory === 'all'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  TODAS ({settings.models.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabCategory('text')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTabCategory === 'text'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>TEXTO</span>
                  <span className="text-[10px] bg-white/10 rounded-full px-1.5 py-0.2">{textCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabCategory('audio')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTabCategory === 'audio'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>VOZ</span>
                  <span className="text-[10px] bg-white/10 rounded-full px-1.5 py-0.2">{audioCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabCategory('image')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTabCategory === 'image'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>IMAGEN</span>
                  <span className="text-[10px] bg-white/10 rounded-full px-1.5 py-0.2">{imageCount}</span>
                </button>
              </div>
            </div>

            {/* Lista de Modelos */}
            <div className="space-y-2.5 pt-2">
              {filteredModels.map((model, idx) => {
                const isTestingThis = testingId === model.id;
                const testMsg = testResults[model.id];
                const isKeyVisible = visibleKeys[model.id] || false;

                return (
                  <div
                    key={model.id}
                    className="rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-900/80 p-4 transition-all space-y-2"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      {/* Lado Izquierdo: Info del Modelo */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-zinc-500 font-mono">{idx + 1}/{settings.models.length}</span>
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold text-sm text-white font-mono">{model.modelName}</span>
                          <span className="text-xs text-zinc-400 font-medium">{model.providerName}</span>
                          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <MessageSquare className="h-3 w-3" />
                            {model.category.toUpperCase()}
                          </span>
                          {model.visibility === 'public' ? (
                            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                              <Globe className="h-3 w-3" />
                              PÚBLICA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-zinc-700 text-zinc-300">
                              <Lock className="h-3 w-3" />
                              PRIVADA
                            </span>
                          )}
                          {model.isActiveEngine && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                              Motor Activo
                            </span>
                          )}
                        </div>

                        {/* Subtexto: estilo, URL y fecha */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 font-mono">
                          {model.tags?.map((t) => (
                            <span key={t} className="rounded bg-white/5 px-1.5 py-0.2 text-zinc-400 border border-white/5">
                              {t}
                            </span>
                          ))}
                          <span>{model.apiStyle}</span>
                          <span>·</span>
                          <span className="truncate max-w-sm">{model.baseUrl}</span>
                          <span>·</span>
                          <span>dado de alta el {model.createdAt || '2026-09-24'}</span>
                        </div>
                      </div>

                      {/* Lado Derecho: Acciones y Credencial */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Visualización de API key */}
                        <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-lg border border-white/10 text-xs font-mono text-zinc-400">
                          <span>
                            {model.apiKey
                              ? isKeyVisible
                                ? model.apiKey
                                : `${model.apiKey.slice(0, 8)}...`
                              : 'sin-clave'}
                          </span>
                          {model.apiKey && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setVisibleKeys((prev) => ({ ...prev, [model.id]: !isKeyVisible }))
                                }
                                className="p-1 hover:text-white"
                                title="Alternar visibilidad"
                              >
                                {isKeyVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyKey(model.id, model.apiKey)}
                                className="p-1 hover:text-white"
                                title="Copiar API Key"
                              >
                                {copiedKeyId === model.id ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>

                        {/* Botón Probar */}
                        <button
                          type="button"
                          disabled={isTestingThis}
                          onClick={() => handleTestModel(model)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 transition"
                        >
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          <span>{isTestingThis ? 'Probando...' : 'Probar'}</span>
                        </button>

                        {/* Botón Hacer Privada / Pública */}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(model.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-400 transition"
                        >
                          {model.visibility === 'public' ? 'Hacer privada' : 'Hacer pública'}
                        </button>

                        {/* Botón Activa (fijar motor activo) */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(model.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            model.isActiveEngine
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300'
                          }`}
                        >
                          {model.isActiveEngine ? '✓ Activa' : 'Activar'}
                        </button>

                        {/* Botón Quitar */}
                        <button
                          type="button"
                          onClick={() => handleDeleteModel(model.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Quitar modelo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Resultado de prueba si existe */}
                    {testMsg && (
                      <div className="pt-2 text-xs font-mono text-amber-400 bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                        {testMsg}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
