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

---

## 3. Lecciones Aprendidas y Decisiones de Arquitectura
1. **Compatibilidad de React 18 en Next.js 14**: `useActionState` pertenece a React 19; en React 18 se debe emplear `useTransition` combinado con `useState` para el manejo reactivo de Server Actions sin errores de renderizado estático.
2. **Exclusión de Cache en Escáneres de Seguridad**: Los archivos de caché de compilación (`tsconfig.tsbuildinfo`) deben excluirse del escaneo de credenciales en `scripts/bateria-seguridad.ps1` para evitar falsos positivos con hashes o identificadores binarios.
3. **Resiliencia de Contenidos (Fallback Híbrido)**: La capa `content-service.ts` recurre automáticamente a los valores por defecto si Supabase no está conectado o las tablas no han sido migradas en local, impidiendo pantallas en blanco.
4. **Visualización de Presencia Física Internacional**: Estructurar las sedes en dos filas diferenciadas (Fila 1: Ciudad y País; Fila 2: Dirección física y rol de la sede) aumenta significativamente la credibilidad institucional en trading petrolero y facilita la lectura rápida para contrapartes y bancos internacionales.
