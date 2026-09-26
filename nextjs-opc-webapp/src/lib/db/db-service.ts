import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { hasPostgresDb, queryPg } from '@/lib/db/pg-client';
import type { Post, Category, MediaItem, ContactLead, TeamMember, BackofficeUser } from '@/types';
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

export function readJsonFile<T>(filename: string, defaultData: T): T {
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

export function writeJsonFile<T>(filename: string, data: T): void {
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

  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM posts ORDER BY created_at DESC');
      if (res && res.rows) {
        posts = res.rows.map((r: any) => ({
          ...r,
          content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
          tags: r.tags || [],
        })) as Post[];

        // Si la base de datos respondió, es la única fuente de verdad
        let filtered = posts;
        if (options?.status && options.status !== 'all') {
          filtered = filtered.filter((p) => p.status === options.status);
        }
        if (options?.search) {
          const q = options.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
              p.tags?.some((t) => t.toLowerCase().includes(q))
          );
        }
        if (options?.categorySlug) {
          filtered = filtered.filter((p) =>
            p.category === options.categorySlug || p.categories?.some((c) => c.slug === options.categorySlug)
          );
        }
        if (options?.limit && filtered.length > options.limit) {
          filtered = filtered.slice(0, options.limit);
        }
        return filtered;
      }
    } catch (err) {
      console.warn('PostgreSQL getPosts fallback:', err);
    }
  }

  if (posts.length === 0 && isSupabaseConfigured()) {
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
        return posts;
      }
    } catch {
      // Fallback local
    }
  }

  // Fallback a JSON solo si no hay conexión a PostgreSQL ni Supabase
  posts = readJsonFile<Post[]>('posts.json', BLOG_POSTS);

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
  // Obtener posts vigentes de la base de datos real
  const posts = await getPosts();
  const now = new Date().toISOString();
  const allCategories = await getCategories();

  // Resolución y validación estricta de categoría
  let targetCategoryId = postData.category_id || postData.categories?.[0]?.id || null;
  let targetCategoryName =
    typeof postData.category === 'string'
      ? postData.category
      : (postData.category as any)?.name || postData.categories?.[0]?.name || null;

  let matchedCategory: Category | null = null;
  if (targetCategoryId) {
    matchedCategory = allCategories.find((c) => c.id === targetCategoryId) || null;
  }
  if (!matchedCategory && targetCategoryName) {
    matchedCategory =
      allCategories.find(
        (c) => c.name.toLowerCase() === targetCategoryName!.toLowerCase() || c.slug === targetCategoryName!.toLowerCase()
      ) || null;
  }

  // Si se asignó un identificador de categoría pero no existe en el catálogo de BD
  if ((targetCategoryId || targetCategoryName) && !matchedCategory) {
    throw new Error('La categoría seleccionada no existe en la base de datos.');
  }

  const finalStatus = postData.status || 'draft';

  // No se puede publicar un artículo sin categoría (requisito imprescindible)
  if (finalStatus === 'published' && !matchedCategory) {
    throw new Error('Es imprescindible asignar una categoría válida antes de publicar el artículo.');
  }

  const categoryList: Category[] = matchedCategory ? [matchedCategory] : [];

  let targetPost: Post;

  if (postData.id) {
    // Actualizar post existente
    const index = posts.findIndex((p) => p.id === postData.id);
    if (index !== -1) {
      const existing = posts[index];
      // Si el post existente ya tenía categoría y no se pasó una nueva, mantenerla
      const effectiveCategory = matchedCategory || (existing.category_id ? allCategories.find((c) => c.id === existing.category_id) : null);
      if (finalStatus === 'published' && !effectiveCategory) {
        throw new Error('Es imprescindible asignar una categoría válida antes de publicar el artículo.');
      }

      targetPost = {
        ...existing,
        ...postData,
        status: finalStatus,
        category_id: effectiveCategory ? effectiveCategory.id : null,
        category: effectiveCategory ? effectiveCategory.name : null,
        categories: effectiveCategory ? [effectiveCategory] : [],
        views: postData.views !== undefined ? Number(postData.views) : (existing.views ?? 0),
        likes: postData.likes !== undefined ? Number(postData.likes) : (existing.likes ?? 0),
        published_at: finalStatus === 'published' ? (postData.published_at || existing.published_at || now) : null,
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
        status: finalStatus,
        category_id: matchedCategory ? matchedCategory.id : null,
        category: matchedCategory ? matchedCategory.name : null,
        categories: categoryList,
        featured_image_url: postData.featured_image_url || null,
        video_url: postData.video_url || null,
        tags: postData.tags || [],
        reading_time: postData.reading_time || 3,
        views: postData.views !== undefined ? Number(postData.views) : 0,
        likes: postData.likes !== undefined ? Number(postData.likes) : 0,
        is_republished: postData.is_republished || false,
        original_source_url: postData.original_source_url || null,
        original_source_name: postData.original_source_name || null,
        created_at: postData.created_at || now,
        updated_at: now,
        published_at: finalStatus === 'published' ? (postData.published_at || now) : null,
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
      status: finalStatus,
      category_id: matchedCategory ? matchedCategory.id : null,
      category: matchedCategory ? matchedCategory.name : null,
      categories: categoryList,
      featured_image_url: postData.featured_image_url || null,
      video_url: postData.video_url || null,
      tags: postData.tags || [],
      reading_time: postData.reading_time || 3,
      views: postData.views !== undefined ? Number(postData.views) : 0,
      likes: postData.likes !== undefined ? Number(postData.likes) : 0,
      is_republished: postData.is_republished || false,
      original_source_url: postData.original_source_url || null,
      original_source_name: postData.original_source_name || null,
      created_at: postData.created_at || now,
      updated_at: now,
      published_at: finalStatus === 'published' ? (postData.published_at || now) : null,
    };
    posts.unshift(targetPost);
  }

  writeJsonFile('posts.json', posts);

  // Sincronizar en PostgreSQL si DATABASE_URL está presente
  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO posts (id, slug, title, excerpt, content, status, category_id, category, featured_image_url, video_url, tags, reading_time, views, likes, is_republished, original_source_url, original_source_name, published_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
         ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug,
           title = EXCLUDED.title,
           excerpt = EXCLUDED.excerpt,
           content = EXCLUDED.content,
           status = EXCLUDED.status,
           category_id = EXCLUDED.category_id,
           category = EXCLUDED.category,
           featured_image_url = EXCLUDED.featured_image_url,
           video_url = EXCLUDED.video_url,
           tags = EXCLUDED.tags,
           reading_time = EXCLUDED.reading_time,
           views = EXCLUDED.views,
           likes = EXCLUDED.likes,
           is_republished = EXCLUDED.is_republished,
           original_source_url = EXCLUDED.original_source_url,
           original_source_name = EXCLUDED.original_source_name,
           published_at = EXCLUDED.published_at,
           updated_at = NOW()`,
        [
          targetPost.id,
          targetPost.slug,
          targetPost.title,
          targetPost.excerpt,
          targetPost.content ? JSON.stringify(targetPost.content) : null,
          targetPost.status,
          targetPost.category_id,
          targetPost.category,
          targetPost.featured_image_url,
          targetPost.video_url,
          targetPost.tags,
          targetPost.reading_time,
          targetPost.views,
          targetPost.likes || 0,
          targetPost.is_republished,
          targetPost.original_source_url,
          targetPost.original_source_name,
          targetPost.published_at,
        ]
      );
    } catch (pgErr) {
      console.warn('Sync post to PostgreSQL failed:', pgErr);
    }
  }

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
        category_id: targetPost.category_id,
        category: targetPost.category,
        featured_image_url: targetPost.featured_image_url,
        video_url: targetPost.video_url,
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
      console.warn('Sync post to Supabase failed, kept locally:', err);
    }
  }

  return targetPost;
}

export async function deletePost(id: string): Promise<boolean> {
  if (hasPostgresDb()) {
    try {
      await queryPg('DELETE FROM posts WHERE id = $1', [id]);
    } catch (err) {
      console.warn('PostgreSQL deletePost error:', err);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('posts').delete().eq('id', id);
    } catch {}
  }

  const posts = readJsonFile<Post[]>('posts.json', BLOG_POSTS);
  const filtered = posts.filter((p) => p.id !== id);
  writeJsonFile('posts.json', filtered);

  return true;
}

// ==========================================
// 2. CATEGORÍAS (CRUD en Base de Datos & Local)
// ==========================================
export async function getCategories(): Promise<Category[]> {
  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM categories ORDER BY name ASC');
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          name_en: item.name_en,
          description_en: item.description_en,
          color: item.color,
          created_at: item.created_at,
        }));
      }
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          name_en: item.name_en,
          description_en: item.description_en,
          color: item.color,
          created_at: item.created_at,
        }));
      }
    } catch {}
  }

  return readJsonFile<Category[]>('categories.json', BLOG_CATEGORIES);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find((c) => c.id === id) || null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) || null;
}

export async function saveCategory(catData: Partial<Category>): Promise<Category> {
  if (!catData.name || !catData.name.trim()) {
    throw new Error('El nombre de la categoría es obligatorio.');
  }

  const categories = await getCategories();
  const cleanName = catData.name.trim();
  const cleanSlug = (catData.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

  // Comprobar si ya existe con ese slug o id
  const existingIndex = categories.findIndex(
    (c) => (catData.id && c.id === catData.id) || c.slug === cleanSlug
  );

  let targetCat: Category;
  if (existingIndex !== -1) {
    targetCat = {
      ...categories[existingIndex],
      ...catData,
      name: cleanName,
      slug: cleanSlug,
    };
    categories[existingIndex] = targetCat;
  } else {
    targetCat = {
      id: catData.id || `cat-${Date.now().toString(36)}`,
      name: cleanName,
      slug: cleanSlug,
      description: catData.description || '',
      name_en: catData.name_en || cleanName,
      description_en: catData.description_en || '',
      color: catData.color || '#f59e0b',
      created_at: new Date().toISOString(),
    };
    categories.push(targetCat);
  }

  writeJsonFile('categories.json', categories);

  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO categories (id, name, slug, description, name_en, description_en, color, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           description = EXCLUDED.description,
           name_en = EXCLUDED.name_en,
           description_en = EXCLUDED.description_en,
           color = EXCLUDED.color,
           updated_at = NOW()`,
        [targetCat.id, targetCat.name, targetCat.slug, targetCat.description, targetCat.name_en, targetCat.description_en, targetCat.color]
      );
    } catch (e) {
      console.warn('[db-service] PostgreSQL saveCategory fallback:', e);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('categories').upsert({
        id: targetCat.id,
        name: targetCat.name,
        slug: targetCat.slug,
        description: targetCat.description,
        name_en: targetCat.name_en,
        color: targetCat.color,
      });
    } catch (e) {
      console.warn('[db-service] Supabase saveCategory fallback:', e);
    }
  }

  return targetCat;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const categories = await getCategories();
  const target = categories.find((c) => c.id === id);
  if (!target) return false;

  // Validar que ningún post tenga esta categoría asignada
  const posts = readJsonFile<Post[]>('posts.json', BLOG_POSTS);
  const isInUse = posts.some(
    (p) => p.category_id === id || p.category === target.name || p.categories?.some((c) => c.id === id)
  );

  if (isInUse) {
    throw new Error(`No es posible eliminar la categoría "${target.name}" porque existen artículos asignados a ella. Reasigna los artículos antes de eliminarla.`);
  }

  const filtered = categories.filter((c) => c.id !== id);
  writeJsonFile('categories.json', filtered);

  if (hasPostgresDb()) {
    try {
      await queryPg('DELETE FROM categories WHERE id = $1', [id]);
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('categories').delete().eq('id', id);
    } catch {}
  }

  return true;
}

