import { ServiceItem, ProductItem, TeamMember, FeaturedOperation, ClientTestimonial } from '@/types';

export const COMPANY_INFO = {
  name: 'Invest Oil LLC',
  sealTitle: 'Petroleum and Derivatives Trading Company',
  tagline: 'Conexiones globales en el mercado petrolero',
  subtagline: 'Connecting buyers and sellers, driving the future of energy',
  heroSubtitle: 'Acceso a mercados diversificados, apoyo en negociaciones y gestión experta de riesgo financiero y operativo.',
  email: 'info@investoil.es',
  businessEmail: 'business@investoil.es',
  schedule: 'Lun–Vie · 09:00–18:00 CET',
  linkedin: 'https://www.linkedin.com/',
  copyright: '© Invest Oil LLC. Todos los derechos reservados.',
};

export const SERVICES_LIST: ServiceItem[] = [
  {
    code: 'S/01',
    title: 'Conexión de compradores y vendedores',
    description: 'Conectamos a compradores y vendedores de crudo en todo el mundo, garantizando transacciones justas y eficientes en cada operación.',
    iconName: 'Network',
    tags: ['Crudo', 'Matching', 'Mercado global'],
  },
  {
    code: 'S/02',
    title: 'Negocio contractual',
    description: 'Apoyamos las negociaciones contractuales, asegurando condiciones favorables y transparencia en cada operación.',
    iconName: 'FileText',
    tags: ['Contratos', 'Spot', 'Term'],
  },
  {
    code: 'S/03',
    title: 'Logística segura',
    description: 'Coordinamos una logística segura para el transporte de petróleo, minimizando riesgos y optimizando los tiempos de entrega.',
    iconName: 'Ship',
    tags: ['Transporte', 'Naviera', 'Puertos'],
  },
  {
    code: 'S/04',
    title: 'Gestión de riesgo financiero y operativo',
    description: 'Expertos en gestión de riesgo financiero y operativo, protegiendo tu inversión en el mercado del petróleo.',
    iconName: 'ShieldCheck',
    tags: ['Riesgo', 'Cobertura', 'Compliance'],
  },
  {
    code: 'S/05',
    title: 'Transparencia y cumplimiento',
    description: 'Nuestro foco en la transparencia garantiza transacciones justas y eficientes, priorizando relaciones a largo plazo.',
    iconName: 'Eye',
    tags: ['Compliance', 'KYC', 'Auditoría'],
  },
  {
    code: 'S/06',
    title: 'Relaciones a largo plazo',
    description: 'Priorizamos relaciones a largo plazo y oportunidades fiables para todos nuestros clientes en el sector energético.',
    iconName: 'Users',
    tags: ['Fidelización', 'Partners', 'Alianzas'],
  },
  {
    code: 'S/07',
    title: 'Coordinación de transporte marítimo',
    description: 'Gestionamos fletamentos, ventanas de carga y documentación naviera para que cada cargamento llegue a tiempo.',
    iconName: 'Anchor',
    tags: ['Fletamento', 'Naviera', 'Documentación'],
  },
  {
    code: 'S/08',
    title: 'Inteligencia de mercado',
    description: 'Analizamos precios de referencia, diferenciales y tendencias de demanda para que decidas con datos, no con intuición.',
    iconName: 'TrendingUp',
    tags: ['Precios', 'Benchmarks', 'Reportes'],
  },
  {
    code: 'S/09',
    title: 'Estructuración de contratos spot y term',
    description: 'Diseñamos la estructura contractual óptima según volumen, plazo y perfil de riesgo de cada operación.',
    iconName: 'Scale',
    tags: ['Spot', 'Term', 'ICC Incoterms'],
  },
  {
    code: 'S/10',
    title: 'Soporte postventa y resolución de disputas',
    description: 'Acompañamos la operación hasta el cierre y mediamos con rapidez ante cualquier incidencia contractual o logística.',
    iconName: 'LifeBuoy',
    tags: ['Disputas', 'Mediación', 'Postventa'],
  },
];

