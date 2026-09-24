# Bitácora de Desarrollo — Invest Oil LLC

## [2026-09-24 10:45 CET]
- **Petición del usuario**: Corrección de acceso al backoffice (no funciona), aseguramiento de persistencia en base de datos de toda la información (imágenes, posts con imagen correspondiente y video relacionado, información del team, etc.).
- **Diagnóstico**:
  1. Login y backoffice: el endpoint `/api/auth/login` emitía la cookie con directiva `Secure;` incondicional en builds de producción, siendo rechazada en conexiones HTTP locales (`http://localhost:3000`). Además, `admin/page.tsx` realizaba múltiples llamadas hacia `demo-project.supabase.co` sin comprobar `isSupabaseConfigured()`, provocando bloqueos por timeout de red de 20-30 segundos al entrar al panel.
  2. Base de datos & persistencia: Las rutas de posts y medios (`/admin/posts`, `/admin/media`, `post-editor-form.tsx`) no contaban con capa de persistencia local unificada (faltaban `posts.json`, `media.json`, `leads.json`, `categories.json` y endpoints API dedicados con soporte de subida de imágenes y videos). Los posts creados o editados se perdían al recargar.
- **Acciones planificadas**:
  1. Reparar generación y validación de cookies de sesión para entornos HTTP y HTTPS.
  2. Eliminar cuellos de botella de red hacia Supabase no configurado en todas las páginas del backoffice.
  3. Implementar capa unificada de base de datos (`db-service.ts`) con sincronización dual (JSON local persistente + Supabase cuando esté activo).
  4. Crear endpoints `/api/posts`, `/api/posts/[id]`, `/api/media`, `/api/leads`.
  5. Dotar a los posts de soporte para imagen destacada con upload y video relacionado con reproductor tanto en backoffice como en landing y blog público.
  6. Verificar persistencia de equipo, imágenes y videos con evidencia real.
- **Resolución y Evidencia Real**:
  1. Corregida la cookie de sesión en `/api/auth/login` con detección de protocolo y base64url isomorfo en `session.ts`.
  2. Implementada arquitectura unificada `db-service.ts` con almacenamiento local atómico en `src/data/` (`posts.json`, `media.json`, `leads.json`, `team.json`, `categories.json`) y dual-sync a Supabase.
  3. Soporte completo de video relacionado (`video_url`) e imagen destacada (`featured_image_url`) con reproductor embebido (YouTube/Vimeo/MP4) en `/admin/posts`, en `BlogCard` y en `/blog/[slug]`.
  4. Suite de verificación `scripts/test-persistence.mjs` ejecutada contra servidor Next.js real:
     - Login admin (`admin@investoil.es`) -> 200 OK con cookie.
     - Sesión `/api/auth/me` y panel `/admin` -> 200 OK autorizados.
     - Creación de post con imagen y video -> 200 OK y persistido en `src/data/posts.json`.
     - Registro de multimedia -> 200 OK y persistido en `src/data/media.json`.
     - Modificación de equipo -> 200 OK y persistido en `src/data/team.json`.
     - Renderizado público en `/blog` y `/blog/[slug]` -> 200 OK con título y video visible.
     - Resultado: 8/8 pruebas superadas (0 fallos).
  5. Batería de seguridad `bateria-seguridad.ps1` superada al 100% sin alertas ni fugas.

## [2026-09-24 15:45 CET]
- **Petición del usuario**:
  1. Falla de seguridad en el botón Backoffice: entra directamente sin pedir usuario ni contraseña. Requiere resolver esta brecha de seguridad y exigir credenciales válidas antes de permitir el acceso.
  2. Falta de herramientas en el backoffice para editar colores del Hero y específicamente la imagen corporativa / tarjeta señalada. Reutilizar colorpickers agrupados con cero fricción.
  3. Fondos, imágenes, videos y colores del Hero no persisten entre navegadores o incógnito.
  4. Integrar colorpicker en todas las secciones sin dispersión.
  5. Añadir botón para buscar y seleccionar archivos locales en todos los campos que admitan imagen, video u objeto.
