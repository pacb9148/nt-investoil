import { getAiSettings } from './ai-service';
import { ConfiguredModelItem } from './ai-types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function executeAiChat(messages: ChatMessage[]): Promise<string> {
  const settings = await getAiSettings();
  const models = settings.models || [];
  const activeModel: ConfiguredModelItem | undefined =
    models.find((m) => m.isActiveEngine) ||
    models.find((m) => m.id === settings.activeModelId) ||
    models[0];

  // Si tiene API Key configurada, ejecutamos la llamada externa
  if (activeModel && activeModel.apiKey && activeModel.apiKey.trim() !== '') {
    try {
      if (activeModel.apiStyle === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': activeModel.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: activeModel.modelName || 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: settings.systemPrompt,
            messages: messages.filter((m) => m.role !== 'system').map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.content && data.content[0]?.text) {
            return cleanMarkdownResponse(data.content[0].text);
          }
        }
      } else {
        // OpenAI / OpenRouter / DeepSeek / NVIDIA / Groq (OpenAI-compatible)
        const baseUrl = activeModel.baseUrl || 'https://api.openai.com/v1';
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeModel.apiKey}`,
        };
        if (activeModel.providerId === 'openrouter') {
          headers['HTTP-Referer'] = 'https://investoil.es';
          headers['X-Title'] = 'Invest Oil LLC Assistant';
        }

        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: activeModel.modelName,
            messages: [
              { role: 'system', content: settings.systemPrompt },
              ...messages.filter((m) => m.role !== 'system'),
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.choices && data.choices[0]?.message?.content) {
            return cleanMarkdownResponse(data.choices[0].message.content);
          }
        }
      }
    } catch (err) {
      console.warn('Fallo en proveedor de IA externo, usando Knowledge Base corporativa:', err);
    }
  }

  // Fallback de Inteligencia Corporativa de Invest Oil LLC
  const rawReply = generateKnowledgeBaseResponse(messages[messages.length - 1]?.content || '');
  return cleanMarkdownResponse(rawReply);
}

/**
 * Limpia caracteres de markdown crudo (asteriscos de negrita excesivos, numerales de encabezados)
 * para presentar una respuesta limpia, fluida y legible en la ventana de chat del orbe.
 */
export function cleanMarkdownResponse(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '') // Quitar # de títulos
    .replace(/\*\*(.*?)\*\*/g, '$1') // Quitar **negrita**
    .replace(/\*(.*?)\*/g, '$1') // Quitar *cursiva*
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1') // Quitar _subrayado_
    .replace(/^>\s+/gm, '') // Quitar blockquotes
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // Quitar backticks de código
    .replace(/\n{3,}/g, '\n\n') // Normalizar saltos de línea
    .trim();
}

function generateKnowledgeBaseResponse(query: string): string {
  const q = query.toLowerCase();

  // PROTOCOLO DE UBICACIÓN ESTRICTO
  if (
    q.includes('ubicacion') ||
    q.includes('ubicación') ||
    q.includes('donde estan') ||
    q.includes('dónde están') ||
    q.includes('donde queda') ||
    q.includes('oficina') ||
    q.includes('sedes') ||
    q.includes('sede') ||
    q.includes('direccion') ||
    q.includes('dirección') ||
    q.includes('telefono') ||
    q.includes('teléfono') ||
    q.includes('contacto') ||
    q.includes('houston') ||
    q.includes('madrid') ||
    q.includes('bogota') ||
    q.includes('bogotá')
  ) {
    return `Invest Oil LLC cuenta con presencia y coordinación operativa en las ciudades de Houston, Madrid y Bogotá.\n\nPara concertar una cita ejecutiva o coordinar una reunión directa con uno de nuestros representantes, le invitamos cordialmente a completar el formulario de contacto disponible en este sitio web.\n\nLe recordamos que toda comunicación formal o requerimiento comercial debe canalizarse de manera oficial vía email corporativo a: trading@investoil.es.`;
  }

  if (q.includes('diésel') || q.includes('diesel') || q.includes('en590') || q.includes('combustible')) {
    return `En Invest Oil LLC comercializamos Ultra Low Sulfur Diesel (ULSD) EN590 10 ppm con estricto cumplimiento de especificaciones internacionales de refinería. Facilitamos operaciones Spot y contratos a plazo (LTR) bajo Incoterms FOB y CIF en los principales puertos y terminales internacionales, respaldados por certificación independiente SGS o Saybolt.\n\nSi desea iniciar una solicitud corporativa, por favor remita su ICPO a trading@investoil.es o utilice el formulario de contacto de nuestra web.`;
  }

  if (q.includes('jet') || q.includes('a1') || q.includes('a-1') || q.includes('aviacion') || q.includes('aviación')) {
    return `Facilitamos asignaciones de Aviation Kerosene Colonial Grade 54 (Jet Fuel A-1) bajo estándar ASTM D1655. Operamos mediante procedimientos seguros en terminales de almacenamiento FOB e itinerarios marítimos CIF. Toda transacción requiere carta de intención corporativa formal (ICPO) y cumplimiento de estándares de verificación bancaria.`;
  }

  if (q.includes('pet coke') || q.includes('coque') || q.includes('solido') || q.includes('carbon')) {
    return `Invest Oil LLC actúa como facilitador estratégico en el suministro de Coque de Petróleo (Anode Grade y Fuel Grade) en despachos marítimos para la industria metalúrgica, de aluminio y cementera internacional, garantizando parámetros óptimos de poder calorífico y bajo azufre.`;
  }

  if (q.includes('gnl') || q.includes('gas') || q.includes('lng') || q.includes('glp') || q.includes('metano')) {
    return `En el segmento de gas, coordinamos operaciones de Gas Natural Licuado (GNL criogénico) y GLP comercial para abastecimiento marítimo e industrial, estructuradas bajo contratos de suministro de primer orden.`;
  }

  if (q.includes('precio') || q.includes('cotiz') || q.includes('costo') || q.includes('procedimiento') || q.includes('fob') || q.includes('cif')) {
    return `Nuestras operaciones se estructuran de conformidad con cotizaciones indexadas a índices Platts de referencia internacional con descuentos según volumen y vigencia de contrato. Para emitir una oferta formal (FCO o SCO), requerimos la recepción de una ICPO corporativa con perfil de empresa. Puede remitirla a trading@investoil.es o ingresar sus datos en el formulario de contacto del portal.`;
  }

  return `Bienvenido a Invest Oil LLC — Petroleum and Derivates Markets.\n\nSomos facilitadores en el mercado del petróleo y sus derivados entre compradores y vendedores de primer orden. Comercializamos crudos, destilados limpios (Diésel EN590, Jet A-1), coque de petróleo y GNL.\n\n¿En qué especificación o consulta operativa podemos asistirle hoy?`;
}
