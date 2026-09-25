export type ProviderPresetId =
  | 'google-ai-studio'
  | 'anthropic'
  | 'openai'
  | 'openrouter'
  | 'nvidia'
  | 'groq'
  | 'deepseek'
  | 'mistral'
  | 'together'
  | 'ollama'
  | 'custom';

export type ApiStyle = 'openai-compatible' | 'anthropic' | 'gemini' | 'ollama';

export interface ConfiguredModelItem {
  id: string;
  providerId: ProviderPresetId;
  providerName: string;
  modelName: string;
  category: 'text' | 'audio' | 'image';
  apiStyle: ApiStyle;
  baseUrl: string;
  apiKey: string;
  costPer1MTokens?: number;
  visibility: 'public' | 'private';
  tags: string[];
  isActiveEngine?: boolean;
  status: 'active' | 'inactive' | 'testing';
  createdAt: string;
}

export interface TrainingFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface AiSettingsConfig {
  activeProviderId: string;
  activeModelId?: string;
  systemPrompt: string;
  knowledgeBase?: string;
  trainingFaqs?: TrainingFaqItem[];
  models: ConfiguredModelItem[];
}

export const PRESET_PROVIDERS: {
  id: ProviderPresetId;
  label: string;
  defaultName: string;
  defaultApiStyle: ApiStyle;
  defaultBaseUrl: string;
  defaultModel: string;
  category: 'text' | 'audio' | 'image';
  tags: string[];
}[] = [
  {
    id: 'google-ai-studio',
    label: 'Google AI Studio',
    defaultName: 'Google AI Studio',
    defaultApiStyle: 'gemini',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-1.5-flash',
    category: 'text',
    tags: ['multimodal', 'gran-contexto'],
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    defaultName: 'Anthropic Claude',
    defaultApiStyle: 'anthropic',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    category: 'text',
    tags: ['razona', 'grande'],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    defaultName: 'OpenAI',
    defaultApiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    category: 'text',
    tags: ['rápido', 'multimodal'],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    defaultName: 'OpenRouter (Multi-Modelo)',
    defaultApiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    category: 'text',
    tags: ['multi-proveedor', 'unificado'],
  },
  {
    id: 'nvidia',
    label: 'Nvidia NIM',
    defaultName: 'Nvidia NIM',
    defaultApiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'nvidia/llama-3.1-nemotron-70b-instruct',
    category: 'text',
    tags: ['ultra-rápido', 'gpu'],
  },
  {
    id: 'groq',
    label: 'Groq',
    defaultName: 'Groq Cloud LPU',
    defaultApiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    category: 'text',
    tags: ['lpu', 'tiempo-real'],
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    defaultName: 'DeepSeek AI',
    defaultApiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    category: 'text',
    tags: ['razona', 'costo-eficiente'],
  },
  {
    id: 'mistral',
    label: 'Mistral',
    defaultName: 'Mistral AI',
    defaultApiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    category: 'text',
    tags: ['europeo', 'seguridad'],
  },
  {
    id: 'together',
    label: 'Together AI',
    defaultName: 'Together AI',
    defaultApiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    category: 'text',
    tags: ['open-source', 'turbo'],
  },
  {
    id: 'ollama',
    label: 'Ollama (local/self-hosted)',
    defaultName: 'Ollama Local Server',
    defaultApiStyle: 'ollama',
    defaultBaseUrl: 'http://localhost:11434/api',
    defaultModel: 'llama3:latest',
    category: 'text',
    tags: ['local', 'privado'],
  },
  {
    id: 'custom',
    label: 'Personalizado (cualquier proveedor)',
    defaultName: 'Servidor Personalizado vLLM / SGLang',
    defaultApiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://api.proveedor.com/v1',
    defaultModel: 'custom-model',
    category: 'text',
    tags: ['custom', 'vllm'],
  },
];

