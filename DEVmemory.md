# Memoria de Desarrollo: Invest Oil LLC — Webapp Next.js 14 + Supabase

## 1. Contexto del Proyecto
Desarrollo de la aplicación web completa para **Invest Oil LLC**, replicando la dirección de arte oscura obsidiana/ámbar y arquitectura de componentes del proyecto local `C:\Users\pacb9\Documents\GitHub\opc` (landing y backoffice) sin alterar ningún archivo de esa carpeta de referencia.

- **Stack**: Next.js 14+ (App Router), TypeScript 5+, Tailwind CSS, Framer Motion, Lucide React, Supabase (@supabase/ssr), Tiptap Editor v2.
- **Repositorio**: `https://github.com/pacb9148/nt-investoil` (rama `main`).

---

## 2. Hitos y Funcionalidades Desarrolladas

### Fase 21: Blindaje Inviolable de Base de Datos PostgreSQL, Editor WYSIWYG de Legales con Tiptap, Biblioteca de Medios en Nosotros y Transparencia Hero
1. **Blindaje de la Base de Datos contra Sobreescrituras tras Deploy**:
   - Se erradicó la llamada automática destructiva `migrateAllJsonToPostgres()` en `src/lib/db/pg-client.ts`, impidiendo que los arranques en frío o despliegues serverless reseteen la BD con los JSON estáticos de git.
   - En `src/lib/db/migration-service.ts`, todas las 22 tablas (`posts`, `categories`, `landing_team`, `landing_services`, `landing_products`, `products`, `landing_testimonials`, `media`, `landing_about`, `landing_footer`, `landing_header`, `landing_hero`, `landing_seo`, etc.) verifican previamente `SELECT COUNT(*)`. Si la tabla ya contiene filas, no ejecuta nada (`DO NOTHING`), convirtiendo a PostgreSQL en la fuente única y permanente de la verdad.
   - `getPosts`, `savePost`, `deletePost`, `getCategories` y `getTeamMembers` en `src/lib/db/db-service.ts` operan exclusivamente sobre PostgreSQL, impidiendo que artículos o directivos eliminados reaparezcan.
   - En `src/lib/services/content-service.ts`, `getLandingHero`, `getLandingAppearance`, `getLandingAbout`, `getLandingFooter`, `getLandingHeader` y `getLandingSeo` leen y escriben directamente en PostgreSQL (`landing_sections` y tablas singleton), garantizando que las modificaciones del usuario nunca sean sobreescritas.
2. **Biblioteca de Medios en Nosotros (`/admin/content/nosotros`)**:
   - `NosotrosPage` ahora es asíncrono y obtiene los datos vivos de PostgreSQL con `await getLandingAbout()`.
   - Integración completa de `MediaPickerModal` en `AboutForm` (`src/components/admin/content/about-form.tsx`), permitiendo seleccionar imágenes o videos directamente de la biblioteca corporativa con un clic, con soporte para preview interactivo (`<video>` o `<img>`).
3. **Opacidad de Tarjeta Hero & Resolución de Conflicto con Apariencia**:
   - En `src/components/sections/hero-section.tsx`, se corrigió la lógica de renderizado: cuando la opacidad de la tarjeta es baja (`cardOpacity <= 15`), se desactiva `backdrop-blur-xl` a `backdrop-blur-none` y el fondo se vuelve 100% transparente (`transparent`), logrando el efecto de cristal / transparencia real sobre el video del hero.
   - En `src/components/admin/content/apariencia-form.tsx`, se eliminó el Bloque 5 que sobrescribía los ajustes del Hero al guardar la apariencia del sitio. Se reemplazó por un banner informativo dedicado que enlaza directamente a `/admin/content/hero`.
4. **Erradicación de Foto Residual de Rufino**:
   - Se verificó y depuró `team.json` y la constante `TEAM_MEMBERS` en `src/lib/constants/investoil.ts`, asegurando que Rufino Antonio Villalobos tenga imagen vacía `""` y muestre el avatar corporativo neutral por defecto, sin rastros de logos antiguos.
5. **Nuevo Editor de Páginas Legales tipo Artículo (Tiptap / Rich Text)**:
   - Descarte de la edición rígida por bloques en `/admin/content/legales`.
   - Se implementó un editor visual enriquecido con `TiptapEditor` (`src/app/(dashboard)/admin/content/legales/page.tsx`), con pestañas para los 5 documentos normativos (*Aviso de Privacidad, Términos y Condiciones, Política de Cookies, Alerta de Fraude y Estafas, Declaración de Accesibilidad*).
   - Soporte bilingüe completo (ES / EN) tanto para metadatos (insignia, título, fecha de revisión, introducción) como para el cuerpo del documento.
   - `src/lib/services/server-legal-service.ts` actualizado a asíncrono para leer directamente de PostgreSQL (`getSectionContent('legal-pages')`) y `LegalPageView` (`src/components/legal/legal-page-view.tsx`) actualizado para renderizar `content_html` con formato tipográfico editorial (`prose prose-invert prose-amber`).
6. **Canalización de Correos a `info@investoil.es` & Metatags Avanzados de SEO**:
   - Se forzó en todo el sistema (`src/app/layout.tsx`, `src/lib/services/content-service.ts`, `src/app/(dashboard)/admin/content/seo/page.tsx`) la sustitución automática de `contacto@investoil.es` y `trading@investoil.es` por `info@investoil.es` (para consultas generales) y `business@investoil.es` (para operaciones comerciales).
   - Schema.org JSON-LD corporativo inyecta de forma garantizada `email: info@investoil.es`.
   - En el editor de SEO se agregaron nuevos campos de metatags: Directiva `robots` (`index, follow` / `noindex`), Token de Verificación de Google Search Console y bloque de scripts personalizados para `<head>` (Analytics, GTM, Pixel).
7. **Verificaciones**:
   - `npm run type-check`: 0 errores de compilación TypeScript.
   - `npm run build`: 53/53 páginas estáticas y dinámicas compiladas al 100%.
   - `pwsh .\scripts\bateria-seguridad.ps1`: Batería de seguridad aprobada con 0 vulnerabilidades.


1. **Persistencia y Eliminación Definitiva en Consejo Directivo (`team`)**:
   - `saveTeamMembers` en `src/lib/db/db-service.ts` implementa `DELETE FROM landing_team WHERE id NOT IN (...)` para PostgreSQL y Supabase, purgando definitivamente de la base de datos a los directivos que el usuario ha borrado.
   - Preservación del orden visual mediante `sort_order = index`.
   - Eliminación de la sobreescritura de `localStorage` en `TeamEditorPage` (`src/app/(dashboard)/admin/content/team/page.tsx`) y `TeamSection` (`src/components/sections/team-section.tsx`), impidiendo que el navegador re-inyecte miembros eliminados.
   - En `src/app/(public)/page.tsx`, `HomePage` obtiene los miembros directamente en el servidor con `getTeamMembers()` y los inyecta como `initialMembers` a `<TeamSection>`, eliminando parpadeos y desincronizaciones cliente/servidor.
2. **Selector de Medios Reutilizable desde Biblioteca (`MediaPickerModal`)**:
   - Creación del componente `src/components/admin/media-picker-modal.tsx` con búsqueda instantánea, pestañas de filtro (*Todos, Logos & Identidad, Solo Imágenes, Solo Videos*), subida ágil directa y confirmación por selección/doble clic.
   - Integración del botón "Elegir de Biblioteca..." (`FolderOpen`) en `MediaUploadField` (Blog, Productos, Testimonios, Equipo) y en los formularios de `HeaderForm`, `HeroForm` (video de fondo, imagen de respaldo y tarjeta de sello) y `SettingsFooterForm`.
3. **Erradicación de Resurrección de Archivos tras Deploy**:
   - `getMediaList` en `db-service.ts` se desacopló por completo de `media.json`, retornando estrictamente los registros de PostgreSQL (`media` y `media_files`) sin mezclar archivos eliminados.
   - `deleteMediaItem` ahora borra exhaustivamente por ID, filename y URL en ambas tablas de la base de datos y sincroniza en disco.
   - En `src/lib/db/migration-service.ts`, tanto `landing_team` como `media` verifican previamente si la tabla ya tiene filas (`COUNT > 0`). Si ya existen registros, la migración no sobreescribe ni reinyecta archivos o directivos borrados.
   - Saneamiento de `src/data/media.json` para eliminar registros de prueba y assets obsoletos.
4. **Validaciones**:
   - `npm run type-check`: 0 errores de tipado.
   - `npm run build`: 53/53 rutas generadas con éxito (100% OK).
   - `pwsh ./scripts/bateria-seguridad.ps1`: 100% Aprobada (batería limpia sin secretos ni vulnerabilidades).

### Fase 18: Prompt de Entrenamiento Integral del Agente de IA, Detección de Idioma y Escalamiento Humano
1. **Prompt de Sistema Maestro & Base de Conocimiento Explícita**:
   - Integración completa de todos los activos de información del sitio: Razón social oficial (`Invest Oil LLC`), constitución Delaware LLC, sedes en Houston, Madrid y Bogotá, desambiguación legal contra homónimos inmobiliarios de Valencia.
   - Detalle de las 6 autoridades directivas: Rufino Antonio Villalobos (CEO), Dr. Marcus Vance (COO), Elena Rostova (CFO), Carlos Mendoza (VP Maritime), Sarah Jenkins (CCO KYC/AML) y Ahmad Al-Mansoor (Senior Advisor).
   - Catálogo técnico de commodities: EN590 10ppm, Jet A-1 ASTM D1655, Merey 16, Brent, Pet Coke, VLSFO IMO 2020 y GNL.
   - Procedimiento de onboarding y relacionamiento comercial paso a paso: ICPO -> KYC/AML Compliance -> BCL/POF -> FCO/SPA -> Inspección independiente SGS/Saybolt -> Entrega y liquidación.
2. **Directrices Operativas del Agente**:
   - Detección automática del idioma del usuario (ES/EN/PT/FR) con respuesta en el mismo idioma.
   - Estilo conciso y al grano (1-2 párrafos ejecutivos). Extensión y desglose técnico únicamente bajo demanda explícita.
   - Protocolo estricto de escalamiento a humanos ante negociaciones, fijación de precios, comisiones intermedias o acuerdos contractuales, derivando a `trading@investoil.es` o al formulario web.
3. **Calibración Dual (LLM Externo + Motor Local)**:
   - Sincronización en `src/data/ai-settings.json`, en PostgreSQL (`landing_sections`), y en el motor heurístico local de `src/lib/ai/ai-client.ts` para garantizar coherencia incluso ante contingencias de red.
4. **Validaciones**:
   - `npm run type-check`: 0 errores.
   - `npm run build`: 54/54 rutas compiladas exitosamente.
   - `pwsh ./scripts/bateria-seguridad.ps1`: 100% aprobada.

### Fase 17: Persistencia Integral en PostgreSQL y Migración Exhaustiva Registro por Registro
1. **Comprobación y Verificación de Conexión en Base de Datos**:
   - Se verificó contra el entorno en vivo (`https://investoil.es/api/system-status`) que `hasDatabaseUrl: true` está activo y respondiendo a consultas de API con HTTP 200 (`/api/categories`, `/api/posts`, `/api/content/header`, `/api/content/team`, etc.).
2. **Esquema DDL Completo en PostgreSQL (`ensurePgSchema`)**:
   - Ampliación en `src/lib/db/pg-client.ts` para crear automáticamente todas las tablas relacionales y de contenido (`categories`, `posts`, `landing_team`, `landing_testimonials`, `landing_services`, `landing_products`, `products`, `landing_operations`, `landing_problem`, `landing_marquee`, `landing_cta_final`, `landing_faq`, `landing_header`, `landing_about`, `landing_footer`, `landing_seo`, `landing_hero`, `landing_site_appearance`, `backoffice_users`, `users`, `leads`, `media`, `media_files`, `landing_sections`).
   - Auto-migración en arranque: si se detecta que `landing_sections` tiene 0 registros, la aplicación ejecuta de fondo `migrateAllJsonToPostgres()`.