export const PRODUCTS_LIST: ProductItem[] = [
  {
    sku: 'PC-4500',
    title: 'Pet Coke',
    description: 'Coque de petróleo verde (green pet coke) para la industria del cemento y metalurgia, uno de nuestros productos principales para el mercado asiático.',
    specs: 'Azufre < 4.5% · HGI 40-45 · Humedad < 8%',
    market: 'Asia',
    availability: 'Bajo pedido',
    category: 'Sólidos y Derivados',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  },
  {
    sku: 'MEREY-16',
    title: 'Merey 16',
    description: 'Crudo pesado venezolano de referencia (16° API), uno de nuestros grados principales para refinerías asiáticas con unidades de conversión profunda.',
    specs: 'API 16° · Azufre ~2.5%',
    market: 'Asia',
    availability: 'Cargamentos programados',
    category: 'Crudos',
    imageUrl: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80',
  },
  {
    sku: 'BRT-BLEND',
    title: 'Crudo referencial Brent-blend',
    description: 'Mezcla de crudo ligero de referencia para operaciones spot con liquidación indexada a cotizaciones internacionales Brent.',
    specs: 'API 38-40° · Azufre < 0.5%',
    market: 'Europa / Asia',
    availability: 'Spot',
    category: 'Crudos',
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
  },
  {
    sku: 'HSFO-380',
    title: 'Fuel Oil HSFO 380 CST',
    description: 'Fuel oil de alto azufre para bunkering marítimo e industria pesada, disponible en los principales puertos y terminales de carga.',
    specs: 'Viscosidad 380 CST · Azufre < 3.5%',
    market: 'Global',
    availability: 'Programado',
    category: 'Refinados Pesados',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    sku: 'NAF-V01',
    title: 'Nafta virgen',
    description: 'Nafta virgen para petroquímica y mezcla de gasolinas automotrices, con especificaciones ajustadas a los requerimientos de cada comprador.',
    specs: 'Densidad 0.68-0.72 · Aromáticos bajos',
    market: 'Asia / Medio Oriente',
    availability: 'Bajo pedido',
    category: 'Destilados Ligeros',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
  },
  {
    sku: 'EN590-D',
    title: 'Diesel (Gasoil) EN590',
    description: 'Gasoil EN590 de ultra bajo azufre (10 ppm) para transporte automotor e industria, cumpliendo rigurosamente la especificación europea.',
    specs: 'Azufre < 10 ppm · Cetano > 51',
    market: 'Europa / África',
    availability: 'Spot / Term',
    category: 'Destilados Medios',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
  },
  {
    sku: 'BIT-60/70',
    title: 'Asfalto / Bitumen',
    description: 'Bitumen a granel para obra civil e infraestructura vial de alta resistencia, con grado de penetración según especificación de proyecto.',
    specs: 'Penetración 60/70 · Punto ablandamiento 46-56°C',
    market: 'África / Asia',
    availability: 'Bajo pedido',
    category: 'Especialidades',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    sku: 'LPG-MIX',
    title: 'GLP (Gas Licuado de Petróleo)',
    description: 'Propano y butano comercial para uso doméstico, industrial y automotor, con logística coordinada de cisternas y buques gaseros refrigerados.',
    specs: 'Propano/Butano mezcla personalizable',
    market: 'Latam / Asia',
    availability: 'Programado',
    category: 'Gases',
    imageUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80',
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 't-01',
    number: '#01',
    name: 'Carlos Medina',
    role: 'Director General',
    location: 'Madrid',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&h=480&q=80',
  },
  {
    id: 't-02',
    number: '#02',
    name: 'Elena Torres',
    role: 'Directora de Riesgos',
    location: 'Madrid',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&h=480&q=80',
  },
  {
    id: 't-03',
    number: '#03',
    name: 'Marco Ferreira',
    role: 'Jefe de Logística',
    location: 'Lisboa',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&h=480&q=80',
  },
  {
    id: 't-04',
    number: '#04',
    name: 'Aisha Rahman',
    role: 'Responsable de Cumplimiento',
    location: 'Dubái',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&h=480&q=80',
  },
  {
    id: 't-05',
    number: '#05',
    name: 'Paulo Costa',
    role: 'Analista de Mercado',
    location: 'Singapur',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&h=480&q=80',
  },
  {
    id: 't-06',
    number: '#06',
    name: 'Ana Villalobos',
    role: 'Directora Comercial',
    location: 'Madrid',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=480&h=480&q=80',
  },
];

