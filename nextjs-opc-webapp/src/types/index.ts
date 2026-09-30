export type UserRole = 'superadmin' | 'admin' | 'editor' | 'operator' | 'compliance_kyc' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface BackofficeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'suspended';
  department?: string;
  phone?: string;
  passwordPlain?: string;
  passwordAliases?: string[];
  createdAt: string;
  lastLogin?: string | null;
}

export type PostStatus = 'draft' | 'published' | 'archived';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  name_en?: string | null;
  description_en?: string | null;
  color?: string | null;
  parent_id?: string | null;
  created_at?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: any; // Tiptap JSON or string content
  status: PostStatus;
  featured_image_url: string | null;
  video_url?: string | null;
  author_id?: string | null;
  author?: UserProfile | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title?: string | null;
  meta_description?: string | null;
  tags: string[];
  reading_time: number;
  views: number;
  likes?: number;
  is_republished: boolean;
  original_source_url?: string | null;
  original_source_name?: string | null;
  category_id?: string | null;
  category?: string | Category | null;
  categories?: Category[];
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'document';
  mime_type?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  uploaded_by?: string | null;
  data_base64?: string | null;
  created_at: string;
}

export interface ContactLead {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'spam';
  source?: string;
  created_at: string;
  updated_at: string;
}

/** Valoración de 1 a 5 estrellas que el visitante deja en el pop tras enviar el formulario de contacto. */
export interface CompanyRating {
  id: string;
  what_we_do: number;
  how_we_do_it: number;
  results: number;
  comment?: string | null;
  name?: string | null;
  email?: string | null;
  lead_id?: string | null;
  created_at: string;
}

export interface ServiceItem {
  code: string;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  iconName: string;
  tags: string[];
}

export interface ProductItem {
  sku: string;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  specs: string;
  specs_en?: string;
  market: string;
  market_en?: string;
  availability: string;
  availability_en?: string;
  category?: string;
  category_en?: string;
  imageUrl?: string;
}

/** Documento Tiptap (JSON) o texto plano heredado; el mismo formato que usan los artículos del blog. */
export type RichText = string | Record<string, unknown>;

export interface ProblemItem {
  id: string;
  num: string;
  title: string;
  title_en?: string;
  desc: RichText;
  desc_en?: RichText;
  solution?: RichText;
  solution_en?: RichText;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  role_en?: string;
  number?: string;
  location?: string;
  image: string;
  photo_url?: string;
  bio?: string;
  bio_en?: string;
  linkedin_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface FeaturedOperation {
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  client: string;
  client_en?: string;
  year: string;
  result: string;
  result_en?: string;
}

export interface ClientTestimonial {
  id?: string;
  rating: number;
  text: string;
  text_en?: string;
  name: string;
  role: string;
  role_en?: string;
  avatar?: string;
  videoUrl?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  question_en?: string;
  answer: string;
  answer_en?: string;
}

export interface NewsRepublishMetadata {
  sourceUrl: string;
  sourceName: string;
  title: string;
  excerpt: string;
  contentHtml?: string;
  imageUrl?: string;
  videoUrl?: string;
  imageSize?: number;
  imageNeedsCompression?: boolean;
  publishedAt?: string;
  /** false cuando no se encontró la fecha real del artículo y `publishedAt` es la hora del scraping. */
  publishedAtIsOriginal?: boolean;
  canonicalUrl: string;
}