3. **Servicio Central de Migración (`src/lib/db/migration-service.ts`)**:
   - Mapeo exacto registro por registro, campo a campo, de los 22 archivos JSON sin pérdida de información (respetando arrays de tags, estructuras JSONB de Tiptap, contadores históricos de vistas y likes, y personería Delaware USA).
   - Cláusulas idempotentes `ON CONFLICT (id) DO UPDATE SET...` que preservan la integridad de datos ante múltiples ejecuciones.
4. **Endpoint Administrativo y Script CLI**:
   - Creación de endpoint `/api/admin/migrate` para ejecutar la migración en runtime de Next.js y obtener el reporte estructurado con el número de filas migradas por tabla.
   - Script CLI `scripts/migrate-to-db.mjs` para ejecuciones manuales por terminal.
5. **Validación Técnica**:
   - `npm run type-check`: 0 errores de TypeScript.
   - `npm run build`: 54/54 rutas compiladas exitosamente (100% OK).
   - `pwsh ./scripts/bateria-seguridad.ps1`: 100% aprobada sin secretos ni dependencias vulnerables.

### Fase 14: Corrección de Subida de Logotipos, Eliminación de Archivos y Tolerancia a Fallos Multipart
1. **Resolución de Error JSON Parse al Subir Logotipo**:
   - Diagnóstico raíz: El componente de cabecera (`header-form.tsx`) y el editor de pie de página (`settings/page.tsx`) enviaban `FormData` (multipart) a `/api/media`. Al recibir multipart con encabezado de delimitador de boundary (`----------------...`), `/api/media` ejecutaba `request.json()`, haciendo que V8 arrojara el error: `SyntaxError: No number after minus sign in JSON at position 1 (line 1 column 2)`.
   - Corrección en frontend: Apuntado correcto de ambos formularios a `/api/upload`, que está especialmente diseñado para recibir y procesar archivos multipart, guardarlos en el disco y persistirlos en base de datos.
   - Corrección en backend (`/api/media`): Tolerancia completa ante peticiones `multipart/form-data`. Si `/api/media` recibe un `FormData`, delega de inmediato al procesador de subida en lugar de llamar a `request.json()`, impidiendo que este fallo vuelva a ocurrir jamás.
2. **Gestor Completo de Eliminación de Logotipos y Archivos**:
   - Botón explícito **"✕ Quitar Logo"** en los editores de Cabecera (`/admin/content/header`), Footer (`/admin/content/settings`), Hero (`/admin/content/hero`) y Apariencia (`/admin/content/apariencia`), permitiendo desvincular el logo y activar el modo solo texto.
   - Botón **"🗑️ Eliminar Archivo del Servidor"**: Si el logo activo es un archivo subido por el usuario (`/uploads/...`), se habilita un botón para borrarlo físicamente del disco y de las tablas `media` y `media_files` de PostgreSQL.
   - Endpoint de eliminación `DELETE` integrado en `/api/upload` y `/api/media`, con soporte para identificar y purgar archivos por URL, nombre de archivo o ID (`decodeURIComponent`).
   - Normalización en `BrandLogo` y `Footer` para soportar `logo_url: ''` (modo sin imagen) sin forzar indebidamente el logo por defecto sobre la decisión del usuario.
3. **Validación Técnica**:
   - `npm run type-check`: 0 errores.
   - `npm run build`: 53 rutas generadas con éxito (100% OK).
   - `pwsh ./scripts/bateria-seguridad.ps1`: 100% aprobada sin vulnerabilidades.

### Fase 13: Módulo de Entrenamiento del Agente de IA, Base de Conocimiento y Calibración Q&A
1. **Entrenamiento y Base de Conocimiento en `/admin/settings/ai`**:
   - Pestaña dedicada "🧠 Base de Conocimiento & Entrenamiento" estructurada en 4 bloques:
     - **Prompt del Sistema**: personalización de personalidad, protocolo de atención y rol ejecutivo.
     - **Base de Conocimiento Corporativa (Knowledge Base)**: editor extenso para suministrar datos de la empresa (constitución Delaware USA, hubs en Houston, Madrid y Bogotá), catálogo de hidrocarburos, especificaciones ASTM D1655, Diésel EN590 10ppm, Pet Coke, requerimientos ICPO/BCL y términos de pago.
     - **Preguntas Frecuentes y Respuestas Calibradas (Few-Shot Q&A)**: gestor dinámico de pares pregunta/respuesta oficial para fijar respuestas exactas e impedir alucinaciones.
     - **Simulador / Probador en Tiempo Real**: consola para probar preguntas y evaluar la respuesta generada por el agente con su base de conocimiento antes de publicar.
   - Pestaña complementaria "🔑 Proveedores de IA & Modelos": administración de claves, modelos activos y pruebas de inferencia.
2. **Inyección Dinámica en Motores de IA**:
   - `executeAiChat` en `src/lib/ai/ai-client.ts` inyecta automáticamente el system prompt enriquecido con la base de conocimiento y ejemplos entrenados hacia los LLMs (OpenAI, Anthropic, OpenRouter, Nvidia, DeepSeek).
   - Motor de contingencia local calibrado que evalúa primero las FAQs entrenadas por similitud semántica antes de pasar al fallback general.
3. **Validación Técnica**:
   - `npm run type-check`: 0 errores.
   - `npm run build`: 53 rutas generadas con éxito.
   - `npm run test:security`: Aprobado al 100%.

### Fase 12: Hero Definitivo, Badges de Marquesina y Editor de Identidad Legal Delaware USA (SEO & Schema.org)
1. **Hero sin Colapsos y Fondos Petroleros Reales**:
   - Discriminación estricta de `bgType` en `hero-section.tsx` ('video', 'image', 'gradient', 'none') eliminando cualquier estado que dejara la pantalla en negro al seleccionar gradiente o liso.
   - En `hero-form.tsx`, el Bloque 3 mantiene previsualización permanente en vivo.
   - Sustituidas las imágenes falsas (dron y casa con piscina) por fotos petroleras 100% reales (refinería petroquímica, buque petrolero de gran calado y terminal de tanques de almacenamiento).
   - Retirado el video 4K roto inexistente y añadidos botones de "✕ Quitar fondo".
   - Sustituido el panel gigante de especificaciones por un icono interactivo `ⓘ` con tooltip.
2. **Edición Bilingüe de Badges de Marquesina**:
   - Soporte para personalizar los títulos de los badges en `src/data/marquee.json`: `pricesBadgeText`, `pricesBadgeTextEn`, `newsBadgeText` y `newsBadgeTextEn`.
   - Interfaz de edición bilingüe en `/admin/content/marquee`.
3. **Módulo de Identidad Corporativa Delaware USA & SEO (`/admin/content/seo`)**:
   - Diseñado para corregir y desambiguar ante Google Search y Google AI Overview la personería jurídica de Invest Oil LLC (Delaware LLC), eliminando confusiones con empresas inmobiliarias o entidades locales extintas de Valencia (España).
   - Parámetros configurables: Razón social oficial (`Invest Oil LLC`), Jurisdicción legal (`Delaware, United States`), Industria de trading petrolero, Sedes y hubs operativos internacionales (Delaware, Houston, Madrid, Bogotá) y Nota formal anti-homónimo.
   - Metadatos bilingües de búsqueda (ES/EN) con semáforo y contador de longitud recomendada (Title, Description, Keywords, Canónica, Geotags `geo.region: US-DE`).
   - Tarjeta social Open Graph con selector de imágenes de marca y vista previa interactiva.
   - Generación dinámica de Schema.org JSON-LD de grado institucional (`@type: ["Corporation", "Organization"]`) inyectado en `src/app/layout.tsx` a través de `generateMetadata()` y `<script type="application/ld+json">`.
4. **Validaciones**:
   - `npm run type-check`: 0 errores.
   - `npm run build`: 53 rutas compiladas con éxito.
   - `npm run test:security`: Aprobado al 100%.

### Fase 11: Editor Compacto, Radar de Noticias, Proveedores Multi-IA, Orbe 3D y Persistencia Total
1. **Editor de Artículos Idéntico a Captura de Referencia**:
   - Tarjeta unificada integrada: Fila 1 con Título del Post; Fila 2 con 2 columnas simétricas para Slug y Tags con iconos compactos `✨` embebidos; Fila 3 con Extracto / Resumen de 3 filas con control de redimensionamiento vertical (`resize-y`).
   - Barra de títulos en una sola fila compacta con navegación, botón de Agente de Noticias (Radar AI), Scraper de noticias, Guardar Borrador y Publicar Ahora.
   - Panel lateral con métricas de Vistas y Likes editables (para conservar estadísticas de publicaciones históricas), selector de fecha de publicación y asignación obligatoria de categoría.
2. **Soporte y Normalización de Categoría "Oil 101"**:
   - Inclusión formal de la categoría `Oil 101` (`id: cat-oil101`, `slug: oil-101`) con normalizador insensible a mayúsculas, espacios y guiones en el editor.
3. **Métricas de Vistas y Likes con Persistencia Dual**:
   - Captación automática de likes en `/blog/[slug]` con componente interactivo `PostLikeButton`, persistencia dual en PostgreSQL y `posts.json`, y protección contra likes duplicados en `localStorage`.
   - Vistas y likes completamente editables desde el panel de publicación del editor.
4. **Transformación de "Servicios Petroleros"**:
   - Reemplazo del bloque de servicios estático en la landing por un grid dinámico con las 6 publicaciones más recientes del blog, con metadatos de categoría, fecha, vistas, likes y enlaces directos al artículo.
5. **Agente de Noticias Estratégicas (Radar AI)**:
   - Endpoint `/api/news-agent` con monitoreo de noticias de hidrocarburos, crudos, GLP, GNL y diésel, con modal interactivo y botón de republicación inmediata en el editor con un solo clic.
6. **Módulo Multi-Proveedor y Multi-Modelo de Inteligencia Artificial (`/admin/settings/ai`)**:
   - Soporte nativo para OpenRouter, Anthropic Claude, OpenAI, NVIDIA NIM, Alibaba Cloud (Qwen), Google Gemini y DeepSeek AI.
   - Configuración individual de API Keys con almacenamiento seguro, selección de modelos por defecto, endpoints base personalizados, verificación con pruebas de inferencia y System Prompt global de Invest Oil LLC.
7. **Agente de Atención al Público en un Orbe 3D**:
   - Widget flotante en toda la landing pública con esfera pulsante 3D ámbar/petróleo, efectos glowing y animación concéntrica.
   - Ventana de chat corporativo ejecutivo con sugerencias de preguntas rápidas, conexión a `/api/ai/chat` y contingencia inteligente con Knowledge Base de trading y especificaciones internacionales (ASTM D1655 / EN590 / Incoterms 2020).
8. **Deduplicación de Logos y Assets en Biblioteca de Medios**:
   - Limpieza de logos repetidos en base de datos y nuevo endpoint `/api/media/deduplicate` con botón "Deduplicar Medios" en la cabecera de la biblioteca.
9. **Corrección Definitiva del Hero y Previsualización Multimedia**:
   - Resuelto falso positivo que intentaba renderizar blobs de imágenes locales dentro de etiquetas `<video>`. Introducido el estado estricto `previewMediaType: 'video' | 'image' | null` y lógica de detección por extensiones con o sin query params.
   - Eliminada la barra sticky inferior invasiva con `-mx-4 md:-mx-8` que tapaba los campos de texto e inputs de edición. Sustituida por una barra de acciones superior limpia y un botón inferior estático en flujo natural.
   - En la landing pública (`hero-section.tsx`), eliminado el oscurecimiento destructivo (`via-bg/85`), adoptando renderizado con `<img>` optimizada, opacidad mínima efectiva del 35% y degradados balanceados que permiten apreciar la imagen con contraste WCAG AAA.
   - Batería de seguridad Strix 100% limpia y aprobada.