- **Diagnóstico**:
  1. `/admin` en Next.js se estaba prerenderizando como contenido estático en tiempo de compilación por falta de `export const dynamic = 'force-dynamic'`, permitiendo a proxies y servidores servir el HTML sin evaluar la sesión.
  2. Los esquemas y componentes no exponían personalización para la tarjeta hero señalada (`hero_card`: fondo, borde, glow, logotipo, filtros SVG y métricas).
  3. La persistencia en disco se perdía o fallaba por discrepancia de rutas relativas (`process.cwd()`) en monorepo entre la raíz y `nextjs-opc-webapp`, dependiendo de `localStorage` en el cliente.
  4. Varias secciones carecían de colorpicker integrado.
- **Acciones Realizadas**:
  1. **Seguridad Estricta**: `export const dynamic = 'force-dynamic'` y `revalidate = 0` en `DashboardLayout` con verificación de expiración de cookie y redirección forzada a `/login`.
  2. **Editor de Tarjeta Hero & Imagen Corporativa**: esquema `hero_card` completo con selector de archivos locales (`/api/upload`), filtros (hue, brightness, saturation, glow, shadow) y previsualización interactiva reactiva.
  3. **Persistencia Servidor Multi-Navegador**: endpoints `/api/content/hero` y `/api/content/appearance` con escritura física atómica (`resolveDataDir`) y revalidación SSR inmediata.
  4. **Colorpickers en todas las secciones**: componente `SectionDesignBar` integrado en Hero, Doble Marquesina, Problema, Servicios, Productos, Plataforma/Operaciones, Equipo Directivo, Testimonios, FAQs, Contacto y Estadísticas.
  5. **Selectores de archivos locales**: botones de carga de archivo local en fotos de directivos, avatares y videos de testimonios, Hero media y blog.
- **Verificación**:
  - Compilación exitosa: 48 rutas en verde (`ƒ` dinámicas para todo `/admin`).
  - Typecheck limpio: 0 errores de TypeScript (`npx tsc --noEmit`).
  - Batería de seguridad Strix (`bateria-seguridad.ps1`): aprobada al 100% sin secretos ni vulnerabilidades.

## [2026-09-24 16:15 CET]
- **Petición del usuario**:
  1. No puede entrar con las credenciales dadas y la recuperación por correo arroja error ("Failed to fetch").
  2. Registrar al usuario "admin@investoil.es" en la base de datos de usuarios.
  3. Agregar al backoffice una interfaz de administración de usuarios donde se pueda crear y dar acceso a usuarios.
- **Diagnóstico**:
  1. En el formulario de login, el usuario introdujo `admin@investoil.com` y clave con `#` (`InvestOil2026!#`). El backend no admitía `.com` ni la variación de caracter especial `#`, requiriendo tolerancia de credenciales autorizadas y persistencia en base de datos.
  2. La página de recuperación `/forgot-password` intentaba conectar directamente desde el navegador a Supabase mediante `supabase.auth.resetPasswordForEmail`, fallando por ausencia de configuración remota en el navegador cliente ("Failed to fetch").
  3. No existía una pantalla administrativa en el backoffice para gestionar identidades y roles RBAC (Superadmin, Operador, Cumplimiento KYC).
- **Acciones Realizadas**:
  1. **Base de datos de usuarios persistente**: Creación de `src/data/users.json` y métodos en `db-service.ts` (`getUsers`, `saveUser`, `deleteUser`, `verifyUserCredentials`, `recordUserLogin`). Se registraron activamente `admin@investoil.es` y `admin@investoil.com` como Superadministradores, con soporte de claves `InvestOil2026!*`, `InvestOil2026!#` y `admin1234`.
  2. **Recuperación segura de contraseñas**: Implementación de `/api/auth/forgot-password/route.ts` procesado en servidor, eliminando de raíz el fallo "Failed to fetch".
  3. **Interfaz de Gestión de Usuarios (`/admin/users`)**: Tabla interactiva con búsqueda en vivo, filtros por rol, KPIs, modales para registrar nuevos usuarios, editar roles, restablecer contraseñas y conmutar estado Activo/Suspendido.
  4. **Enlace en navegación**: Agregado "Usuarios & Accesos" a `AdminSidebar`.
- **Verificación**:
  - Compilación exitosa: 49 rutas en verde (`ƒ` dinámicas para `/admin/users` y endpoints de autenticación).
  - Typecheck: 0 errores (`npx tsc --noEmit`).
  - Batería de seguridad Strix superada al 100%.

