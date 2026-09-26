// Traducciones al inglés del contenido de portada que se edita en el panel y solo existe en español.
// Van por identificador estable (id o sku). Si el panel define campos `*_en`, esos mandan; si un
// elemento nuevo no está aquí ni tiene `*_en`, se muestra en español (nunca vacío).

type Dict = Record<string, Record<string, string>>;

export const PROBLEMS_EN: Dict = {
  'prob-01': {
    title: 'Inefficient Intermediation and Lack of Traceability',
    desc: 'Chains of intermediaries with no real chartering capacity inflate the price of a barrel and delay contractual loading windows.',
    solution: 'At Invest Oil we deal directly with refineries, producers and certified charterers under the most demanding KYC protocols.',
  },
  'prob-02': {
    title: 'Extreme Volatility and Financial Exposure',
    desc: 'Sharp swings in international prices with no hedging instruments or payment structures guaranteed by top-tier banks.',
    solution: 'Structuring of spot and term contracts with standby letters of credit (SBLC), contractual indexation and active risk management.',
  },
  'prob-03': {
    title: 'Logistics Bottleneck Constraints',
    desc: 'Storage shortages at strategic terminals, berthing delays and discrepancies in quantity and quality (Q&Q) inspections.',
    solution: 'Satellite tracking of cargoes, priority berthing windows and independent verification backed by SGS and Intertek.',
  },
};

export const PRODUCTS_EN: Dict = {
  'PC-4500': {
    title: 'Pet Coke (Green Petroleum Coke)',
    description: 'Fuel-grade green petroleum coke for industrial boilers, metallurgy and clinker kilns in the cement industry.',
    availability: 'On request / FOB or CIF freight',
    market: 'Asia / Europe',
    category: 'Solids & Derivatives',
    specs: 'Sulfur < 4.5% · HGI 40-45 · Moisture < 8%',
  },
  'MEREY-16': {
    title: 'Merey 16 (Heavy Crude)',
    description: 'Internationally referenced heavy crude for refineries with coking and deep-conversion units in high-demand markets.',
    availability: 'Scheduled cargoes',
    market: 'Asia',
    category: 'Crude Oil',
    specs: 'API 16° · Sulfur ~2.5% · Tank and vessel',
  },
  'BRT-BLEND': {
    title: 'Brent Blend Reference Crude',
    description: 'Light sweet reference crude blend with settlement indexed to international quotations for spot and term operations.',
    availability: 'Spot',
    market: 'Europe / Global',
    category: 'Crude Oil',
    specs: 'API 38-40° · Sulfur < 0.5%',
  },
  'EN590-10PPM': {
    title: 'Ultra-Low Sulfur Diesel (EN590 10 ppm)',
    description: 'Middle distillate for automotive and heavy transport with European emissions certification and a strictly controlled flash point.',
    availability: 'Continuous monthly supply',
    market: 'Europe / Americas',
    category: 'Distillates',
    specs: 'Sulfur < 10 ppm · Cetane > 51',
  },
  'JET-A1': {
    title: 'Jet Fuel A-1 Aviation Fuel',
    description: 'Commercial aviation kerosene for international airline fleets, compliant with ASTM D1655 and Def Stan 91-091.',
    availability: 'Annual contracts',
    market: 'Airport Hubs',
    category: 'Aviation',
    specs: 'Freezing point < -47°C · Flash point > 38°C',
  },
  'D2-L02': {
    title: 'Gasoil D2 (L-0.2/62)',
    description: 'Industrial and marine gasoil for thermal power generation, merchant fleets and heavy machinery with high calorific value.',
    availability: 'Spot / Term',
    market: 'Mediterranean / Africa',
    category: 'Distillates',
    specs: 'Sulfur < 0.05% · Flash Point > 62°C',
  },
};

// Categorías y mercados sueltos (por si un producto nuevo reutiliza estos rótulos).
export const LABELS_EN: Record<string, string> = {
  'Sólidos y Derivados': 'Solids & Derivatives',
  Crudos: 'Crude Oil',
  Destilados: 'Distillates',
  Aviación: 'Aviation',
  'Asia / Europa': 'Asia / Europe',
  Asia: 'Asia',
  'Europa / Global': 'Europe / Global',
  'Europa / América': 'Europe / Americas',
  'Hubs Aeroportuarios': 'Airport Hubs',
  'Mediterráneo / África': 'Mediterranean / Africa',
  Spot: 'Spot',
  'Spot / Term': 'Spot / Term',
  'Cargamentos programados': 'Scheduled cargoes',
  'Contratos anuales': 'Annual contracts',
  'Suministro mensual continuo': 'Continuous monthly supply',
  'Bajo pedido / Fletes FOB o CIF': 'On request / FOB or CIF freight',
  // Nombres de categorías del blog guardados solo en español.
  'Mercado Petrolero': 'Oil Market',
  'Mercado Petrolero & Precios': 'Oil Market & Prices',
  'Logística Marítima': 'Maritime Logistics',
  'Logística & Fletes Marítimos': 'Logistics & Maritime Freight',
  Logística: 'Logistics',
  Refinación: 'Refining',
  'Refinación & Derivados': 'Refining & Derivatives',
  'Compliance & Regulaciones': 'Compliance & Regulations',
  'Pet Coke & Commodities Sólidos': 'Pet Coke & Solid Carbon',
  'Transición & Sostenibilidad': 'Energy Transition & ESG',
  'Transición Energética': 'Energy Transition',
};

