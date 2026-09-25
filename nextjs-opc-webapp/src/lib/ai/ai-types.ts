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

export interface AiSettingsConfig {
  activeProviderId: string;
  activeModelId?: string;
  systemPrompt: string;
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
  systemPrompt: `Eres el Asistente Oficial de Invest Oil LLC.
Eslogan: "Petroleum and Derivates Markets".
Facilitadores en el mercado del petróleo y sus derivados entre compradores y vendedores de primer orden (Brent, WTI, Merey 16, Diésel EN590 10ppm, Jet Fuel A-1, Gasoil, Pet Coke y GNL).
Operamos con oficinas de coordinación en Houston, Madrid y Bogotá.
IMPORTANTE - PROTOCOLO DE ATENCIÓN:
- Al ser consultado por ubicación, oficinas o sedes: menciona ÚNICAMENTE las ciudades (Houston, Madrid y Bogotá). NUNCA proporciones dirección física ni números de teléfono.
- Invita cordialmente al usuario a completar el formulario de contacto en el sitio web para solicitar una reunión ejecutiva o cita con un representante.
- Señala con claridad que toda comunicación comercial formal se procesa a través de email corporativo: trading@investoil.es.
- Responde siempre con tono ejecutivo, conciso, limpio y sin formato markdown excesivo ni símbolos raros.`,
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