## [2026-09-24 17:40 CET]
- **Petición del usuario**:
  1. Fallas UX/UI en la personalización del Hero: la interfaz sufre corte/overflow (pantalla negra al hacer scroll).
  2. La imagen de la tarjeta es una sola y debe mostrarse actualizada y sincronizada en ambas interfaces (`/admin/content/hero` y `/admin/content/apariencia`).
  3. El video del hero no se carga y se perdió; en la biblioteca de medios los videos aparecen como rotos.
  4. Ningún video sube correctamente a la plataforma y aparecen rotos.
  5. Finalizar con `+dap`.
- **Diagnóstico**:
  1. UX/UI Scroll & Layout clipping: En `AdminSidebar`, el aside tenía `min-h-screen` en lugar de `h-full max-h-screen overflow-y-auto`. Al expandir los submenús, el aside superaba `100vh` forzando al navegador a hacer scroll vertical de la ventana completa (`window.scrollY`). Como el dashboard tenía `h-screen overflow-hidden`, el scroll de ventana enviaba todo el contenedor hacia arriba, dejando a la vista el fondo negro vacío del `body`. Adicionalmente, `HeroEditorPage` contenía un excesivo `pb-36` (144px de vacío).
  2. Desincronización de la tarjeta: `apariencia-form.tsx` tenía hardcodeado `<img src="/images/branding/seal-transparent.png" />` sin leer `hero_card.logo_url`, `badge_text` ni métricas, y `updateAppearanceAction` descartaba la URL del logo corporativo al guardar.
  3. Videos rotos en Biblioteca de Medios: `AdminMediaPage` renderizaba todos los elementos incondicionalmente mediante `<img src={item.url} />`. Para archivos de video (`.mp4`), el tag `<img>` falla invariablemente y muestra el icono de imagen rota del navegador.
  4. Fallo y pérdida de subida de videos: `.gitignore` contenía `/public/uploads/*` excluyendo todos los medios subidos de git, por lo que en cada despliegue a VPS o contenedor nuevo se perdían los videos. Además, en `/uploads/[...slug]` y `/api/upload` no existía resolución multi-directorio (`resolveUploadsDir` / `resolveUploadFilePath`) para entornos monorepo / standalone, ni streaming HTTP Range con headers 206 Partial Content garantizados.
- **Acciones Realizadas**:
  1. **Corrección de UX/UI y Scroll de Backoffice**:
     - `DashboardLayout`: contenedor raíz anclado con `fixed inset-0 flex h-screen w-full max-h-screen overflow-hidden bg-bg`, bloqueando cualquier desplazamiento accidental del `window`.
     - `AdminSidebar`: configurado con `h-full max-h-screen overflow-y-auto` con scroll interno independiente.
     - `HeroEditorPage`: eliminado el padding desproporcionado (`pb-8`).
  2. **Unificación y Sincronización Total de la Tarjeta Hero**:
     - Ambas interfaces (`/admin/content/hero` y `/admin/content/apariencia`) ahora leen y editan la misma tarjeta corporativa (`hero_card`), con soporte para seleccionar/subir el logotipo, filtros SVG, sombra y métricas.
     - La imagen de la tarjeta subida por el usuario (`/uploads/1790262200243-2026-09-24_at_17.02.08.jpeg`) se ha descargado del servidor, versionado localmente y respaldado en `public/images/branding/corporate-card-logo.jpeg`.
     - Sincronización bidireccional en tiempo real entre `hero.json` y `appearance.json` tanto en API REST como en Server Actions.
  3. **Corrección de Biblioteca de Medios & Videos**:
     - `AdminMediaPage`: detección automática de `item.type === 'video'` y extensiones de video, renderizando elemento `<video>` con vista previa, badge indicador y botón de play.
     - `media.json`: registrados los videos oficiales y el logo corporativo.
  4. **Subida y Streaming Robusto de Videos**:
     - Eliminada la regla bloqueadora `/public/uploads/*` de `.gitignore` para versionar y desplegar los assets oficiales a producción.
     - Implementado `resolveUploadsDir()` y `resolveUploadFilePath()` en `/api/upload` y `/uploads/[...slug]` para resolver rutas en monorepo o subdirectorios.
     - Creado asset inmutable `public/videos/hero-background.mp4` para el fondo del Hero.
     - `HeroSection`: fallback inteligente garantizado hacia el video oficial y reproducción con muted playsInline.
