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
    id: 'news-1',
    title: 'Diferencial Brent-WTI se Amplía ante Creciente Demanda en Refinerías del Mediterráneo y Asia',
    source: 'Reuters Energy',
    sourceUrl: 'https://www.reuters.com/business/energy',
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    category: 'Mercado Petrolero & Precios',
    summary: 'El spread entre el crudo Brent del Mar del Norte y el West Texas Intermediate alcanzó máximos de tres meses, impulsado por tensiones logísticas marítimas y alta demanda de crudos ligeros dulces en complejos de refinación europeos.',
    content: '<p>Las mesas de trading en Londres y Houston reportan una ampliación sostenida en el diferencial Brent/WTI, impulsada por un mayor consumo de cortes medios en refinerías de alta conversión.</p><p>Analistas destacan que el encarecimiento de fletes en buques Suezmax y Aframax ha incentivado a los refinadores asiáticos a asegurar cargas spot con entrega FOB antes del cierre del trimestre.</p>',
    tags: ['Brent', 'WTI', 'Trading', 'Refinación', 'Spread', 'Mercado'],
    imageUrl: '/images/hero/hero-bg-refinery.webp',
  },
  {
    id: 'news-2',
    title: 'Oferta de Pet Coke de Grado Combustible se Ajusta por Paradas Técnicas en Coquizadores de la Costa del Golfo',
    source: 'Argus Petroleum Coke',
    sourceUrl: 'https://www.argusmedia.com',
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    category: 'Pet Coke & Commodities Sólidos',
    summary: 'El suministro de coque de petróleo con azufre medio y alto registra tensiones de inventario tras mantenimientos no programados en refinerías de Texas y Luisiana, presionando al alza las primas hacia India y Turquía.',
    content: '<p>La menor tasa de producción de coque verde en el Golfo de México ha reducido la disponibilidad de despachos a granel hacia los sectores cementero y metalúrgico de Asia.</p><p>Operadores de Invest Oil señalan que la diversificación hacia contratos de suministro a plazo con garantías SGS está siendo la opción preferida por compradores industriales para asegurar continuidad operativa.</p>',
    tags: ['Pet Coke', 'Coque Verde', 'Trading', 'Asia', 'Cementeras', 'Incoterms'],
    imageUrl: '/uploads/1790320883864-petcoke.png.png',
  },
  {
    id: 'news-3',
    title: 'Crudo Merey 16 Mantiene Sólida Demanda en Refinerías de Alta Conversión pese a Volatilidad Global',
    source: 'S&P Global Platts',
    sourceUrl: 'https://www.spglobal.com/commodityinsights',
    publishedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    category: 'Refinación & Derivados',
    summary: 'El crudo pesado Merey 16 consolida su posición estratégica en unidades con coquización retardada (delayed coking) gracias a su óptimo rendimiento en residuales y asfalto.',
    content: '<p>Los diferenciales de crudos pesados en el mercado spot reflejan una estabilidad notable en comparación con los marcadores ligeros, respaldada por la capacidad de absorción de refinerías complejas en el Lejano Oriente.</p>',
    tags: ['Merey 16', 'Crudo Pesado', 'Refinación', 'Delayed Coking', 'Platts'],
    imageUrl: '/images/hero/oil-shipment-hero.webp',
  },
  {
    id: 'news-4',
    title: 'Normativa OMI 2026: Aumenta la Adopción de Combustibles Marítimos de Ultra Bajo Azufre (VLSFO) y MGO',
    source: 'Bunker Bulletin',
    sourceUrl: 'https://shipandbunker.com',
    publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    category: 'Logística & Fletes Marítimos',
    summary: 'Armadores internacionales incrementan compras anticipadas de Gasóleo Marino (MGO) y VLSFO para mitigar riesgos de penalización en zonas de control de emisiones (ECA).',
    content: '<p>Con la entrada en vigor de requerimientos ambientales más estrictos en rutas del Atlántico y el Mediterráneo, la demanda de combustibles marinos certificados bajo norma ISO 8217 ha alcanzado cifras récord en hubs como Rotterdam y Gibraltar.</p>',
    tags: ['MGO', 'VLSFO', 'Bunker', 'OMI', 'Logística Marítima', 'Rotterdam'],
    imageUrl: '/uploads/1790321009575-1790279740.png',
  },
  {
    id: 'news-5',
    title: 'Flujos de Diésel EN590: Rutas desde el Golfo de EE. UU. hacia Europa Mantienen Arbitraje Positivo',
    source: 'Energy Intelligence',
    sourceUrl: 'https://www.energyintel.com',
    publishedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    category: 'Refinación & Derivados',
    summary: 'El gasóleo de automoción EN590 de 10 ppm continúa fluyendo con márgenes atractivos a través del Atlántico, con buques Medium Range (MR) cerrando ventanas de entrega en Amberes y Barcelona.',
    content: '<p>La solidez en la demanda de diésel ultra bajo en azufre (ULSD) en el sector logístico terrestre europeo compensa la moderación en otros destilados, sosteniendo los cracks de refino por encima de las medias históricas.</p>',
    tags: ['EN590', 'Diésel', 'Arbitraje', 'Houston', 'Europa', 'Trading'],
    imageUrl: '/uploads/1790320950129-diesel-engine-efficiency.webp',
  },
  {
    id: 'news-6',
    title: 'Mercado de Gas Natural Licuado (GNL): Contratos Spot Ganan Terreno Frente a Fórmulas Indexadas al Petróleo',
    source: 'LNG World News',
    sourceUrl: 'https://www.lngworldnews.com',
    publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    category: 'Transición & Sostenibilidad',
    summary: 'Compradores industriales buscan mayor flexibilidad mediante entregas DES (Delivered Ex-Ship) de GNL criogénico, preparándose para la reposición de almacenamiento estacional.',
    content: '<p>El comercio de GNL criogénico continúa sofisticándose con opciones de desvío de carga y acuerdos bilaterales que integran cobertura financiera frente a cotizaciones Henry Hub y TTF.</p>',
    tags: ['GNL', 'Gas Natural', 'Criogénico', 'Henry Hub', 'TTF', 'Sostenibilidad'],
    imageUrl: '/images/hero/hero-bg-refinery.webp',
  },
  {
    id: 'news-7',
    title: 'Tarifas de Fletamento en Buques VLCC Registran Alza por Rutas Extensas alrededor del Cabo de Buena Esperanza',
    source: 'Clarksons Shipping Intelligence',
    sourceUrl: 'https://www.clarksons.com',
    publishedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    category: 'Logística & Fletes Marítimos',
    summary: 'El alargamiento en los días de viaje promedio para el transporte de crudo de Oriente Medio y América hacia refinerías occidentales reduce la disponibilidad de tonelaje VLCC en el mercado spot.',
    content: '<p>Las toneladas-milla globales han aumentado un 8% en el último semestre, presionando los costos de flete por barril e impulsando a los operadores a optimizar el dimensionamiento de flotas Aframax y Suezmax.</p>',
    tags: ['VLCC', 'Aframax', 'Fletes Marítimos', 'Logística', 'Buques', 'Trading'],
    imageUrl: '/uploads/1790321009575-1790279740.png',
  },
  {
    id: 'news-8',
    title: 'Inspecciones SGS y Certificación ASTM D1655: La Clave para Despachos de Jet Fuel A-1 sin Disputas Comerciales',
    source: 'Aviation Fuel Today',
    sourceUrl: 'https://www.aviationfueltoday.com',
    publishedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    category: 'Compliance & Regulaciones',
    summary: 'El rigor en la verificación de densidad, punto de congelación y estabilidad térmica en combustible de aviación Jet A-1 previene reclamaciones de calidad en terminales aeroportuarias internacionales.',
    content: '<p>En el comercio transfronterizo de turbosina, los análisis independientes emitidos por laboratorios acreditados constituyen la garantía documental insustituible para el pago de cartas de crédito irrevocables.</p>',
    tags: ['Jet A-1', 'SGS', 'ASTM', 'Compliance', 'Aviación', 'Calidad'],
    imageUrl: '/images/hero/oil-shipment-hero.webp',
  },
  {
    id: 'news-9',
    title: 'Incoterms 2020 en Hidrocarburos: CIF vs. FOB y la Gestión del Riesgo en Transferencias Marítimas Ship-to-Ship',
    source: 'International Energy Law Review',
    sourceUrl: 'https://www.energylawreview.com',
    publishedAt: new Date(Date.now() - 3600000 * 42).toISOString(),
    category: 'Compliance & Regulaciones',
    summary: 'Análisis de la distribución de riesgos, seguros marítimos y puntos de entrega en operaciones de alijo en aguas internacionales bajo contratos marco tipo BP/Shell terms.',
    content: '<p>La correcta delimitación del momento en que el riesgo se transfiere del vendedor al comprador en operaciones STS (Ship-to-Ship) es fundamental para evitar litigios por mermas o demoras portuarias (demurrage).</p>',
    tags: ['Incoterms', 'CIF', 'FOB', 'STS', 'Trading', 'Riesgo Legal'],
    imageUrl: '/uploads/1790317899444-WhatsApp_Image_2026-09-22_at_22.33.02.jpeg',
  },
  {
    id: 'news-10',
    title: 'Oil 101: Benchmark Brent vs. WTI — Fundamentos Geológicos, Calidad API y Relevancia en el Comercio Mundial',
    source: 'Invest Oil Market Intelligence',
    sourceUrl: 'https://investoil.es/blog/oil101-brent-vs-wti',
    publishedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    category: 'Oil 101',
    summary: 'Guía esencial para operadores y clientes: por qué el crudo Brent del Mar del Norte y el WTI de Texas determinan los precios de más del 70% de las transacciones petroleras del planeta.',
    content: '<p>Conozca la diferencia entre crudos dulces (sweet) y ácidos (sour), la gravedad API y cómo los diferenciales geográficos y logísticos estructuran el comercio internacional de hidrocarburos.</p>',
    tags: ['Oil 101', 'Brent', 'WTI', 'Crudo', 'Trading', 'Mercado Petrolero'],
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
