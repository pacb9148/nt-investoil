import { getAiSettings } from './ai-service';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function executeAiChat(messages: ChatMessage[]): Promise<string> {
  const settings = await getAiSettings();
  const activeProvider = settings.providers.find((p) => p.id === settings.activeProviderId);

  // Si tiene API Key configurada, ejecutamos la llamada externa
  if (activeProvider && activeProvider.apiKey && activeProvider.apiKey.trim() !== '') {
    try {
      if (activeProvider.id === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': activeProvider.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: activeProvider.defaultModel || 'claude-3-5-sonnet-20241022',
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
            return data.content[0].text;
          }
        }
      } else {
        // OpenAI / OpenRouter / DeepSeek / NVIDIA / Alibaba (OpenAI-compatible)
        const baseUrl = activeProvider.baseUrl || 'https://api.openai.com/v1';
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeProvider.apiKey}`,
        };
        if (activeProvider.id === 'openrouter') {
          headers['HTTP-Referer'] = 'https://investoil.es';
          headers['X-Title'] = 'Invest Oil LLC Assistant';
        }

        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: activeProvider.defaultModel,
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
            return data.choices[0].message.content;
          }
        }
      }
    } catch (err) {
      console.warn('Fallo en proveedor de IA externo, usando Knowledge Base experta:', err);
    }
  }

  // Fallback de Inteligencia de Negocios de Invest Oil LLC
  return generateKnowledgeBaseResponse(messages[messages.length - 1]?.content || '');
}

function generateKnowledgeBaseResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('diésel') || q.includes('diesel') || q.includes('en590') || q.includes('combustible')) {
    return `En Invest Oil LLC suministramos Ultra Low Sulfur Diesel (ULSD) EN590 10 ppm de máxima especificación internacional. 
Disponemos de contratos Spot y LTR (Long Term Contract) bajo Incoterms FOB (Rotterdam, Fujairah, Houston) y CIF principales puertos globales, certificados por inspección SGS o Saybolt. 
¿Desea conocer los volúmenes mínimos por cargamento (MT) o los procedimientos de emisión de ICPO/BCL?`;
  }

  if (q.includes('jet') || q.includes('a1') || q.includes('a-1') || q.includes('aviacion')) {
    return `Manejamos asignaciones garantizadas de Aviation Kerosene Colonial Grade 54 (Jet Fuel A-1) bajo norma ASTM D1655.
Operamos con procedimientos seguros Dip & Pay en tanques de almacenamiento (FOB Tank-to-Tank / Tank-to-Vessel) en puertos clave como Rotterdam y Houston, así como fletamentos CIF marítimos.
Para iniciar el procedimiento comercial, requerimos la recepción de ICPO corporativa con detalles bancarios.`;
  }

  if (q.includes('pet coke') || q.includes('coque') || q.includes('solido') || q.includes('carbon')) {
    return `Invest Oil LLC es un actor destacado en la comercialización de Coque de Petróleo (Anode Grade y Fuel Grade).
Contamos con capacidad logística para despachos de graneles sólidos (Bulk Carriers Handymax y Panamax) con bajo contenido de azufre y alto poder calorífico para las industrias del aluminio, siderurgia y cementeras.
¿Tiene un requerimiento con especificaciones de azufre (Sulfur %) y humedad específicas?`;
  }

  if (q.includes('gnl') || q.includes('gas') || q.includes('lng') || q.includes('glp') || q.includes('metano')) {
    return `Nuestra división de Gas comercializa Gas Natural Licuado (GNL) criogénico y GLP (Propano/Butano comercial).
Facilitamos el aprovisionamiento marítimo mediante buques metaneros dedicados (LNG Carriers) y estaciones de regasificación bajo contratos plurianuales indexados a Henry Hub o TTF.`;
  }

  if (q.includes('contacto') || q.includes('oficina') || q.includes('houston') || q.includes('madrid') || q.includes('bogota') || q.includes('telefono')) {
    return `Invest Oil LLC opera a través de sus tres sedes internacionales:
• **Houston (HQ):** San Felipe St, Suite 2400, Houston, TX 77056, EE. UU. (Mesa de Trading & Contratos)
• **Madrid:** Paseo de la Castellana 95, 28046 Madrid, España (Desk Europeo y Logística Marítima)
• **Bogotá:** Calle 93B #13-20, Bogotá, Colombia (Operaciones y Abastecimiento Latam)

Puede enviar su carta de intención o documentación comercial a: **trading@investoil.es**`;
  }

  if (q.includes('precio') || q.includes('cotiz') || q.includes('costo') || q.includes('procedimiento') || q.includes('fob') || q.includes('cif')) {
    return `Nuestras cotizaciones se indexan a los índices Platts de la región de carga con descuentos estructurados según volumen y vigencia de contrato.
Para emitir una oferta corporativa formal (FCO / SCO), el comprador calificado debe emitir una ICPO formal dirigida a Invest Oil LLC acompañada de CP (Company Profile). Todos los procedimientos contemplan verificación SGS y emisión de garantías financieras estándar (SBLC / DLC vía bancos Top 50).`;
  }

  return `Bienvenido a la mesa de atención de **Invest Oil LLC**. 
Somos líderes en trading internacional de hidrocarburos, crudos livianos y pesados, derivados limpios (EN590, Jet A-1), Pet Coke y Gas Natural Licuado (GNL).
¿En qué tipo de producto energético, procedimiento de carga (FOB/CIF) o consulta operativa de trading le podemos asistir hoy?`;
}