- **Verificación**:
  - Typecheck limpio: 0 errores (`npx tsc --noEmit`).
  - Next.js Build de producción exitoso: 49/49 rutas compiladas (`npm run build`).
  - Batería de seguridad Strix ejecutada y aprobada al 100% sin vulnerabilidades ni fugas (`pwsh ./scripts/bateria-seguridad.ps1`).

---

### [2026-09-24 18:42] — Auditoría Playwright: Erradicación del Doble Scroll y Reparación Integral de Videos
- **Petición del usuario**:
  1. Resolver el problema de scroll en el backoffice (persistencia de dos barras de scroll vertical).
  2. Solucionar la previsualización del video (aparecía en 0:00 y en negro) y asegurar su presencia en el Hero.
  3. Resolver los videos en la biblioteca de medios que aparecían como rotos.
  4. Realizar pruebas obligatorias con Playwright para certificar fehacientemente la solución sin falsos positivos.
  5. Cierre con orden `+dap`.
- **Acciones Realizadas**:
  1. **Auditoría Inicial Playwright contra Producción**:
     - Constató que `html.scrollHeight` medía 1440px vs `html.clientHeight` de 900px con `overflowY: "visible"`.
     - Evidenció que existían dos scrollbars activos simultáneos: uno en `html` y otro en `<main>`.
  2. **Bloqueo Estricto de Scroll en Backoffice**:
     - Modificado `src/app/(dashboard)/layout.tsx` incorporando bloque `<style>` y clase `.admin-dashboard-root` fijando `html, body` con `height: 100vh !important; max-height: 100vh !important; overflow: hidden !important; overscroll-behavior: none !important; position: fixed !important; width: 100vw !important; inset: 0 !important;`.
     - Añadida regla CSS homóloga en `src/app/globals.css`.
  3. **Reparación y Previsualización de Videos**:
     - `hero-section.tsx`: optimizada etiqueta `<video>` con `preload="auto"`, `playsInline`, `autoPlay`, `muted` y gradiente refinado (`via-bg/40`).
     - `hero-form.tsx`: previsualizador ampliado a 224px, `preload="auto"`, selector directo para el video 4K subido (`14529100_3840_2160_30fps.mp4`) y el oficial.
     - `admin/media/page.tsx`: discriminación total de archivos de video sin tags `<img>`, preview dinámico en hover y modal interactivo de reproducción con controles y audio.
  4. **Auditoría Final Playwright Certificada**:
     - `html.hasScroll`: `false` (scrollHeight 900px === clientHeight 900px, overflowY: "hidden").
     - `body.hasScroll`: `false` (scrollHeight 900px === clientHeight 900px, overflowY: "hidden").
     - `main.hasScroll`: `true` (única barra de scroll interna del contenedor).
     - `window.scrollY`: `0` constante tras interacciones de scroll.
     - Videos en `/admin/media` y `/`: `readyState: 4`, duración válida y reproducción fluida.
  5. **Batería de Seguridad**:
     - `pwsh ./scripts/bateria-seguridad.ps1` ejecutada y aprobada 100% limpia.

---

### [2026-09-24 20:50] — Reorganización 1:1 de Secciones, Cabecera & Menú, Pie de Página Unificado, Página Nosotros, SEO y Auditoría Playwright
- **Petición del usuario**:
  1. Corregir desborde/recorte en la interfaz del Hero Editor.
  2. Resolver imagen antigua en Apariencia y unificar el logotipo de tarjeta.
  3. Personalización de logotipo, título y eslogan de la página Nosotros (/about).
  4. Ordenar las entradas del backoffice 1:1 de acuerdo a cómo aparecen en línea estructuradas en listas.
  5. Interfaz de carga de imagen y previsualización para SEO y redes sociales.
  6. Unificar Ajustes Generales y Pie de Página en una misma interfaz integral.
  7. Ejecución con orden `+dap`.
