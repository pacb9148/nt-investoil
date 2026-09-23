import { type Post, type Category } from '@/types';

export interface EnrichedCategory extends Category {
  name_en?: string;
  description_en?: string;
  color?: string;
}

export const BLOG_CATEGORIES: EnrichedCategory[] = [
  {
    id: 'cat-1',
    name: 'Mercado Petrolero & Precios',
    name_en: 'Oil Markets & Pricing',
    slug: 'mercado-petrolero',
    description: 'Análisis de diferenciales Brent/WTI, cotizaciones y balances de inventarios.',
    description_en: 'Analysis of Brent/WTI differentials, quotes, and inventory balances.',
    color: '#f59e0b',
  },
  {
    id: 'cat-2',
    name: 'Logística & Fletes Marítimos',
    name_en: 'Maritime & Freight Logistics',
    slug: 'logistica-maritima',
    description: 'Rutas VLCC/Aframax, fletes internacionales y operaciones terminales.',
    description_en: 'VLCC/Aframax trade routes, international freight, and terminal operations.',
    color: '#06b6d4',
  },
  {
    id: 'cat-3',
    name: 'Refinación & Derivados',
    name_en: 'Refining & Derivatives',
    slug: 'refinacion-derivados',
    description: 'Merey 16, Diésel EN590, Jet A-1 y procesamiento en unidades de alta conversión.',
    description_en: 'Merey 16, Diesel EN590, Jet A-1, and complex refinery hydrocracking.',
    color: '#eab308',
  },
  {
    id: 'cat-4',
    name: 'Compliance & Regulaciones',
    name_en: 'Compliance & Regulations',
    slug: 'compliance-regulaciones',
    description: 'Incoterms 2020, cartas de crédito documentarias e inspección SGS.',
    description_en: 'Incoterms 2020, documentary letters of credit, and SGS inspection.',
    color: '#10b981',
  },
  {
    id: 'cat-5',
    name: 'Pet Coke & Commodities Sólidos',
    name_en: 'Pet Coke & Solid Carbon',
    slug: 'pet-coke-solidos',
    description: 'Coque de petróleo verde y calcinado para cementeras y metalurgia.',
    description_en: 'Green and calcined petroleum coke for cement and metallurgy plants.',
    color: '#ec4899',
  },
  {
    id: 'cat-6',
    name: 'Transición & Sostenibilidad',
    name_en: 'Energy Transition & ESG',
    slug: 'transicion-sostenibilidad',
    description: 'GNL criogénico, combustibles marítimos de ultra bajo azufre (MGO).',
    description_en: 'Cryogenic LNG, ultra-low sulfur marine fuels (MGO), and decarbonization.',
    color: '#14b8a6',
  },
];

