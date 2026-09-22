-- ==============================================================================
-- seed.sql: Datos Iniciales para Invest Oil LLC
-- ==============================================================================

-- 1. Categorías Iniciales
INSERT INTO public.categories (id, name, slug, description)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Crudo y Refinados', 'crudo-y-refinados', 'Análisis y dinámica de oferta y demanda de crudo liviano, pesado y derivados petrolíferos.'),
  ('c1000000-0000-0000-0000-000000000002', 'Logística Marítima', 'logistica-maritima', 'Transporte marítimo internacional, fletamentos y gestión de terminales portuarias.'),
  ('c1000000-0000-0000-0000-000000000003', 'Mercados Asiáticos', 'mercados-asiaticos', 'Evolución de refinerías y demanda estratégica en los principales hubs de Asia.'),
  ('c1000000-0000-0000-0000-000000000004', 'Gestión de Riesgo y Compliance', 'riesgo-y-compliance', 'Estructuración contractual, cobertura financiera e integridad regulatoria.')
ON CONFLICT (id) DO NOTHING;

-- 2. Posts de Ejemplo con contenido Tiptap JSON
INSERT INTO public.posts (
  id,
  slug,
  title,
  excerpt,
  content,
  status,
  featured_image_url,
  published_at,
  tags,
  reading_time,
  views,
  is_republished,
  original_source_url,
  original_source_name
)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'dinamica-de-suministro-pet-coke-mercado-asiatico-2026',
    'Dinámica del Suministro de Pet Coke hacia los Principales Centros Industriales de Asia',
    'Un análisis exhaustivo sobre la evolución de la demanda de coque de petróleo verde (green pet coke) para cementeras y metalurgia pesada en Asia oriental durante el presente ejercicio.',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"El papel estratégico del Pet Coke en la matriz energética industrial"}]},{"type":"paragraph","content":[{"type":"text","text":"El coque de petróleo verde con especificaciones PC-4500 (azufre < 4.5%, HGI 40-45) continúa consolidándose como una de las materias primas fundamentales para la competitividad de las plantas de cemento y fundición en Asia. En un contexto de volatilidad en los combustibles fósiles tradicionales, el Pet Coke ofrece un poder calorífico superior a costes operativos previsibles."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Logística marítima y aseguramiento de volúmenes"}]},{"type":"paragraph","content":[{"type":"text","text":"Invest Oil LLC coordina fletamentos a granel con buques Handymax y Supramax, garantizando el estricto cumplimiento de ventanas de carga y minimizando mermas de humedad. La estructuración de contratos con entregas programadas permite a los compradores blindarse ante fluctuaciones intempestivas en las tarifas de flete spot."}]}]}',
    'published',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '2 days',
    ARRAY['Pet Coke', 'Asia', 'Trading', 'Logística'],
    5,
    342,
    false,
    null,
    null
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'merey-16-demanda-refinerias-complejas-diferenciales',
    'Merey 16: Demanda Sólida en Refinerías de Alta Conversión y Dinámica de Diferenciales',
    'Evaluación del comportamiento del crudo pesado venezolano Merey 16 (16° API) en refinerías asiáticas con unidades de coquización retardada e hidrocraqueo profundo.',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Rendimiento y adaptabilidad en refinerías de alta conversión"}]},{"type":"paragraph","content":[{"type":"text","text":"El crudo pesado Merey 16 sigue siendo uno de los grados más codiciados por su alto rendimiento en destilados medios y bitumen tras su procesamiento en unidades complejas. La optimización del blending y la gestión de su contenido de azufre (~2.5%) permiten obtener márgenes de refinación superiores cuando se liquida contra referencias internacionales."}]},{"type":"paragraph","content":[{"type":"text","text":"Mediante contratos de suministro a largo plazo (term contracts), Invest Oil conecta volúmenes garantizados con refinerías de primer nivel, asegurando un marco transparente bajo estándares ICC Incoterms 2020."}]}]}',
    'published',
    'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '5 days',
    ARRAY['Merey 16', 'Crudo Pesado', 'Refinación', 'Trading'],
    4,
    512,
    false,
    null,
    null
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'cobertura-riesgos-financieros-mercado-petrolero-global',
    'Estrategias Avanzadas de Cobertura y Gestión de Riesgo en Transacciones de Crudo',
    'Cómo blindar márgenes en operaciones spot y term mediante instrumentos derivados, cartas de crédito documentarias y compliance riguroso en comercio internacional.',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Protección integral ante la volatilidad de precios"}]},{"type":"paragraph","content":[{"type":"text","text":"En los mercados energéticos actuales, la gestión de riesgo no es opcional sino el pilar central de toda operación exitosa. Nuestro equipo estructura instrumentos de mitigación que integran swaps, collars y liquidaciones contra Brent y WTI para eliminar incertidumbres operativas."}]},{"type":"paragraph","content":[{"type":"text","text":"Asimismo, los protocolos estrictos de KYC (Know Your Customer) y auditoría previa aseguran que todas las partes cumplan con la normativa marítima y bancaria internacional."}]}]}',
    'published',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '10 days',
    ARRAY['Riesgo Financiero', 'Compliance', 'Derivados', 'Contratos'],
    6,
    289,
    false,
    null,
    null
  ),
  (
    'p1000000-0000-0000-0000-000000000004',
    'suministro-diesel-en590-normativa-bajo-azufre',
    'Perspectivas del Diésel EN590: Calidad Ultra Baja en Azufre y Eficiencia en Transporte',
    'El combustible EN590 (< 10 ppm de azufre) continúa siendo la columna vertebral del transporte de carga pesada y distribución europea e internacional.',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Cumplimiento estricto de especificaciones técnicas europeas"}]},{"type":"paragraph","content":[{"type":"text","text":"El suministro continuo de gasoil EN590 requiere una cadena de custodia impecable desde la carga hasta los tanques de recepción en terminales de almacenamiento. Con un índice de cetano superior a 51 y punto de inflamación certificado, Invest Oil garantiza entregas sin desviaciones de calidad."}]}]}',
    'published',
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '15 days',
    ARRAY['Diesel EN590', 'Refinados', 'Logística', 'Europa'],
    4,
    195,
    false,
    null,
    null
  ),
  (
    'p1000000-0000-0000-0000-000000000005',
    'republicacion-analisis-precios-brent-iea-reuters',
    'Perspectiva Global de la Demanda de Crudo según Informes de la AIE',
    'Resumen y análisis de las últimas proyecciones de demanda de petróleo y refinados para el segundo semestre, con foco en el balance de inventarios en Asia y Europa.',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Equilibrio entre oferta OPEP+ y consumo global"}]},{"type":"paragraph","content":[{"type":"text","text":"De acuerdo con los datos recopilados por agencias internacionales, el consumo sostenido de combustibles de aviación y naftas petroquímicas está contrarrestando la desaceleración estacional en otros sectores industriales."}]},{"type":"paragraph","content":[{"type":"text","text":"Esta republicación sintetiza los puntos clave para traders y compradores que buscan planificar sus posiciones con 6 a 12 meses de horizonte temporal."}]}]}',
    'published',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    NOW() - INTERVAL '18 days',
    ARRAY['IEA', 'Brent', 'Mercados', 'Macroeconomía'],
    3,
    640,
    true,
    'https://www.iea.org/reports/oil-market-report',
    'International Energy Agency'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Vincular Posts a Categorías
INSERT INTO public.post_categories (post_id, category_id)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004'),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- 4. Media Library Items Iniciales
INSERT INTO public.media (id, filename, url, type, mime_type, size, alt_text)
VALUES
  ('m1000000-0000-0000-0000-000000000001', 'investoil-seal.png', '/images/branding/seal-transparent.png', 'image', 'image/png', 540000, 'Sello Oficial Invest Oil LLC'),
  ('m1000000-0000-0000-0000-000000000002', 'investoil-logo.png', '/images/branding/logo.png', 'image', 'image/png', 210000, 'Logotipo Principal Invest Oil LLC'),
  ('m1000000-0000-0000-0000-000000000003', 'pet-coke-terminal.jpg', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', 'image', 'image/jpeg', 420000, 'Terminal de carga de Pet Coke'),
  ('m1000000-0000-0000-0000-000000000004', 'oil-tanker-vessel.jpg', 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=80', 'image', 'image/jpeg', 680000, 'Buque petrolero VLCC en alta mar'),
  ('m1000000-0000-0000-0000-000000000005', 'refinery-complex.jpg', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80', 'image', 'image/jpeg', 510000, 'Complejo de refinación petroquímica')
ON CONFLICT (id) DO NOTHING;