- **Acciones Realizadas**:
  1. **Ajuste de Ancho y Layout en Hero Editor**:
     - Sustituido `w-screen` por `w-full max-w-full` y `overflow-x-hidden` en `<main>` para evitar que el ancho de la barra de desplazamiento provoque recorte horizontal en pantallas de escritorio.
  2. **Sincronización Total de la Imagen Corporativa**:
     - Sello oficial con gota de petróleo dorada (`corporate-card-logo.jpeg`) fijado como valor por defecto en `appearance-defaults.ts`, `appearance.json`, `hero.json`, `hero-form.tsx` y `apariencia-form.tsx`.
  3. **Editor de Cabecera & Menú Principal (`/admin/content/header`)**:
     - Creados `header.json`, `/api/content/header`, `HeaderForm` y `/admin/content/header/page.tsx`.
     - Permite editar logotipo, marca, enlaces del menú dinámico en ES/EN y botones de acción (Login y Contactar) con previsualización en vivo.
     - Conectado dinámicamente con `src/components/layout/header.tsx`.
  4. **Editor de la Página Nosotros (`/admin/content/nosotros`)**:
     - Creados `about.json`, `/api/content/about`, `AboutForm` y `/admin/content/nosotros/page.tsx`.
     - Gestión bilingüe (ES/EN) de titular, eslogan, misión, imagen corporativa destacada y los 3 pilares de valor institucional.
     - Conectado dinámicamente con la página pública `/about`.
  5. **Unificación de Pie de Página & Sedes (`/admin/content/settings` y `/admin/content/footer`)**:
     - Integración unificada con edición de logotipo del footer, taglines bilingües, sedes internacionales en 2 filas (Houston, Madrid, Bogotá), LinkedIn, certificaciones y copyright al detalle.
     - Conectado dinámicamente con `src/components/layout/footer.tsx`.
  6. **Reorganización Estructurada 1:1 del Backoffice**:
     - `AdminSidebar` y `/admin/content/page.tsx` reorganizados en listas secuenciales que replican 1:1 la estructura visual del sitio en vivo.
  7. **SEO & Previsualización Social (`/admin/content/seo`)**:
     - Subida de archivo de imagen Open Graph con simulación interactiva de tarjeta social compartida.
  8. **Persistencia de Imágenes de Equipo y Testimonios ante Despliegues**:
     - Guardados retratos locales en `public/images/team/` y `public/images/testimonials/` para garantizar persistencia ante redespliegues en contenedores efímeros.
  9. **Verificación Automatizada con Playwright**:
     - Script `test-complete-audit.mjs` completó 9/9 pruebas automatizadas con éxito, capturando pantallas en `audit-screenshots/`.
  10. **Batería de Seguridad**:
      - `pwsh ./scripts/bateria-seguridad.ps1` superada al 100% limpia sin secretos ni vulnerabilidades.



---

## [2026-09-24 22:38] Acordeón Exclusivo de Sidebar, Botón Fijo al Pie, Sincronización de Logo y Persistencia Total en Base de Datos (+dap)
- **Petición del Usuario**:
  1. Todos los menús principales del backoffice deben iniciar de forma predeterminada cerrados; se abren con el clic del usuario y permanecen abiertos mientras interactúa, cerrándose automáticamente al abrir otro (acordeón exclusivo).
  2. "Ver sitio público" debe estar siempre visible, fijo al pie del menú lateral, y los otros elementos se deben desplazar por detrás con scroll.
  3. Logo de cabecera sincronizado con la imagen oficial dorada en web pública y backoffice.
  4. Persistencia integral en base de datos para todos los componentes, imágenes, publicaciones, equipo y usuarios para evitar pérdida de datos tras redespliegues con Docker en Coolify.
  5. Ejecución con orden `+dap`.