export const BLOG_POSTS: (Post & { category?: EnrichedCategory })[] = [
  {
    id: 'p-1',
    slug: 'dinamica-de-suministro-pet-coke-mercado-asiatico-2026',
    title: 'Dinámica del Suministro de Pet Coke hacia los Principales Centros Industriales de Asia',
    excerpt: 'Un análisis exhaustivo sobre la evolución de la demanda de coque de petróleo verde (green pet coke) para cementeras y metalurgia pesada en Asia oriental durante el presente ejercicio.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'El comercio transoceánico de coque de petróleo (Pet Coke) experimenta una sólida reactivación logística hacia los principales complejos siderúrgicos y plantas de clínker en India, China y Vietnam. La competitividad calórica del coque verde (>8,000 kcal/kg) frente al carbón térmico tradicional consolida su protagonismo en los fletes a granel desde el Golfo de México hasta los puertos de descarga en Asia.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Especificaciones Técnicas y Manejo de Azufre' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Invest Oil LLC supervisa cada cargamento con certificaciones independientes emitidas por inspectores de primer nivel (SGS, Saybolt, Intertek), verificando estrictamente parámetros de HGI (Hardgrove Grindability Index), contenido de azufre (4.5% - 6.5%) y humedad residual para garantizar el cumplimiento normativo portuario y ambiental.',
            },
          ],
        },
      ],
    },
    status: 'published',
    featured_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Pet Coke', 'Asia', 'Trading', 'Logística'],
    categories: [BLOG_CATEGORIES[4]], // Pet Coke & Commodities Sólidos
    category: BLOG_CATEGORIES[4],
    reading_time: 5,
    views: 342,
    is_republished: false,
  },
  {
    id: 'p-2',
    slug: 'merey-16-demanda-refinerias-complejas-diferenciales',
    title: 'Merey 16: Demanda Sólida en Refinerías de Alta Conversión y Dinámica de Diferenciales',
    excerpt: 'Evaluación del comportamiento del crudo pesado Merey 16 (16° API) en refinerías asiáticas con unidades de coquización retardada e hidrocraqueo profundo.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Las refinerías de configuración profunda optimizadas para crudos densos continúan buscando barriles de Merey 16 debido a su excelente rendimiento en cortes de destilados medios y bitumen de alta durabilidad para obras viales.',
            },
          ],
        },
      ],
    },
    status: 'published',
    featured_image_url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=80',
    published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Merey 16', 'Crudo Pesado', 'Refinación', 'Trading'],
    categories: [BLOG_CATEGORIES[2]], // Refinación & Derivados
    category: BLOG_CATEGORIES[2],
    reading_time: 4,
    views: 512,
    is_republished: false,
  },
  {
    id: 'p-3',
    slug: 'cobertura-riesgos-financieros-mercado-petrolero-global',
    title: 'Estrategias Avanzadas de Cobertura y Gestión de Riesgo en Transacciones de Crudo',
    excerpt: 'Cómo blindar márgenes en operaciones spot y term mediante instrumentos derivados, cartas de crédito documentarias y compliance riguroso en comercio internacional.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'La alta volatilidad en los diferenciales de flete y precios de referencia exige instrumentos de mitigación financiera sofisticados, incluyendo swaps de crack spread y cartas de crédito standby confirmadas por bancos de primer orden internacional.',
            },
          ],
        },
      ],
    },
    status: 'published',
    featured_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    published_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Riesgo Financiero', 'Compliance', 'Derivados', 'Contratos'],
    categories: [BLOG_CATEGORIES[3]], // Compliance & Regulaciones
    category: BLOG_CATEGORIES[3],
    reading_time: 6,
    views: 289,
    is_republished: false,
  },
  {
    id: 'p-4',
    slug: 'suministro-diesel-en590-normativa-bajo-azufre',
    title: 'Perspectivas del Diésel EN590: Calidad Ultra Baja en Azufre y Eficiencia en Transporte',
    excerpt: 'El combustible EN590 (< 10 ppm de azufre) continúa siendo la columna vertebral del transporte de carga pesada y distribución europea e internacional.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'La especificación EN590 de 10 ppm de azufre es el estándar de referencia indiscutible para flotas logísticas e industria de generación eléctrica que exigen bajas emisiones y alto índice de cetano.',
            },
          ],
        },
      ],
    },
    status: 'published',
    featured_image_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    published_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Diesel EN590', 'Refinados', 'Logística', 'Europa'],
    categories: [BLOG_CATEGORIES[2]], // Refinación & Derivados
    category: BLOG_CATEGORIES[2],
    reading_time: 4,
    views: 195,
    is_republished: false,
  },
  {
    id: 'p-5',
    slug: 'republicacion-analisis-precios-brent-iea-reuters',
    title: 'Perspectiva Global de la Demanda de Crudo según Informes de la AIE',
    excerpt: 'Resumen y análisis de las últimas proyecciones de demanda de petróleo y refinados para el segundo semestre, con foco en el balance de inventarios en Asia y Europa.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'El más reciente balance de la Agencia Internacional de la Energía (AIE) resalta la resiliencia en la demanda de combustibles de aviación Jet A-1 y la recomposición de reservas estratégicas en centros de refinación del Mediterráneo.',
            },
          ],
        },
      ],
    },
    status: 'published',
    featured_image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    published_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['IEA', 'Brent', 'Mercados', 'Macroeconomía'],
    categories: [BLOG_CATEGORIES[0]], // Mercado Petrolero & Precios
    category: BLOG_CATEGORIES[0],
    reading_time: 3,
    views: 640,
    is_republished: true,
    original_source_url: 'https://www.iea.org/reports/oil-market-report',
    original_source_name: 'International Energy Agency',
  },
  {
    id: 'p-6',
    slug: 'rutas-maritimas-vlcc-arbitraje-houston-rotterdam',
    title: 'Optimización de Fletes Marítimos en Buques Aframax y VLCC: Rutas Houston - Rotterdam',
    excerpt: 'Análisis de costes de combustible bunker VLSFO, tarifas Worldscale y ventanas de atraque en las terminales hub de almacenamiento de Invest Oil LLC.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'La coordinación logística eficiente entre los puertos del Golfo de México y el corredor del Mar del Norte permite comprimir tiempos de tránsito y optimizar ventanas de demurrage mediante inspección pre-carga rigurosa.',
            },
          ],
        },
      ],
    },
    status: 'published',
    featured_image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    published_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Fletes', 'VLCC', 'Rotterdam', 'Houston', 'Logística'],
    categories: [BLOG_CATEGORIES[1]], // Logística & Fletes Marítimos
    category: BLOG_CATEGORIES[1],
    reading_time: 5,
    views: 418,
    is_republished: false,
  },
  {
    id: 'p-7',
    slug: 'expansion-mercado-gnl-criogenico-europa',
    title: 'Despliegue del GNL Criogénico: Flexibilidad y Seguridad Energética Transatlántica',
    excerpt: 'El papel del Gas Natural Licuado (GNL) en contratos DES y FOB para respaldar la estabilidad industrial y mitigar emisiones de gases de efecto invernadero.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Las terminales de regasificación europeas y los nuevos acuerdos de almacenamiento a largo plazo consolidan al GNL como el vector clave de transición energética y seguridad de suministro.',
            },
          ],
        },
      ],
    },
    status: 'published',
    featured_image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    published_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['GNL', 'Gas Natural', 'Sostenibilidad', 'Transición'],
    categories: [BLOG_CATEGORIES[5]], // Transición & Sostenibilidad
    category: BLOG_CATEGORIES[5],
    reading_time: 4,
    views: 380,
    is_republished: false,
  },
];

export function getCuratedCategories(): EnrichedCategory[] {
  return BLOG_CATEGORIES;
}

export function getCuratedPosts(): Post[] {
  return BLOG_POSTS;
}

export function getCuratedPostBySlug(slug: string): (Post & { category?: EnrichedCategory }) | null {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}
