# Invest Oil LLC — Aplicación Web Completa (Next.js 14+ & Supabase)

Plataforma corporativa y backoffice administrativo para **Invest Oil LLC**, especializada en trading y comercialización física de petróleo y derivados (Pet Coke, Merey 16, Brent Blend, Diesel EN590, Bitumen, GLP). Desarrollada con arquitectura moderna monolítica modular basada en **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Supabase** y desplegable en **Vercel**.

---

## 🚀 Setup Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/pacb9148/nt-investoil.git
cd nt-investoil/nextjs-opc-webapp
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno
Copia la plantilla `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Configurar Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com/).
2. Copia la URL del proyecto y la anon key en tu `.env.local`.
3. Ejecuta las migraciones en orden:
   ```bash
   # Vía Supabase CLI
   supabase db push
   supabase db seed
   ```
   *O copia el contenido de `supabase/migrations/*.sql` y `supabase/seed.sql` en el SQL Editor del panel de Supabase.*

### 5. Iniciar el servidor de desarrollo
```bash
pnpm dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 🔐 Variables de Entorno

Configura las siguientes variables en `.env.local`:

```env
# Conexión con Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# URL de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Metadatos del sitio
NEXT_PUBLIC_SITE_NAME="Invest Oil LLC"
NEXT_PUBLIC_SITE_TAGLINE="Conexiones globales en el mercado petrolero"
```

---

## 📁 Estructura del Proyecto

```
nextjs-opc-webapp/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login, Registro y Recuperación de Contraseña
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/        # Panel administrativo protegido
│   │   │   ├── admin/
│   │   │   │   ├── posts/      # Gestión de posts y republicador
│   │   │   │   ├── media/      # Biblioteca de medios
│   │   │   │   ├── leads/      # Mensajes de contacto recibidos
│   │   │   │   └── settings/   # Configuración de plataforma
│   │   │   └── layout.tsx
│   │   ├── (public)/           # Landing y páginas públicas
│   │   │   ├── page.tsx        # Landing corporativa
│   │   │   ├── about/          # Historia y valores corporativos
│   │   │   ├── services/       # 10 Servicios de trading y logística
│   │   │   ├── products/       # 8 Productos y especificaciones técnicas
│   │   │   ├── blog/           # Artículos y análisis de mercado
│   │   │   ├── contact/        # Formulario de contacto
│   │   │   └── [páginas legales] # Privacidad, cookies, accesibilidad, fraude
│   │   ├── api/
│   │   │   ├── news-republish/ # Scraping de metadatos OG para republicar
│   │   │   └── contact/        # Receptor de formulario de contacto
│   │   ├── layout.tsx          # Root Layout con metadatos y fuentes
│   │   ├── globals.css         # Estilos globales y tokens obsidian
│   │   ├── not-found.tsx       # 404 estilizado
│   │   ├── sitemap.ts          # Sitemap dinámico
│   │   └── robots.ts           # Robots.txt
│   │
│   ├── components/
│   │   ├── ui/                 # Botones, Cards, Inputs, Modales, Badges
│   │   ├── layout/             # Header sticky, Footer, BrandLogo
│   │   ├── sections/           # Hero, Servicios, Productos, Equipo, Testimonios
│   │   ├── blog/               # BlogCard, BlogGrid, Atribución
│   │   └── admin/              # Editor Tiptap, Sidebar, Topbar
│   │
│   ├── lib/
│   │   ├── supabase/           # Clientes Browser, Server, Middleware, Admin
│   │   ├── constants/          # Contenido de investoil.es y enlaces
│   │   ├── validators/         # Schemas Zod
│   │   └── utils/              # Funciones auxiliares
│   ├── types/                  # Tipos TypeScript
│   └── middleware.ts           # Middleware de sesión y seguridad
│
├── supabase/
│   ├── migrations/             # 0001_init, 0002_blog, 0003_media, 0004_leads
│   ├── seed.sql                # 5 artículos iniciales, categorías y media
│   └── config.toml             # Configuración Supabase local
│
├── public/
│   ├── images/branding/        # Sello, Logotipo y Favicons
│   ├── favicon.ico
│   └── ...
│
├── tailwind.config.ts          # Paleta obsidian, cyan, ámbar y neón
├── package.json
└── vercel.json                 # Configuración de headers de seguridad
```

---

## 🎨 Personalización

### Paleta de Colores
Los tokens de diseño están centralizados en `tailwind.config.ts` y `src/app/globals.css`:
- **Fondo Obsidiana:** `#050d1f` (`--bg`)
- **Superficie:** `#0a1830` (`--surf`)
- **Tarjeta:** `#0e1e3d` (`--card`)
- **Borde:** `#1a3264` (`--border`)
- **Acento Petróleo:** `#00c9a7` (`--accent`)
- **Ámbar / Oro:** `#f5a623` (`--warm`)
- **Neón:** `#eaff3f` (`--neon`)

### Contenido Corporativo
Toda la información corporativa, los 10 servicios, los 8 productos con fichas técnicas, el equipo directivo y los testimonios se gestionan de forma tipada en `src/lib/constants/investoil.ts`.

---

## 📝 Uso del Blog & Backoffice

### Crear o Editar un Post
1. Accede a `/admin/posts` e inicia sesión.
2. Haz clic en **"Crear Post"** (o navega a `/admin/posts/new`).
3. Completa el título, extracto y utiliza el editor **Tiptap** enriquecido (soporta negritas, encabezados, tablas, listas de tareas, imágenes y videos de YouTube/Vimeo).
4. Elige si guardar como **Borrador** o **Publicar**.

### Republicar una Noticia (1 Clic)
1. En la pantalla de creación de post, haz clic en **"Republicar Noticia (1 Clic)"**.
2. Pega la URL de cualquier noticia energética (ej. Reuters, IEA, Bloomberg).
3. Haz clic en **"Extraer Metadatos"**; el sistema extraerá automáticamente el título, imagen, extracto y fuente original.
4. Presiona **"Cargar en Editor"** y publica con atribución canónica visible garantizada.

---

## 🚢 Deploy en Vercel

1. Sube tu código al repositorio en GitHub (`https://github.com/pacb9148/nt-investoil`).
2. En el panel de Vercel, importa el proyecto seleccionando la carpeta raíz o `nextjs-opc-webapp`.
3. Configura las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`).
4. Despliega automáticamente con un clic.

---

## 🔧 Scripts Disponibles

- `pnpm dev`: Inicia el servidor de desarrollo en `localhost:3000`.
- `pnpm build`: Compila la aplicación para producción.
- `pnpm start`: Arranca el servidor de producción.
- `pnpm type-check`: Ejecuta la verificación estricta de TypeScript.
- `pnpm lint`: Análisis de linter ESLint.
- `pnpm test:security`: Ejecuta la batería de pruebas de seguridad y detección de vulnerabilidades (Strix & AppSec).