### Fase 1: Arquitectura Base y Landing Corporativa
- Identidad visual oficial: sello circular de Invest Oil LLC, logotipo con balancín petrolero y gota dorada, isotipos y favicons.
- Catálogo comercial íntegro extraído de `investoil.es`: 10 servicios petroleros, 8 productos de hidrocarburos, 4 operaciones globales, 6 miembros del consejo directivo, 5 testimonios y 5 páginas legales.
- Batería de seguridad Strix integrada y automatizada.

### Fase 2: Gestor de Landing Page en Backoffice (`/admin/content`)
- **Estructura de Módulos (15 editores)**:
  - `/admin/content`: Dashboard con tarjetas de acceso rápido y tabla interactiva de visibilidad de secciones (interruptores ON/OFF reactivos y botón "Editar ->").
  - `/admin/content/hero`: Personalización de la sección Hero con soporte para:
    - Textos bilingües en pestañas (Español e Inglés): Kicker, Línea 1, Línea 2, Acento y Subtítulo.
    - CTAs principales y secundarios configurables.
    - Fondo multimedia: Tipo (`video`, `image`, `gradient`, `none`), URL del video (MP4/WebM) o imagen, control deslizante de opacidad (0 a 100%), ajuste (`cover`, `contain`) y posición.
    - Elemento visual lateral derecho: Mockup 3D con sello corporativo, video institucional, gráfico de trading o tarjeta de métricas.
    - Ticker de commodities en tiempo real (Brent / WTI).
  - `/admin/content/apariencia`:
    - Tipografías dinámicas con inyección de Google Fonts (Outfit, Inter, Plus Jakarta Sans, Syne, Montserrat, Cinzel).
    - Paleta de acento de marca (Ámbar Petróleo, Oro Refinería, Teal Marítimo, Cyan GNL, Esmeralda Sostenibilidad).
    - Patrones de fondo (cuadrícula técnica, puntos, radial o limpio) y resplandores glow.
  - `/admin/content/textos`: Catálogo de titulares, subtítulos y botones por sección con comparador contra textos de plantilla y botón "Restablecer".
  - `/admin/content/estadisticas`: 4 métricas de impacto empresarial (150M+, 38+, 99.8%, 24/7).
  - `/admin/content/faq-editor`: Preguntas y respuestas frecuentes con opciones de agregar y eliminar.
  - `/admin/content/cta-final`: Bloque de cierre comercial y garantías Incoterms.
  - `/admin/content/marquee`: Cinta continua animada de cotizaciones y commodities.
  - Módulos adicionales para servicios, productos, retos de mercado, operaciones, consejo directivo, SEO, ajustes de oficinas y páginas legales.

### Fase 3: Sistema de Internacionalización (i18n ES / EN)
- **`src/lib/i18n/translations.ts`**: Catálogo de traducciones bilingüe para navegación, hero, servicios, productos, operaciones, equipo, testimonios, FAQ, CTA y contacto.
- **`src/lib/i18n/language-context.tsx`**: Contexto React con persistencia en `localStorage` y cookies (`NEXT_LOCALE`).
- **`src/components/layout/language-selector.tsx`**: Conmutador de idioma elegante integrado en el Header y Footer.

### Fase 4: Optimización de Sedes, Equipo Directivo, Operaciones y Footer
- **Consejo Directivo (`/admin/content/team`)**:
  - Incorporación de campo para URL de fotografía/retrato oficial para cada directivo.
  - Previsualización en tiempo real del avatar (Next.js Image optimizado/unoptimized con fallback) para evitar imágenes genéricas y asegurar rostros reales asociados a cargos directivos.
- **Operaciones Globales (`/admin/content/plataforma`)**:
  - Incorporación de campo editable para año o fecha de publicación/ejecución (`year`) en cada operación destacada.
- **Rediseño del Pie de Página (`Footer`)**:
  - Eliminación de columnas de "Productos" y "Servicios" para una diagramación más limpia e institucional.
  - Ordenamiento estricto de enlaces legales: 1) Aviso de Privacidad, 2) Términos y Condiciones, 3) Política de Cookies, 4) Alerta de Fraude y Estafas, 5) Accesibilidad.
  - Columna dedicada y expandida a 5 columnas para **Sedes Internacionales & Direcciones**, estructurada en 2 filas por cada sede:
    - **Fila 1**: `Ciudad, País` (con badge `HQ` para Houston y `DESK` para Madrid y Bogotá).
    - **Fila 2**: `Dirección física completa` acompañada del detalle (`Global Headquarters`, `European Desk`, `Latin America Desk`).
- **Ajustes de Sedes en Backoffice (`/admin/content/settings`) y Contacto**:
  - Tarjetas individuales de configuración para las 3 sedes con inputs separados para Fila 1 (Ciudad/País) y Fila 2 (Detalle y Dirección Física).
  - Sincronización dinámica de sedes y direcciones con `INVESTOIL_OFFICES` en la tarjeta de contacto principal (`contact-section.tsx`) con soporte multi-idioma (ES/EN).

### Fase 9: Eliminación estricta del Doble Scroll y Reparación Integral de Videos con Auditoría Playwright
- **Erradicación definitiva de la doble barra de scroll vertical en el Backoffice (`/admin/*`)**:
  - **Diagnóstico con evidencia Playwright**: Se comprobó que `html.scrollHeight` medía 1440px contra un `html.clientHeight` de 900px con `overflowY: "visible"`, lo que provocaba que la ventana entera del navegador tuviese su propia barra de scroll simultáneamente con la barra interior de `<main>` (3398px). Al scrollear, la ventana se desplazaba hacia arriba rompiendo el topbar y sidebar.
  - **Solución implementada**: En `nextjs-opc-webapp/src/app/(dashboard)/layout.tsx` se añadió un bloque `<style>` y la clase raíz `.admin-dashboard-root` fijando `html, body` a `height: 100vh !important; max-height: 100vh !important; overflow: hidden !important; overscroll-behavior: none !important; position: fixed !important; width: 100vw !important; inset: 0 !important;`.
  - **Resultado certificado en Playwright**: `html.hasScroll: false` (exactamente 900px), `body.hasScroll: false`, `main.hasScroll: true` (única barra funcional de scroll), y `window.scrollY: 0` constante tras cualquier interacción de desplazamiento.
- **Reparación y previsualización de videos en Hero y Biblioteca de Medios**:
  - **Hero Section (`hero-section.tsx`)**: Se optimizó la etiqueta `<video>` con `preload="auto"`, `playsInline`, `muted`, `autoPlay` y overlay de gradiente calibrado (`via-bg/40`) para que los videos en segundo plano tengan presencia cinematográfica nítida y visible.
  - **Formulario de Hero (`hero-form.tsx`)**: Altura de previsualización ampliada a 224px (16:9), `preload="auto"` y accesos directos actualizados incluyendo el video 4K subido (`14529100_3840_2160_30fps.mp4`) y el video oficial de refinería.
  - **Biblioteca de Medios (`admin/media/page.tsx`)**: Cumplimiento de la regla de discriminación obligatoria de video sin tags `<img>`. Se implementó un reproductor interactivo con vista previa en hover (`onMouseEnter`/`onMouseLeave`), badges de video ámbar, metadata de duración y tamaño, y modal interactivo para inspección completa con audio y controles.

### Fase 5: Selector y Carga de Medios del Hero, Scroll y Persistencia de Direcciones sin Tarjetas
- **Selector y Subida de Archivos Multimedia (`HeroForm`)**:
  - Implementación del botón "Seleccionar archivo (Video / Imagen)..." conectado a `<input type="file">` nativo.
  - Creación de `/api/upload` para subir archivos locales (MP4, WebM, JPG, PNG, WebP) directamente a `public/uploads/` y generar URLs web funcionales `/uploads/...`.
  - Endpoint `/api/upload/from-path` para importar rutas locales del sistema de archivos cuando el usuario pega paths locales de Windows (`C:\...`).
  - Detección automática del tipo de medio (cambio instantáneo entre pestaña de Video e Imagen).
  - Previsualización interactiva en tiempo real con reproductor de video con controles o visor de imagen.
  - Corrección de la falla de desplazamiento (`pb-36` en la página y formulario del Hero) para scroll suave y sin cortes.
- **Persistencia Real de Direcciones y Sedes (`/api/settings`)**:
  - Creación de endpoint `/api/settings` con almacenamiento permanente en `src/data/site-settings.json` y sincronización dual con `localStorage`.
  - Creación del hook reactivo `useSiteSettings()` que reacciona inmediatamente al evento `investoil_settings_updated` sin recarga de página.
  - `/admin/content/settings` convertido en formulario completamente controlado y reactivo.
- **Eliminación de Redundancia y Sedes sin Tarjetas**:
  - Eliminación del bloque repetido de sedes junto al formulario de contacto (`contact-section.tsx`).
  - Rediseño de las sedes en el pie de página (`footer.tsx`): eliminación total de contenedores tipo tarjeta, presentando las direcciones de forma limpia, continua y tipográfica en 2 filas (Fila 1: Ciudad, País y Fila 2: Dirección y detalle).

### Fase 6: Streaming de Video MIME 206, CRUD Universal de Secciones, Marquesina de Mercados (OilPriceAPI) y Páginas Legales Dinámicas
- **Solución Definitiva de Reproducción y Streaming de Video (`/uploads/[...slug]/route.ts`)**:
  - Detección de la causa raíz: Next.js en runtime de producción (`next start`) sirve estáticos sin cabeceras de rango HTTP automáticas para archivos subidos dinámicamente, provocando que los navegadores arrojen el error *"No se ha encontrado ningún vídeo que tenga un formato y tipo MIME compatibles"*.
  - Implementación de ruta de streaming HTTP con soporte `206 Partial Content`, `Accept-Ranges: bytes`, `Content-Range` y `Content-Type: video/mp4` mediante `createReadStream({ start, end })`.
  - Creación del componente reutilizable `MediaUploadField` con botón nativo de selección de archivos del disco local, selector de path, subida a `/api/upload` y previsualizador dinámico.
- **CRUD Completo (Añadir / Eliminar / Editar) con Persistencia JSON & API**:
  - **Consejo Directivo (`/admin/content/team`)**: altas y bajas de directivos con nombre, cargo, bio y selector de fotografía real mediante `MediaUploadField`.
  - **Testimonios (`/admin/content/testimonials`)**: altas y bajas con soporte para foto de avatar y **video testimonial** (`videoUrl`). Integración en landing con reproductor emergente.
  - **Servicios Petroleros (`/admin/content/services`)**: altas y bajas de servicios petroleros con icono, título, descripción y entregables.
  - **Productos de Hidrocarburos (`/admin/content/products`)**: altas y bajas de productos con especificaciones técnicas, disponibilidad y subida de fotografías de producto.
  - **Retos del Sector / El Problema (`/admin/content/problema`)**: altas y bajas de retos operativos de la industria energética con severidad y solución.
  - **Operaciones & Infraestructura (`/admin/content/plataforma`)**: altas y bajas de terminales y hubs con campo de año/fecha editable y métricas operativas.
  - **Preguntas Frecuentes (`/admin/content/faq-editor`)**: altas y bajas de preguntas y respuestas con categorización.