export const OPERATIONS_EN: Dict = {
  'op-01': {
    title: 'Pet Coke export to the Asian market',
    client: 'International Refinery, China',
    result: '50,000 MT/month delivered strictly on schedule',
    description:
      'End-to-end coordination of a 50,000 MT/month Pet Coke shipment, from contract negotiation to delivery at the destination port. The agreement provides for continuous monthly deliveries over a 5-year period.',
  },
  'op-02': {
    title: 'Merey 16 term contract',
    client: 'Global Trader',
    result: 'Contract renewed for an additional 12 months',
    description: 'Structuring and closing of a 20-month contract with scheduled monthly deliveries for deep-conversion refining.',
  },
  'op-03': {
    title: 'Recurring EN590 Diesel supply',
    client: 'Wholesale Distributor',
    result: 'Zero logistics incidents in 12 months of operation',
    description: 'Continuous monthly supply programme with ultra-low-sulfur quality control for a European distribution network.',
  },
  'op-04': {
    title: 'Bitumen supply for road infrastructure',
    client: 'Infrastructure Contractor, China',
    result: 'Deliveries without delays throughout the entire construction',
    description: 'Scheduled bulk supply of 60/70 bitumen for a large-scale paving and infrastructure project.',
  },
};

export const TESTIMONIALS_EN: Dict = {
  'test-01': {
    name: 'Procurement Director',
    role: 'Head of Purchasing · Asian Refinery',
    text: 'The Invest Oil team coordinated the whole Pet Coke purchase from start to finish, with a transparency and contractual solidity we had not seen from other brokers.',
  },
  'test-02': {
    name: 'General Trading Manager',
    role: 'Trading Director · Energy Fund',
    text: 'Risk management and maritime logistics coordination were flawless. We closed the spot contract in record time with transparent settlement.',
  },
  'test-03': {
    name: 'Operations Manager',
    role: 'Operations Manager · European Distribution Network',
    text: 'In Invest Oil we found a strategic and fully trusted partner for the recurring supply of EN590 Diesel to our network of service stations.',
  },
  'test-04': {
    name: 'Chief Site Engineer',
    role: 'Project Director · Construction Consortium',
    text: 'The bitumen arrived exactly to the agreed technical specification (60/70), allowing the motorway sections to move forward without the slightest delay.',
  },
  'test-05': {
    name: 'Commercial Director',
    role: 'Commercial Director · Shipping and Supply Company',
    text: 'Professionalism, KYC rigor and constant communication at every stage of the chartering and loading windows. We will repeat operations next quarter.',
  },
};

export const FAQ_EN: Dict = {
  'faq-01': {
    question: 'What are the usual procedures for buying crude oil or derivatives?',
    answer:
      'We operate under international standards (Incoterms 2020: FOB, CIF, CFR). Buyers must submit a formal corporate LOI/ICPO, KYC compliance documentation and an irrevocable letter of credit issued or confirmed by a top-50 international bank.',
  },
  'faq-02': {
    question: 'What quality and inspection guarantees does Invest Oil LLC offer?',
    answer:
      'All our cargoes are inspected and certified by leading independent firms such as SGS, Intertek or Saybolt at the port of loading before the Bill of Lading (B/L) is issued.',
  },
  'faq-03': {
    question: 'In which ports and hubs do you have delivery capacity?',
    answer:
      'We maintain presence and agreements in Houston (US Gulf Coast), Rotterdam, Fujairah, Singapore and strategic marine terminals in the Caribbean and South America for agile delivery.',
  },
  'faq-04': {
    question: 'How is price-volatility risk managed in term contracts?',
    answer:
      'We design contracts indexed to international benchmarks (Brent, WTI, Argus, Platts) with transparent differential formulas and financial hedges structured to the profile of each operation.',
  },
};

/**
 * Devuelve el campo en el idioma pedido: `campo_en` del propio elemento, si no la traducción
 * incorporada por id, y si no el texto original en español.
 */
export function localized<T extends object>(
  item: T,
  field: string,
  isEn: boolean,
  table: Dict,
  key?: string
): string {
  const original = String((item as Record<string, unknown>)[field] ?? '');
  if (!isEn) return original;
  const own = (item as Record<string, unknown>)[`${field}_en`];
  if (typeof own === 'string' && own.trim()) return own;
  const byKey = key ? table[key]?.[field] : undefined;
  if (byKey) return byKey;
  return LABELS_EN[original] ?? original;
}