export const DEFAULT_AI_SETTINGS: AiSettingsConfig = {
  activeProviderId: 'openrouter',
  activeModelId: 'mod-1',
  systemPrompt: `Eres el Asistente Oficial e Inteligente de Invest Oil LLC.
Eslogan: "Petroleum and Derivates Markets".
Tu función es atender consultas comerciales, técnicas y corporativas de compradores, vendedores, refinerías, brokers y fondos de inversión internacionales.
Responde siempre con tono ejecutivo, alta rigurosidad técnica, conciso y profesional, sin markdown excesivo.`,
  knowledgeBase: `IDENTIDAD CORPORATIVA Y JURISDICCIÓN:
- Razón Social: Invest Oil LLC.
- Jurisdicción Legal: Registrada y constituida bajo las leyes del Estado de Delaware, Estados Unidos de América.
- Actividad: Facilitación y trading en el mercado internacional de petróleo, crudos y derivados energéticos.
- Oficinas y Desks de Coordinación Operativa: Houston (Texas, USA), Madrid (España) y Bogotá (Colombia).
- Aclaratoria Importante: Invest Oil LLC no tiene ningún vínculo con empresas inmobiliarias o entidades locales extintas de Valencia (España).

CATÁLOGO PRINCIPAL DE PRODUCTOS Y ESPECIFICACIONES:
1. Diésel Ultra Bajo Azufre (ULSD) EN590 10 ppm: Cumplimiento de especificación europea EN590, cetano > 51, azufre < 10 ppm. Modalidad Spot y contratos LTR (12 meses).
2. Jet Fuel A-1 (Aviation Kerosene Colonial Grade 54): Estándar internacional ASTM D1655. Despachos FOB Rotterdam / Houston y fletamentos marítimos CIF.
3. Crudos Pesados y Ligeros: Merey 16 (API 16°, azufre ~2.5% para refinerías de conversión profunda) y Brent Blend (API 38-40°, bajo azufre).
4. Pet Coke (Coque de Petróleo Verde): Grado ánodo y grado combustible para industria cementera y metalúrgica (HGI 40-45, humedad < 8%).
5. Gas Natural Licuado (GNL) y GLP comercial (mezcla propano/butano).

PROCEDIMIENTOS Y COMPLIANCE:
- Para compras y aperturas comerciales se requiere ICPO (Irrevocable Corporate Purchase Order) con detalles de empresa compradora y banco emisor.
- Verificación de calidad y cantidad por inspectores independientes internacionales (SGS, Saybolt, Intertek).
- Incoterms habituales: FOB (Rotterdam, Houston, Fujairah) y CIF puertos seguros internacionales.
- Medios de pago estándar de la industria: Cartas de Crédito Documentarias Irrevocables (DLC / SBLC) o transferencias bancarias directas contra presentación de documentos de embarque (MT103).

PROTOCOLO DE ATENCIÓN Y CONTACTO:
- Al ser consultado por ubicación: Menciona que la sede legal es Delaware (USA) con coordinación comercial en Houston, Madrid y Bogotá.
- Invita cordialmente al usuario a completar el formulario de contacto de la web para una reunión ejecutiva.
- Correo oficial de operaciones y trading: trading@investoil.es.`,
  trainingFaqs: [
    {
      id: 'faq-1',
      question: '¿Dónde está la sede de Invest Oil LLC y qué oficinas tienen?',
      answer: 'Invest Oil LLC es una compañía registrada en el Estado de Delaware, Estados Unidos, con desks de coordinación operativa y comercial en Houston (Texas), Madrid (España) y Bogotá (Colombia).',
      category: 'Corporativo',
    },
    {
      id: 'faq-2',
      question: '¿Qué productos comercializan principalmente?',
      answer: 'Comercializamos y facilitamos asignaciones de Diésel EN590 10 ppm, Jet Fuel A-1 (ASTM D1655), crudo Merey 16, Brent Blend, Pet Coke para cementeras y metalurgia, y Gas Natural Licuado (GNL).',
      category: 'Productos',
    },
    {
      id: 'faq-3',
      question: '¿Cómo puedo iniciar una solicitud de compra o venta?',
      answer: 'Para evaluar requerimientos comerciales, los compradores calificados deben remitir una carta de intención formal (ICPO) y datos de contacto corporativos a trading@investoil.es o a través del formulario de contacto en nuestro sitio web.',
      category: 'Procedimientos',
    },
    {
      id: 'faq-4',
      question: '¿Qué certificaciones de calidad respaldan sus cargamentos?',
      answer: 'Todas las operaciones cuentan con certificación independiente de cantidad y calidad emitida en puerto de carga o terminal de almacenamiento por inspectores reconocidos como SGS, Saybolt o Intertek.',
      category: 'Calidad',
    },
  ],
  models: [
    {
      id: 'mod-1',
      providerId: 'openrouter',
      providerName: 'OpenRouter (Multi-Modelo)',
      modelName: 'anthropic/claude-3.5-sonnet',
      category: 'text',
      apiStyle: 'openai-compatible',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: '',
      costPer1MTokens: 3.0,
      visibility: 'public',
      tags: ['razona', 'grande'],
      isActiveEngine: true,
      status: 'active',
      createdAt: '2026-09-24',
    },
    {
      id: 'mod-2',
      providerId: 'nvidia',
      providerName: 'Nvidia NIM',
      modelName: 'nvidia/nemotron-3-ultra-550b-a55b',
      category: 'text',
      apiStyle: 'openai-compatible',
      baseUrl: 'https://integrate.api.nvidia.com/v1',
      apiKey: '',
      costPer1MTokens: 1.5,
      visibility: 'public',
      tags: ['razona', 'grande'],
      isActiveEngine: false,
      status: 'active',
      createdAt: '2026-09-24',
    },
    {
      id: 'mod-3',
      providerId: 'deepseek',
      providerName: 'DeepSeek AI',
      modelName: 'deepseek/deepseek-chat',
      category: 'text',
      apiStyle: 'openai-compatible',
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: '',
      costPer1MTokens: 0.27,
      visibility: 'public',
      tags: ['rápido', 'costo-eficiente'],
      isActiveEngine: false,
      status: 'active',
      createdAt: '2026-09-24',
    },
    {
      id: 'mod-4',
      providerId: 'openai',
      providerName: 'OpenAI',
      modelName: 'gpt-4o',
      category: 'text',
      apiStyle: 'openai-compatible',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      costPer1MTokens: 5.0,
      visibility: 'public',
      tags: ['multimodal', 'global'],
      isActiveEngine: false,
      status: 'active',
      createdAt: '2026-09-24',
    },
    {
      id: 'mod-5',
      providerId: 'google-ai-studio',
      providerName: 'Google AI Studio',
      modelName: 'gemini-1.5-flash',
      category: 'text',
      apiStyle: 'gemini',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      apiKey: '',
      costPer1MTokens: 0.15,
      visibility: 'public',
      tags: ['rápido', '1M-tokens'],
      isActiveEngine: false,
      status: 'active',
      createdAt: '2026-09-24',
    },
  ],
};