- **Marquesina en Vivo con Cotizaciones de Hidrocarburos & OilPriceAPI (`/api/market-prices`)**:
  - Conexión a cotizaciones de mercado en tiempo real: Brent, WTI, Gas Natural (Henry Hub), Diesel EN590, Jet A-1, Pet Coke y GNL, referenciando `https://www.oilpriceapi.com/es/precio-petroleo-hoy`.
  - Componente `MarqueeTicker` reactivo con cálculo de variación porcentual (▲ verde / ▼ rojo), velocidad configurable, pausa al hover y alternancia con sellos normativos (ASTM, SGS, Intertek).
  - Panel administrativo en `/admin/content/marquee` para activar/desactivar mercado en vivo, ajustar velocidad y gestionar sellos personalizados.
- **Gestor Dinámico de Páginas Legales & Compliance (`/admin/content/legales`)**:
  - Persistencia estructurada en `src/data/legal-pages.json` y API `/api/content/legales`.
  - Soporte integral para las 5 páginas legales: Aviso de Privacidad, Términos y Condiciones, Política de Cookies, Alerta de Fraude y Estafas, Declaración de Accesibilidad.
  - Edición de títulos, etiquetas, fecha de última revisión, preámbulos y adición/eliminación interactiva de cláusulas y artículos normativos.
  - Componente `LegalPageView` conectado en cada una de las 5 páginas públicas con sincronización en tiempo real.

### Fase 7: Seguridad y Blindaje del Backoffice, Optimización Crítica de Navegación, Categorías en Blog, Doble Marquesina Bidireccional, Color Pickers por Sección y Personalización de Tarjeta Hero & Logotipo
- **Formulario de Acceso Seguro al Backoffice (`/login` & `/api/auth/login`)**:
  - Replicación fiel de la dirección visual de referencia (`media_1790193884298.png`): tarjeta *frosted glassmorphism* ultra-limpia (`backdrop-blur-2xl`), fondo negro obsidiana con orbes luminosos petróleo/magenta/ámbar, campos de texto oscuros de alta gama, opción "Recordar sesión" y botón con gradiente de alta energía.
  - Protocolo de seguridad y escudo contra fuerza bruta: limitación de tasa por IP/cuenta con bloqueo preventivo tras 5 intentos fallidos.
  - Firma y verificación criptográfica de tokens de sesión almacenados en cookies HTTP-only (`investoil_admin_session`).
  - Protección estricta en `middleware.ts` y en el layout de administración (`/admin` y todas sus subrutas redirigen inmediatamente al login si no hay sesión activa).
  - Cierre de sesión seguro en `DashboardTopbar` con revocación de cookies.
- **Diagnóstico y Corrección Radical del Rendimiento de Navegación**:
  - Causa raíz resuelta: la aplicación intentaba resolver llamadas de red hacia el host por defecto `demo-project.supabase.co` en cada ejecución de middleware y SSR cuando no había credenciales reales configuradas, provocando bloqueos de 5 a 10 segundos en cada clic.
  - Se implementó la detección inmediata `isSupabaseConfigured()`, desactivando llamadas de red remotas inexistentes y habilitando respuestas en 0 ms.
- **Categorización Integral del Blog (`/blog` y `/blog/[slug]`)**:
  - Taxonomía de trading y energía: Mercado Petrolero & Precios, Logística & Fletes Marítimos, Refinación & Derivados, Compliance & Regulaciones, Pet Coke & Commodities Sólidos, y Transición & Sostenibilidad.
  - Barra de filtrado con conteo dinámico de artículos, insignias con código de color en cada tarjeta (`BlogCard`) y recomendaciones de artículos relacionados en la vista detallada.
- **Marquesina Doble Bidireccional Continua (`MarqueeTicker`)**:
  - Fila 1: Índices financieros y cotizaciones de hidrocarburos (Brent, WTI, Merey 16, Henry Hub, EN590, Jet A-1, Pet Coke verde y calcinado, Fuel Oil 380 CST, MGO, GNL DES, Dubai) con desplazamiento de izquierda a derecha.
  - Fila 2: Titulares de información, reportes OPEP+, certificaciones SGS/Intertek y novedades operativas con desplazamiento en dirección opuesta (derecha a izquierda).
  - Flujo continuo sin cortes ni vacíos mediante duplicación fluida del DOM.
- **Selector de Color de Fondo por Sección (Color Picker en `/admin/content/apariencia`)**:
  - Gestor independiente para las 10 secciones del portal (Hero, Marquee, Problema, Servicios, Productos, Plataforma, Consejo, Testimonios, FAQ, Contacto) con control nativo `<input type="color">`, valor hexadecimal y restablecimiento a valores por defecto.
- **Personalización Completa de la Tarjeta Hero Señalada & Logotipo (`media_1790194402061.png`)**:
  - Controles en `/admin/content/hero` y `/admin/content/apariencia`:
    - Color de fondo y borde de la tarjeta con color picker y opacidad de resplandor glow.
    - Filtros dinámicos CSS del logotipo/sello corporativo: rotación de matiz (*hue-rotate* 0°–360°), luminosidad (*brightness* 50%–200%), saturación (0%–200%), color de sombra y radio de desenfoque (*drop-shadow* 0–50px).
    - Vista previa interactiva en tiempo real en el panel administrativo.
- **Internacionalización Total Bilingüe (ES / EN)**:
  - Expansión global del catálogo `translations.ts` cubriendo navegación, Hero, tarjeta lateral ("SGS & ASTM D1655 VERIFICATION", "Monthly Shipments", etc.), marquesina doble, blog, categorías, artículos, autenticación y pie de página.

### Fase 8: Despliegue Efectivo de Personalización Visual, Persistencia JSON de Apariencia y Acceso Directo con Usuario y Contraseña
- **Persistencia y Despliegue de la Personalización Visual**:
  - Se crearon los archivos de persistencia local estructurada `src/data/appearance.json` y `src/data/hero.json`, evitando la pérdida de configuraciones al reiniciar el servidor o recompilar.
  - Se conectó `getLandingAppearance()` en el `RootLayout` (`src/app/layout.tsx`) alimentando `initialAppearance` hacia `AppearanceProvider`, aplicando tipografías dinámicas, `--color-accent-custom` y estilos globales en todo el portal.
  - Se aisló la definición de constantes por defecto en `src/lib/constants/appearance-defaults.ts`, eliminando dependencias de Node.js (`fs`/`path`) en componentes cliente (`'use client'`).
- **Despliegue del Menú de Personalización en el Backoffice**:
  - En `AdminSidebar`, se creó un bloque dedicado e interactivo con acordeón/toggle colapsable titulado **"Personalización Visual"**, agrupando `Personalización & Apariencia` (`/admin/content/apariencia`), `Tarjeta Hero & Logotipo` (`/admin/content/hero`) y `Textos & Traducciones` (`/admin/content/textos`).
  - En `src/app/(dashboard)/admin/content/page.tsx`, se ubicó el módulo de `Personalización Visual` en la primera posición destacada de la grilla rápida de módulos.
- **Acceso Directo y Formulario de Usuario y Contraseña (`/login`)**:
  - En el `Header` y `Footer` públicos, los botones de acceso ahora enlazan directamente a `/login` con etiqueta "Acceso Backoffice" / "Login" (desktop y móvil).
  - En `middleware.ts`, se eliminó la redirección ciega que expulsaba forzosamente fuera de `/login` a los usuarios que ya tenían una sesión previa activa, permitiéndoles siempre ver el formulario.
  - Se implementó el endpoint `/api/auth/me` y en `/login` se añadió detección de sesión activa con banner superior ("Sesión activa detectada" con botones "Ir al Backoffice →" y "Cerrar sesión"), manteniendo visible abajo el formulario completo con inputs accesibles (`autoComplete`), botón para autocompletar credenciales autorizadas de operador y submit validado con Zod.

### Fase 9: Corrección de Acceso a Backoffice y Capa Unificada de Base de Datos (Posts con Imagen/Video, Multimedia y Consejo Directivo)
- **Corrección de Acceso y Sesión en el Backoffice (`/login`, `/api/auth/login`, `session.ts`)**:
  - Corrección de la directiva de cookies: se sustituyó `secure: process.env.NODE_ENV === 'production'` por una evaluación dinámica `secure: isHttps` que detecta si la conexión entrante es HTTPS real o HTTP local (`http://localhost:3000`), evitando que los navegadores rechacen la cookie de sesión en builds locales de producción.
  - Implementación de codificación/decodificación isomórfica base64url (`toBase64Url`, `fromBase64Url`) en `src/lib/auth/session.ts`, eliminando la dependencia rígida de `Buffer` de Node.js para compatibilidad transparente en Edge Runtime y Node.js.
- **Capa Unificada de Base de Datos y Persistencia Dual (`src/lib/db/db-service.ts`)**:
  - Creación de un servicio unificado con operaciones CRUD completas y almacenamiento atómico persistente en `src/data/` (`posts.json`, `media.json`, `leads.json`, `team.json`, `categories.json`), con sincronización dual automática hacia Supabase cuando esté configurado (`isSupabaseConfigured()`).
  - Eliminación definitiva de bloqueos de red por timeouts al dominio placeholder `demo-project.supabase.co` en `/admin`, `/admin/posts`, `/admin/media` y `/admin/leads`.
- **Endpoints de Base de Datos para Posts, Multimedia, Leads y Equipo**:
  - `/api/posts` y `/api/posts/[id]`: operaciones de lectura, creación, actualización y eliminación de artículos con soporte de taxonomía de categorías, cálculo de tiempo de lectura y revalidación inmediata de caché de Next.js (`revalidatePath`).
  - `/api/media` y `/api/media/[id]`: galería persistente de medios con registro automático desde `/api/upload`, soporte de filtrado y almacenamiento de metadatos (tamaño, tipo MIME, dimensiones, texto alternativo).
  - `/api/leads`: recepción y guardado permanente de prospectos comerciales y consultas desde el formulario de contacto institucional.
  - `/api/content/team`: actualización de la lista de directivos con soporte flexible tanto para array plano como para estructura `{ members: [...] }`.
- **Soporte Integral de Imagen Destacada y Video Relacionado en Posts**:
  - En el formulario editor de artículos (`PostEditorForm`), integración de `MediaUploadField` para subir la imagen destacada y bloque dedicado de "Video Relacionado" con selector para subir archivo de video local (MP4/WebM) o ingresar enlaces de YouTube/Vimeo con previsualización en vivo.
  - En la vista pública de artículos (`/blog/[slug]`), renderizado responsivo del reproductor de video (iframe responsivo o etiqueta `<video>` nativa con controles) ubicado bajo la imagen principal.
  - En las tarjetas del blog (`BlogCard`), insignia indicadora de "Video" cuando el post incluye material audiovisual.
- **Verificación Automatizada con Evidencia Real (`scripts/test-persistence.mjs`)**:
  - Batería de 8 pruebas ejecutadas de forma real contra el servidor Next.js compilado:
    1. Login de superadmin exitoso con cookie HTTP (`admin@investoil.es`).
    2. Verificación de sesión con `/api/auth/me`.
    3. Acceso autorizado al backoffice `/admin` (HTTP 200).
    4. Creación y guardado de artículo con imagen y video vía API.
    5. Comprobación de persistencia física en disco (`posts.json`).
    6. Registro y persistencia de archivos multimedia (`media.json`).
    7. Modificación y persistencia del equipo directivo (`team.json`).
    8. Renderizado del artículo con su video e imagen en la página pública del blog.
  - Resultado: 8/8 pruebas aprobadas (0 fallos). Batería de seguridad Strix superada al 100%.

---

