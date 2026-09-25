export type Language = 'es' | 'en';

export interface TranslationDictionary {
  nav: {
    home: string;
    services: string;
    products: string;
    about: string;
    contact: string;
    blog: string;
    portalClient: string;
    admin: string;
  };
  hero: {
    eyebrow: string;
    title1: string;
    title2: string;
    accent: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    marketTicker: string;
    activeContracts: string;
    complianceRate: string;
    globalPresence: string;
    sgsVerification: string;
    monthlyShipments: string;
    monthlyShipmentsValue: string;
    marineTerminals: string;
    marineTerminalsValue: string;
    operationalStatus: string;
    active100: string;
  };
  marquee: {
    livePrices: string;
    marketNews: string;
    sourceTitle: string;
  };
  blog: {
    tag: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    showingArticles: string;
    filterCategory: string;
    all: string;
    noArticles: string;
    noArticlesSub: string;
    resetFilters: string;
    readArticle: string;
    republished: string;
    readingTime: string;
    views: string;
    backToBlog: string;
    relatedArticles: string;
    topics: string;
    quotePrompt: string;
    quotePromptSub: string;
    contactDesk: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    rememberMe: string;
    forgotPassword: string;
    loginButton: string;
    authenticating: string;
    noAccount: string;
    requestAccess: string;
    backToSite: string;
    sslBadge: string;
    vaultBadge: string;
  };
  stats: {
    metric1Value: string;
    metric1Label: string;
    metric2Value: string;
    metric2Label: string;
    metric3Value: string;
    metric3Label: string;
    metric4Value: string;
    metric4Label: string;
  };
  services: {
    tag: string;
    title: string;
    subtitle: string;
    viewAll: string;
    cta: string;
  };
  products: {
    tag: string;
    title: string;
    subtitle: string;
    quoteTitle: string;
    specsTitle: string;
    origin: string;
    viewAll: string;
  };
  operations: {
    tag: string;
    title: string;
    subtitle: string;
  };
  team: {
    tag: string;
    title: string;
    subtitle: string;
  };
  testimonials: {
    tag: string;
    title: string;
    subtitle: string;
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
  };
  cta: {
    tag: string;
    title: string;
    subtitle: string;
    button: string;
    guarantee: string;
    privacyNotice: string;
  };
  contact: {
    tag: string;
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    phone: string;
    company: string;
    interest: string;
    message: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    legal: string;
    contact: string;
    rights: string;
    houstonOffice: string;
    madridOffice: string;
    bogotaOffice: string;
    fraudAlert: string;
    accessibility: string;
    privacy: string;
    terms: string;
    cookies: string;
  };
  common: {
    learnMore: string;
    contactUs: string;
    downloadSpecs: string;
    requestQuote: string;
    close: string;
    save: string;
    saving: string;
    successSaved: string;
    errorSaving: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  es: {
    nav: {
      home: 'Inicio',
      services: 'Servicios',
      products: 'Productos',
      about: 'Nosotros',
      contact: 'Contacto',
      blog: 'Noticias & Blog',
      portalClient: 'Portal Clientes',
      admin: 'Backoffice',
    },
    hero: {
      eyebrow: 'INFRAESTRUCTURA Y TRADING ENERGÉTICO GLOBAL',
      title1: 'Soluciones Estratégicas en',
      title2: 'del Petróleo y Derivados',
      accent: 'el Mercado Global',
      subtitle:
        'Conectamos productores, refinerías y distribuidores en los principales centros energéticos mundiales con máxima solidez operativa, gestión de riesgo y cumplimiento normativo internacional.',
      ctaPrimary: 'Explorar Servicios Petroleros',
      ctaSecondary: 'Ver Catálogo de Productos',
      marketTicker: 'BRENT: $82.40/bbl (+1.2%) | WTI: $78.15/bbl (+0.9%)',
      activeContracts: '150M+ Barriles',
      complianceRate: '99.8% Cumplimiento',
      globalPresence: '38+ Países',
      sgsVerification: 'VERIFICACIÓN SGS & ASTM D1655',
      monthlyShipments: 'Despachos Mensuales:',
      monthlyShipmentsValue: '12.5M BBLS',
      marineTerminals: 'Terminales Marítimas:',
      marineTerminalsValue: 'Houston / Rotterdam',
      operationalStatus: 'Estatus Operativo:',
      active100: 'ACTIVO 100%',
    },
    marquee: {
      livePrices: 'Precios de Energía en Vivo',
      marketNews: 'Actualidad & Operaciones',
      sourceTitle: 'Fuente: OilPrice & Platts',
    },
    blog: {
      tag: 'ANÁLISIS & ACTUALIDAD PETROLERA',
      title: 'Blog de Inteligencia Energética',
      subtitle:
        'Informes técnicos, cotizaciones de crudo y refinados, dinámicas de fletes marítimos, regulaciones internacionales y análisis de mercado por Invest Oil LLC.',
      searchPlaceholder: 'Buscar por título, tag o tema petrolero...',
      showingArticles: 'Mostrando {filtered} de {total} artículos',
      filterCategory: 'Filtrar por categoría temática:',
      all: 'Todos',
      noArticles: 'No se encontraron artículos',
      noArticlesSub: 'Intenta con otro término de búsqueda o selecciona otra categoría.',
      resetFilters: 'Restablecer todos los filtros',
      readArticle: 'Leer artículo',
      republished: 'REPUBLICACIÓN',
      readingTime: 'min de lectura',
      views: 'lecturas',
      backToBlog: 'Volver al Blog de Inteligencia Energética',
      relatedArticles: 'Artículos Recomendados de Mercado',
      topics: 'Categorías & Tags:',
      quotePrompt: '¿Interesado en cotizar este producto o ruta?',
      quotePromptSub:
        'Nuestro equipo estructura contratos a medida como facilitadores entre compradores y vendedores de primer orden según volumen, especificaciones e Incoterms.',
      contactDesk: 'Contactar Operaciones Comerciales',
    },
    auth: {
      loginTitle: 'Acceso Backoffice',
      loginSubtitle: 'Credenciales autorizadas de Operaciones & Trading.',
      emailLabel: 'Email Corporativo',
      emailPlaceholder: 'admin@investoil.es',
      passwordLabel: 'Contraseña de Operador',
      passwordPlaceholder: '••••••••',
      rememberMe: 'Recordar sesión',
      forgotPassword: '¿Olvidó contraseña?',
      loginButton: 'Acceder al Panel',
      authenticating: 'Verificando seguridad...',
      noAccount: '¿No tienes cuenta de operador?',
      requestAccess: 'Solicitar acceso',
      backToSite: 'Volver al portal público',
      sslBadge: 'TLS 256-Bit',
      vaultBadge: 'Invest Oil Vault',
    },
    stats: {
      metric1Value: '150M+',
      metric1Label: 'Barriles transaccionados anualmente en hubs globales',
      metric2Value: '38+',
      metric2Label: 'Países con conexiones comerciales activas',
      metric3Value: '99.8%',
      metric3Label: 'Índice de cumplimiento contractual y entrega a tiempo',
      metric4Value: '24/7',
      metric4Label: 'Monitoreo logístico, marítimo y gestión de riesgo',
    },
    services: {
      tag: 'CAPACIDADES OPERATIVAS',
      title: 'Servicios Integrales para la Industria Energética',
      subtitle:
        'Acompañamos cada fase de la cadena de suministro con infraestructura de vanguardia, inteligencia comercial y rigor normativo.',
      viewAll: 'Ver todos los servicios',
      cta: 'Solicitar Asesoría Operativa',
    },
    products: {
      tag: 'PORTAFOLIO DE HIDROCARBUROS',
      title: 'Crudos y Derivados de Alta Pureza',
      subtitle:
        'Suministro confiable bajo estándares internacionales ASTM, GOST y especificaciones técnicas garantizadas.',
      quoteTitle: 'Cotizar Lote Comercial',
      specsTitle: 'Especificaciones Técnicas',
      origin: 'Orígenes y Especificaciones Certificadas',
      viewAll: 'Ver catálogo completo',
    },
    operations: {
      tag: 'LOGÍSTICA & INFRAESTRUCTURA',
      title: 'Presencia en Hubs Energéticos Estratégicos',
      subtitle:
        'Capacidad de almacenamiento, fletamento marítimo y terminales marítimas en las principales rutas comerciales mundiales.',
    },
    team: {
      tag: 'LIDERAZGO EXPERTO',
      title: 'Consejo Directivo y Dirección Ejecutiva',
      subtitle:
        'Más de 85 años de experiencia combinada en finanzas energéticas, geología, trading marítimo y derecho internacional.',
    },
    testimonials: {
      tag: 'CONFIANZA COMPROBADA',
      title: 'Lo que dicen nuestros socios y clientes',
      subtitle:
        'Refinerías, traders y corporaciones multinacionales que confían en la puntualidad y rigor de Invest Oil LLC.',
    },
    faq: {
      tag: 'PREGUNTAS FRECUENTES',
      title: 'Respuestas a dudas operativas y comerciales',
      subtitle:
        'Claridad y transparencia en procesos de compra, garantías financieras y procedimientos de entrega.',
    },
    cta: {
      tag: 'CONEXIÓN INMEDIATA',
      title: 'Optimice su Cadena de Suministro Energético',
      subtitle:
        'Contáctenos hoy mismo para evaluar oportunidades de abastecimiento, contratos a plazo o estructuración de fletes internacionales.',
      button: 'Iniciar Diálogo Comercial',
      guarantee: 'Cumplimiento normativo, trazabilidad y garantías bancarias internacionales de primer nivel.',
      privacyNotice: 'Sus datos corporativos son tratados bajo estricta confidencialidad comercial.',
    },
    contact: {
      tag: 'COMUNICACIÓN DIRECTA',
      title: 'Operaciones Comerciales & Facilitación de Mercados',
      subtitle:
        'Póngase en contacto con nuestro equipo directivo para coordinar requerimientos de crudo, refinados o fletamento.',
      fullName: 'Nombre y Apellidos',
      email: 'Correo Electrónico Corporativo',
      phone: 'Teléfono Directo',
      company: 'Razón Social / Empresa',
      interest: 'Producto o Servicio de Interés',
      message: 'Detalle de la Operación / Volumen Requerido',
      submit: 'Enviar Solicitud Comercial',
      submitting: 'Transmitiendo datos cifrados...',
      success: '✓ Su solicitud comercial ha sido recibida por nuestro equipo de operaciones comerciales.',
      error: 'Error al procesar la solicitud. Por favor verifique sus datos o contáctenos por email.',
    },
    footer: {
      tagline: 'Conexiones globales en el mercado petrolero, trading físico y logística de hidrocarburos.',
      quickLinks: 'Enlaces Rápidos',
      legal: 'Gobernanza & Legal',
      contact: 'Contacto Directo',
      rights: 'Todos los derechos reservados. Invest Oil LLC.',
      houstonOffice: 'Houston, Texas, EE. UU.',
      madridOffice: 'Madrid, España',
      bogotaOffice: 'Bogotá, Colombia',
      fraudAlert: 'Alerta de Fraude y Estafas',
      accessibility: 'Accesibilidad Web',
      privacy: 'Aviso de Privacidad',
      terms: 'Términos y Condiciones',
      cookies: 'Política de Cookies',
    },
    common: {
      learnMore: 'Conocer Más',
      contactUs: 'Contáctanos',
      downloadSpecs: 'Descargar Ficha Técnica',
      requestQuote: 'Solicitar Cotización',
      close: 'Cerrar',
      save: 'Guardar',
      saving: 'Guardando...',
      successSaved: 'Guardado exitosamente',
      errorSaving: 'Error al guardar los datos',
    },
  },
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      products: 'Products',
      about: 'About Us',
      contact: 'Contact',
      blog: 'News & Blog',
      portalClient: 'Client Portal',
      admin: 'Backoffice',
    },
    hero: {
      eyebrow: 'GLOBAL ENERGY TRADING & INFRASTRUCTURE',
      title1: 'Strategic Solutions in',
      title2: 'Oil & Refined Products',
      accent: 'the Global Market',
      subtitle:
        'Connecting producers, refineries, and distributors across world energy hubs with premier operational strength, risk mitigation, and strict international compliance.',
      ctaPrimary: 'Explore Petroleum Services',
      ctaSecondary: 'View Products Catalog',
      marketTicker: 'BRENT: $82.40/bbl (+1.2%) | WTI: $78.15/bbl (+0.9%)',
      activeContracts: '150M+ Barrels',
      complianceRate: '99.8% Compliance',
      globalPresence: '38+ Countries',
      sgsVerification: 'SGS & ASTM D1655 VERIFICATION',
      monthlyShipments: 'Monthly Shipments:',
      monthlyShipmentsValue: '12.5M BBLS',
      marineTerminals: 'Marine Terminals:',
      marineTerminalsValue: 'Houston / Rotterdam',
      operationalStatus: 'Operational Status:',
      active100: 'ACTIVE 100%',
    },
    marquee: {
      livePrices: 'Live Energy Prices',
      marketNews: 'Market News & Ops',
      sourceTitle: 'Source: OilPrice & Platts',
    },
    blog: {
      tag: 'ENERGY INTELLIGENCE & NEWS',
      title: 'Energy Market Intelligence Blog',
      subtitle:
        'Technical reports, crude and refined product quotes, maritime freight dynamics, international regulations, and market analysis by Invest Oil LLC.',
      searchPlaceholder: 'Search by title, tag or market topic...',
      showingArticles: 'Showing {filtered} of {total} articles',
      filterCategory: 'Filter by category:',
      all: 'All',
      noArticles: 'No articles found',
      noArticlesSub: 'Try changing the search query or clearing the category filter.',
      resetFilters: 'Reset all filters',
      readArticle: 'Read article',
      republished: 'REPUBLICATED',
      readingTime: 'min read',
      views: 'views',
      backToBlog: 'Back to Energy Market Intelligence Blog',
      relatedArticles: 'Recommended Market Articles',
      topics: 'Categories & Tags:',
      quotePrompt: 'Interested in quoting this product or route?',
      quotePromptSub:
        'Our team structures custom contracts as facilitators between tier-one buyers and sellers tailored to your volume, specifications, and Incoterms.',
      contactDesk: 'Contact Commercial Operations',
    },
    auth: {
      loginTitle: 'Login',
      loginSubtitle: 'Welcome back please login to your account.',
      emailLabel: 'Corporate Email',
      emailPlaceholder: 'admin@investoil.es',
      passwordLabel: 'Operator Password',
      passwordPlaceholder: '••••••••',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      loginButton: 'Login',
      authenticating: 'Authenticating...',
      noAccount: "Don't have an account?",
      requestAccess: 'Sign up',
      backToSite: 'Back to corporate site',
      sslBadge: 'TLS 256-Bit',
      vaultBadge: 'Invest Oil Vault',
    },
    stats: {
      metric1Value: '150M+',
      metric1Label: 'Barrels traded annually across international hubs',
      metric2Value: '38+',
      metric2Label: 'Countries with active commercial relationships',
      metric3Value: '99.8%',
      metric3Label: 'Contractual compliance rate and timely deliveries',
      metric4Value: '24/7',
      metric4Label: 'Maritime monitoring and active risk mitigation',
    },
    services: {
      tag: 'OPERATIONAL EXCELLENCE',
      title: 'Comprehensive Energy Industry Solutions',
      subtitle:
        'Supporting every stage of the supply chain with advanced infrastructure, market intelligence, and regulatory rigor.',
      viewAll: 'View all services',
      cta: 'Request Operational Advisory',
    },
    products: {
      tag: 'HYDROCARBON PORTFOLIO',
      title: 'High-Purity Crude & Refined Products',
      subtitle:
        'Reliable supply adhering to international ASTM, GOST standards, and guaranteed technical specifications.',
      quoteTitle: 'Request Commercial Quote',
      specsTitle: 'Technical Specifications',
      origin: 'Certified Origins & Specifications',
      viewAll: 'View complete catalog',
    },
    operations: {
      tag: 'LOGISTICS & INFRASTRUCTURE',
      title: 'Presence in Strategic Energy Hubs',
      subtitle:
        'Storage tank capacity, maritime chartering, and hub terminals across primary global trading lanes.',
    },
    team: {
      tag: 'EXECUTIVE LEADERSHIP',
      title: 'Board of Directors & Management',
      subtitle:
        'Over 85 years of collective leadership in energy finance, petroleum geology, vessel operations, and international law.',
    },
    testimonials: {
      tag: 'VERIFIED TRUST',
      title: 'What our clients and partners say',
      subtitle:
        'Refineries, trading houses, and multinational corporations that rely on Invest Oil LLC precision.',
    },
    faq: {
      tag: 'FREQUENT QUESTIONS',
      title: 'Answers to operational & trading inquiries',
      subtitle:
        'Uncompromising transparency across purchasing protocols, financial collaterals, and delivery standards.',
    },
    cta: {
      tag: 'DIRECT ACCESS',
      title: 'Optimize Your Energy Supply Chain Today',
      subtitle:
        'Contact our desk to evaluate supply pipelines, term agreements, or chartered cargo solutions.',
      button: 'Initiate Commercial Dialogue',
      guarantee: 'Full compliance, cargo traceability, and tier-1 international bank warranties.',
      privacyNotice: 'Corporate inquiries handled under strict non-disclosure compliance.',
    },
    contact: {
      tag: 'DIRECT COMMUNICATION',
      title: 'Commercial Operations & Market Facilitation',
      subtitle:
        'Reach our executive team to structure your crude, refined products, or logistics requirements.',
      fullName: 'Full Name',
      email: 'Corporate Email Address',
      phone: 'Direct Telephone',
      company: 'Company / Organization',
      interest: 'Product or Service of Interest',
      message: 'Cargo Volume & Operational Details',
      submit: 'Submit Commercial Inquiry',
      submitting: 'Transmitting encrypted inquiry...',
      success: '✓ Your commercial request has been received by our commercial operations team.',
      error: 'Error processing inquiry. Please verify your details or contact us directly via email.',
    },
    footer: {
      tagline: 'Global connections in petroleum markets, physical trading, and hydrocarbon logistics.',
      quickLinks: 'Quick Links',
      legal: 'Corporate Governance',
      contact: 'Direct Contact',
      rights: 'All rights reserved. Invest Oil LLC.',
      houstonOffice: 'Houston, Texas, USA',
      madridOffice: 'Madrid, Spain',
      bogotaOffice: 'Bogota, Colombia',
      fraudAlert: 'Fraud & Scam Advisory',
      accessibility: 'Web Accessibility',
      privacy: 'Privacy Notice',
      terms: 'Terms & Conditions',
      cookies: 'Cookie Policy',
    },
    common: {
      learnMore: 'Learn More',
      contactUs: 'Contact Us',
      downloadSpecs: 'Download Spec Sheet',
      requestQuote: 'Request Quote',
      close: 'Close',
      save: 'Save',
      saving: 'Saving...',
      successSaved: 'Saved successfully',
      errorSaving: 'Error saving changes',
    },
  },
};
