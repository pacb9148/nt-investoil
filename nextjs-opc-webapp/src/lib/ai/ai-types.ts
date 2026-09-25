export interface AiProviderConfig {
  id: 'openrouter' | 'anthropic' | 'openai' | 'nvidia' | 'alibaba' | 'gemini' | 'deepseek';
  name: string;
  enabled: boolean;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  availableModels: string[];
  description: string;
}

export interface AiSettingsConfig {
  activeProviderId: string;
  systemPrompt: string;
  providers: AiProviderConfig[];
}

export const DEFAULT_AI_SETTINGS: AiSettingsConfig = {
  activeProviderId: 'openrouter',
  systemPrompt: `Eres el Asistente Virtual Oficial de Invest Oil LLC, una compañía multinacional líder en comercialización, trading y logística de hidrocarburos, crudos (Brent, WTI, Merey 16), derivados limpios (Diésel EN590 10ppm, Jet Fuel A-1, Gasoil), commodities sólidos (Pet Coke / Coque de petróleo) y Gas Natural Licuado (GNL criogénico).

Tus oficinas y mesas de operaciones operan en Houston (Headquarters), Madrid (European Desk) y Bogotá (Latin America Desk).
Todos los despachos se rigen bajo estándares internacionales SGS/ASTM D1655 e Incoterms 2020 (FOB, CIF, STS).
Responde con tono corporativo de alta finanza y trading energético, con precisión técnica, cortesía ejecutiva y en el idioma en que te consulte el cliente (español o inglés).`,
  providers: [
    {
      id: 'openrouter',
      name: 'OpenRouter (Multi-Modelo Unificado)',
      enabled: true,
      apiKey: '',
      baseUrl: 'https://openrouter.ai/api/v1',
      defaultModel: 'anthropic/claude-3.5-sonnet',
      availableModels: [
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4o',
        'meta-llama/llama-3.1-70b-instruct',
        'deepseek/deepseek-chat',
        'mistralai/mistral-large-2407',
        'google/gemini-pro-1.5',
      ],
      description: 'Acceso unificado a más de 100 modelos con una sola clave API y facturación centralizada.',
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      enabled: false,
      apiKey: '',
      baseUrl: 'https://api.anthropic.com/v1',
      defaultModel: 'claude-3-5-sonnet-20241022',
      availableModels: [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
      ],
      description: 'Modelos líderes en razonamiento complejo, análisis de contratos petroleros y redacción ejecutiva.',
    },
    {
      id: 'openai',
      name: 'OpenAI (ChatGPT & O1)',
      enabled: false,
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4o',
      availableModels: [
        'gpt-4o',
        'gpt-4o-mini',
        'o1-preview',
        'o1-mini',
      ],
      description: 'Modelos multimodales de alta velocidad y capacidades avanzadas de inferencia matemática.',
    },
    {
      id: 'nvidia',
      name: 'NVIDIA NIM (Inferencia Ultra-Rápida)',
      enabled: false,
      apiKey: '',
      baseUrl: 'https://integrate.api.nvidia.com/v1',
      defaultModel: 'meta/llama-3.1-70b-instruct',
      availableModels: [
        'meta/llama-3.1-70b-instruct',
        'nvidia/nemotron-4-340b-instruct',
        'mistralai/mixtral-8x22b-instruct',
      ],
      description: 'Microservicios optimizados sobre GPUs NVIDIA para baja latencia en mesas de operaciones.',
    },
    {
      id: 'alibaba',
      name: 'Alibaba Cloud (Qwen DashScope)',
      enabled: false,
      apiKey: '',
      baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
      defaultModel: 'qwen-plus',
      availableModels: [
        'qwen-plus',
        'qwen-turbo',
        'qwen-max',
        'qwen2.5-72b-instruct',
      ],
      description: 'Especializado en comercio internacional, logística transfronteriza y análisis de mercados asiáticos.',
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      enabled: false,
      apiKey: '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-1.5-flash',
      availableModels: [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-2.0-flash-exp',
      ],
      description: 'Gran ventana de contexto para procesar dossieres marítimos y especificaciones de calidad.',
    },
    {
      id: 'deepseek',
      name: 'DeepSeek AI',
      enabled: false,
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      defaultModel: 'deepseek-chat',
      availableModels: [
        'deepseek-chat',
        'deepseek-coder',
      ],
      description: 'Alta eficiencia y costo optimizado para procesamiento analítico de datos y cotizaciones.',
    },
  ],
};