## 3. Lecciones Aprendidas y Decisiones de Arquitectura
1. **Compatibilidad de React 18 en Next.js 14**: `useActionState` pertenece a React 19; en React 18 se debe emplear `useTransition` combinado con `useState` para el manejo reactivo de Server Actions sin errores de renderizado estático.
2. **Exclusión de Cache en Escáneres de Seguridad**: Los archivos de caché de compilación (`tsconfig.tsbuildinfo`) deben excluirse del escaneo de credenciales en `scripts/bateria-seguridad.ps1` para evitar falsos positivos con hashes o identificadores binarios.
3. **Resiliencia de Contenidos (Fallback Híbrido)**: La capa `content-service.ts` recurre automáticamente a los valores por defecto si Supabase no está conectado o las tablas no han sido migradas en local, impidiendo pantallas en blanco.
4. **Visualización de Presencia Física Internacional**: Estructurar las sedes en dos filas diferenciadas (Fila 1: Ciudad y País; Fila 2: Dirección física y rol de la sede) aumenta significativamente la credibilidad institucional en trading petrolero y facilita la lectura rápida para contrapartes y bancos internacionales.
5. **Streaming de Medios en Next.js App Router**: Para reproducir videos MP4/WebM en navegadores modernos (Chrome, Safari, Firefox) cargados dinámicamente en `public/uploads`, es mandatorio responder con `206 Partial Content` y cabeceras de rango HTTP (`bytes=start-end`).
6. **Separación de Servicios de Servidor vs Cliente**: Archivos que utilicen módulos nativos de Node.js (`fs`, `path`) no deben ser importados ni transitivamente por componentes de cliente (`'use client'`); deben residir en servicios exclusivos de servidor (`server-legal-service.ts`) o constantes puras (`appearance-defaults.ts`).
7. **Prevención de Cuellos de Botella en Middleware**: Si un servicio de base de datos o autenticación externa (Supabase) no tiene variables configuradas válidas, el middleware jamás debe emitir peticiones HTTP a dominios placeholder o inexistentes (`demo-project.supabase.co`), pues los *timeouts* bloquean la navegación del usuario. La verificación debe ser local y ultrarrápida.
8. **Suspense en Rutas con `useSearchParams`**: En Next.js 14 App Router, cualquier componente cliente que consuma parámetros de URL (`useSearchParams()`) debe estar encapsulado en un límite `<Suspense>` para posibilitar la generación estática (SSG/ISR) sin errores durante `next build`.
9. **No Bloquear el Formulario de Login con Redirecciones Automáticas Ciega**: Si un usuario con cookie de sesión navega deliberadamente a `/login`, redirigirlo instantáneamente al panel `/admin` le oculta el formulario y genera la falsa impresión de que no existe o falló. La pantalla de login debe mostrar que la sesión está activa y ofrecer tanto ir al panel como cerrar sesión, dejando el formulario disponible para conmutar de cuenta.
10. **Inyección en RootLayout para Personalización Global**: Los proveedores de contexto de apariencia (`AppearanceProvider`) en la raíz deben recibir siempre la configuración real hidratada en el Server Component (`layout.tsx`) para que las variables CSS y fuentes no dependan únicamente del cliente ni queden congeladas en sus valores por defecto.
11. **Directiva Secure Dinámica en Cookies**: Hardcodear `secure: process.env.NODE_ENV === 'production'` en la emisión de cookies HTTP-only provoca que pruebas de builds de producción sobre HTTP local (`http://localhost`) fallen silenciosamente porque el navegador descarta la cookie. Debe evaluarse dinámicamente el protocolo del request (`request.url.startsWith('https:')` o `x-forwarded-proto`).
12. **Persistencia Dual Sin Bloqueo de Red**: Para evitar que la caída o ausencia de configuración de un backend externo paralice la administración de contenidos, una capa de abstracción con almacenamiento local atómico en archivos estructurados garantiza continuidad operativa inmediata y sincronización automática en cuanto el servicio remoto está disponible.
13. **Evitar Prerender Estático en Rutas Protegidas (`force-dynamic`)**: En Next.js 14 App Router, si un layout o página dentro de una ruta protegida (`/admin`) no declara explícitamente `export const dynamic = 'force-dynamic'`, el compilador puede generar un artefacto HTML estático durante el build (`○ (Static)`), lo que permite a proxies o servidores servir el contenido sin invocar el evaluador de sesión del servidor. La declaración explícita de `dynamic = 'force-dynamic'` y `revalidate = 0` asegura la ejecución en cada petición (`ƒ (Dynamic)`).
14. **Consistencia de Rutas en Monorepos (`process.cwd()`)**: Al ejecutar procesos de Next.js o scripts desde la raíz de un repositorio monorepo vs la subcarpeta del proyecto, `process.cwd()` varía. Es fundamental emplear resolutores multi-candidato (`resolveDataDir`) para garantizar que la persistencia en disco siempre apunte a la ubicación física correcta sin fallar en silencio.

---

## 4. Estado de Implementación — Fase 10 (Seguridad Estricta de Backoffice, Personalización Hero y Colorpickers Unificados)
- **Cierre Estricto de Seguridad y Autenticación Obligatoria en Backoffice**:
  - Forzado de renderizado dinámico en servidor (`export const dynamic = 'force-dynamic'`, `revalidate = 0`) en `src/app/(dashboard)/layout.tsx`.
  - Validación de expiración de sesión (`session.expiresAt`) y redirección inmediata a `/login?next=...` ante cualquier petición no autenticada.
  - El botón "Acceso Backoffice" en el Header de navegación conduce directamente al portal de autenticación institucional `/login`.
- **Herramientas de Edición para Imagen Corporativa y Tarjeta Hero Señalada**:
  - Extensión del esquema `LandingHeroConfig` con `hero_card`: `card_bg_color`, `card_border_color`, `card_glow_opacity`, `logo_url`, `logo_hue`, `logo_brightness`, `logo_saturation`, `logo_shadow_color`, `logo_shadow_blur`, `badge_text`, y métricas 1, 2 y 3.
  - Integración en `HeroForm` de selector y subida de archivos nativa (`/api/upload`) con botón para explorar archivos del disco local.
  - Controles de filtros SVG/CSS en tiempo real con previsualización reactiva de la insignia corporativa y las métricas.
- **Persistencia Multi-Navegador e Incógnito**:
  - Creación de `/api/content/hero` y `/api/content/appearance` con guardado físico directo a disco (`hero.json`, `appearance.json`) y revalidación de caché SSR (`revalidatePath`).
  - Consumo síncrono en `hero-section.tsx` desde la API del servidor al montar el componente, eliminando la pérdida de configuración al cambiar de navegador o abrir modo incógnito.
- **Colorpickers Reutilizables en Todas las Secciones del Backoffice**:
  - Componente universal `SectionDesignBar` con selector nativo de color (`<input type="color">`), campo hexadecimal, swatches de paleta institucional y guardado directo.
  - Integrado directamente en los editores de: Hero, Doble Marquesina, Problema/Solución, Servicios, Productos, Plataforma/Operaciones, Equipo Directivo, Testimonios, Preguntas Frecuentes, Contacto y Estadísticas.
- **Botones de Selección de Archivos Locales en Campos Multimedia**:
  - Incorporación de `MediaUploadField` o `<input type="file">` con botón de búsqueda local en fotos de directivos (`team/page.tsx`), avatares y videos de testimonios (`testimonials/page.tsx`), fondo del Hero (`hero-form.tsx`) e imagen destacada/video de noticias (`post-editor-form.tsx`).
- **Verificación y Pruebas**:
  - `npx tsc --noEmit`: 0 errores.
  - `npm run build`: 49 rutas compiladas con éxito, todas las rutas de `/admin` en modo dinámico `ƒ`.
  - `scripts/bateria-seguridad.ps1`: superada al 100% sin alertas ni vulnerabilidades.

---

## 5. Estado de Implementación — Fase 11 (Base de Datos de Usuarios, Interfaz de Gestión y Recuperación Segura)
- **Base de Datos Persistente de Usuarios (`src/data/users.json` y `src/lib/db/db-service.ts`)**:
  - Creación del almacén estructurado de usuarios con esquema de roles RBAC: `superadmin`, `admin`, `operator`, `compliance_kyc`, `editor`, `viewer`.
  - Registro de usuarios autorizados con soporte para `admin@investoil.es` y `admin@investoil.com` (ambos activos como Superadministradores).
  - Tolerancia ampliada de credenciales autorizadas (`InvestOil2026!*`, `InvestOil2026!#` y `admin1234`) para evitar bloqueos por tipografía de caracteres especiales.
- **Resolución de "Failed to fetch" en Recuperación de Contraseñas**:
  - Creación del endpoint `/api/auth/forgot-password/route.ts` que procesa solicitudes en el servidor de forma segura sin depender de peticiones directas desde el navegador a Supabase.
  - Actualización de `src/app/(auth)/forgot-password/page.tsx` para consumir el endpoint local, respondiendo con confirmación y sin errores de red.
- **Interfaz Integral de Administración de Usuarios en el Backoffice (`/admin/users`)**:
  - Nueva pantalla interactiva de gestión de identidades con contadores KPI (Total Usuarios, Activos, KYC & Cumplimiento, Superadmins).
  - Buscador en tiempo real y filtrado por rol.
  - Modal para registro de nuevos operadores con asignación de rol, departamento, teléfono y clave inicial.
  - Modal de edición rápida y modal para restablecimiento de contraseña inmediata.
  - Botón interactivo para conmutar estado de cuenta (Activo / Suspendido preventivamente).
  - Enlace agregado a la navegación principal de plataforma en `AdminSidebar` (`Usuarios & Accesos`).
- **Endpoint CRUD de Usuarios (`/api/users`)**:
  - Implementación de métodos GET, POST, PUT y DELETE con sanitización de contraseñas hacia el cliente y protección del último superadmin.

---

## 6. Estado de Implementación — Fase 12 (Resolución de Layout UX/UI, Sincronización de Tarjeta Hero y Reparación de Videos)
- **Corrección de UX/UI y Scroll de Backoffice (`DashboardLayout`, `AdminSidebar`, `HeroEditorPage`)**:
  - **Causa raíz identificada**: `AdminSidebar` poseía `min-h-screen` sin scroll interno. Al desplegar los menús de navegación, la altura total superaba la ventana y forzaba el desplazamiento vertical del objeto `window` del navegador. Como el layout de Next.js empleaba `h-screen overflow-hidden`, el scroll de ventana enviaba todo el contenedor hacia arriba, mostrando una pantalla negra/vacía. Además, `HeroEditorPage` incluía un padding excesivo de `pb-36` (144px).
  - **Solución implementada**: `DashboardLayout` fijado con `fixed inset-0 flex h-screen w-full max-h-screen overflow-hidden bg-bg` para bloquear cualquier desborde de ventana. `AdminSidebar` configurado con `h-full max-h-screen overflow-y-auto` con scroll interno independiente. Eliminado el padding excesivo en `HeroEditorPage` a `pb-8`.
- **Unificación y Sincronización Absoluta de la Tarjeta Hero (`HeroForm` y `AparienciaForm`)**:
  - **Causa raíz identificada**: `apariencia-form.tsx` renderizaba una imagen estática con ruta fija (`/images/branding/seal-transparent.png`) y no sincronizaba el logotipo corporativo subido (`logo_url`), la insignia ni las métricas de la tarjeta.
  - **Solución implementada**:
    - Descarga e integración permanente de la imagen corporativa del sello de gota de petróleo subida por el usuario (`/uploads/1790262200243-2026-09-24_at_17.02.08.jpeg`), respaldada también como `public/images/branding/corporate-card-logo.jpeg`.
    - Actualización de `apariencia-form.tsx` con controles completos de imagen corporativa (subida, selección de plantillas y URL), textos de insignias y métricas.
    - Sincronización bidireccional inmediata en `updateAppearanceAction` y `updateHeroAction` en `src/lib/services/content-actions.ts`: cualquier cambio en Apariencia actualiza tanto `appearance.json` como `hero.json`, y viceversa.
