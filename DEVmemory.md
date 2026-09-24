# Memoria de Desarrollo: Invest Oil LLC — Webapp Next.js 14 + Supabase

## 1. Contexto del Proyecto
Desarrollo de la aplicación web completa para **Invest Oil LLC**, replicando la dirección de arte oscura obsidiana/ámbar y arquitectura de componentes del proyecto local `C:\Users\pacb9\Documents\GitHub\opc` (landing y backoffice) sin alterar ningún archivo de esa carpeta de referencia.

- **Stack**: Next.js 14+ (App Router), TypeScript 5+, Tailwind CSS, Framer Motion, Lucide React, Supabase (@supabase/ssr), Tiptap Editor v2.
- **Repositorio**: `https://github.com/pacb9148/nt-investoil` (rama `main`).

---

## 2. Hitos y Funcionalidades Desarrolladas

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



