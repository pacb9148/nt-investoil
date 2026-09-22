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
      eyebrow: 'INFRAESTRUCTURA Y TRADING ENERGETICO GLOBAL',
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
      tag: 'OPORTUNIDADES DE COOPERACIÓN',
      title: 'Impulse sus Operaciones Energéticas con Invest Oil LLC',
      subtitle:
        'Establezca una alianza comercial estratégica con acceso preferencial a volúmenes, almacenamiento y financiamiento estructurado.',
      button: 'Iniciar Diálogo Comercial',
      guarantee: 'Garantía contractual de suministro · Cumplimiento Incoterms 2020 · Verificación SGS / Intertek',
      privacyNotice: 'Tratamiento confidencial según acuerdos NDA y normativas internacionales.',
    },
    contact: {
      tag: 'CENTRO DE ATENCIÓN GLOBAL',
      title: 'Hablemos de su Próxima Transacción',
      subtitle:
        'Nuestros equipos comerciales en Houston, Madrid y Bogotá están listos para evaluar sus requerimientos de volumen y logística.',
      fullName: 'Nombre y Apellidos',
      email: 'Correo Electrónico Corporativo',
      phone: 'Teléfono / WhatsApp de Contacto',
      company: 'Empresa u Organización',
      interest: 'Área de Interés',
      message: 'Detalle de la Consulta / Volúmenes Requeridos',
      submit: 'Enviar Solicitud Comercial',
      submitting: 'Procesando Envío...',
      success: '✓ Mensaje enviado con éxito. Un director comercial le responderá a la brevedad.',
      error: 'Hubo un error al procesar su solicitud. Intente nuevamente o llámenos directamente.',
    },
    footer: {
      tagline:
        'Invest Oil LLC es una firma global especializada en la comercialización, trading, logística y financiamiento estructurado de hidrocarburos y derivados.',
      quickLinks: 'Navegación Rápida',
      legal: 'Marco Legal & Cumplimiento',
      contact: 'Oficinas Principales',
      rights: '© 2026 Invest Oil LLC. Todos los derechos reservados.',
      houstonOffice: 'Houston, Texas · EE. UU. (Sede Central)',
      madridOffice: 'Madrid · España (Operaciones Europa)',
      bogotaOffice: 'Bogotá · Colombia (Operaciones LatAm)',
      fraudAlert: 'Alerta de Fraude y Estafas',
      accessibility: 'Accesibilidad',
      privacy: 'Aviso de Privacidad',
      terms: 'Términos y Condiciones',
      cookies: 'Política de Cookies',
    },
    common: {
      learnMore: 'Más información',
      contactUs: 'Contáctanos',
      downloadSpecs: 'Descargar Ficha Técnica',
      requestQuote: 'Solicitar Cotización',
      close: 'Cerrar',
      save: 'Guardar Cambios',
      saving: 'Guardando...',
      successSaved: 'Guardado correctamente',
      errorSaving: 'Error al guardar los cambios',
    },
  },
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      products: 'Products',
      about: 'About Us',
      contact: 'Contact',
      blog: 'News & Insights',
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
    },
    stats: {
      metric1Value: '150M+',
      metric1Label: 'Barrels transacted annually in major trading hubs',
      metric2Value: '38+',
      metric2Label: 'Countries with active trade relationships',
      metric3Value: '99.8%',
      metric3Label: 'Contractual performance and on-time delivery rate',
      metric4Value: '24/7',
      metric4Label: 'Maritime logistics monitoring and risk management',
    },
    services: {
      tag: 'OPERATIONAL EXCELLENCE',
      title: 'Comprehensive Energy Industry Services',
      subtitle:
        'Supporting every stage of the supply chain with cutting-edge infrastructure, market intelligence, and regulatory rigor.',
      viewAll: 'View all services',
      cta: 'Request Operational Advisory',
    },
    products: {
      tag: 'HYDROCARBON PORTFOLIO',
      title: 'High-Grade Crude and Refined Products',
      subtitle:
        'Reliable supply adhering to ASTM, GOST standards and certified technical specifications.',
      quoteTitle: 'Request Commercial Quote',
      specsTitle: 'Technical Specifications',
      origin: 'Certified Origins & Technical Grades',
      viewAll: 'View complete catalog',
    },
    operations: {
      tag: 'LOGISTICS & INFRASTRUCTURE',
      title: 'Presence in Key Global Energy Hubs',
      subtitle:
        'Storage terminal capacity, vessel chartering, and offshore facilities across prime commercial shipping routes.',
    },
    team: {
      tag: 'EXPERT LEADERSHIP',
      title: 'Board of Directors & Executive Leadership',
      subtitle:
        'Over 85 years of combined experience in energy finance, petroleum geology, maritime trading, and international law.',
    },
    testimonials: {
      tag: 'PROVEN REPUTATION',
      title: 'Trusted by Global Industry Leaders',
      subtitle:
        'Refineries, trading houses, and multinational corporations relying on Invest Oil LLC’s precision and integrity.',
    },
    faq: {
      tag: 'FREQUENTLY ASKED QUESTIONS',
      title: 'Operational & Commercial Insights',
      subtitle:
        'Clarity, transparency, financial escrow safeguards, and international delivery protocols.',
    },
    cta: {
      tag: 'PARTNERSHIP OPPORTUNITIES',
      title: 'Advance Your Energy Operations with Invest Oil LLC',
      subtitle:
        'Establish a strategic commercial alliance with preferential volume allocations, storage access, and structured finance.',
      button: 'Initiate Commercial Discussion',
      guarantee: 'Contractual supply guarantee · Incoterms 2020 compliance · SGS / Intertek inspection verified',
      privacyNotice: 'Strict confidentiality guaranteed under international NDA protocols.',
    },
    contact: {
      tag: 'GLOBAL INQUIRY CENTER',
      title: 'Let’s Discuss Your Next Energy Allocation',
      subtitle:
        'Our commercial teams in Houston, Madrid, and Bogotá are prepared to evaluate your volume and logistical requirements.',
      fullName: 'Full Name',
      email: 'Corporate Email',
      phone: 'Phone / WhatsApp',
      company: 'Company / Organization',
      interest: 'Area of Interest',
      message: 'Inquiry Details / Required Volumes',
      submit: 'Submit Commercial Request',
      submitting: 'Processing Request...',
      success: '✓ Request submitted successfully. A commercial director will follow up shortly.',
      error: 'An error occurred while submitting. Please try again or contact our desk directly.',
    },
    footer: {
      tagline:
        'Invest Oil LLC is a premier global enterprise specializing in petroleum trading, maritime logistics, storage infrastructure, and structured energy commodities finance.',
      quickLinks: 'Quick Links',
      legal: 'Legal Framework & Compliance',
      contact: 'Headquarters & Desks',
      rights: '© 2026 Invest Oil LLC. All rights reserved.',
      houstonOffice: 'Houston, Texas · USA (Headquarters)',
      madridOffice: 'Madrid · Spain (European Desk)',
      bogotaOffice: 'Bogotá · Colombia (Latin America Desk)',
      fraudAlert: 'Fraud & Scam Prevention Alert',
      accessibility: 'Accessibility Statement',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      cookies: 'Cookie Policy',
    },
    common: {
      learnMore: 'Learn More',
      contactUs: 'Contact Us',
      downloadSpecs: 'Download Spec Sheet',
      requestQuote: 'Request Quote',
      close: 'Close',
      save: 'Save Changes',
      saving: 'Saving...',
      successSaved: 'Saved successfully',
      errorSaving: 'Error saving changes',
    },
  },
};