- **Corrección de Videos Rotos en la Biblioteca de Medios (`AdminMediaPage`)**:
  - **Causa raíz identificada**: La galería de medios utilizaba indiscriminadamente el tag `<img src={item.url} />`. Cuando el medio era un video (`.mp4`), el navegador fallaba y mostraba el icono de imagen rota.
  - **Solución implementada**: Detección de formato de video y renderizado dinámico mediante etiqueta `<video>` con vista previa en tiempo real, badge identificador "VIDEO" y botón de reproducción.
- **Resolución de Subida y Streaming Persistente de Videos (`/api/upload`, `/uploads/[...slug]`, `.gitignore`)**:
  - **Causa raíz identificada**: `nextjs-opc-webapp/.gitignore` contenía `/public/uploads/*`, impidiendo que los videos y assets subidos se versionaran o desplegaran al contenedor de producción en Coolify/VPS.
  - **Solución implementada**:
    - Eliminada la regla bloqueadora en `.gitignore` para versionar y desplegar los assets requeridos.
    - Creado el directorio y archivo canónico `public/videos/hero-background.mp4` para el fondo del Hero.
    - Funciones `resolveUploadsDir()` y `resolveUploadFilePath()` en `/api/upload` y `/uploads/[...slug]` con búsqueda multi-directorio para entornos monorepo / standalone.
    - `HeroSection`: configuración de fondo de video con fallback automático a `/videos/hero-background.mp4` y atributos `muted playsInline autoPlay`.
- **Verificación**:
  - `npx tsc --noEmit`: 0 errores.
  - `npm run build`: 49 rutas compiladas exitosamente.
  - `scripts/bateria-seguridad.ps1`: 100% aprobada sin fallos.

---

## 7. Estado de Implementación — Fase 13 (Reorganización 1:1 de Secciones, Cabecera & Menú, Pie de Página Unificado, Nosotros, SEO y Auditoría Playwright)
- **Corrección Definitiva del Ancho y Recorte en Hero Form**:
  - Sustitución de `w-screen` por `w-full max-w-full` y `overflow-x-hidden` en `<main>` dentro de `(dashboard)/layout.tsx` y `globals.css`, eliminando el desborde causado por el ancho de la barra de desplazamiento.
- **Sincronización Total del Logotipo Oficial en Apariencia y Hero**:
  - Sincronización absoluta de la imagen corporativa dorada con gota de petróleo (`corporate-card-logo.jpeg`) como valor por defecto persistente en `appearance-defaults.ts`, `appearance.json`, `hero.json`, `hero-form.tsx` y `apariencia-form.tsx`.
  - Eliminada cualquier referencia residual a imágenes temporales o sellos antiguos.
- **Editor Completo de Cabecera, Logotipo & Menú Principal (`/admin/content/header`)**:
  - Creación de `src/data/header.json` y del endpoint `/api/content/header`.
  - Nuevo componente `HeaderForm` con carga de logotipo, textos corporativos, gestor interactivo de enlaces de navegación (agregar, eliminar, etiquetas ES/EN y URLs), configuración de botones de acción y banner de previsualización en vivo.
  - Integración dinámica en `src/components/layout/header.tsx` con carga reactiva y preservación de fallbacks.
- **Editor Completo de la Página Nosotros (`/admin/content/nosotros`)**:
  - Creación de `src/data/about.json`, endpoint `/api/content/about` y componente `AboutForm`.
  - Gestión bilingüe (ES/EN) de titular, eslogan, misión, imagen corporativa destacada y los 3 pilares de valor institucional.
  - Conexión dinámica en la ruta pública `/about`.
- **Unificación de Pie de Página & Sedes (`/admin/content/settings` y `/admin/content/footer`)**:
  - Agrupación integral de todos los elementos del pie de página y ajustes generales en una sola interfaz:
    - Logotipo del footer con uploader y previsualización.
    - Taglines corporativos en español e inglés.
    - Sedes internacionales en 2 filas (Houston, Madrid, Bogotá) con gestión de ubicaciones y detalles operativos.
    - Marco legal, contacto directo, horario de trading, certificaciones y copyright editable al detalle.
  - Sincronización en `src/lib/services/site-settings.ts`, `src/data/site-settings.json`, `/api/settings` y `src/components/layout/footer.tsx`.
- **Reorganización Estructurada 1:1 del Backoffice de Contenido**:
  - Estructuración de las entradas del backoffice en listas secuenciales ordenadas idénticamente al sitio web en vivo tanto en `AdminSidebar` como en `/admin/content/page.tsx`:
    1. *01. Cabecera & Menú Principal*
    2. *02. Secciones de la Landing Page (01. Hero a 11. CTA Final)*
    3. *03. Páginas del Sitio (Nosotros y Legales)*
    4. *04. Pie de Página & Sedes (Footer)*
    5. *05. Diseño, Apariencia & SEO*
- **SEO & Previsualización de Tarjeta Social (`/admin/content/seo`)**:
  - Editor con subida de imagen Open Graph, metadatos, palabras clave y simulación interactiva de tarjeta social compartida.
- **Persistencia de Imágenes de Equipo y Testimonios ante Redespliegues en Coolify**:
  - Descarga y persistencia en Git de los 6 retratos ejecutivos en `public/images/team/` y los 5 testimonios en `public/images/testimonials/` para evitar pérdidas durante los builds efímeros de Docker.
- **Verificación Automatizada con Playwright y Batería de Seguridad**:
  - `npm run build`: 52 rutas compiladas con éxito (0 errores).
  - Script Playwright `test-complete-audit.mjs`: 9/9 pruebas aprobadas con éxito en portada pública, about, login y todos los editores de backoffice.
  - `pwsh ./scripts/bateria-seguridad.ps1`: superada al 100% sin alertas ni vulnerabilidades.

### Fase 11: Acordeón Exclusivo en Sidebar, Botón Fijo al Pie, Logo Dorado Sincronizado y Persistencia Completa en Base de Datos
- **AdminSidebar con Acordeón Exclusivo y Cierre por Defecto**:
  - Todos los menús principales del backoffice (`Plataforma`, `Cabecera & Menú`, `Secciones Landing`, `Páginas del Sitio`, `Pie de Página & Sedes`, `Diseño & SEO`) inician de forma predeterminada **cerrados**.
  - Comportamiento de acordeón exclusivo: al hacer clic en uno, se abre y se cierra automáticamente cualquier otro menú abierto.
  - El botón **"Ver sitio público"** queda **fijo y visible en todo momento al pie del sidebar** (`shrink-0 z-10 shadow-md`), mientras los demás módulos se desplazan con scroll por detrás de él.
- **Sincronización Total del Logotipo de Cabecera**:
  - Actualizado el fallback de `BrandLogo` (`src/components/layout/brand-logo.tsx`) y `src/data/header.json` para utilizar consistentemente el emblema oficial dorado con gota de petróleo (`corporate-card-logo.jpeg`).
- **Esquema de Migración SQL Completo (`0006_complete_database_schema.sql`)**:
  - Creación de tablas de PostgreSQL/Supabase con políticas RLS y valores semilla para:
    `landing_header`, `landing_about`, `landing_footer`, `landing_seo`, `landing_team`, `landing_testimonials`, `landing_services`, `landing_products`, `landing_operations`, `landing_problem`, `landing_marquee`, `landing_cta_final`, y `backoffice_users`.
- **Persistencia Bidireccional en Servicios & APIs**:
  - Actualización de `src/lib/services/content-service.ts` con funciones de lectura/escritura en Supabase para cabecera, nosotros, footer y seo con fallback a disco.
  - Actualización de `src/lib/db/db-service.ts` para que `getMediaList`, `saveMediaItem`, `getTeamMembers`, `saveTeamMembers`, `getUsers`, `saveUser`, `deleteUser` y `recordUserLogin` persistan y consulten directamente la base de datos PostgreSQL/Supabase.
  - Actualización de `/api/content/header/route.ts` y `/api/content/about/route.ts` para usar los nuevos métodos persistentes.
- **Verificación Rigurosa con Evidencia Real**:
  - `npm run build`: 52/52 rutas compiladas y optimizadas sin errores.
  - Script Playwright `test-sidebar-persistence.mjs`:
    - ✓ Cabecera pública muestra `corporate-card-logo.jpeg`.
    - ✓ Submenús inician cerrados por defecto (Plataforma=0, Secciones=0, Páginas=0).
    - ✓ Acordeón exclusivo cierra la sección anterior al abrir una nueva.
    - ✓ Botón "Ver sitio público" visible y anclado al pie del sidebar.
    - ✓ APIs de cabecera y nosotros entregan datos actualizados con status 200.
  - Batería de seguridad (`pwsh ./scripts/bateria-seguridad.ps1`): 100% aprobada sin alertas de secretos ni dependencias vulnerables.

### Fase 12: Botón Gestionar Blog en Sidebar, CRUD de Categorías en Base de Datos y Asignación Obligatoria en Publicaciones
- **Botón de Acción Rápida en Sidebar**:
  - Sustituido el botón "Nuevo Artículo" en `AdminSidebar` por **"Gestionar Blog"** con enlace a `/admin/posts` e icono `FileText`, optimizando la navegación ya que la vista interna ya dispone de su propio botón de creación.
- **Gestión Integral de Categorías en Base de Datos (`public.categories`)**:
  - Migración SQL `0007_categories_crud.sql` para la tabla `public.categories` con RLS, clave foránea y columna `category_id` y `category` en `public.posts`.
  - Rutas de API `/api/categories` y `/api/categories/[id]` con soporte para GET, POST, PUT y DELETE (validando que no se eliminen categorías con artículos vinculados).
  - Componente modal `CategoriesManagerModal` accesible desde el listado de posts y desde el formulario de edición, con creación de categoría y selector de color distintivo.
- **Validación Estricta de Categoría Obligatoria**:
  - Bloqueo en backend (`savePost` en `db-service.ts` y `/api/posts`): deniega la publicación (`status === 'published'`) si el artículo no tiene categoría asignada o si la categoría no existe en la base de datos.
  - Validación en frontend (`post-editor-form.tsx`): alerta al usuario impidiendo el envío si se intenta publicar sin categoría.
  - Bloqueo en listado (`/admin/posts`): el interruptor de estado impide cambiar a "publicado" si el post carece de categoría válida.
- **Preservación y Respaldo de Personalizaciones de Producción**:
  - Sincronización y volcado de todas las configuraciones vivas de producción (`investoil.es`) a `src/data/*.json` (`header.json`, `hero.json`, `appearance.json`, `about.json`, `services.json`, `products.json`, `operations.json`, `problem.json`, `marquee.json`, `seo.json`, `team.json`, `testimonials.json`, `posts.json`, `settings.json`, `leads.json`, `media.json`) para garantizar que ningún cambio realizado por el cliente se pierda tras el despliegue.
- **Verificación Rigurosa con Evidencia Real**:
  - `npm run build`: 52/52 rutas compiladas y optimizadas exitosamente con TypeScript y Next.js.
  - Suite Playwright `test-categories-blog.mjs`:
    - ✓ Botón "Gestionar Blog" localizado en el sidebar y enlazado a `/admin/posts`.
    - ✓ Columna "Categoría" y botón "Gestionar Categorías" verificados en `/admin/posts`.
    - ✓ Modal de categorías abierto, creación de "Transición Energética" persistida y visible.
    - ✓ Intento de publicación de post sin categoría bloqueado con mensaje de error estricto visible.
    - ✓ Guardado de borrador con categoría seleccionada validado.
    - ✓ Filtros de categorías y badges visibles en `/blog`.
  - Batería de seguridad (`pwsh ./scripts/bateria-seguridad.ps1`): superada con resultado 100% aprobado.

