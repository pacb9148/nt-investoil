import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface MarketNewsItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
  imageUrl?: string;
}

const FALLBACK_RADAR_NEWS: MarketNewsItem[] = [
  {
    id: 'news-google-1',
    title: 'Volatilidad en los Marcadores Brent y WTI ante Nuevas Dinámicas de Demanda Global y Flujos de Refino',
    source: 'Google News / Finanzas & Mercados',
    sourceUrl: 'https://news.google.com',
    publishedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    category: 'Mercado Petrolero & Precios',
    summary: 'El diferencial entre el Brent del Mar del Norte y el West Texas Intermediate experimenta fluctuaciones clave por cambios en la logística de tanqueros en el Atlántico y un sólido apetito por destilados medios en complejos industriales.',
    content: `<p>Los mercados internacionales de hidrocarburos han comenzado la semana registrando una notable reconfiguración en los diferenciales de precios spot para crudos marcadores de referencia. La cotización del crudo Brent ha oscilado con fuerza debido a factores geopolíticos en rutas críticas y a la programación de mantenimientos mayores en refinerías del noroeste europeo.</p>
<p>Por su parte, el crudo WTI estadounidense ha mostrado una resiliencia particular en la Costa del Golfo, impulsado por niveles de exportación récord hacia terminales receptoras en Asia y el Mediterráneo. Facilitadores de mercado y firmas comerciales señalan que el arbitraje transatlántico se mantiene abierto para calidades de crudo ligero dulce con bajo contenido de azufre.</p>
<p>La interacción entre los márgenes de refino (cracks) y los costos de fletamento marítimo continuará siendo el vector determinante en la fijación de precios durante las próximas semanas, lo que exige a los participantes comerciales una gestión rigurosa de contratos y ventanas de entrega FOB/CIF.</p>`,
    tags: ['Brent', 'WTI', 'Google News', 'Crudo', 'Arbitraje', 'Refinación', 'Mercados'],
    imageUrl: '/images/hero/hero-bg-refinery.webp',
  },
  {
    id: 'news-bbc-1',
    title: 'Geopolítica y Rutas Marítimas: Cómo la Reconfiguración de Buques Petroleros Impacta los Precios de los Combustibles',
    source: 'BBC Mundo / Economía & Energía',
    sourceUrl: 'https://www.bbc.com/mundo',
    publishedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    category: 'Logística & Fletes Marítimos',
    summary: 'El desvío obligatorio de supertanqueros VLCC y Suezmax alrededor del Cabo de Buena Esperanza prolonga las travesías entre 10 y 14 días adicionales, elevando los costos de fletes y seguros marítimos globales.',
    content: `<p>La logística internacional de hidrocarburos enfrenta una de sus transformaciones operativas más profundas de la última década. El tráfico de buques petroleros a través de pasos marítimos tradicionales ha sido redirigido de manera sustancial hacia rutas oceánicas más largas para preservar la seguridad de las tripulaciones y las cargas de crudo y derivados.</p>
<p>Este incremento en las toneladas-milla ha absorbido gran parte de la capacidad disponible de superpetroleros de clase VLCC (Very Large Crude Carrier) y Suezmax, incrementando las primas de flete y las coberturas de seguro contra riesgos bélicos. Compradores industriales en Europa y América Latina han debido coordinar con mayor antelación sus pedidos para evitar retrasos en el aprovisionamiento de sus plantas térmicas y refinerías.</p>
<p>Expertos en comercio exterior consultados por BBC Mundo subrayan que la figura de los facilitadores y comercializadores con infraestructura diversificada en Houston, Madrid y centros de distribución neurálgicos resulta esencial para garantizar la continuidad de suministro bajo estrictos términos de cumplimiento legal e Incoterms 2020.</p>`,
    tags: ['BBC Mundo', 'Logística Marítima', 'VLCC', 'Suezmax', 'Fletes', 'Incoterms', 'Combustibles'],
    imageUrl: '/uploads/1790321009575-1790279740.png',
  },
  {
    id: 'news-euronews-1',
    title: 'Transición y Suministro en Europa: El Diésel EN590 y el Gas Natural Licuado Blindan la Seguridad Energética',
    source: 'Euronews en Español',
    sourceUrl: 'https://es.euronews.com',
    publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    category: 'Refinación & Derivados',
    summary: 'Terminales portuarias en España, Bélgica y Países Bajos consolidan flujos constantes de gasóleo automotriz EN590 de 10 ppm y descargas de GNL para abastecer el transporte pesado y la red industrial.',
    content: `<p>La Unión Europea mantiene un foco prioritario en la estabilidad de su matriz energética y en el suministro ininterrumpido de destilados de alta pureza. El combustible diésel de especificación EN590 (con un máximo de 10 partes por millón de azufre) continúa siendo la piedra angular del transporte de mercancías por carretera y de las operaciones logísticas del continente.</p>
<p>Paralelamente, las terminales de regasificación en puertos estratégicos como Huelva, Barcelona, Zeebrugge y Rotterdam reportan una recepción dinámica de buques metaneros con Gas Natural Licuado (GNL) criogénico provenientes de la cuenca atlántica, lo que permite sostener los niveles de reserva estratégica por encima de los requerimientos mínimos fijados por las autoridades comunitarias.</p>
<p>El mercado ha premiado los contratos de aprovisionamiento a medio plazo respaldados por análisis de calidad independientes emitidos por entidades certificadas como SGS e Intertek, mitigando el riesgo de discrepancias operativas en los puntos de transferencia de custodia.</p>`,
    tags: ['Euronews', 'EN590', 'GNL', 'Gas Natural', 'Europa', 'Refinación', 'SGS', 'Seguridad Energética'],
    imageUrl: '/uploads/1790320950129-diesel-engine-efficiency.webp',
  },
  {
    id: 'news-efe-1',
    title: 'América Latina y el Comercio Global de Petróleo: Creciente Protaganismo de Crudos Pesados y Coque de Petróleo',
    source: 'Agencia EFE / Mundo',
    sourceUrl: 'https://efe.com/mundo',
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    category: 'Pet Coke & Commodities Sólidos',
    summary: 'El apetito de la industria cementera y siderúrgica por Pet Coke de grado combustible y la demanda de crudos pesados tipo Merey 16 dinamizan los acuerdos bilaterales de suministro entre América y Asia.',
    content: `<p>El sector de los commodities energéticos en el continente americano experimenta un renovado dinamismo comercial impulsado por el aprovechamiento de fracciones pesadas y subproductos de refinería. El coque de petróleo (Pet Coke) en sus grados combustible y calcinado se ha consolidado como un insumo térmico fundamental para la industria cementera de India, Turquía y el Lejano Oriente.</p>
<p>Asimismo, los crudos pesados de calidad Merey 16 mantienen una valorización sostenida gracias a su excelente rendimiento en unidades de coquización retardada (delayed coking), permitiendo a las refinerías de alta complejidad maximizar la producción de asfalto y destilados intermedios de alto valor comercial.</p>
<p>De acuerdo con despachos de la Agencia EFE, las operaciones de compraventa a granel exigen hoy más que nunca estructuras de garantía documental robustas, incluyendo cartas de crédito confirmadas y verificación exhaustiva de origen y especificaciones analíticas conforme a normas ASTM.</p>`,
    tags: ['EFE', 'Pet Coke', 'Merey 16', 'Crudo Pesado', 'América Latina', 'Cementeras', 'Incoterms'],
    imageUrl: '/uploads/1790320883864-petcoke.png.png',
  },
  {
    id: 'news-reuters-1',
    title: 'Diferencial Brent-WTI se Amplía ante Creciente Demanda en Refinerías del Mediterráneo y Asia',
    source: 'Reuters Energy',
    sourceUrl: 'https://www.reuters.com/business/energy',
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    category: 'Mercado Petrolero & Precios',
    summary: 'El spread entre el crudo Brent del Mar del Norte y el West Texas Intermediate alcanzó máximos de tres meses, impulsado por tensiones logísticas marítimas y alta demanda de crudos ligeros dulces en complejos de refinación europeos.',
    content: `<p>Operadores comerciales y analistas del sector energético en Londres y Houston reportan una ampliación sostenida en el diferencial entre los principales crudos marcadores del mundo. La mayor demanda de cortes ligeros y medios por parte de las refinerías de alta conversión ha generado una fuerte competencia por lotes disponibles en el mercado spot.</p>
<p>Los refinadores asiáticos, ante el encarecimiento general de las tarifas en buques Suezmax y Aframax, han priorizado el aseguramiento de contratos con especificaciones claras y ventanas de carga garantizadas para el próximo trimestre.</p>
<p>La estabilidad de los flujos físicos demuestra que, más allá de la volatilidad financiera en los mercados de futuros, la demanda real de materia prima para la generación de combustibles sigue respondiendo a fundamentos macroeconómicos sólidos.</p>`,
    tags: ['Reuters', 'Brent', 'WTI', 'Refinación', 'Spread', 'Mercado Petrolero'],
    imageUrl: '/images/hero/hero-bg-refinery.webp',
  },
  {
    id: 'news-platts-1',
    title: 'Combustibles de Aviación: Estricto Cumplimiento de ASTM D1655 y Trazabilidad en Despachos de Jet A-1',
    source: 'S&P Global Platts',
    sourceUrl: 'https://www.spglobal.com/commodityinsights',
    publishedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    category: 'Compliance & Regulaciones',
    summary: 'El rigor en la verificación de densidad, punto de congelación y estabilidad térmica en combustible de aviación Jet A-1 previene reclamaciones de calidad en terminales aeroportuarias internacionales.',
    content: `<p>El transporte aéreo comercial ha intensificado sus requerimientos de calidad para el aprovisionamiento de combustible Jet A-1 en los principales hubs internacionales. Los protocolos de inspección en refinería y en buque tanque exigen la emisión de reportes de calidad detallados bajo la norma ASTM D1655 antes de autorizar cualquier descarga en tanques de almacenamiento fiscal.</p>
<p>La trazabilidad total de la cadena de suministro, desde el complejo petroquímico hasta la entrega en hidrantes aeroportuarios, representa una condición indispensable en las negociaciones bilaterales contemporáneas. Contar con facilitadores de mercado con presencia en centros neurálgicos de trading y logística asegura la mitigación de contingencias operativas.</p>`,
    tags: ['Platts', 'Jet A-1', 'Aviación', 'ASTM', 'Compliance', 'Calidad'],
    imageUrl: '/images/hero/oil-shipment-hero.webp',
  },
  {
    id: 'news-argus-1',
    title: 'Oferta de Pet Coke de Grado Combustible se Ajusta por Paradas Técnicas en Coquizadores de la Costa del Golfo',
    source: 'Argus Media',
    sourceUrl: 'https://www.argusmedia.com',
    publishedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    category: 'Pet Coke & Commodities Sólidos',
    summary: 'El suministro de coque de petróleo con azufre medio y alto registra tensiones de inventario tras mantenimientos programados en refinerías de Texas y Luisiana, presionando al alza las primas hacia India y Turquía.',
    content: `<p>La menor tasa de producción de coque verde en el Golfo de México ha reducido la disponibilidad de despachos a granel hacia los sectores cementero y metalúrgico internacionales. Los compradores industriales han respondido diversificando sus canales de suministro mediante contratos a plazo con inspecciones de calidad independientes.</p>
<p>Las proyecciones de Argus señalan que los precios FOB en terminales del Golfo estadounidense tenderán a estabilizarse a medida que los coquizadores retornen a sus capacidades nominales a lo largo del próximo mes.</p>`,
    tags: ['Argus', 'Pet Coke', 'Coque Verde', 'Trading', 'Asia', 'Cementeras'],
    imageUrl: '/uploads/1790320883864-petcoke.png.png',
  },
  {
    id: 'news-oil101-1',
    title: 'Oil 101: Benchmark Brent vs. WTI — Fundamentos Geológicos, Calidad API y Relevancia en el Comercio Mundial',
    source: 'Invest Oil Market Intelligence',
    sourceUrl: 'https://investoil.es/blog/oil101-brent-vs-wti',
    publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    category: 'Oil 101',
    summary: 'Guía esencial para operadores y clientes: por qué el crudo Brent del Mar del Norte y el WTI de Texas determinan los precios de más del 70% de las transacciones petroleras del planeta.',
    content: `<p>El petróleo crudo no es un commodity homogéneo. Sus propiedades físicas y químicas determinan de manera directa el rendimiento en refinería y el valor comercial de cada cargamento. Dos indicadores fundamentales gobiernan esta clasificación: la gravedad API (que mide la ligereza o pesadez respecto al agua) y el contenido de azufre (clasificado como dulce si es bajo o agrio/ácido si es elevado).</p>
<p>El crudo Brent, extraído originalmente de campos en el Mar del Norte, posee una gravedad API de aproximadamente 38° y un contenido de azufre cercano al 0.4%, lo que lo convierte en el estándar de referencia para más de dos tercios de los contratos de crudo transfronterizos en Europa, África y Oriente Medio.</p>
<p>En contraste, el West Texas Intermediate (WTI) es un crudo aún más ligero (API ~39.6°) y dulce (azufre ~0.24%), ideal para la extracción directa de gasolinas y naftas de alto octanaje en los complejos refinadores de los Estados Unidos. Comprender cómo interactúan ambos marcadores permite a compradores y vendedores de primer orden estructurar operaciones comerciales eficientes y rentables.</p>`,
    tags: ['Oil 101', 'Brent', 'WTI', 'Crudo', 'Trading', 'Mercado Petrolero', 'Invest Oil'],
    imageUrl: '/uploads/1790317899444-WhatsApp_Image_2026-09-22_at_22.33.02.jpeg',
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      count: FALLBACK_RADAR_NEWS.length,
      news: FALLBACK_RADAR_NEWS,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error al obtener radar de noticias' },
      { status: 500 }
    );
  }
}
