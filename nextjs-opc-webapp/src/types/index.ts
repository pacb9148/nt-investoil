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

export interface ServiceItem {
  code: string;
  title: string;
  description: string;
  iconName: string;
  tags: string[];
}

export interface ProductItem {
  sku: string;
  title: string;
  description: string;
  specs: string;
  market: string;
  availability: string;
  category?: string;
  imageUrl?: string;
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
  description: string;
  client: string;
  year: string;
  result: string;
}

export interface ClientTestimonial {
  id?: string;
  rating: number;
  text: string;
  name: string;
  role: string;
  avatar?: string;
  videoUrl?: string;
}

export interface NewsRepublishMetadata {
  sourceUrl: string;
  sourceName: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  publishedAt?: string;
  canonicalUrl: string;
}