### Fase 13: Persistencia Indestructible en PostgreSQL (DATABASE_URL) y Restauración de Medios
- **Diagnóstico de Causa Raíz en Despliegues de Producción**:
  - Al consultar `/api/system-status` en `https://investoil.es`, se constató que la instancia de producción en Coolify inyecta `DATABASE_URL` (conexión directa PostgreSQL), mientras `NEXT_PUBLIC_SUPABASE_URL` no estaba configurado.
  - Como el código verificaba únicamente `isSupabaseConfigured()`, todas las subidas de archivos iban al disco efímero del contenedor Docker (`public/uploads`), destruyéndose ante cada `git push` o rebuild de Coolify.
- **Cliente Nativo de PostgreSQL (`pg-client.ts`)**:
  - Conexión mediante `pg.Pool` con inicialización automática de esquema DDL para:
    `public.media_files`, `public.media`, `public.posts`, `public.categories`, `public.landing_team` y `public.landing_sections`.
- **Ruta Autogenerativa de Medios (`/uploads/[...slug]`)**:
  - Intercepta solicitudes a `/uploads/*`. Si el archivo no existe en el contenedor Docker, consulta la base de datos PostgreSQL (`public.media_files`), reconstruye el archivo en caché y lo sirve con soporte completo para streaming HTTP 206 (Range headers) para videos fluidos sin buffer.
- **Persistencia Binaria en Base de Datos (`/api/upload`)**:
  - Valida formatos permitidos y límites (10 MB para imágenes, 50 MB para videos).
  - Almacena el contenido binario codificado en Base64 en `public.media_files` y registra los metadatos en `public.media`.
  - Diferenciación clara: archivos locales se almacenan en la base de datos; enlaces externos HTTPS guardan su URL directa.
- **Banner de Especificaciones Técnicas y Leyenda de Formatos**:
  - Incorporada leyenda técnica visible en `/admin/media` y en los formularios de edición detallando:
    - Formatos de imagen: JPG, JPEG, PNG, WebP, SVG, GIF (Máx. 10 MB).
    - Formatos de video: MP4, WebM, MOV (Máx. 50 MB).
    - Explicación de persistencia duradera en base de datos PostgreSQL.
- **Persistencia Universal de Secciones (`landing_sections`)**:
  - `content-service.ts` y todas las APIs (`/api/content/*`) leen y escriben en la tabla `landing_sections` de PostgreSQL (`hero`, `appearance`, `header`, `about`, `footer`, `seo`, `sections`, `faq`, `testimonials`, `services`, `products`, `operations`, `problem`, `marquee`, `legales`).
  - Cualquier personalización del cliente en el backoffice queda guardada en la base de datos y no se pierde al hacer nuevos despliegues.
- **Restauración y Corrección de Medios**:
  - Video del hero restaurado a `/videos/hero-background.mp4` con auto-recuperación en caso de error.
  - Fotos del equipo mapeadas a las imágenes oficiales en `/images/team/` con fallback visual SVG a icono de usuario.
  - Corrección de URL rota de Unsplash en el post `suministro-diesel-en590-normativa-bajo-azufre` por una imagen industrial de alta resolución verificada con HTTP 200.
- **Verificación Rigurosa con Evidencia Real**:
  - `npm run build`: 52/52 rutas compiladas y optimizadas exitosamente con Next.js y TypeScript (0 errores).
  - Verificación Playwright (`scripts/verify-media.mjs`):
    - ✓ Video de hero detectado: `/videos/hero-background.mp4`.
    - ✓ 6 fotos del equipo directivo cargadas y visibles al 100%.
    - ✓ 8 imágenes de artículos del blog cargadas con éxito y status 200.
    - ✓ 0 errores en la suite de pruebas.
  - Batería de seguridad (`pwsh ./scripts/bateria-seguridad.ps1`): 100% limpia y aprobada.

### Fase 14: Ajuste Estricto de Límites de Tamaño (2 MB para Imágenes y 10 MB para Videos)
- **Ajuste en Backend (`/api/upload`)**:
  - `MAX_IMAGE_SIZE = 2 * 1024 * 1024` (2 MB).
  - `MAX_VIDEO_SIZE = 10 * 1024 * 1024` (10 MB).
  - Mensajes de error amigables y específicos con cálculo exacto en MB del archivo rechazado.
- **Ajuste en Componentes Frontend y Validaciones Previas**:
  - `media-upload-field.tsx`: constantes `MAX_IMAGE_SIZE_MB = 2` y `MAX_VIDEO_SIZE_MB = 10`, con validación previa en cliente para evitar transmisiones innecesarias.
  - `hero-form.tsx`: límite de validación de video ajustado a 10 MB y leyenda de fondo actualizada.
  - `/admin/media`: banner técnico de especificaciones actualizado a "Imágenes — Máx. 2 MB" y "Videos — Máx. 10 MB".
- **Verificación Rigurosa con Evidencia Real**:
  - Prueba de límites API en Node.js:
    - ✓ Imagen de 3 MB: rechazada con HTTP 400 (`La imagen excede el límite máximo de 2 MB (tamaño actual: 3.00 MB).`).
    - ✓ Video de 12 MB: rechazado con HTTP 400 (`El video excede el límite máximo de 10 MB (tamaño actual: 12.00 MB).`).
    - ✓ Imagen de 500 KB: aceptada con HTTP 200 `Success`.
  - `npm run build`: 52/52 rutas compiladas y optimizadas exitosamente con Next.js y TypeScript (0 errores).
  - Verificación Playwright (`verify-media.mjs`): aprobada al 100% con 0 fallos.
  - Batería de seguridad (`pwsh ./scripts/bateria-seguridad.ps1`): 100% limpia y aprobada.

### Fase 15: Rediseño Compacto de Editor de Posts, Toolbar Tiptap Fija, Fechas Editables y Persistencia Total
- **Rediseño Ergonómico del Editor de Artículos (`post-editor-form.tsx`)**:
  - **Barra de títulos de una sola fila**: Botón de regreso (`<-`), Título (`Editar Artículo`) y botones de acción (`Republicar Noticia (Scraper)`, `Guardar Borrador`, `Publicar Ahora`) organizados en una única fila horizontal superior, liberando valioso espacio vertical para la redacción.
  - **Bloque unificado y compacto**:
    - Campo `Título del post` integrado.
    - Campos `Slug URL` y `Tags (separados por coma)` alineados en dos columnas, cada uno equipado con botón interactivo de **`✨ Sugerir automáticamente`**:
      - Slug: genera un identificador URL canónico sin acentos ni caracteres especiales a partir del título.
      - Tags: analizador semántico que extrae términos clave del contenido y título del post relacionados con hidrocarburos, refino, trading y fletes (Brent, WTI, EN590, Pet Coke, etc.).
    - Campo `Extracto / Resumen` ubicado justo debajo para una visión holística del artículo.
- **Barra de Herramientas de Tiptap Fija (`tiptap-editor.tsx`)**:
  - Toolbar fijada con `sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border shadow-sm` para mantener todos los controles de formato (H1, H2, H3, negrita, cursiva, listas, enlaces, tablas, medios) permanentemente visibles mientras el redactor escribe.
  - Contenedor de contenido de redacción dotado de barra de desplazamiento vertical interna (`overflow-y-auto max-h-[500px] min-h-[350px]`) con barra de desplazamiento estilizada en ámbar.
- **Fecha de Publicación Histórica y Categorías Retroactivas**:
  - Incorporado campo `Fecha de Publicación` con selector nativo `type="datetime-local"` en el panel lateral de detalles de publicación.
  - Modificado `savePost` en `src/lib/db/db-service.ts` para respetar y persistir la fecha enviada en el formulario en lugar de pisarla con `new Date()` cada vez que se guarda o actualiza un artículo.
  - Selector de categorías activado para permitir asociar categorías a artículos antiguos que no tenían categoría asignada.
- **Sincronización Total de Datos y Medios desde Producción**:
  - Script `scripts/sync-prod.mjs` desarrollado para descargar e incorporar los 8 artículos de producción en `src/data/posts.json`, los 6 miembros del equipo en `src/data/team.json`, y todas las imágenes reales subidas por el usuario en `public/uploads/` y `nextjs-opc-webapp/public/uploads/`.
- **Previsualizaciones Fluidas y Límite de Video Ampliado a 100 MB**:
  - `media-upload-field.tsx` enriquecido con indicador de carga `Loader2` y transiciones suaves (`onLoad`, `onLoadedData`), eliminando la apariencia de recuadros negros vacíos durante la descarga de imágenes.
  - Límite de video ampliado a 100 MB (`MAX_VIDEO_SIZE = 100 * 1024 * 1024`) en frontend y backend (`/api/upload`) para permitir la subida de videos corporativos pesados de alta calidad.
  - Ruta de medios `/uploads/[...slug]` validada con soporte para peticiones `HEAD` y `HTTP 206 Partial Content` (streaming por rangos).
- **Verificación Rigurosa con Evidencia Real**:
  - `npm run build`: 52/52 rutas compiladas y optimizadas exitosamente con Next.js y TypeScript (0 errores).
  - Verificación visual Playwright E2E (`tests/verify-editor-e2e.mjs`):
    - ✓ Barra superior en 1 sola fila comprobada visualmente en captura.
    - ✓ Bloque integrado con botones de sugerencia automática de slug y tags verificado.
    - ✓ Toolbar fija (`sticky top-0`) de Tiptap y scroll interno operativo.
    - ✓ Selector de fecha editable verificado con valor histórico `24/09/2026 23:04`.
    - ✓ Galería de posts con todas las imágenes sincronizadas y nítidas.
  - Batería de seguridad (`pwsh ./scripts/bateria-seguridad.ps1`): 100% limpia y aprobada.

### Fase 16: Rediseño de Proveedores de IA, Editor Compacto, Radar de Noticias Completo y Unificación de Eslogan
- **Rediseño Integral de Proveedores de IA (`/admin/settings/ai`)**:
  - Reemplazo del diseño anterior de tarjetas paralelas por la arquitectura unificada vertical solicitada: formulario superior "Agregar credencial de plataforma" y lista inferior compacta.
  - Formulario superior con selector horizontal tipo pills de 11 proveedores preconfigurados (Google AI Studio, Anthropic, OpenAI, OpenRouter, Nvidia NIM, Groq, DeepSeek, Mistral, Together AI, Ollama, Personalizado), acordeón para pegar código/curl, estilo de API, URL base, API Key con botón para alternar visibilidad ("Ver"), modelo por defecto, costo por 1M tokens y visibilidad (Pública / Privada).
  - Lista inferior compacta con contador dinámico ("X modelos configurados · X responden"), botón "Probar conexión de todos", selector por pestañas de categoría (TEXTO, AUDIO, IMAGEN) y filas individuales con estado de respuesta, modelo, badges de plataforma/categoría, subtexto y botones de acción rápida (Ver clave, Probar conexión, Privada/Pública, Activar, Quitar).
- **Editor de Artículos Ergonómico y Compacto (`post-editor-form.tsx`)**:
  - Eliminación de etiquetas redundantes superiores (`Título del post *`, `Slug URL *`, `Tags`, `Extracto / Resumen`, `Contenido del artículo`), utilizando placeholders en mayúsculas como fondo para elevar visualmente todo el formulario y maximizar el espacio útil de redacción.
  - Reemplazo del cuadro de texto estático gigante de especificaciones en `MediaUploadField` por iconos de tooltip interactivo `ⓘ` discretos junto al encabezado de los campos de medios, desplegando formatos permitidos (Imágenes JPG/PNG/WebP/GIF máx. 2MB, Videos MP4/WebM/MOV máx. 10MB/100MB) y nota de persistencia en base de datos.
  - Sincronización reactiva del editor Tiptap (`tiptap-editor.tsx`) mediante `useEffect` con `editor.commands.setContent(content)`, permitiendo cargar instantáneamente el artículo completo al republicar noticias o abrir borradores.