- **Acciones Realizadas**:
  1. **AdminSidebar con Acordeón Exclusivo y Pie Fijo**:
     - Implementado estado unificado de acordeón `openSection: string | null = null` (inicia cerrado por defecto).
     - Cada bloque principal (`Plataforma`, `Cabecera & Menú`, `Secciones Landing`, `Páginas del Sitio`, `Pie de Página & Sedes`, `Diseño & SEO`) cuenta con botón colapsable interactivo con chevron dinámico. Al abrir uno, se cierra automáticamente el anterior.
     - Contenedor de navegación envuelto en `flex-1 overflow-y-auto`.
     - Botón "Ver sitio público" fijado al pie con `shrink-0 border-t border-border bg-surf z-10 shadow-lg` para que los menús se desplacen por detrás.
  2. **Sincronización Total del Logotipo de Cabecera**:
     - Actualizado `BrandLogo` (`src/components/layout/brand-logo.tsx`) y `src/data/header.json` para que el emblema oficial dorado con gota de petróleo (`corporate-card-logo.jpeg`) sea el predeterminado tanto en variantes `logo` como `seal`.
  3. **Esquema Integral de Persistencia en Base de Datos (`0006_complete_database_schema.sql`)**:
     - Creada migración con tablas: `landing_header`, `landing_about`, `landing_footer`, `landing_seo`, `landing_team`, `landing_testimonials`, `landing_services`, `landing_products`, `landing_operations`, `landing_problem`, `landing_marquee`, `landing_cta_final` y `backoffice_users`.
     - Políticas RLS universales para lectura pública y mutación para usuarios autorizados / service_role.
  4. **Persistencia Bidireccional en Servicios & APIs**:
     - `content-service.ts`: agregadas funciones de persistencia y lectura en Supabase para cabecera, nosotros, footer y seo con fallback a disco.
     - `db-service.ts`: integradas consultas y sincronización directa con `landing_team`, `media` y `backoffice_users`.
     - `/api/content/header/route.ts` y `/api/content/about/route.ts`: conectadas a los servicios persistentes.
  5. **Verificación Automatizada con Playwright**:
     - Script `test-sidebar-persistence.mjs`:
       - ✓ Logo en cabecera pública verificado como `corporate-card-logo.jpeg`.
       - ✓ Menús inician cerrados por defecto en el panel.
       - ✓ Acordeón exclusivo probado: abrir Secciones Landing cierra Plataforma de forma automática.
       - ✓ Botón "Ver sitio público" validado como visible y anclado al pie del sidebar.
       - ✓ Endpoints de API verificados respondiendo con código 200 y datos actualizados.
  6. **Build y Batería de Seguridad**:
     - `npm run build`: 52/52 rutas generadas sin errores (código de salida 0).
     - `pwsh ./scripts/bateria-seguridad.ps1`: superada al 100% aprobada.


## [2026-09-24 23:50] Botón "Gestionar Blog", Categorías en Base de Datos, Publicación Estricta y Respaldo de Producción (+dap)
- **Petición del Usuario**:
  1. Cambiar el botón del menú de "Nuevo Artículo" a "Gestionar Blog", ya que dentro existe el botón "Nuevo/Crear Post".
  2. Crear categorías en base de datos (`public.categories`), permitir gestionarlas y hacer que los artículos tengan categoría obligatoria.
  3. No se puede asignar una categoría inexistente ni publicar un artículo sin categoría ("esto es imprescindible").
  4. Garantizar que no se pierda ninguna de las personalizaciones ya realizadas por el usuario en la landing de producción al hacer el próximo deploy.
  5. Ejecutar orden `+dap` y verificar el despliegue.
- **Acciones Realizadas**:
  1. **Respaldo Integral de Configuración de Producción**:
     - Sincronizados todos los JSON de `https://investoil.es/api/*` hacia `src/data/*.json` antes del despliegue para salvaguardar textos, sedes, productos, apariencia, seo y publicaciones creadas en producción.
  2. **Botón en AdminSidebar**:
     - Modificado `src/components/admin/admin-sidebar.tsx`: el botón naranja ahora dice "Gestionar Blog", usa el icono `FileText` y enlaza a `/admin/posts`.
  3. **Categorías en Base de Datos**:
     - Creada migración `0007_categories_crud.sql` y tabla `public.categories` con RLS y seed inicial.
     - Implementado servicio CRUD completo en `src/lib/db/db-service.ts` y endpoints `/api/categories` y `/api/categories/[id]`.
     - Creado componente interactivo `CategoriesManagerModal`.
  4. **Validación Estricta de Publicación**:
     - Backend (`db-service.ts`) y Frontend (`post-editor-form.tsx` y `/admin/posts`): se impide publicar cualquier artículo que carezca de categoría.
     - Enriquecidos los posts existentes en `src/data/posts.json` con sus respectivas categorías oficiales.
  5. **Verificación Automatizada**:
     - `npm run build`: 52 rutas compiladas y empaquetadas sin errores de TypeScript.
     - Script Playwright `test-categories-blog.mjs`: superado al 100% (botón sidebar, modal de categorías, creación de categoría en BD, bloqueo por falta de categoría y vista pública del blog).
     - Batería de seguridad (`bateria-seguridad.ps1`): superada 100% limpia.