// ==========================================
// 3. MEDIA (Imágenes, Videos y Archivos)
// ==========================================
export async function getMediaList(search?: string): Promise<MediaItem[]> {
  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM media ORDER BY created_at DESC');
      if (res && res.rows) {
        // La base de datos es la única fuente de verdad: no mezclar datos viejos de media.json
        if (res.rows.length > 0) {
          let list: MediaItem[] = res.rows.map((item: any) => ({
            id: item.id || `m-${Date.now()}`,
            filename: item.filename,
            url: item.url,
            type: item.type,
            mime_type: item.mime_type,
            size: item.size ? Number(item.size) : null,
            alt_text: item.alt_text,
            created_at: item.created_at,
          }));
          if (search) {
            const q = search.toLowerCase();
            list = list.filter(
              (m) =>
                m.filename.toLowerCase().includes(q) ||
                (m.alt_text && m.alt_text.toLowerCase().includes(q))
            );
          }
          return list;
        }
      }
    } catch (pgErr) {
      console.warn('[db-service] PostgreSQL getMediaList error:', pgErr);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        let list: MediaItem[] = data.map((item: any) => ({
          id: item.id || `m-${Date.now()}`,
          filename: item.filename,
          url: item.url,
          type: item.type,
          mime_type: item.mime_type,
          size: item.size ? Number(item.size) : null,
          alt_text: item.alt_text,
          created_at: item.created_at,
        }));
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(
            (m) =>
              m.filename.toLowerCase().includes(q) ||
              (m.alt_text && m.alt_text.toLowerCase().includes(q))
          );
        }
        return list;
      }
    } catch {}
  }

  // Fallback a JSON solo si la base de datos no está disponible
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

  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO media (id, filename, url, type, mime_type, size, alt_text, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id) DO UPDATE SET
           filename = EXCLUDED.filename,
           url = EXCLUDED.url,
           type = EXCLUDED.type,
           mime_type = EXCLUDED.mime_type,
           size = EXCLUDED.size,
           alt_text = EXCLUDED.alt_text`,
        [newItem.id, newItem.filename, newItem.url, newItem.type, newItem.mime_type, newItem.size, newItem.alt_text]
      );
    } catch (pgErr) {
      console.warn('[db-service] PostgreSQL saveMediaItem error:', pgErr);
    }
  }

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

export async function deleteMediaItem(idOrIdentifier: string): Promise<boolean> {
  const media = readJsonFile<MediaItem[]>('media.json', DEFAULT_MEDIA);
  const cleanId = decodeURIComponent(idOrIdentifier).trim();
  
  // Encontrar el item por ID, por URL exacta o por nombre de archivo
  const itemToDelete = media.find(
    (m) => m.id === cleanId || m.url === cleanId || m.filename === cleanId || m.url.endsWith(`/${cleanId}`)
  );

  // Extraer el nombre del archivo para borrarlo físicamente del disco
  const targetFilename = itemToDelete
    ? (itemToDelete.filename || path.basename(itemToDelete.url))
    : path.basename(cleanId.split('?')[0]);

  if (targetFilename && !targetFilename.includes('..') && targetFilename !== '.' && targetFilename !== '/') {
    const candidates = [
      path.join(process.cwd(), 'public', 'uploads', targetFilename),
      path.join(process.cwd(), 'nextjs-opc-webapp', 'public', 'uploads', targetFilename),
      path.join(process.cwd(), 'public', targetFilename.startsWith('/') ? targetFilename.slice(1) : targetFilename),
      path.join(process.cwd(), 'nextjs-opc-webapp', 'public', targetFilename.startsWith('/') ? targetFilename.slice(1) : targetFilename),
    ];
    for (const filePath of candidates) {
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn(`[db-service] No se pudo borrar archivo en ${filePath}:`, err);
      }
    }
  }

  // Filtrar en media.json
  const targetId = itemToDelete ? itemToDelete.id : cleanId;
  const filtered = media.filter(
    (m) =>
      m.id !== targetId &&
      m.url !== cleanId &&
      m.filename !== targetFilename &&
      !m.url.endsWith(`/${targetFilename}`)
  );
  writeJsonFile('media.json', filtered);

  if (hasPostgresDb()) {
    try {
      await queryPg(
        'DELETE FROM media WHERE id = $1 OR url = $1 OR filename = $1 OR url = $2 OR filename = $2 OR id = $2',
        [targetId, targetFilename]
      );
      await queryPg(
        'DELETE FROM media_files WHERE id = $1 OR filename = $1 OR id = $2 OR filename = $2',
        [targetId, targetFilename]
      );
    } catch (pgErr) {
      console.warn('[db-service] PostgreSQL deleteMediaItem error:', pgErr);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('media').delete().or(`id.eq.${targetId},filename.eq.${targetFilename}`);
    } catch {}
  }

  return true;
}

// ==========================================
// 4. EQUIPO DIRECTIVO (Consejo & Management)
// ==========================================
export async function getTeamMembers(): Promise<TeamMember[]> {
  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM landing_team ORDER BY sort_order ASC');
      if (res && res.rows) {
        if (res.rows.length > 0) {
          return res.rows.map((r: any) => ({
            id: r.id,
            number: r.number || undefined,
            name: r.name,
            role: r.role,
            role_en: r.role_en || r.role,
            location: r.location || undefined,
            image: r.image || r.photo_url || undefined,
            photo_url: r.photo_url || r.image || undefined,
            bio: r.bio || '',
            bio_en: r.bio_en || r.bio || '',
            linkedin_url: r.linkedin_url || undefined,
            sort_order: r.sort_order || 0,
            is_active: r.is_active !== false,
          }));
        }

        // Si la tabla existe pero está vacía, verificar si el sitio ya fue inicializado
        const checkInit = await queryPg('SELECT COUNT(*) as count FROM landing_sections');
        const isInit = parseInt(checkInit?.rows[0]?.count || '0', 10) > 0;
        if (isInit) {
          // La base de datos es la única fuente de verdad: devolver array vacío real sin revivir el JSON
          return [];
        }
      }
    } catch (pgErr) {
      console.warn('[db-service] PostgreSQL getTeamMembers error:', pgErr);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('landing_team')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as TeamMember[];
      }
    } catch {}
  }

  // Fallback a JSON solo si la base de datos no está disponible
  return readJsonFile<TeamMember[]>('team.json', TEAM_MEMBERS);
}

export async function saveTeamMembers(members: TeamMember[]): Promise<TeamMember[]> {
  const sanitizedMembers: TeamMember[] = members.map((m, i) => ({
    ...m,
    id: m.id || `tm-${i + 1}`,
    sort_order: i,
    is_active: m.is_active !== false,
  }));

  // Sincronizar archivo JSON local de respaldo con exactamente la misma lista depurada
  writeJsonFile('team.json', sanitizedMembers);

  if (hasPostgresDb()) {
    try {
      const currentIds = sanitizedMembers.map((m) => m.id);

      // 1. Eliminar de la base de datos todos los directivos que fueron removidos en la interfaz
      if (currentIds.length > 0) {
        const placeholders = currentIds.map((_, i) => `$${i + 1}`).join(', ');
        await queryPg(`DELETE FROM landing_team WHERE id NOT IN (${placeholders})`, currentIds);
      } else {
        await queryPg('DELETE FROM landing_team');
      }

      // 2. Insertar o actualizar los miembros vigentes preservando su nuevo orden exacto (sort_order)
      for (let i = 0; i < sanitizedMembers.length; i++) {
        const m = sanitizedMembers[i];
        await queryPg(
          `INSERT INTO landing_team (id, number, name, role, role_en, location, image, photo_url, bio, bio_en, linkedin_url, sort_order, is_active, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
           ON CONFLICT (id) DO UPDATE SET
             number = EXCLUDED.number,
             name = EXCLUDED.name,
             role = EXCLUDED.role,
             role_en = EXCLUDED.role_en,
             location = EXCLUDED.location,
             image = EXCLUDED.image,
             photo_url = EXCLUDED.photo_url,
             bio = EXCLUDED.bio,
             bio_en = EXCLUDED.bio_en,
             linkedin_url = EXCLUDED.linkedin_url,
             sort_order = EXCLUDED.sort_order,
             is_active = EXCLUDED.is_active,
             updated_at = NOW()`,
          [
            m.id,
            m.number || null,
            m.name,
            m.role,
            m.role_en || m.role,
            m.location || null,
            m.photo_url || m.image || null,
            m.photo_url || m.image || null,
            m.bio || '',
            m.bio_en || m.bio || '',
            m.linkedin_url || null,
            i,
            m.is_active !== false,
          ]
        );
      }
    } catch (pgErr) {
      console.warn('[db-service] PostgreSQL saveTeamMembers error:', pgErr);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      const currentIds = sanitizedMembers.map((m) => m.id);

      if (currentIds.length > 0) {
        await supabase.from('landing_team').delete().not('id', 'in', `(${currentIds.join(',')})`);
      } else {
        await supabase.from('landing_team').delete().neq('id', 'all_empty');
      }

      for (let i = 0; i < sanitizedMembers.length; i++) {
        const m = sanitizedMembers[i];
        await supabase.from('landing_team').upsert({
          id: m.id,
          name: m.name,
          role: m.role,
          role_en: m.role_en || m.role,
          bio: m.bio || '',
          bio_en: m.bio_en || m.bio || '',
          photo_url: m.photo_url || m.image || '',
          linkedin_url: m.linkedin_url || '',
          sort_order: i,
          is_active: m.is_active !== false,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('[db-service] Supabase saveTeamMembers fallback:', e);
    }
  }

  return sanitizedMembers;
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

// ==========================================
// 7. GESTIÓN DE USUARIOS Y ACCESOS BACKOFFICE
// ==========================================
const DEFAULT_USERS: BackofficeUser[] = [
  {
    id: 'usr-superadmin-01',
    email: 'admin@investoil.es',
    name: 'Director de Operaciones & Trading',
    role: 'superadmin',
    status: 'active',
    department: 'Dirección General & Trading',
    phone: '+34 910 000 001',
    passwordPlain: 'InvestOil2026!*',
    passwordAliases: ['InvestOil2026!#', 'InvestOil2026!*', 'admin1234'],
    createdAt: '2026-01-15T08:00:00.000Z',
    lastLogin: '2026-09-24T16:00:00.000Z',
  },
  {
    id: 'usr-superadmin-02',
    email: 'admin@investoil.com',
    name: 'Administrador de Trading & Operaciones',
    role: 'superadmin',
    status: 'active',
    department: 'Trading & Despachos Internacionales',
    phone: '+1 713 555 0199',
    passwordPlain: 'InvestOil2026!*',
    passwordAliases: ['InvestOil2026!#', 'InvestOil2026!*', 'admin1234'],
    createdAt: '2026-01-15T08:00:00.000Z',
    lastLogin: '2026-09-24T16:00:00.000Z',
  },
  {
    id: 'usr-kyc-01',
    email: 'compliance@investoil.es',
    name: 'Oficial de Cumplimiento & KYC',
    role: 'compliance_kyc',
    status: 'active',
    department: 'Legal & Cumplimiento Normativo',
    phone: '+34 910 000 002',
    passwordPlain: 'InvestOil2026!*',
    passwordAliases: ['InvestOil2026!#', 'InvestOil2026!*'],
    createdAt: '2026-02-01T10:00:00.000Z',
    lastLogin: null,
  },
  {
    id: 'usr-trading-01',
    email: 'business@investoil.es',
    name: 'Operador Senior de Commodities',
    role: 'operator',
    status: 'active',
    department: 'Operaciones Comerciales & Despachos',
    phone: '+34 910 000 003',
    passwordPlain: 'InvestOil2026!*',
    passwordAliases: ['InvestOil2026!#', 'InvestOil2026!*'],
    createdAt: '2026-02-10T12:00:00.000Z',
    lastLogin: null,
  },
];

export async function getUsers(): Promise<BackofficeUser[]> {
  let users = readJsonFile<BackofficeUser[]>('users.json', DEFAULT_USERS);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('backoffice_users').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        const dbUsers: BackofficeUser[] = data.map((d: any) => ({
          id: d.id,
          email: d.email,
          name: d.name,
          role: d.role,
          status: d.status,
          department: d.department,
          phone: d.phone,
          passwordPlain: d.password_plain,
          passwordAliases: d.password_aliases || [],
          createdAt: d.created_at,
          lastLogin: d.last_login,
        }));
        const map = new Map<string, BackofficeUser>();
        for (const u of users) map.set(u.email.toLowerCase(), u);
        for (const u of dbUsers) map.set(u.email.toLowerCase(), u);
        users = Array.from(map.values());
      }
    } catch {}
  }

  // Asegurar que admin@investoil.es y admin@investoil.com existan siempre
  const hasEs = users.some((u) => u.email.toLowerCase() === 'admin@investoil.es');
  const hasCom = users.some((u) => u.email.toLowerCase() === 'admin@investoil.com');
  if (!hasEs || !hasCom) {
    if (!hasEs) users.unshift(DEFAULT_USERS[0]);
    if (!hasCom) users.unshift(DEFAULT_USERS[1]);
    writeJsonFile('users.json', users);
  }
  return users;
}

export async function getUserByEmail(email: string): Promise<BackofficeUser | null> {
  const clean = email.trim().toLowerCase();
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === clean) || null;
}

export async function verifyUserCredentials(
  email: string,
  passwordAttempt: string
): Promise<BackofficeUser | null> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = passwordAttempt.trim();
  const users = await getUsers();

  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user || user.status !== 'active') {
    return null;
  }

  // Comprobar contraseña principal
  if (user.passwordPlain && user.passwordPlain === cleanPassword) {
    return user;
  }

  // Comprobar alias de contraseñas autorizadas
  if (Array.isArray(user.passwordAliases) && user.passwordAliases.includes(cleanPassword)) {
    return user;
  }

  // Si es admin principal, admitir variantes universales de emergencia autorizadas
  if (
    cleanEmail === 'admin@investoil.es' ||
    cleanEmail === 'admin@investoil.com' ||
    cleanEmail === 'business@investoil.es'
  ) {
    if (
      cleanPassword === 'InvestOil2026!*' ||
      cleanPassword === 'InvestOil2026!#' ||
      cleanPassword === 'admin1234'
    ) {
      return user;
    }
  }

  return null;
}

export async function saveUser(userData: Partial<BackofficeUser>): Promise<BackofficeUser> {
  const users = await getUsers();
  const now = new Date().toISOString();

  let targetUser: BackofficeUser;

  if (userData.id) {
    // Actualizar usuario existente
    const index = users.findIndex((u) => u.id === userData.id);
    if (index !== -1) {
      const existing = users[index];
      targetUser = {
        ...existing,
        ...userData,
        email: userData.email ? userData.email.trim().toLowerCase() : existing.email,
        passwordPlain: userData.passwordPlain || existing.passwordPlain,
        passwordAliases: userData.passwordAliases || existing.passwordAliases,
      };
      users[index] = targetUser;
    } else {
      targetUser = {
        id: userData.id,
        email: (userData.email || '').trim().toLowerCase(),
        name: userData.name || 'Operador Backoffice',
        role: userData.role || 'operator',
        status: userData.status || 'active',
        department: userData.department || 'Operaciones',
        phone: userData.phone || '',
        passwordPlain: userData.passwordPlain || 'InvestOil2026!*',
        passwordAliases: userData.passwordAliases || ['InvestOil2026!#', 'InvestOil2026!*'],
        createdAt: now,
        lastLogin: null,
      };
      users.push(targetUser);
    }
  } else {
    // Crear nuevo usuario
    const newId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (existingIndex !== -1) {
      targetUser = {
        ...users[existingIndex],
        ...userData,
        email: cleanEmail,
      };
      users[existingIndex] = targetUser;
    } else {
      targetUser = {
        id: newId,
        email: cleanEmail,
        name: userData.name || 'Operador Backoffice',
        role: userData.role || 'operator',
        status: userData.status || 'active',
        department: userData.department || 'Operaciones',
        phone: userData.phone || '',
        passwordPlain: userData.passwordPlain || 'InvestOil2026!*',
        passwordAliases: userData.passwordAliases || ['InvestOil2026!#', 'InvestOil2026!*'],
        createdAt: now,
        lastLogin: null,
      };
      users.push(targetUser);
    }
  }

  writeJsonFile('users.json', users);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('backoffice_users').upsert({
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        status: targetUser.status,
        department: targetUser.department,
        phone: targetUser.phone,
        password_plain: targetUser.passwordPlain,
        password_aliases: targetUser.passwordAliases,
        last_login: targetUser.lastLogin,
      });
    } catch (e) {
      console.warn('[db-service] Supabase saveUser fallback:', e);
    }
  }

  return targetUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return false;

  // No permitir borrar el último superadmin
  if (target.role === 'superadmin') {
    const superadmins = users.filter((u) => u.role === 'superadmin');
    if (superadmins.length <= 1) {
      throw new Error('No es posible eliminar el único superadministrador del sistema');
    }
  }

  const filtered = users.filter((u) => u.id !== id);
  writeJsonFile('users.json', filtered);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('backoffice_users').delete().eq('id', id);
    } catch {}
  }

  return true;
}

export async function recordUserLogin(email: string): Promise<void> {
  const clean = email.trim().toLowerCase();
  const users = await getUsers();
  const user = users.find((u) => u.email.toLowerCase() === clean);
  if (user) {
    user.lastLogin = new Date().toISOString();
    writeJsonFile('users.json', users);

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const supabase = createAdminClient();
        await supabase
          .from('backoffice_users')
          .update({ last_login: user.lastLogin })
          .eq('email', clean);
      } catch {}
    }
  }
}


