// Tipo y semilla de la sección Actualidad, en un archivo aparte del route handler: los componentes
// cliente (news-section, admin/content/actualidad) los importan sin arrastrar `pg`/`fs` al bundle
// del navegador, que es lo que pasaba al importarlos desde la propia route.ts.
export interface ActualidadConfig {
  /** Cuántas publicaciones se muestran en la portada, de 1 a 12. */
  cardCount: number;
  badgeText: string;
  badgeTextEn: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
}

export const DEFAULT_ACTUALIDAD: ActualidadConfig = {
  cardCount: 6,
  badgeText: 'ACTUALIDAD & INTELIGENCIA DE MERCADO',
  badgeTextEn: 'NEWS & MARKET INTELLIGENCE',
  title: 'Actualidad y Últimos Análisis',
  titleEn: 'Latest News & Analysis',
  subtitle:
    'Monitoreo en tiempo real de diferenciales Brent/WTI, coque de petróleo, destilados limpios y logística de fletes marítimos.',
  subtitleEn:
    'Real-time insight on Brent/WTI differentials, pet coke supply, middle distillates, and global maritime tanker routes.',
};