export const FEATURED_OPERATIONS: FeaturedOperation[] = [
  {
    title: 'Exportación de Pet Coke a mercado asiático',
    description: 'Coordinación integral de un cargamento de 50.000 MT de Pet Coke, desde la negociación contractual hasta la entrega en puerto destino.',
    client: 'Refinería Internacional',
    year: '2024',
    result: '50.000 MT entregadas estrictamente en plazo',
  },
  {
    title: 'Contrato term de Merey 16',
    description: 'Estructuración y cierre de un contrato a 12 meses con entregas mensuales programadas para refinación profunda.',
    client: 'Trader Global',
    year: '2024',
    result: 'Contrato renovado por 12 meses adicionales',
  },
  {
    title: 'Suministro recurrente de Diesel EN590',
    description: 'Programa continuo de suministro mensual con control de calidad de ultra bajo azufre para red de distribución europea.',
    client: 'Distribuidor Mayorista',
    year: '2023',
    result: '0 incidencias logísticas en 12 meses de operación',
  },
  {
    title: 'Suministro de bitumen para infraestructura vial',
    description: 'Suministro programado de bitumen 60/70 a granel para megaproyecto de pavimentación e infraestructura.',
    client: 'Constructora de Infraestructuras',
    year: '2023',
    result: 'Entregas sin demoras durante toda la ejecución de obra',
  },
];

export const CLIENT_TESTIMONIALS: ClientTestimonial[] = [
  {
    rating: 5,
    text: 'El equipo de Invest Oil coordinó toda la operación de compra de Pet Coke de principio a fin, con una transparencia y solidez contractual que no habíamos visto en otros brokers.',
    name: 'Director de Aprovisionamiento',
    role: 'Jefe de Compras · Refinería Asiática',
  },
  {
    rating: 5,
    text: 'La gestión de riesgo y la coordinación de logística marítima fueron impecables. Cerramos el contrato spot en tiempo récord con liquidación transparente.',
    name: 'Gerente General de Trading',
    role: 'Director de Trading · Fondo Energético',
  },
  {
    rating: 4,
    text: 'Encontramos en Invest Oil un socio estratégico y de total confianza para el suministro recurrente de Diesel EN590 a nuestra red de estaciones de servicio.',
    name: 'Responsable de Operaciones',
    role: 'Gerente de Operaciones · Red de Distribución Europea',
  },
  {
    rating: 5,
    text: 'El suministro de bitumen llegó exactamente en la especificación técnica acordada (60/70), permitiendo avanzar los tramos de autopista sin el menor retraso.',
    name: 'Ingeniero Jefe de Obra',
    role: 'Director de Proyecto · Consorcio Constructor',
  },
  {
    rating: 5,
    text: 'Profesionalismo, rigor en el KYC y comunicación constante en cada fase del fletamento y ventanas de carga. Repetiremos operaciones el próximo trimestre.',
    name: 'Directora Comercial',
    role: 'Directora Comercial · Compañía Naviera y de Suministro',
  },
];

export const NAV_LINKS = [
  { href: '/#services', label: 'Servicios' },
  { href: '/#products', label: 'Productos' },
  { href: '/#projects', label: 'Operaciones' },
  { href: '/#team', label: 'Equipo' },
  { href: '/blog', label: 'Blog' },
  { href: '/#contact', label: 'Contacto' },
];

export const LEGAL_LINKS = [
  { href: '/aviso-de-privacidad', label: 'Aviso de privacidad' },
  { href: '/terminos-y-condiciones', label: 'Términos y condiciones' },
  { href: '/politica-de-cookies', label: 'Política de cookies' },
  { href: '/alerta-de-fraude-y-estafas', label: 'Alerta de fraude y estafas' },
  { href: '/accesibilidad', label: 'Accesibilidad' },
];

export interface OfficeLocation {
  id: string;
  cityCountry: string;
  cityCountryEn: string;
  detail: string;
  detailEn: string;
  address: string;
}

export const INVESTOIL_OFFICES: OfficeLocation[] = [
  {
    id: 'houston',
    cityCountry: 'Houston, Estados Unidos',
    cityCountryEn: 'Houston, United States',
    detail: 'Headquarters · Sede Central',
    detailEn: 'Global Headquarters',
    address: '1000 Louisiana St, Suite 4000, Houston, TX 77002',
  },
  {
    id: 'madrid',
    cityCountry: 'Madrid, España',
    cityCountryEn: 'Madrid, Spain',
    detail: 'European Operations Desk',
    detailEn: 'European Operations Desk',
    address: 'Paseo de la Castellana 95, Planta 15, 28046 Madrid',
  },
  {
    id: 'bogota',
    cityCountry: 'Bogotá, Colombia',
    cityCountryEn: 'Bogotá, Colombia',
    detail: 'Latin America Operations Desk',
    detailEn: 'Latin America Operations Desk',
    address: 'Carrera 7 # 71-21, Torre B, Bogotá D.C.',
  },
];

