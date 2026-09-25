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

  // Construir el prompt de sistema enriquecido con la Base de Conocimiento y FAQs de entrenamiento
  const systemPromptChunks: string[] = [settings.systemPrompt || ''];

  if (settings.knowledgeBase && settings.knowledgeBase.trim()) {
    systemPromptChunks.push(
      `--- BASE DE CONOCIMIENTO CORPORATIVA Y ESPECIFICACIONES ---\n${settings.knowledgeBase.trim()}`
    );
  }

  if (Array.isArray(settings.trainingFaqs) && settings.trainingFaqs.length > 0) {
    const faqsText = settings.trainingFaqs
      .filter((f) => f.question && f.answer)
      .map((f, i) => `[Ejemplo ${i + 1}]\nPregunta: ${f.question}\nRespuesta oficial: ${f.answer}`)
      .join('\n\n');
    if (faqsText) {
      systemPromptChunks.push(
        `--- PREGUNTAS FRECUENTES Y RESPUESTAS ENTRENADAS (SÉ FIEL A ESTAS RESPUESTAS) ---\n${faqsText}`
      );
    }
  }

  const fullSystemPrompt = systemPromptChunks.filter(Boolean).join('\n\n');

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
            system: fullSystemPrompt,
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
              { role: 'system', content: fullSystemPrompt },
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

  // Fallback de Inteligencia Corporativa de Invest Oil LLC calibrado con FAQs y Knowledge Base
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const rawReply = generateKnowledgeBaseResponse(lastUserMessage, settings);
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

function generateKnowledgeBaseResponse(query: string, settings?: any): string {
  const q = query.toLowerCase().trim();

  // 1. Evaluar si la consulta coincide con preguntas entrenadas (trainingFaqs)
  if (settings && Array.isArray(settings.trainingFaqs)) {
    for (const faq of settings.trainingFaqs) {
      if (!faq.question || !faq.answer) continue;
      const faqQ = faq.question.toLowerCase().trim();
      // Coincidencia exacta o inclusión recíproca
      if (q === faqQ || q.includes(faqQ) || faqQ.includes(q)) {
        return faq.answer;
      }

      // Coincidencia por palabras clave compartidas
      const queryTokens = q.split(/\s+/).filter((w: string) => w.length > 3);
      const faqTokens = faqQ.split(/\s+/).filter((w: string) => w.length > 3);
      if (queryTokens.length > 0 && faqTokens.length > 0) {
        const shared = queryTokens.filter((token: string) => faqTokens.includes(token));
        const matchRatio = shared.length / Math.min(queryTokens.length, faqTokens.length);
        if (matchRatio >= 0.6) {
          return faq.answer;
        }
      }
    }
  }

  // 2. PROTOCOLO DE IDENTIDAD Y SEDE LEGAL (DELAWARE USA + HUBS)
  if (
    q.includes('delaware') ||
    q.includes('valencia') ||
    q.includes('inmobiliaria') ||
    q.includes('homonimo') ||
    q.includes('homónimo')
  ) {
    return `Invest Oil LLC es una compañía constituida y registrada en el Estado de Delaware, Estados Unidos de América. Operamos exclusivamente en el mercado de petróleo, crudo y derivados energéticos internacionales con coordinación en Houston, Madrid y Bogotá. No tenemos vinculación con entidades inmobiliarias ni sociedades de Valencia (España).`;
  }

  // 3. PROTOCOLO DE UBICACIÓN Y SEDES
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
    return `Invest Oil LLC cuenta con sede legal registrada en Delaware (Estados Unidos) y mesas de coordinación operativa en Houston (Texas), Madrid (España) y Bogotá (Colombia).\n\nPara concertar una reunión ejecutiva o solicitar atención directa con un representante, le invitamos a completar el formulario de contacto en nuestro sitio web.\n\nToda comunicación comercial formal o envío de documentos corporativos (ICPO) se canaliza a través de email oficial: trading@investoil.es.`;
  }

  // 4. DIÉSEL EN590
  if (q.includes('diésel') || q.includes('diesel') || q.includes('en590') || q.includes('combustible')) {
    return `En Invest Oil LLC comercializamos Ultra Low Sulfur Diesel (ULSD) EN590 10 ppm con estricto cumplimiento de especificaciones internacionales de refinería (cetano > 51). Facilitamos operaciones Spot y contratos a plazo (LTR) bajo Incoterms FOB y CIF en los principales puertos y terminales internacionales, respaldados por certificación independiente SGS o Saybolt.\n\nPara solicitudes comerciales, remita su ICPO a trading@investoil.es o utilice el formulario de contacto de la web.`;
  }

  // 5. JET FUEL A-1
  if (q.includes('jet') || q.includes('a1') || q.includes('a-1') || q.includes('aviacion') || q.includes('aviación')) {
    return `Facilitamos asignaciones de Aviation Kerosene Colonial Grade 54 (Jet Fuel A-1) bajo estándar ASTM D1655. Operamos mediante procedimientos seguros en terminales de almacenamiento FOB e itinerarios marítimos CIF. Toda transacción requiere carta de intención corporativa formal (ICPO) y verificación bancaria.`;
  }

  // 6. PET COKE
  if (q.includes('pet coke') || q.includes('coque') || q.includes('solido') || q.includes('carbon')) {
    return `Invest Oil LLC actúa como facilitador estratégico en el suministro de Coque de Petróleo Verde (Anode Grade y Fuel Grade) en despachos marítimos para la industria metalúrgica y cementera internacional, garantizando parámetros óptimos de poder calorífico y bajo azufre.`;
  }

  // 7. CRUDOS (MEREY 16 / BRENT)
  if (q.includes('merey') || q.includes('crudo') || q.includes('crude') || q.includes('brent') || q.includes('wti')) {
    return `Facilitamos cargamentos programados de crudo pesado Merey 16 (API 16°, azufre ~2.5%) para refinerías con unidades de conversión profunda, así como mezclas ligeras referenciales Brent y WTI en operaciones spot con liquidación transparente indexada a benchmarks oficiales.`;
  }

  // 8. GAS / GNL / GLP
  if (q.includes('gnl') || q.includes('gas') || q.includes('lng') || q.includes('glp') || q.includes('metano')) {
    return `En el segmento de gas, coordinamos operaciones de Gas Natural Licuado (GNL criogénico) y GLP comercial para abastecimiento marítimo e industrial, estructuradas bajo contratos de suministro de primer orden.`;
  }

  // 9. COTIZACIONES Y PROCEDIMIENTOS
  if (
    q.includes('precio') ||
    q.includes('cotiz') ||
    q.includes('costo') ||
    q.includes('procedimiento') ||
    q.includes('fob') ||
    q.includes('cif') ||
    q.includes('icpo')
  ) {
    return `Nuestras operaciones se estructuran según cotizaciones indexadas a cotizaciones Platts con descuentos según volumen y vigencia de contrato. Para emitir una oferta formal (FCO o SCO), requerimos la recepción de una ICPO corporativa con perfil de empresa. Puede remitirla a trading@investoil.es o ingresar sus datos en el formulario de contacto.`;
  }

  return `Bienvenido a Invest Oil LLC — Petroleum and Derivates Markets.\n\nSomos una compañía registrada en Delaware, EE. UU., facilitadora en el mercado internacional del petróleo y sus derivados (Diésel EN590, Jet Fuel A-1, Merey 16, Brent, Pet Coke y GNL).\n\n¿En qué especificación o consulta operativa podemos asistirle hoy?`;
}
