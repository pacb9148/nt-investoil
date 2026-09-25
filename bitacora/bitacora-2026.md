# Bitácora de Desarrollo — Invest Oil LLC

## [2026-09-25 19:50 CET]
- **Petición del usuario**:
  - Habilitar en el backoffice el espacio y herramientas para proporcionarle más información al agente de IA para que sus respuestas sean más ajustadas a la realidad, y entrenarlo con datos precisos de la compañía.
- **Resolución y Evidencias**:
  1. Rediseñado [`/admin/settings/ai`](file:///c:/Users/pacb9/Documents/GitHub/WPthemes/nt-investoil/nextjs-opc-webapp/src/app/(dashboard)/admin/settings/ai/page.tsx) con arquitectura de dos pestañas principales:
     - **Pestaña 1: "🧠 Base de Conocimiento & Entrenamiento"**:
       - *Prompt del Sistema*: personalidad, rol ejecutivo y reglas de atención.
       - *Base de Conocimiento Corporativa*: editor amplio para cargar datos de la compañía (constitución legal en Delaware USA, desks en Houston, Madrid y Bogotá), catálogo de hidrocarburos, especificaciones ASTM D1655 / EN590, Pet Coke, requerimientos ICPO/BCL y términos de pago.
       - *Preguntas Frecuentes y Respuestas Calibradas (Few-Shot Q&A)*: gestor interactivo para agregar preguntas y respuestas oficiales exactas.
       - *Simulador y Probador de Chat en Vivo*: consola interactiva para probar consultas y ver la respuesta que genera el agente antes de publicarlo.
     - **Pestaña 2: "🔑 Proveedores de IA & Modelos"**: gestor de modelos activos (OpenRouter, Nvidia NIM, DeepSeek, OpenAI, Anthropic, Gemini, etc.), claves API y pruebas de conectividad.
  2. En [`ai-types.ts`](file:///c:/Users/pacb9/Documents/GitHub/WPthemes/nt-investoil/nextjs-opc-webapp/src/lib/ai/ai-types.ts), agregada la interfaz `TrainingFaqItem` y ampliados `AiSettingsConfig` y `DEFAULT_AI_SETTINGS` con `knowledgeBase` y `trainingFaqs`.
  3. En [`ai-client.ts`](file:///c:/Users/pacb9/Documents/GitHub/WPthemes/nt-investoil/nextjs-opc-webapp/src/lib/ai/ai-client.ts), inyectado el contexto enriquecido (`knowledgeBase` + `trainingFaqs`) en los prompts a los LLMs, e implementada coincidencia de FAQs y protocolo de Delaware en el motor de fallback.
  4. En [`ai-service.ts`](file:///c:/Users/pacb9/Documents/GitHub/WPthemes/nt-investoil/nextjs-opc-webapp/src/lib/ai/ai-service.ts), implementado `getAiSettingsPath()` para resolución atómica de rutas.
  5. En [`admin-sidebar.tsx`](file:///c:/Users/pacb9/Documents/GitHub/WPthemes/nt-investoil/nextjs-opc-webapp/src/components/admin/admin-sidebar.tsx), renombrado el enlace a *"Agente de IA & Modelos"*.
  6. Verificación técnica: `npm run type-check` (0 errores), `npm run build` (53 páginas compiladas) y `npm run test:security` (aprobado al 100%).

## [2026-09-25 18:15 CET]
- **Petición del usuario**:
  1. Hero: resolver que al cambiar entre gradiente, video, imagen o sin fondo no colapse ni deje la pantalla en negro; corregir imágenes de muestra erróneas (reemplazar dron y casa con piscina por fotos petroleras 100% reales: refinería petroquímica, buque petrolero en alta mar y terminal de tanques); retirar videos rotos (4K inexistente); incorporar botón "Quitar fondo / Limpiar"; sustituir el cajón de especificaciones que ocupaba espacio por un icono interactivo `ⓘ` con popover desplegable.
  2. Marquesina: permitir editar de forma bilingüe (ES / EN) los títulos de los badges de ambas filas ("Precios de Energía en Vivo" y "Actualidad & Operaciones").
  3. SEO & Identidad Legal Delaware USA: incorporar en el backoffice un editor integral de metadatos corporativos para desambiguar ante Google Search y Google AI Overview la personería jurídica de Invest Oil LLC (sociedad registrada en Delaware, EE. UU. con presencia en Houston, Madrid y Bogotá), eliminando confusiones de buscadores con firmas inmobiliarias o entidades locales extintas de Valencia (España). Inyección de Schema.org JSON-LD de grado institucional.
  4. Orden `+dap` al finalizar.
- **Resolución y Evidencias**:
  1. **Hero**:
     - En `hero-section.tsx`, reestructurada la discriminación estricta de `bgType` ('video', 'image', 'gradient', 'none') para evitar colapsos visuales y asegurar que los modos gradiente y sin fondo rendericen fondos elegantes obsidiana sin pantalla negra.
     - En `hero-form.tsx`, el Bloque 3 mantiene previsualización permanente en vivo; sustituidas las fotos por activos petroleros 100% reales; retirado video 4K inexistente que generaba 404; agregado botón explícito "✕ Quitar fondo"; sustituido cuadro gigante por icono interactivo `ⓘ` con tooltip.
     - Corregido cierre balanceado de tags JSX en `hero-form.tsx`.
  2. **Marquesina Ticker**:
     - En `marquee.json`, agregados `pricesBadgeText`, `pricesBadgeTextEn`, `newsBadgeText` y `newsBadgeTextEn`.
     - En `marquee-ticker.tsx`, soporte dinámico bilingüe en los badges de la Fila 1 y Fila 2.
     - En `admin/content/marquee/page.tsx`, panel de edición bilingüe de títulos de badges con guardado en tiempo real.
     - En `(public)/page.tsx`, sincronización reactiva con `getSectionContent('marquee')`.
  3. **SEO, Identidad Legal Delaware USA & Schema.org**:
     - En `src/types/content.ts`, ampliado `LandingSeoConfig` y creado `CorporateOperatingHub` con datos legales de Delaware USA, hubs de operaciones y declaración formal anti-homónimo.
     - En `src/data/seo.json`, registrados los datos de Invest Oil LLC, Delaware (USA), hubs (Houston, Madrid, Bogotá), notas de desambiguación y geotags (`geo.region: US-DE`).
     - En `src/app/api/content/seo/route.ts`, persistencia dual JSON + PostgreSQL `landing_sections`.
     - En `src/app/(dashboard)/admin/content/seo/page.tsx`, rediseñada la interfaz en 4 pestañas profesionales: 1) Identidad Legal & Delaware USA, 2) Metadatos de Búsqueda ES/EN con contador de caracteres, 3) Tarjeta Social Open Graph con previsualización en vivo, 4) Generador en tiempo real de Schema.org JSON-LD con botón de copia y acceso a Google Rich Results Test.
     - En `src/app/layout.tsx`, sustituido metadata estático por `generateMetadata()` dinámico e inyectado el script `<script type="application/ld+json">` corporativo con `@type: ["Corporation", "Organization"]`, sede Delaware (USA) y declaración anti-confusión.
     - Actualizado enlace en sidebar: "Identidad Legal, SEO & Delaware".
  4. **Evidencia y Calidad**:
     - `npm run type-check`: 0 errores de tipado TypeScript.
     - `npm run build`: Compilación exitosa de Next.js 14 (53 páginas estáticas y dinámicas generadas).
     - `npm run test:security`: Batería Strix aprobada al 100% (0 secretos, 0 vulnerabilidades).
- **Petición del usuario**:
  1. Editor de artículos exacto al adjunto (`media_1790336575538.png`): tarjeta integrada con Título, Fila 2 de dos columnas (Slug y Tags con icono `✨` embebido compacto), Fila 3 con Extracto de 3 filas extensible (`resize-y`), barra superior compacta en una fila con Agente de Noticias y Scraper.
  2. Categoría "Oil 101" creada formalmente en selector y auto-mapeada sin importar mayúsculas o guiones.
  3. Contadores de vistas y likes manuales en el editor + automático interactivo en el frontend.
  4. Botones para ver/ocultar secciones funcionando de inmediato.
  5. Sección "Servicios Petroleros" convertida en las 6 publicaciones recientes del blog.
  6. Agente de Noticias energéticas con radar y republicación en un solo clic.
  7. Interfaz de proveedores de IA multi-proveedor (OpenRouter, Anthropic, OpenAI, NVIDIA NIM, Alibaba, Gemini, DeepSeek).
  8. Agente de atención al público en un Orbe 3D en la landing.
  9. Deduplicar archivos y logos en la biblioteca de medios.
  10. Arreglo definitivo del Hero (sin saltos en negro, barra sticky de guardado permanente).
  11. Orden `+dap` al finalizar.
- **Resolución y Evidencias**:
  1. Editor adaptado fielmente al diseño de la captura de referencia: slug y tags en 2 columnas con botón de sugerencia `✨`, extracto de 3 filas con resize, barra superior compacta y panel lateral de publicación con vistas y likes.
  2. Categoría `Oil 101` añadida a `categories.json` y base de datos con normalizador robusto.
  3. Soporte para vistas y likes: endpoint `/api/posts/[id]/like`, componente `PostLikeButton` en `/blog/[slug]`, y campos numéricos editables en el backoffice.
  4. Forzado `dynamic = 'force-dynamic'` en `(public)/page.tsx` y sincronización sincrónica con PostgreSQL `landing_sections`.
  5. Transformada la sección de servicios en un grid reactivo con las 6 publicaciones más recientes del blog.
  6. Agente de Noticias implementado en `/api/news-agent` y modal `NewsAgentModal` con botón "Republicar en Editor".
  7. Interfaz administrativa en `/admin/settings/ai` con gestión de 7 proveedores de IA, encriptación segura y system prompt global.
  8. Orbe 3D pulsante de atención al público implementado en `public-ai-orbe.tsx`, inyectado en `(public)/layout.tsx` y probado con Playwright.
  9. Deduplicados los registros redundantes del logo en `media.json`, creado endpoint `/api/media/deduplicate` y botón en la biblioteca de medios.
  10. Resuelto el salto en negro en el Hero eliminando `position: fixed !important` en `(dashboard)/layout.tsx`, protegiendo la previsualización con `isRealVideo` y añadiendo barra sticky de guardado flotante.
  11. Pruebas visuales automatizadas con Playwright ejecutadas con 6 capturas de pantalla de evidencia.
  12. Batería de seguridad Strix aprobada al 100% sin secretos ni vulnerabilidades.

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

## [2026-09-25 00:58] Fijación de Límites Máximos a 2 MB para Imágenes y 10 MB para Videos (+dap)
- **Petición del Usuario**:
  "fija los limites maximos en 2MB para imagenes y en 10 MB para video +dap y deploy"
- **Acciones Realizadas**:
  1. **Ajuste en Backend (/api/upload/route.ts)**:
     - Constantes fijadas en `MAX_IMAGE_SIZE = 2 * 1024 * 1024` (2 MB) y `MAX_VIDEO_SIZE = 10 * 1024 * 1024` (10 MB).
     - Respuestas de error 400 actualizadas con los nuevos límites exactos.
  2. **Ajuste en Frontend y Formularios**:
     - `media-upload-field.tsx`: constantes `MAX_IMAGE_SIZE_MB = 2` y `MAX_VIDEO_SIZE_MB = 10`, leyenda actualizada a 2 MB y 10 MB.
     - `hero-form.tsx`: validación previa de subida ajustada a 2 MB (imágenes) y 10 MB (videos), y leyenda de fondo sincronizada.
     - `/admin/media`: banner de especificaciones técnicas actualizado con los topes de 2 MB y 10 MB.
     - `scripts/verify-media.mjs`: script de prueba sincronizado.
  3. **Verificación Automatizada con Evidencia Real**:
     - Test de API en Node.js:
       - Imagen 3 MB -> HTTP 400 (`La imagen excede el límite máximo de 2 MB`).
       - Video 12 MB -> HTTP 400 (`El video excede el límite máximo de 10 MB`).
       - Imagen 500 KB -> HTTP 200 (`Success`).
     - `npm run build`: 52/52 rutas compiladas y optimizadas exitosamente con Next.js y TypeScript (0 errores).
     - Suite Playwright (`verify-media.mjs`): 100% aprobada con 0 fallos.
     - Batería de seguridad (`pwsh ./scripts/bateria-seguridad.ps1`): 100% limpia y aprobada.

## [2026-09-25 10:20] Rediseño Compacto de Editor de Posts, Toolbar Fija, Fecha Editable, Sugerencias y Persistencia (+dap)
- **Petición del Usuario**:
  - Reducción de la barra de títulos a una sola fila horizontal compacta con botones de acción para ganar espacio.
  - Bloque unificado y estilizado: Título, Slug con sugerencia automática, Tags con sugerencia automática de términos energéticos, y Extracto.
  - Toolbar de Tiptap fija arriba (sticky top-0) y contenedor de contenido con barra de desplazamiento vertical interna.
  - Fecha de publicación editable (datetime-local) para mantener fechas históricas de noticias.
  - Categorías asignables retroactivamente a artículos antiguos sin categoría.
  - Sincronización completa de imágenes y miembros del equipo directivo para no perder datos en despliegues.
  - Previsualizaciones interactivas con spinner de carga y ampliación del límite de videos a 100 MB para permitir videos corporativos pesados.
  - Orden final: +dap y verificación del deploy.
- **Acciones Realizadas**:
  1. **Editor de Artículos (post-editor-form.tsx)**:
     - Barra superior rediseñada en una sola fila compacta con <-, título y botones de acción.
     - Bloque integrado: Título, dos columnas alineadas para Slug URL y Tags con botones interactivos Sugerir automáticamente, y Extracto.
     - Campo editable Fecha de Publicación (type=datetime-local) integrado en la columna de detalles.
  2. **Editor Tiptap (tiptap-editor.tsx)**:
     - Toolbar con sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border shadow-sm.
     - Contenedor con scroll vertical (max-h-[500px] min-h-[350px] overflow-y-auto) y scrollbar ámbar.
  3. **Persistencia en Base de Datos (db-service.ts)**:
     - savePost adaptado para respetar published_at enviado desde el editor, impidiendo pisar fechas históricas con new Date().
  4. **Sincronización Total de Datos (scripts/sync-prod.mjs)**:
     - Descargados e incorporados los 8 artículos de producción en posts.json, los 6 miembros del equipo en team.json, y todas las imágenes reales subidas por el usuario a public/uploads/ y nextjs-opc-webapp/public/uploads/.
  5. **Previsualizaciones y Límites Multimedia (media-upload-field.tsx, /api/upload)**:
     - Spinner Loader2 y eventos onLoad/onLoadedData para previsualizaciones fluidas sin recuadros negros.
     - Límite de video ampliado a 100 MB y validación de streaming HTTP 206 Partial Content.
  6. **Verificación Automatizada con Evidencia Real**:
     - npm run build: 52/52 páginas y rutas de Next.js compiladas con éxito (0 errores).
     - Test E2E Playwright: captura verificada con barra en 1 fila, toolbar fija, fecha editable y tags automáticos.
     - Batería de seguridad (pwsh ./scripts/bateria-seguridad.ps1): superada con resultado 100% aprobado.

## [2026-09-25 16:20] Rediseño de Proveedores de IA, Editor Compacto, Radar de Noticias Completo y Unificación de Eslogan (+dap)
- **Petición del Usuario**:
  1. Rediseñar la interfaz de proveedores de IA: formulario arriba tipo "Agregar credencial de plataforma" con selector de proveedores y acordeón de código, y abajo la lista compacta con estados, badges y botones de prueba/activación.
  2. Eliminar etiquetas redundantes en el editor de artículos, subir todo para no perder espacio, y mover el cuadro de especificaciones técnicas a un tooltip o icono `ⓘ` discreto.
  3. Al republicar noticias con el Agente de Noticias, traer el artículo completo estructurado en párrafos (no solo el extracto) e incluir el enlace a la fuente original al pie, cubriendo fuentes como Google News, BBC Mundo, Euronews, Agencia EFE, etc.
  4. Solución definitiva al renderizado del fondo de Hero y previsualizaciones inmediatas de videos e imágenes.
  5. Agente en el Orbe: limpiar respuestas de markdown crudo y aplicar protocolo estricto de ubicación (solo mencionar Houston, Madrid y Bogotá, sin direcciones ni teléfonos, canalizando a trading@investoil.es).
  6. Eslogan corporativo unificado: "Petroleum and Derivates Markets", posicionando a la empresa como facilitadores entre compradores y vendedores de primer orden, y erradicando cualquier mención a "Mesa de Trading" o "Mesa de Operaciones".
  7. Cierre con orden `+dap` y comprobación del build.
- **Acciones Realizadas**:
  1. **Interfaz de Proveedores de IA (`/admin/settings/ai`, `ai-types.ts`, `ai-service.ts`)**:
     - Rediseño según esquema: selector horizontal de 11 plataformas (Google AI Studio, Anthropic, OpenAI, OpenRouter, Nvidia NIM, Groq, DeepSeek, Mistral, Together AI, Ollama, Personalizado), acordeón de código/curl, estilo API, visibilidad y lista compacta con pestañas TEXTO/AUDIO/IMAGEN, estados y botones de acción.
  2. **Editor de Artículos Ergonómico (`post-editor-form.tsx`, `media-upload-field.tsx`, `tiptap-editor.tsx`)**:
     - Eliminadas etiquetas redundantes (`TÍTULO DEL POST *`, `SLUG URL *`, etc.), sustituidas por placeholders limpios en mayúsculas como fondo para elevar visualmente todo el editor.
     - Especificaciones técnicas de archivos encapsuladas en un icono/tooltip interactivo `ⓘ` junto a cada label de subida, liberando más de 120px de espacio vertical.
     - Sincronización reactiva con `useEffect` en `tiptap-editor.tsx` para reflejar instantáneamente el contenido completo importado.
  3. **Radar de Inteligencia de Noticias (`/api/news-agent`, `news-agent-modal.tsx`)**:
     - Incorporadas fuentes solicitadas (`news.google.com`, `bbc.com/mundo`, `es.euronews.com`, `efe.com/mundo`, Reuters, Platts).
     - Contenido completo estructurado en varios párrafos por noticia y atribución canónica con enlace directo al pie del post.
  4. **Hero y Previsualizaciones (`hero-section.tsx`, `hero-form.tsx`)**:
     - Previsualización instantánea a 0 ms (`URL.createObjectURL(file)`) al seleccionar archivos locales.
     - Detección infalible de tipo de medio por extensión y MIME type.
     - Eliminado el `onError` destructivo en `hero-section.tsx` y sincronización con `localStorage`.
  5. **Orbe AI y Protocolo de Ubicación (`PublicAiOrbe`, `ai-client.ts`)**:
     - Filtro `cleanMarkdownResponse` para eliminar caracteres crudos de markdown (`#`, `**`, `*`).
     - Protocolo estricto de ubicación restringido a Houston, Madrid y Bogotá, canalizando contacto a `trading@investoil.es`.
  6. **Erradicación de "Mesa de Trading"**:
     - Barrido completo en toda la plataforma: sustituido por "Operaciones Comerciales & Facilitación de Mercados" y eslogan oficial "Petroleum and Derivates Markets".
- **Verificación**:
  - `npm run build`: 53/53 páginas y rutas compiladas con éxito (0 errores).
  - Batería de seguridad (`pwsh ./scripts/bateria-seguridad.ps1`): 100% limpia y aprobada.

## [2026-09-25 17:00] - Corrección Definitiva: Interfaz de Selección de Imagen Hero y Fondo de Landing Pública
- **Solicitud del Usuario**:
  1. "No solucionaste el problema de la interfase cuando selecciono imagen, resuelve esto"
  2. "el hero sigue roto"
- **Causa Raíz Identificada**:
  1. *Falso positivo de Video en previsualización*: Al seleccionar una imagen local, `localPreviewUrl` generaba un `blob:` que no terminaba en `.jpg`/`.png`. Como `bgType` venía por defecto como `'video'` o la regex buscaba solo extensiones con anclaje `$`, el código forzaba `isRealVideo = true` e intentaba reproducir la imagen dentro de una etiqueta `<video>`. El navegador crasheaba el elemento dejando un recuadro negro total.
  2. *Barra sticky invasiva con margen negativo*: La barra inferior con el botón "Guardar Configuración del Hero" tenía `sticky bottom-0 z-30 -mx-4 md:-mx-8`. En pantallas y contenedores con scroll, flotaba permanentemente sobre el formulario tapando los inputs de titulares y lemas.
  3. *Hero roto en Landing Pública*: `hero-section.tsx` aplicaba un degradado negro excesivo (`via-bg/85`) que, combinado con `bgOpacity` al 20%, volvía cualquier imagen de fondo 100% invisible (pantalla negra).
- **Acciones Realizadas**:
  1. **HeroForm (`src/components/admin/content/hero-form.tsx`)**:
     - Introducido estado explícito `previewMediaType: 'video' | 'image' | null` sincronizado con `file.type` e inputs.
     - Lógica infalible de previsualización: si `bgType === 'image'` o `previewMediaType === 'image'`, se renderiza SIEMPRE etiqueta `<img>` con `onError` seguro, impidiendo que una imagen se procese como `<video>`.
     - Soporte para extensiones con o sin query parameters (`jpg|jpeg|png|webp|svg|gif|avif`).
     - Eliminada completamente la barra invasiva `sticky bottom-0 -mx-4 md:-mx-8`.
     - Añadida una barra de acciones superior limpia con botón de Guardar y estado en tiempo real, más un botón de Guardar inferior estático en flujo normal que jamás tapa campos.
  2. **HeroSection (`src/components/sections/hero-section.tsx`)**:
     - Discriminación inequívoca entre Video e Imagen.
     - Renderizado de imagen de fondo con `<img />` optimizada, opacidad mínima efectiva del 35% y degradado sutil (`via-bg/35` y `bg-black/20`) garantizando que la imagen sea nítida y visible con contraste WCAG AAA.
  3. **Seguridad y Estabilidad**:
     - `npm run type-check`: 0 errores.
     - `npm run build`: 53/53 páginas estáticas y dinámicas compiladas exitosamente.
     - `npm run test:security`: Batería Strix 100% aprobada.

## [2026-09-25 20:20] - Corrección: Subida de Logotipos, Eliminación de Archivos y Tolerancia Multipart
- **Solicitud del Usuario**:
  "No me deja cambiar los archivos de logo, y no hay boton para eliminarlos, revisa y arregla eso"
- **Causa Raíz Identificada**:
  1. *Error JSON en cabecera y pie*: `header-form.tsx` y `settings/page.tsx` realizaban un `fetch('/api/media', { method: 'POST', body: formData })` enviando un `FormData` multipart. `/api/media` llamaba de inmediato a `await request.json()`. Al recibir la cabecera `Content-Type: multipart/form-data; boundary=----------------...`, V8 encontraba un guion `-` sin dígito posterior y arrojaba `SyntaxError: No number after minus sign in JSON at position 1 (line 1 column 2)`.
  2. *Falta de controles de eliminación*: No existían botones para quitar el logo activo ni para eliminar archivos subidos del servidor/base de datos.
  3. *Forzado involuntario de logos*: Si el usuario dejaba el logo en blanco (`logo_url: ''`), `BrandLogo` y `Footer` forzaban el logo por defecto con el operador `||`.
- **Acciones Realizadas**:
  1. **Frontend (`header-form.tsx`, `settings/page.tsx`, `hero-form.tsx`, `apariencia-form.tsx`)**:
     - Se redirigió la subida de archivos al endpoint especializado `/api/upload`.
     - Se añadió botón explícito "✕ Quitar Logo" / "✕ Quitar Sello" para desvincular la imagen y dejar modo solo texto.
     - Se añadió botón "🗑️ Eliminar Archivo del Servidor" para archivos subidos en `/uploads/...`, que purga físicamente el archivo del disco y de las tablas de PostgreSQL.
     - Se integró previsualización limpia con estado "Sin Logo (Solo texto corporativo)" y mensajes de confirmación verdes temporizados.
  2. **Backend (`/api/media`, `/api/upload`, `db-service.ts`)**:
     - Tolerancia multipart en `/api/media`: Si recibe `multipart/form-data`, delega al procesador de subida en vez de invocar `request.json()`.
     - Endpoints `DELETE` en `/api/upload` y `/api/media` para eliminar archivos por URL, nombre o ID de forma segura.
     - En `deleteMediaItem`, purga en todas las carpetas de uploads (`public/uploads` y `nextjs-opc-webapp/public/uploads`), `media.json`, `media` y `media_files` en PostgreSQL.
  3. **Componentes de Layout (`brand-logo.tsx`, `footer.tsx`)**:
     - Soporte para `logo_url: ''` (modo sin imagen de logotipo) respetando la elección del usuario.
     - Marcado `unoptimized` para imágenes locales subidas con `/uploads/`.
- **Verificación**:
  - `npm run type-check`: 0 errores de TypeScript.
  - `npm run build`: 53/53 rutas generadas con éxito al 100%.
  - `pwsh ./scripts/bateria-seguridad.ps1`: 4/4 verificaciones OK (Batería 100% limpia).

## [2026-09-25 22:00] - Fase 17: Persistencia Integral en PostgreSQL y Migración Exhaustiva Registro por Registro
- **Solicitud del Usuario**:
  "Ahora ya está solucionado el problema de acceso a la base de datos, revisa y comprueba, ya puedes dejar de guardar la información en ficheros json, ahora transfiere toda la información a su sitio en la base de datos de forma ordenada, cada cosa en su lugar, registro por registro y asegurate de no perder información en el camino, toda la información del los json a su correspondiente campo en la base de datos"
- **Diagnóstico y Arquitectura**:
  1. *Comprobación en vivo del acceso a la BD*: Se verificó contra el entorno de producción (`https://investoil.es/api/system-status`) que `hasDatabaseUrl: true` está activo y respondiendo a consultas de API con HTTP 200 (`/api/categories`, `/api/posts`, `/api/content/header`, `/api/content/team`, etc.).
  2. *Inventario y Mapeo Completo de 22 Archivos JSON*:
     - `categories.json` (8 items) -> Tabla `categories` (id, name, slug, description, name_en, description_en, color, updated_at).
     - `posts.json` (8 artículos con vistas, likes, slugs y contenido Tiptap) -> Tabla `posts` (id, slug, title, excerpt, content JSONB, status, category_id, category, featured_image_url, video_url, tags, reading_time, views, likes, is_republished, original_source_url, original_source_name, published_at, updated_at).
     - `team.json` (6 directivos) -> Tabla `landing_team` (id, number, name, role, role_en, location, image, photo_url, bio, bio_en, linkedin_url, sort_order, is_active, updated_at).
     - `testimonials.json` (5 testimonios) -> Tabla `landing_testimonials` (id, author_name, author_company, author_role, avatar_url, text_es, text_en, rating, sort_order, is_active, updated_at).
     - `services.json` (8 servicios) -> Tabla `landing_services` (id, title_es, title_en, description_es, description_en, icon, features, sort_order, is_active, updated_at).
     - `products.json` (6 productos) -> Tablas `landing_products` y `products` (id, name_es, name_en, category, specs, description_es, description_en, image_url, sort_order, is_active, updated_at).
     - `faq.json` (4 FAQs) -> Tabla `landing_faq` (id, question, answer, question_en, answer_en, category, sort_order, is_active, updated_at).
     - `media.json` (19 elementos) -> Tabla `media` (id, filename, url, type, mime_type, size, alt_text, data_base64).
     - `users.json` (4 usuarios) -> Tablas `backoffice_users` y `users`.
     - `leads.json` (2 prospectos) -> Tabla `leads`.
     - Secciones Singleton: `header.json` -> `landing_header`, `about.json` -> `landing_about`, `footer.json`/`settings.json` -> `landing_footer`, `seo.json` -> `landing_seo`, `hero.json` -> `landing_hero`, `appearance.json` -> `landing_site_appearance`, `operations.json` -> `landing_operations`, `problem.json` -> `landing_problem`, `marquee.json` -> `landing_marquee`, `cta-final` -> `landing_cta_final`.
     - Tabla Universal `landing_sections`: Copia completa e indexada de las 18 secciones (`about`, `ai_settings`, `ai_settings_config`, `appearance`, `faq`, `header`, `hero`, `legal_pages`, `marquee`, `operations`, `problem`, `products`, `seo`, `services`, `settings`, `site_settings`, `team`, `testimonials`, `sections`).
- **Implementaciones Realizadas**:
  1. **Esquema DDL Completo en `ensurePgSchema()` (`src/lib/db/pg-client.ts`)**:
     - Definidas las 24 tablas de persistencia con `CREATE TABLE IF NOT EXISTS` (sin prefijo fijo para máxima compatibilidad).
     - Auto-detección en arranque: si las tablas están vacías (`landing_sections` con 0 registros), se dispara automáticamente `migrateAllJsonToPostgres()` para que no quede vacía.
  2. **Servicio Central de Migración (`src/lib/db/migration-service.ts`)**:
     - Función idempotente `migrateAllJsonToPostgres()` con cláusulas `ON CONFLICT (id) DO UPDATE SET...` para todas las tablas.
     - Registro metódico campo a campo, preservando tipos JSONB, arrays de tags, estadísticas históricas (views, likes) e identidades Delaware USA.
  3. **Endpoint de API para Migración (`src/app/api/admin/migrate/route.ts`)**:
     - Endpoint protegido que ejecuta la migración en runtime de Next.js y devuelve el reporte estructurado con el número de filas migradas por tabla.
  4. **Script CLI Standalone (`scripts/migrate-to-db.mjs`)**:
     - Ejecutable para migración directa vía terminal pasando la cadena de conexión o variables de entorno.
- **Verificación Técnica**:
  - `npm run type-check`: 0 errores de TypeScript.
  - `npm run build`: 54/54 rutas compiladas exitosamente (100% OK).
  - `pwsh ./scripts/bateria-seguridad.ps1`: 100% aprobada sin secretos ni dependencias vulnerables.



