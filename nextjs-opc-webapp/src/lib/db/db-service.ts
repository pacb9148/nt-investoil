import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { Post, Category, MediaItem, ContactLead, TeamMember } from '@/types';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/lib/constants/blog-data';
import { TEAM_MEMBERS } from '@/lib/constants/investoil';

function resolveDataDir(): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'data'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data'),
    path.resolve(__dirname, '../../data'),
    path.resolve(__dirname, '../../../data'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  const fallback = fs.existsSync(path.join(process.cwd(), 'nextjs-opc-webapp'))
    ? path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data')
    : path.join(process.cwd(), 'src', 'data');
  try {
    fs.mkdirSync(fallback, { recursive: true });
  } catch {}
  return fallback;
}

const DATA_DIR = resolveDataDir();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string, defaultData: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
    // Si no existe, crear con defaultData
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  } catch (error) {
    console.error(`Error al leer archivo de base de datos ${filename}:`, error);
    return defaultData;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error al escribir archivo de base de datos ${filename}:`, error);
  }
}

// Media inicial por defecto
const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'm-1',
    filename: 'seal-transparent.png',
    url: '/images/branding/seal-transparent.png',
    type: 'image',
    mime_type: 'image/png',
    size: 540000,
    alt_text: 'Sello Oficial Invest Oil LLC',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-2',
    filename: 'logo.png',
    url: '/images/branding/logo.png',
    type: 'image',
    mime_type: 'image/png',
    size: 210000,
    alt_text: 'Logotipo Principal Invest Oil LLC',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-3',
    filename: 'pet-coke-terminal.jpg',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    mime_type: 'image/jpeg',
    size: 420000,
    alt_text: 'Terminal de carga de Pet Coke',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-4',
    filename: 'oil-tanker-vessel.jpg',
    url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    mime_type: 'image/jpeg',
    size: 680000,
    alt_text: 'Buque petrolero VLCC en alta mar',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-5',
    filename: 'refinery-complex.jpg',
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    mime_type: 'image/jpeg',
    size: 510000,
    alt_text: 'Complejo de refinación petroquímica',
    created_at: new Date().toISOString(),
  },
];

// ==========================================
// 1. POSTS (Artículos del Blog & Análisis)
// ==========================================
export async function getPosts(options?: {
  status?: string;
  search?: string;
  categorySlug?: string;
  limit?: number;
}): Promise<Post[]> {
  let posts: Post[] = [];

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      let query = supabase.from('posts').select('*, categories(*)').order('created_at', { ascending: false });

      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        posts = data as Post[];
      }
    } catch {
      // Fallback local
    }
  }

  if (posts.length === 0) {
    posts = readJsonFile<Post[]>('posts.json', BLOG_POSTS);
  }

  // Filtrado en memoria
  if (options?.status && options.status !== 'all') {
    posts = posts.filter((p) => p.status === options.status);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (options?.categorySlug) {
    posts = posts.filter((p) =>
      p.categories?.some((c) => c.slug === options.categorySlug)
    );
  }

  if (options?.limit && posts.length > options.limit) {
    posts = posts.slice(0, options.limit);
  }

  return posts;
}

export async function getPostById(id: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.id === id) || null;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export async function savePost(postData: Partial<Post>): Promise<Post> {
  const posts = readJsonFile<Post[]>('posts.json', BLOG_POSTS);
  const now = new Date().toISOString();

  let targetPost: Post;

  if (postData.id) {
    // Actualizar post existente
    const index = posts.findIndex((p) => p.id === postData.id);
    if (index !== -1) {
      targetPost = {
        ...posts[index],
        ...postData,
        updated_at: now,
      };
      posts[index] = targetPost;
    } else {
      targetPost = {
        id: postData.id,
        slug: postData.slug || `post-${Date.now()}`,
        title: postData.title || 'Sin título',
        excerpt: postData.excerpt || '',
        content: postData.content || null,
        status: postData.status || 'draft',
        featured_image_url: postData.featured_image_url || null,
        video_url: postData.video_url || null,
        tags: postData.tags || [],
        reading_time: postData.reading_time || 3,
        views: postData.views || 0,
        is_republished: postData.is_republished || false,
        original_source_url: postData.original_source_url || null,
        original_source_name: postData.original_source_name || null,
        created_at: now,
        updated_at: now,
        published_at: postData.status === 'published' ? now : null,
      };
      posts.unshift(targetPost);
    }
  } else {
    // Crear nuevo post
    targetPost = {
      id: `p-${Date.now()}`,
      slug: postData.slug || `post-${Date.now()}`,
      title: postData.title || 'Sin título',
      excerpt: postData.excerpt || '',
      content: postData.content || null,
      status: postData.status || 'draft',
      featured_image_url: postData.featured_image_url || null,
      video_url: postData.video_url || null,
      tags: postData.tags || [],
      reading_time: postData.reading_time || 3,
      views: 0,
      is_republished: postData.is_republished || false,
      original_source_url: postData.original_source_url || null,
      original_source_name: postData.original_source_name || null,
      created_at: now,
      updated_at: now,
      published_at: postData.status === 'published' ? now : null,
    };
    posts.unshift(targetPost);
  }

  writeJsonFile('posts.json', posts);

  // Sincronizar en Supabase si está disponible
  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('posts').upsert({
        id: targetPost.id,
        slug: targetPost.slug,
        title: targetPost.title,
        excerpt: targetPost.excerpt,
        content: targetPost.content,
        status: targetPost.status,
        featured_image_url: targetPost.featured_image_url,
        tags: targetPost.tags,
        reading_time: targetPost.reading_time,
        views: targetPost.views,
        is_republished: targetPost.is_republished,
        original_source_url: targetPost.original_source_url,
        original_source_name: targetPost.original_source_name,
        published_at: targetPost.published_at,
        updated_at: targetPost.updated_at,
      });
    } catch (err) {
      console.warn('Sync post to Supabase failed, kept locally');
    }
  }

  return targetPost;
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = readJsonFile<Post[]>('posts.json', BLOG_POSTS);
  const filtered = posts.filter((p) => p.id !== id);
  writeJsonFile('posts.json', filtered);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('posts').delete().eq('id', id);
    } catch {}
  }

  return true;
}

// ==========================================
// 2. CATEGORÍAS
// ==========================================
export async function getCategories(): Promise<Category[]> {
  return readJsonFile<Category[]>('categories.json', BLOG_CATEGORIES);
}

// ==========================================
// 3. MEDIA (Imágenes, Videos y Archivos)
// ==========================================
export async function getMediaList(search?: string): Promise<MediaItem[]> {
  let media = readJsonFile<MediaItem[]>('media.json', DEFAULT_MEDIA);

  if (search) {
    const q = search.toLowerCase();
    media = media.filter(
      (m) =>
        m.filename.toLowerCase().includes(q) ||
        (m.alt_text && m.alt_text.toLowerCase().includes(q))
    );
  }

  return media;
}

export async function saveMediaItem(item: Partial<MediaItem>): Promise<MediaItem> {
  const media = readJsonFile<MediaItem[]>('media.json', DEFAULT_MEDIA);
  const now = new Date().toISOString();

  const newItem: MediaItem = {
    id: item.id || `m-${Date.now()}`,
    filename: item.filename || 'archivo-sin-nombre',
    url: item.url || '',
    type: item.type || (item.url?.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image'),
    mime_type: item.mime_type || null,
    size: item.size || null,
    alt_text: item.alt_text || item.filename || 'Archivo Invest Oil',
    created_at: now,
  };

  const existingIdx = media.findIndex((m) => m.id === newItem.id || m.url === newItem.url);
  if (existingIdx !== -1) {
    media[existingIdx] = { ...media[existingIdx], ...newItem };
  } else {
    media.unshift(newItem);
  }

  writeJsonFile('media.json', media);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('media').upsert({
        filename: newItem.filename,
        url: newItem.url,
        type: newItem.type,
        mime_type: newItem.mime_type,
        size: newItem.size,
        alt_text: newItem.alt_text,
      });
    } catch {}
  }

  return newItem;
}

export async function deleteMediaItem(id: string): Promise<boolean> {
  const media = readJsonFile<MediaItem[]>('media.json', DEFAULT_MEDIA);
  const itemToDelete = media.find((m) => m.id === id);

  if (itemToDelete && itemToDelete.url.startsWith('/uploads/')) {
    try {
      const filePath = path.join(process.cwd(), 'public', itemToDelete.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {}
  }

  const filtered = media.filter((m) => m.id !== id);
  writeJsonFile('media.json', filtered);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('media').delete().eq('id', id);
    } catch {}
  }

  return true;
}

// ==========================================
// 4. EQUIPO DIRECTIVO (Consejo & Management)
// ==========================================
export async function getTeamMembers(): Promise<TeamMember[]> {
  return readJsonFile<TeamMember[]>('team.json', TEAM_MEMBERS);
}

export async function saveTeamMembers(members: TeamMember[]): Promise<TeamMember[]> {
  writeJsonFile('team.json', members);
  return members;
}

// ==========================================
// 5. CONTACT LEADS
// ==========================================
export async function getLeads(): Promise<ContactLead[]> {
  return readJsonFile<ContactLead[]>('leads.json', [
    {
      id: 'l-01',
      name: 'PetroAsia Trading Corp',
      email: 'procurement@petroasia.sg',
      subject: 'Requerimiento de Suministro Spot Pet Coke PC-4500 (50,000 MT)',
      message: 'Solicitamos cotización CFR puerto de Qingdao para entrega durante la segunda quincena del próximo mes.',
      status: 'new',
      source: 'web_form',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'l-02',
      name: 'Iberia Bunker Services',
      email: 'bunkers@iberiabunker.es',
      subject: 'Consulta Técnica Diésel Marino MGO & EN590',
      message: 'Interesados en programación mensual de barcazas para terminal de Algeciras.',
      status: 'contacted',
      source: 'web_form',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
}

export async function saveLead(leadData: Partial<ContactLead>): Promise<ContactLead> {
  const leads = await getLeads();
  const now = new Date().toISOString();

  let targetLead: ContactLead;
  const existingIdx = leadData.id ? leads.findIndex((l) => l.id === leadData.id) : -1;

  if (existingIdx !== -1) {
    targetLead = {
      ...leads[existingIdx],
      ...leadData,
      updated_at: now,
    };
    leads[existingIdx] = targetLead;
  } else {
    targetLead = {
      id: leadData.id || `l-${Date.now()}`,
      name: leadData.name || 'Anónimo',
      email: leadData.email || 'sin-email@investoil.es',
      subject: leadData.subject || 'Consulta comercial',
      message: leadData.message || '',
      status: leadData.status || 'new',
      source: leadData.source || 'web_form',
      created_at: now,
      updated_at: now,
    };
    leads.unshift(targetLead);
  }

  writeJsonFile('leads.json', leads);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('contact_leads').upsert([{
        id: targetLead.id,
        name: targetLead.name,
        email: targetLead.email,
        subject: targetLead.subject,
        message: targetLead.message,
        status: targetLead.status,
      }]);
    } catch {}
  }

  return targetLead;
}

// ==========================================
// 6. ESTADÍSTICAS DEL DASHBOARD
// ==========================================
export async function getDashboardStats() {
  const [posts, media, leads] = await Promise.all([
    getPosts(),
    getMediaList(),
    getLeads(),
  ]);

  const publishedPostsCount = posts.filter((p) => p.status === 'published').length;
  const draftPostsCount = posts.filter((p) => p.status === 'draft').length;

  return {
    postsCount: posts.length,
    publishedPostsCount,
    draftPostsCount,
    mediaCount: media.length,
    leadsCount: leads.length,
    recentPosts: posts.slice(0, 5),
    recentLeads: leads.slice(0, 5),
  };
}
