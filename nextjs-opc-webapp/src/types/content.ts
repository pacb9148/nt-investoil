export interface LandingSectionConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

export type HeroBgType = 'none' | 'image' | 'video' | 'gradient';
export type HeroVisualType = 'mockup' | 'video' | 'graphic' | 'stats';

export interface SectionBackgroundColors {
  hero?: string;
  marquee?: string;
  problema?: string;
  services?: string;
  products?: string;
  plataforma?: string;
  team?: string;
  testimonials?: string;
  faq?: string;
  contact?: string;
}

export interface HeroCardCustomization {
  card_bg_color?: string;
  card_border_color?: string;
  card_glow_opacity?: number;
  logo_url?: string;
  logo_hue?: number;
  logo_brightness?: number;
  logo_saturation?: number;
  logo_shadow_color?: string;
  logo_shadow_blur?: number;
  badge_text?: string;
  badge_text_en?: string;
  metric1_label?: string;
  metric1_label_en?: string;
  metric1_value?: string;
  metric2_label?: string;
  metric2_label_en?: string;
  metric2_value?: string;
  metric3_label?: string;
  metric3_label_en?: string;
  metric3_value?: string;
}

export interface LandingHeroConfig {
  id: number;
  eyebrow_text: string;
  eyebrow_text_en?: string;
  heading_line_1: string;
  heading_line_1_en?: string;
  heading_line_2: string;
  heading_line_2_en?: string;
  heading_accent: string;
  heading_accent_en?: string;
  subtitle: string;
  subtitle_en?: string;
  cta_primary_text: string;
  cta_primary_text_en?: string;
  cta_primary_url: string;
  cta_secondary_text: string;
  cta_secondary_text_en?: string;
  cta_secondary_url: string;
  // Fondo y aspecto visual
  hero_bg_type: HeroBgType;
  hero_bg_url: string;
  hero_bg_fit: 'cover' | 'contain' | 'fill';
  hero_bg_position: string;
  hero_bg_opacity: number; // 0 a 100 o 0 a 1
  hero_bg_blur: number; // px
  hero_visual_tipo: HeroVisualType;
  hero_visual_url?: string;
  // Personalización de la tarjeta señalada
  hero_card?: HeroCardCustomization;
  // Tickers & Métricas
  market_ticker?: string;
  seats_total?: number;
  seats_taken?: number;
  countdown_deadline?: string;
  updated_at?: string;
}

export interface LandingAppearanceConfig {
  font_heading: 'Inter' | 'Plus Jakarta Sans' | 'Outfit' | 'Syne' | 'Montserrat' | 'Cinzel' | 'Roboto';
  font_body: 'Inter' | 'Plus Jakarta Sans' | 'Outfit' | 'Roboto';
  primary_color: string; // ej. #F59E0B
  accent_glow: boolean;
  background_pattern: 'grid' | 'dots' | 'radial' | 'none';
  custom_css?: string;
  section_bg_colors?: SectionBackgroundColors;
  hero_card?: HeroCardCustomization;
}

export interface LandingStatsConfig {
  stat1_value: string;
  stat1_label: string;
  stat1_label_en?: string;
  stat2_value: string;
  stat2_label: string;
  stat2_label_en?: string;
  stat3_value: string;
  stat3_label: string;
  stat3_label_en?: string;
  stat4_value: string;
  stat4_label: string;
  stat4_label_en?: string;
}

export interface LandingFaqItem {
  id: string;
  question: string;
  question_en?: string;
  answer: string;
  answer_en?: string;
  category?: string;
  sort_order: number;
}

export interface LandingCtaFinalConfig {
  kicker: string;
  kicker_en?: string;
  heading: string;
  heading_en?: string;
  subheading: string;
  subheading_en?: string;
  button_text: string;
  button_text_en?: string;
  button_url: string;
  guarantee_line: string;
  guarantee_line_en?: string;
}

export interface LandingMarqueeConfig {
  items: string; // Separado por coma o barra vertical
  speed_seconds: number;
  is_active: boolean;
}

export interface LandingProblemCard {
  id: string;
  number: string;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  icon?: string;
}

export interface LandingSiteSettingsConfig {
  site_name: string;
  site_tagline: string;
  site_tagline_en?: string;
  contact_email: string;
  contact_phone: string;
  logo_url?: string;
  favicon_url?: string;
  footer_copy: string;
  footer_copy_en?: string;
}

export interface LandingSeoConfig {
  meta_title: string;
  meta_title_en?: string;
  meta_description: string;
  meta_description_en?: string;
  og_image_url?: string;
  keywords: string;
}

export interface ContentActionResponse {
  success: boolean;
  error?: string | null;
  message?: string;
}