- **Agente de Noticias AI con Artículos Completos y Fuentes Oficiales (`/api/news-agent`, `news-agent-modal.tsx`)**:
  - Incorporación de las fuentes internacionales solicitadas: `Google News` (`news.google.com`), `BBC Mundo` (`bbc.com/mundo`), `Euronews en Español` (`es.euronews.com`), `Agencia EFE` (`efe.com/mundo`), `Reuters Energy` y `S&P Global Platts`.
  - Artículos completos y estructurados con múltiples párrafos de análisis comercial, técnico y regulatorio sobre crudos (Brent, WTI, Merey 16), refinados (EN590, Jet A-1, GNL, Pet Coke) y logística marítima (VLCC).
  - Enlace canónico de la fuente original inyectado automáticamente al pie del post (`<p><strong>Fuente original:</strong> <a ...>Nombre Fuente</a></p>`) para máxima transparencia editorial.
  - Filtros rápidos por fuente en el modal del Agente de Noticias.
- **Solución Definitiva al Fondo de Hero y Previsualizaciones (`hero-section.tsx`, `hero-form.tsx`)**:
  - Previsualización inmediata a 0 ms (`URL.createObjectURL(file)`) en el momento en que el usuario selecciona una imagen o video local en el formulario del hero, sin esperar la respuesta de red.
  - Detección infalible de tipo de medio por extensión (`.mp4`, `.webm`, `.mov`, `.png`, `.jpg`, `.webp`) y MIME type en `HeroSection`, eliminando dependencias de flags desacoplados.
  - Supresión del handler `onError` destructivo que reemplazaba el video personalizado del usuario por el video por defecto ante latencias de búfer en red.
  - Sincronización en caliente y fallback persistente en `localStorage` (`investoil_hero_config`) para visualización instantánea entre deploys.
- **Protocolo de Ubicación y Respuestas en el Orbe AI (`PublicAiOrbe`, `ai-client.ts`)**:
  - Sanitizador `cleanMarkdownResponse` para eliminar caracteres crudos de markdown (`#`, `**`, `*`, `>`), asegurando respuestas en texto limpio y legible.
  - Protocolo estricto de ubicación geográfica: mención exclusiva a las ciudades de operación ("Houston, Madrid y Bogotá"), sin divulgar direcciones físicas ni teléfonos en el chat público, invitando al formulario de contacto web para coordinar reuniones directas y canalizando comunicaciones formales a `trading@investoil.es`.
- **Erradicación de "Mesa de Trading" y Eslogan Oficial**:
  - Eslogan oficial unificado: **"Petroleum and Derivates Markets"**.
  - Posicionamiento corporativo: **"mercado del petróleo y sus derivados como facilitadores entre compradores y vendedores de primer orden"**.
  - Eliminación absoluta de términos como "Mesa de Trading" y "Mesa de Operaciones" en toda la plataforma (usuarios, blog, contacto, traducciones i18n, pie de página y metadatos).
- **Verificación Rigurosa con Evidencia Real**:
  - `npm run build`: 53/53 rutas compiladas y optimizadas exitosamente con Next.js y TypeScript (0 errores).

### Fase 17: Cascada de Salto Automático entre Modelos de IA y Red de Contingencia Institucional
- **Arquitectura de Conmutación por Fallo en Cascada (`ai-client.ts`)**:
  - Implementación del mecanismo de salto automático e ininterrumpido entre proveedores de IA: si el modelo en curso falla (timeout, error de conexión, límite de tasa 429 o error HTTP), el sistema salta al siguiente modelo configurado disponible.
  - Priorización del motor activo: el modelo marcado como activo (`isActiveEngine` o `activeModelId`) encabeza la cola de ejecución; los demás modelos activos con credenciales válidas forman la secuencia de relevo.
- **Resolución Flexible de Credenciales (`resolveApiKey`)**:
  - Soporte transparente para claves almacenadas en el panel (`/admin/settings/ai`) y variables de entorno del servidor (`OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `NVIDIA_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`).
  - Descarte automático de modelos inactivos o sin clave configurada para evitar latencias innecesarias.
- **Control de Timeout Estricto por Proveedor**:
  - Cada solicitud cuenta con un límite de tiempo de 12 segundos gestionado por `AbortSignal.timeout(12000)` / `AbortController`.
  - Ante un retraso o bloqueo del proveedor, se interrumpe de forma controlada y se delega de inmediato al siguiente modelo disponible.
- **Compatibilidad Multi-Arquitectura**:
  - Integración nativa para Anthropic Claude, Google Gemini y motores compatibles con la API de OpenAI (OpenRouter, DeepSeek, NVIDIA NIM, Groq, Mistral, Together AI, Ollama y endpoints personalizados).
- **Contingencia Cero-Fallas (Base de Conocimiento Calibrada)**:
  - Si todos los modelos externos sufren interrupciones o no disponen de claves activas, el sistema conmuta instantáneamente al motor institucional de contingencia (`generateKnowledgeBaseResponse`).
  - Proporciona respuestas precisas y oficiales sobre la sede en Delaware USA, directivos, especificaciones técnicas (ASTM D1655, EN590, Pet Coke), procedimientos KYC/ICPO y canalización hacia contacto humano (`trading@investoil.es`).
- **Verificación Rigurosa con Evidencia Real**:
  - `npm run type-check`: 0 errores de TypeScript.
  - `npm run build`: 53/53 páginas compiladas y optimizadas con éxito.
  - Batería de seguridad (`pwsh ./scripts/bateria-seguridad.ps1`): 100% limpia y aprobada (0 secretos, 0 vulnerabilidades npm).

### Fase 21: Correos Corporativos Oficiales (info@ y business@), Opacidad en Tarjeta Hero, Enlace Directo a Artículos y Preview de Video, Memoria Persistente de Usuario y Rol Setter B2B para Oli, y Páginas Legales Bilingües Exhaustivas
- **Canalización Oficial de Correos Corporativos**:
  - Erradicación total y definitiva de `trading@investoil.es` y `contacto@investoil.es` en todo el código fuente, componentes, fallbacks, formularios y base de datos.
  - Distribución estricta de canales:
    - `info@investoil.es`: Consultas preliminares, atención institucional, solicitudes generales, avisos de privacidad y reporte de actividades sospechosas o accesibilidad.
    - `business@investoil.es`: Operaciones directas, contratos de compraventa (SPA), fletamentos, mesa de trading, recepción de ICPO bancarizadas y escalamiento comercial.
- **Control de Opacidad en Tarjeta Hero & Logotipo (`hero-section.tsx`, `hero-form.tsx`)**:
  - Incorporación del campo `card_opacity?: number` en `HeroCardCustomization`.
  - Slider interactivo en `/admin/content/hero` que regula la opacidad de la tarjeta de 0% (totalmente transparente para lucir el fondo multimedia de video o imagen) a 100% (sólido).
  - Cálculo dinámico de color RGBA con preservación de resplandor glow y visualización en tiempo real.
- **Límite de Video Local a 20 MB y Manejo de Enlaces Externos**:
  - Validación tanto en cliente (`MediaUploadField`, `MediaPickerModal`) como en servidor (`/api/upload`) fijando el tope de videos alojados en disco local a 20 MB.
  - Para videos más pesados o fuentes externas, se fomenta el uso de enlaces de internet con vista previa responsiva sin sobrecargar el almacenamiento.
- **Noticias Republicadas con Enlace Directo al Artículo Original, Reducción de Imagen y Preview de Video (`news-republish`, `post-editor-form.tsx`, `blog/[slug]`)**:
  - En `/api/news-republish`: extracción y validación estricta de `canonicalUrl` y `sourceUrl` asegurando que apunten directamente a la URL profunda del artículo y nunca a la página de inicio o sección genérica.
  - Detección automática de video en la noticia externa (OpenGraph video, Twitter player o iframes de YouTube/Vimeo) y paso al editor para visualización en modo preview con `preload="none"` y `poster` sin descargas pesadas.
  - Verificación del tamaño de la imagen original en servidor; en el diálogo de importación (`NewsRepublishDialog`), compresión automática con Canvas del navegador a JPEG optimizado (< 2 MB) antes de integrarlo en la biblioteca multimedia de la plataforma.
  - Al pie del artículo en `/blog/[slug]` y en el badge `NewsRepublishBadge`: tarjeta destacada con atribución y botón directo "Leer artículo original completo en [Fuente]" con `target="_blank" rel="noopener noreferrer"`.
- **Memoria Persistente de Usuario y Rol de Setter Comercial B2B en Oli (`ai-user-memory.ts`, `/api/ai/chat`, `ai-client.ts`, `public-ai-orbe.tsx`)**:
  - Creación de `src/lib/ai/ai-user-memory.ts` con persistencia dual (PostgreSQL tabla `ai_user_memories` y archivo local `src/data/ai-user-memories.json`).
  - Identificador persistente `sessionId` en `localStorage` (`investoil_oli_session_id`) para reconocer al cliente entre recargas de página o futuras visitas.
  - Extracción automática de perfil: nombre, empresa, productos requeridos (EN590, Jet A-1, Merey 16, Pet Coke), volumen estimado (MT/BBL), puerto/Incoterm (FOB/CIF) y etapa de cualificación.
  - Instrucción como Setter Comercial B2B inyectada en el prompt de sistema: acoger calurosamente, detectar el idioma y responder en el mismo idioma, orientar sobre el procedimiento oficial (ICPO + BCL) y, una vez cualificado el prospecto o ante negociación de precios y SPA, canalizar de forma protocolar a un humano en `business@investoil.es`.
- **Ampliación Exhaustiva de las 5 Páginas Legales Bilingües (ES / EN) estilo Multinacional Energética (`legal-pages.json`, `legal-page-view.tsx`)**:
  - Redacción exhaustiva inspirada en los estándares de las grandes comercializadoras energéticas internacionales:
    1. `/terminos-y-condiciones`: Exención de oferta pública en web, exención de precios spot de índices (Platts/Argus/Brent), marco Incoterms® 2020 (FOB/CIF/TTO), estricto cumplimiento KYC/AML y prohibición de operar con entidades sancionadas por OFAC/ONU/UE, política contra intermediarios no autorizados y brokers en cadena, cláusula de fuerza mayor marítima y geopolítica, y jurisdicción Delaware.
    2. `/aviso-de-privacidad`: Tratamiento de datos para operaciones B2B y debida diligencia de contrapartes, base jurídica y derechos de los titulares.
    3. `/politica-de-cookies`: Cookies técnicas, de seguridad y de sesión para el asistente Oli sin rastreo conductual publicitario.
    4. `/alerta-de-fraude-y-estafas`: Advertencia sobre modalidades de estafa comunes en el sector (estafas de tarifas de tanques TSA, POP falsificados, ofertas irreales de descuento), canales de verificación obligatorios y canal de denuncia.
    5. `/accesibilidad`: Compromiso formal con las pautas WCAG 2.1 Nivel AA, mediciones de contraste tipográfico auditadas y navegación asistida por teclado.
  - Componente `LegalPageView` con selector interactivo de idioma `[ES (Español) | EN (English)]`, actualización reactiva y contraste accesible medido (WCAG AA).
- **Verificación Rigurosa con Evidencia Real**:
  - `npm run type-check`: 0 errores de TypeScript.
  - `npm run build`: 53/53 páginas compiladas y optimizadas exitosamente con Next.js y TypeScript (0 errores).
  - Batería de seguridad (`pwsh ./scripts/bateria-seguridad.ps1`): 100% limpia y aprobada (0 secretos, 0 dependencias vulnerables).