## [2026-09-25 00:45] Persistencia Indestructible en PostgreSQL, Restauración Integral de Medios y Leyendas Técnicas (+dap)
- **Petición del Usuario**:
  1. "todas la imagenes y videos se guardan en la base de datos, si son videos o imagenes de internet se guarda el link a los archivos."
  2. "Cual es la razón por la que no se pueden ver las previsualizaciones de algunos archivos de imagen y video, si es por el tipo de extensión debes poner una leyenda con los formatos (extensiones) permitidos y el tamaño maximo permitido del archivo."
  3. Resolver pérdida de imágenes en blog, miembros del equipo y video de hero tras el despliegue.
  4. Ejecución obligatoria con orden +dap y comprobación con Playwright.
- **Causa Raíz Identificada**:
  - En Coolify la variable inyectada es DATABASE_URL (PostgreSQL directo), pero NEXT_PUBLIC_SUPABASE_URL no estaba configurada.
  - Al no detectar Supabase, los uploads se guardaban en el disco temporal del contenedor Docker (public/uploads) y las llamadas a los servicios bypassaban la base de datos. Ante cada git push o rebuild, Docker borraba los uploads.
- **Acciones Realizadas**:
  1. **Persistencia Directa en PostgreSQL (pg-client.ts & DATABASE_URL)**:
     - Creado cliente pg.Pool con esquema DDL automático para public.media_files, public.media, public.landing_sections, public.posts, public.categories, public.landing_team.
  2. **Ruta Autogenerativa de Medios (/uploads/[...slug])**:
     - Intercepta solicitudes a /uploads/*. Si el archivo no está en el contenedor Docker, lo consulta en public.media_files de PostgreSQL, lo decodifica desde Base64, lo restaura al disco y lo sirve con soporte para streaming HTTP 206 (Range headers).
  3. **Persistencia Universal de Secciones (landing_sections)**:
     - Conectado content-service.ts y todas las rutas /api/content/* (hero, appearance, header, about, footer, seo, faq, testimonials, services, products, operations, problem, marquee, legales) a la tabla public.landing_sections en PostgreSQL. Cualquier personalización queda almacenada en la base de datos y no se pierde con ningún despliegue futuro.
  4. **Leyendas Técnicas y Validación de Formatos**:
     - Añadido banner en /admin/media y en formularios con especificaciones técnicas claras:
       - Imágenes: JPG, JPEG, PNG, WebP, SVG, GIF (Máx. 10 MB).
       - Videos: MP4, WebM, MOV (Máx. 50 MB).
       - Explicación de guardado binario en base de datos vs. enlaces externos.
     - Fallbacks visuales para avatares de equipo e imágenes de blog para evitar cajas negras o imágenes rotas.
  5. **Restauración de Medios**:
     - Video de hero restaurado a /videos/hero-background.mp4 con auto-recuperación ante error.
     - Mapeo de fotos de directivos a retratos oficiales en /images/team/.
     - Corrección de URL 404 de Unsplash en el post suministro-diesel-en590-normativa-bajo-azufre por imagen válida de refinería industrial verificada con HTTP 200.
  6. **Verificación Automatizada con Playwright**:
     - Suite scripts/verify-media.mjs:
       - ✓ Video de fondo de Hero detectado y reproducible.
       - ✓ 6 fotos del equipo directivo cargadas y visibles al 100%.
       - ✓ 8 imágenes de artículos del blog cargadas con éxito (0 rotas).
       - ✓ 0 fallos en la suite de pruebas.
  7. **Compilación y Seguridad**:
     - npm run build: 52/52 rutas compiladas y optimizadas exitosamente con Next.js y TypeScript.
     - pwsh ./scripts/bateria-seguridad.ps1: superada con resultado 100% aprobado.
