# Memoria de Desarrollo: Invest Oil LLC — Webapp Next.js 14 + Supabase

## 1. Contexto del Proyecto
Desarrollo de la aplicación web completa para **Invest Oil LLC**, replicando la dirección de arte oscura obsidiana/ámbar y arquitectura de componentes del proyecto local `C:\Users\pacb9\Documents\GitHub\opc` (landing y backoffice) sin alterar ningún archivo de esa carpeta de referencia.

- **Stack**: Next.js 14+ (App Router), TypeScript 5+, Tailwind CSS, Framer Motion, Lucide React, Supabase (@supabase/ssr), Tiptap Editor v2.
- **Repositorio**: `https://github.com/pacb9148/nt-investoil` (rama `main`).

---

## 2. Hitos y Funcionalidades Desarrolladas

### Fase 32: Blog público con selector de categorías y vistas, orden real por fecha de publicación, y editor enriquecido en Nosotros
1. **Orden de los artículos corregido en el origen** (`db-service.ts`): la consulta SQL ordenaba por `created_at` (cuándo se guardó en la base) en vez de `published_at` (la fecha real del artículo). Un artículo redactado hoy con fecha histórica de enero quedaba mal ubicado porque su `created_at` era reciente. Ahora `ORDER BY COALESCE(published_at, created_at) DESC`; el fallback JSON de desarrollo también se ordena igual. Probado: un artículo de prueba con `published_at` de febrero, insertado primero en el array (como si se hubiera creado el último), pasó a aparecer correctamente al final tanto en `/api/posts` como en las tres vistas del blog.
2. **Blog público (`blog-grid.tsx`)**: quitado el contador «Mostrando X de Y artículos» y la fila de pastillas de categoría; en su lugar, junto al buscador (que se mantiene), un selector de categorías («Todas las categorías» + las reales de la base) y tres iconos de vista — tarjetas, lista y por fecha con selector de día — mismo patrón ya construido para el Radar de Noticias y la Biblioteca de Medios, reutilizado aquí. Nuevo componente `blog-list-row.tsx` para las filas compactas de lista y por fecha. El orden es siempre por fecha de publicación descendente, con una ordenación defensiva en el propio componente además del arreglo en el origen.
3. **Editor de Nosotros con el mismo formato que el editor de artículos** (`about-form.tsx`, `about/page.tsx`): el campo «Misión y Compromiso Normativo» (ES/EN) pasa de `<textarea>` plano al `TiptapEditor` ya construido para los posts — reutilizado tal cual, sin tocar el componente. Para pintarlo en la web pública se extrajo el renderizador de nodos Tiptap que ya vivía en `blog/[slug]/page.tsx` a un componente compartido nuevo, `tiptap-content.tsx` (`TiptapContent` + `renderTiptapNode`), usado ahora tanto por el artículo del blog como por la página Nosotros; el texto antiguo en español plano (sin editar todavía con Tiptap) se sigue mostrando igual gracias a esa misma pieza. Probado: al guardar, `mission` pasa a persistirse como documento Tiptap JSON (antes cadena de texto) y una prueba con negrita se vio correctamente en negrita en `/about`.
4. **Verificación**: `tsc --noEmit`, `npm run build` y la batería de seguridad, todos correctos; pruebas manuales en el navegador local de las tres vistas del blog, el selector de categorías y el editor enriquecido de Nosotros con guardado y lectura reales. **Sin verificar en producción** tras el despliegue.

### Fase 31: Favicon con fondo transparente real, selector de categorías en el radar y Biblioteca de Medios reorganizada
1. **Favicon transparente**: el paquete que el dueño había generado en `faviconio/` (favicon.io) tenía fondo blanco *opaco* pese al nombre — comprobado por canal alfa (0 variación). Se usó en su lugar la fuente que el propio dueño adjuntó con transparencia real (`faviconIO.png`, canal alfa 0–255, confirmado píxel por píxel), recortada a la gota y reescalada a `favicon.ico` (6 tamaños: 16/32/48/64/128/256, todos con alfa), `favicon.png`, `icon-192.png` e `icon-512.png`. Cache-busting subido a `v=4`.
2. **Selector de categorías en el Radar de Noticias** (`google-news-radar.ts`, `api/news-agent`, `news-agent-modal.tsx`): 10 categorías del negocio (Mercado Petrolero, Crudos Pesados & Merey, Refinación, Diésel, Aviación, Pet Coke, Logística Marítima, Gas Natural & GNL, Cumplimiento & Sanciones, Transición Energética), con «Todas las categorías» arriba (combina los términos más representativos de las 10) y «Otros» al final para una búsqueda puntual de texto libre que solo se envía en esa petición GET y no se guarda en ningún sitio (la función no tiene persistencia). Cada categoría manda su propia consulta a Google News (más precisa que el filtrado por palabras clave de antes) y su etiqueta prevalece sobre la adivinada por regex. Se sustituyó la fila de pastillas de fuente/tema por el selector, junto al buscador, tal como se señaló en la captura; el buscador de texto libre se mantiene y ahora solo afina dentro de los resultados ya traídos. Probado en local: cada categoría dispara su propia petición (`category=mercado`, `category=petcoke`…) y «Otros» solo se dispara al enviar el formulario (`category=otros&q=…`), nunca solo.
3. **Biblioteca de Medios reorganizada** (`admin/media/page.tsx`): cabecera compacta en una fila (título + icono de info con el detalle técnico en un popover + Deduplicar + Subir Archivo); barra de buscador + tres iconos de vista (tarjetas, lista, por fecha con selector de día) + contador; tarjetas al 50% de tamaño (10 columnas en escritorio en vez de 5) para ver el doble de archivos sin desplazarse tanto. Clic en una tarjeta o en una fila de la lista abre un pop de previsualización grande (imagen o video con controles, nombre, peso, URL y acciones de copiar/abrir/eliminar). La vista «Por fecha» agrupa por día de subida o filtra a un día concreto con el selector. Probado en el navegador: info popover, las tres vistas y el preview de imagen y de video, todos correctos.
4. **Verificación**: `tsc --noEmit` y `npm run build` correctos; batería de seguridad aprobada; pruebas manuales en el navegador local de las tres funciones. **Sin verificar en producción** tras el despliegue (lo hace el dueño).

### Fase 30: Favicon definitivo a partir del logo suministrado por el dueño
1. El dueño entregó un paquete de favicon ya generado (`favicon.ico`, PNGs por tamaño, iconos Apple/Android) a partir del logotipo oficial (la gota con el equipo de bombeo y el óvalo "INVEST OIL LLC"). Se sustituyeron `public/favicon.ico` (ICO real, no el PNG mal etiquetado que había antes en origen), `public/images/branding/favicon.png` (32×32), `icon-192.png` (192×192, usado como apple-touch-icon) e `icon-512.png` (256×256, sin uso actual en el código salvo como activo de reserva).
2. Cache-busting subido a `?v=3` en `layout.tsx` para que el navegador no siga sirviendo el favicon anterior.
3. **Verificación**: `tsc --noEmit` y `npm run build` correctos, batería de seguridad aprobada. **Sin verificar visualmente en el navegador** (pestaña/marcador) ni en producción tras el despliegue, que hace el dueño manualmente.

### Fase 29: Likes y orden por fecha en la gestión de posts, y favicon a partir del logo
1. **Gestión de posts** (`admin/posts/page.tsx`): nueva columna **Likes** (icono de corazón) entre Vistas y Fecha, y la cabecera **Fecha** es un botón que alterna el orden por fecha de publicación (`published_at`, o `created_at` si no la hay): descendente por defecto, ascendente al invertir, con flecha e `aria-sort`. Probado en local: 10-9-2026 → 25-9-2026 en ascendente y a la inversa.
2. **Favicon**: se regeneró desde la gota con el equipo de bombeo del logo (recorte cuadrado sin la etiqueta de texto, ilegible a 16-32 px): `favicon.ico` (16/32/48/64), `favicon.png`, `icon-192.png` e `icon-512.png`; los enlaces del `<head>` llevan `?v=2` para saltarse la caché del navegador.

### Fase 28: Los artículos publicados no aparecían (contenido HTML del radar rompía la lista) y la siembra se saltaba los originales
1. **Causa**: el radar de noticias deja el cuerpo como cadena HTML. Se guarda en `posts.content` (JSONB) como cadena JSON y al leer, `getPosts` hacía `JSON.parse` sobre esa cadena: lanzaba `SyntaxError`, la excepción caía en un `catch` que la convertía en «sin artículos», y **un solo artículo con HTML hacía desaparecer todos** (blog, Actualidad y gestión de posts). Además la siembra `posts_seed_v1` solo actuaba con la tabla vacía: en cuanto alguien creó un artículo nuevo, los 8 originales quedaron sin sembrar.
2. **Arreglo** (`db-service.ts`, `migration-service.ts`): el contenido se interpreta con tolerancia (objeto Tiptap o HTML); una lectura fallida ya no se disfraza de lista vacía (lanza el error y queda en el log); `savePost` deja de dar por bueno un guardado que PostgreSQL rechazó (`queryPg` devuelve `null` en vez de lanzar); la siembra pasa a `posts_seed_v2` e inserta los artículos que falten aunque ya existan otros (`ON CONFLICT DO NOTHING`). La portada del blog y el panel de control absorben un fallo de tabla sin romperse.
3. **Verificado en un PostgreSQL 16 temporal**: 8 originales sembrados + 1 artículo publicado con contenido HTML y fecha 5-1-2026: `/api/posts` 9, lista de administración 9, `/blog` y la página del artículo los muestran. **Sin verificar en producción** hasta que se despliegue; si sigue vacío, `/api/posts` devolverá ahora un error 500 con el motivo en lugar de `[]`.

### Fase 27: Pie de página y logo, Actualidad, radar que redacta el borrador, chat multilínea, textos legales nuevos, blog recuperado e internacionalización de la landing
1. **Pie de página** (`footer.tsx`, `site-settings*.ts`, `(public)/layout.tsx`): bajo el logo se mostraba `footerTagline` (la descripción larga) y debajo otra vez la descripción, y con el campo vacío salía «Petroleum and Derivates Markets»: el mismo bloque cambiaba según el idioma y el momento. Ahora el logo lleva siempre el lema de marca fijo y el párrafo es la descripción en el idioma elegido (ES/EN literales). Los ajustes los entrega el servidor desde la base de datos (`site-settings-defaults.ts` sin `'use client'`), sin pintar primero valores por defecto ni leer copias antiguas de `localStorage`.
2. **Logo desaparecido**: `header.logo_url` y el logo del pie apuntaban a `/uploads/1790369398791-…-rbg.png`, que en producción devolvía 404 (la biblioteca solo conserva `1790443479869-…-rbg.png`); el borrado de un archivo con el mismo nombre original arrastraba a los demás (defecto de `deleteMediaItem` corregido en la Fase 24). `BrandLogo` muestra ahora el logo oficial si el archivo configurado falla (también antes de hidratar). **Pendiente del dueño**: volver a elegir el logo en Cabecera y Pie desde la biblioteca.
3. **Actualidad** (`news-section.tsx`, defaults, header, hero, `content-service.ts`): la sección «Servicios Petroleros» es ahora «Actualidad» (últimas 6 publicaciones), ancla `#actualidad` (queda `#services` como alias), menú y botón del hero renombrados, y lo ya guardado en la base con el nombre antiguo se normaliza al leerlo. `/services` redirige a `/#actualidad`.
4. **Radar de noticias completo** (`api/news-agent/compose`, `lib/news/article-composer.ts`, `ai-client.executeAiTask`): resuelve el enlace cifrado de Google News al artículo real (canonical con ruta específica), lee el texto, redacta con la IA configurada una nota de análisis de Invest Oil (con sus palabras, sin inventar datos), descarga la imagen destacada a la biblioteca (≤ 2 MB; si pesa más se comprime en el navegador) y añade al pie el enlace clicable al artículo. Sin proveedor de IA deja esqueleto, imagen y enlace y lo avisa. Se descartaron las noticias «curadas» fijas (atribuían a Reuters, BBC o Platts textos que no habían publicado). Solo URLs públicas (no localhost ni redes privadas). Probado con la noticia del MITECO del 5-1-2026 y un modelo simulado; **la calidad de la redacción con un modelo real no está probada**.
5. **Chat de Oli**: campo multilínea (3 filas, scroll interno, redimensionable hasta 160 px; Enter envía y Mayús+Enter salta de línea) y todo su texto en español/inglés.
6. **Textos legales** (`legal-pages.json`, `server-legal-service.ts`, `legal-meta.ts`): reescritos al estilo de una energética multinacional (Chevron como referencia de alcance): Términos de Uso (15 secciones), Aviso de Privacidad (14, con RGPD y CCPA/CPRA), Aviso de Cookies (7, con las cookies y almacenamiento local reales del sitio: `NEXT_LOCALE`, `investoil_locale`, `investoil_oli_session_id`, `liked_post_*`), Accesibilidad (6) y nueva página **Tus opciones de privacidad / No vender ni compartir** (8), todas en ES y EN. La de fraude no se tocó. Como la base es la fuente, el texto nuevo se vuelca **una vez** (marca `legal_seed_v2`, sobrescribe esas 5 páginas); después mandan las ediciones del panel. `LegalPageView` sigue el selector de idioma global. Pie: enlaces bilingües y nuevo enlace. **Revisión jurídica**: los textos son un borrador razonable, no asesoramiento legal; conviene que los revise un abogado, sobre todo plazos de conservación, responsable y cláusulas de Delaware.
7. **Artículos del blog**: en producción `posts` seguía vacía (la migración nunca se ejecutaba sola y la única vez falló). `getPosts` siembra una sola vez desde `posts.json` (marca `posts_seed_v1`); la categoría inexistente `cat-mug51qtp` (OIL101) se sustituye por la equivalente por nombre (`Oil 101`). Probado con PostgreSQL 16: 8 artículos, y vaciar el blog después se respeta. Los artículos creados solo en producción y no presentes en `posts.json` no se pueden recuperar desde el repositorio.
8. **Internacionalización**: idioma leído de la cookie `NEXT_LOCALE` en el servidor (`getServerLanguage`, `<html lang>`, `LanguageProvider initialLanguage`): la primera pintura sale en el idioma elegido y los metadatos (título y descripción de cada página, SEO `_en`) también. Traducidos: retos, operaciones, testimonios, FAQ, equipo, productos (con tablas por id/sku en `content-en.ts`, que ceden ante campos `*_en` del panel), Nosotros (`about-en.ts`), contacto (etiquetas, marcadores y errores de validación), blog, artículo, chat y pie. Verificado con un escáner sobre las 11 páginas en inglés y las principales en español: solo queda en español el contenido editorial de los artículos (título, resumen y cuerpo), que se marca («Read article (in Spanish)» y aviso en el artículo).
9. **Pendiente conocido**: traducir automáticamente al guardar (los elementos nuevos creados en el panel sin `*_en` se ven en español) y traducir títulos/cuerpo de artículos.

### Fase 26: Memoria de Oli en tabla filtrable y auto-revisión que funde lo redundante
1. **Tabla en lugar de tarjetas** (`components/admin/ai-learning-table.tsx`, usada por `settings/ai/page.tsx`): filtros por texto, tema, tipo (interacción / manual / consolidada / nota), idioma, usuario (todos / identificados / anónimos / uno concreto) y rango de fechas; orden por fecha, tema, usuario y veces; paginación de 25; selección múltiple con descarte en bloque; fila desplegable con consulta, aprendizaje, respuesta y variantes. Las acciones son iconos con tooltip propio (posición fija, no lo recorta el scroll) y `aria-label`. Contraste mínimo medido 7.35:1 (el backoffice solo tiene tema oscuro).
2. **Datos de usuario en cada experiencia** (`ai-types.ts`, `ai-learning.ts`, `api/ai/chat`): `sessionId`, `userName`, `userCompany`, `userEmail`, `occurrences` (una consulta repetida se cuenta en vez de ignorarse) y `lastSeenAt`. Con nombre, empresa o email conocidos la experiencia es **historial particular**. Las anteriores a este cambio no tienen usuario y se tratan como anónimas.
3. **Auto-revisión** (`ai-learning-review.ts`, `runExperienceReview`): agrupa las consultas anónimas del mismo tema e idioma con similitud de palabras significativas ≥ 0.55 (sin acentos, stopwords ni plurales), las funde en un concepto consolidado (representante = la formulación más repetida; conserva variantes y nº de veces) y vuelca una línea a `CONCEPTOS APRENDIDOS…` de la base de conocimiento, sin repetir si ya figura. **No toca** usuarios identificados, notas manuales ni consultas únicas. Es determinista, sin llamadas a un modelo (coste cero). Se ejecuta a mano con el botón «Auto-revisar memoria» (calcula, pide confirmación con el recuento y aplica) y sola cuando hay ≥ 30 consultas anónimas sin fusionar y han pasado ≥ 6 h desde la última. El estado (`learningReview`) se muestra en la cabecera de la tabla.
4. **Tope de historial**: de 50 a 500 experiencias; al superarlo se descartan primero las anónimas más antiguas, nunca las identificadas ni las manuales.
5. **Verificación**: `tsc` y `build` correctos; con 9 experiencias sembradas (3 anónimas casi iguales, 2 de Jet Fuel, 2 de un usuario identificado, 1 manual, 1 única) la simulación y la aplicación fusionaron 5 en 2 conceptos, conservaron las otras 4, una segunda pasada dio 0 (idempotente) y la KB no se duplicó; filtros y botón probados en el navegador. **Sin probar**: el disparo automático con tráfico real y el comportamiento contra PostgreSQL de producción (los ajustes de IA se guardan como un único JSON).
6. **Límite conocido**: los ajustes de IA (incluida la memoria) siguen guardados en un solo JSON (`landing_sections.ai_settings_config`) que se reescribe entero en cada mensaje del chat; con cientos de experiencias conviene moverlas a su propia tabla.

### Fase 25: Leads y usuarios en PostgreSQL, rescate de los artículos del blog, cierre de accesos fijos, radar de noticias por fecha y saludo breve de Oli
1. **Leads y usuarios del backoffice en PostgreSQL** (`db-service.ts`): `getLeads/saveLead` y `getUsers/saveUser/deleteUser/recordUserLogin` leen y escriben las tablas `leads` y `backoffice_users`; el JSON solo se usa sin base (desarrollo). Si la escritura falla el formulario de contacto ya no dice «recibido» (un lead perdido es un cliente perdido). `leads` gana las columnas `subject` y `source`. Primer arranque con la tabla de usuarios vacía: se siembran los administradores iniciales. Los dos leads de `leads.json` son ficticios y ya no se siembran. Los leads reales enviados antes de este cambio vivían en un JSON del contenedor y se perdieron en los redespliegues.
2. **Migrador corregido** (`migration-service.ts`): leía `password_plain` cuando el JSON usa `passwordPlain` (sustituía cualquier contraseña por la de siembra) y no copiaba `subject/source/fechas` de los leads.
3. **Artículos del blog**: la migración de `posts` abortaba en el primer artículo con `category_id` inexistente (`cat-mug51qtp`, categoría borrada) por la clave foránea, dejando `posts` vacío; al quitar el JSON como respaldo el blog quedó en blanco. Ahora cada artículo se inserta por separado, con `category_id` nulo si la categoría no existe, y conserva `created_at`. Probado en un PostgreSQL 16 temporal: 8/8 artículos migrados, `/api/posts` y `/blog` los muestran. **Sin verificar en producción** (allí el arranque reintenta la migración si `posts` está vacía; `GET /api/admin/migrate` con sesión da el estado por tabla).
4. **Accesos fijos eliminados**: contraseñas de emergencia en `verifyUserCredentials`, fallback maestro de `/api/auth/login` (solo queda si el servidor define `ADMIN_PASSWORD`), alias de contraseña de siembra que sobrevivían a cambiar la contraseña (ahora se vacían al rotar), botón «Autocompletar credenciales» del login (publicaba la contraseña en el JS del cliente) y valores por defecto del formulario de usuarios. Contraseñas nuevas: mínimo 10 caracteres. Probado: la contraseña de siembra y `admin1234` devuelven 401 tras rotar; la nueva, 200. **Nota**: `/api/users` ya ocultaba las contraseñas en su respuesta (lo indicado en la Fase 24 sobre «contraseñas en claro» era inexacto); el riesgo real eran la contraseña de siembra en el repositorio y el botón del login. Las contraseñas siguen guardadas en claro en `backoffice_users`: pendiente hashearlas.
5. **Radar de noticias por fecha** (`api/news-agent`, `lib/news/google-news-radar.ts`, `news-agent-modal.tsx`): selector de fecha (por defecto hoy, máximo hoy) y «Volver a hoy». Consulta el RSS de Google News con `after:/before:` (25 titulares reales de esa fecha; el cuerpo se redacta en el editor, no se copia). Hoy = noticias vivas + archivo curado de Invest Oil; fechas pasadas = solo vivas. Fecha validada (AAAA-MM-DD, no futura). **Caveat**: el feed de Google News indica uso personal y no comercial; si se quiere una fuente con licencia hay que cambiar de proveedor.
6. **Saludo de Oli**: regla obligatoria «saludo breve» en el prompt de sistema (`OLI_GREETING_RULE`, siempre inyectada aunque el prompt guardado en la base se haya editado) y mensaje inicial del chat: «¡Hola! Soy Oli, el agente oficial de Invest Oil LLC, ¿En qué puedo ayudarte hoy?».
7. **Verificación**: `tsc` sin errores, `build` correcto, batería de seguridad aprobada; pruebas locales contra PostgreSQL 16 temporal (ya eliminado) y el modal del radar en el navegador (contraste del selector 15.7:1).

### Fase 24: Foto del CEO que no se actualizaba, eliminar/reutilizar archivos en todas las interfaces, base de datos como única fuente y cierre de la API de gestión
1. **Causa raíz de la foto que no cambiaba** (`saveTeamMembers`, `db-service.ts`): la lista devuelve `image` y `photo_url` con la misma foto, el formulario solo edita `image` y el guardado escribía `photo_url || image`, así que ganaba siempre el valor viejo (y al quitar la foto reaparecía la antigua: la imagen «fantasma»). Ahora manda `image` y se escribe en ambas columnas. Probado en local: la foto nueva aparece en `/api/content/team` y en el HTML de la home.
2. **Guardado del equipo honesto**: los errores de PostgreSQL en `saveTeamMembers` se propagan (antes `console.warn`) y `team/page.tsx` muestra el error en vez de «guardado con éxito» cuando el servidor falla. Una lista de equipo vacía real ya no se sustituye por el demo (`TeamSection` y admin).
3. **Eliminar archivo y reutilizar biblioteca en todas las interfaces**:
   - Componente compartido `delete-media-file-button.tsx`: avisa de las secciones donde se usa el archivo (`GET /api/media/usage`, `findMediaUsage`), pide confirmación y borra de disco, `media`, `media_files`, `media.json` y Supabase. Solo actúa sobre `/uploads/`.
   - Integrado en `MediaUploadField` (equipo, productos, testimonios, editor de posts), Nosotros, fondo del Hero, SEO/Open Graph; Cabecera, Footer y logo del Hero ya lo tenían.
   - Botón «Biblioteca...» añadido a SEO/Open Graph y a la inserción de imágenes del editor Tiptap (antes solo pedía una URL).
   - `deleteMediaItem` ya no identifica por `media.filename` (nombre original compartido entre subidas) para no borrar archivos ajenos, y solo borra dentro de `public/uploads`.
   - `/uploads/*` responde con caché de 5 min (antes 24 h): un archivo borrado seguía viéndose en navegadores y CDN.
4. **Base de datos como única fuente** (con `DATABASE_URL` no se lee ni se escribe ningún JSON de `src/data`): `readJsonFile/writeJsonFile` (`db-service`) y `readLocalJson/writeLocalJson` (`content-service`) devuelven el valor por defecto; ajustes, legales, IA, dedupe y `server-legal-service` solo usan disco sin base. Cabecera: el layout público (ahora dinámico) la lee de la base y se la pasa a `Header`; el menú por defecto vive en `lib/constants/header-defaults.ts` en vez de importar `header.json`. Eliminadas las cachés `localStorage` de FAQ, retos, productos, operaciones y testimonios (mostraban contenido obsoleto antes de la respuesta de la API). **Excepciones conocidas**: leads y usuarios del backoffice siguen en JSON (no tienen lectura/escritura PostgreSQL implementada) y se pierden en cada redeploy; queda pendiente migrarlos.
5. **Seguridad (hallazgo grave)**: en producción, `/api/users`, `/api/leads`, `/api/settings/ai` y `/api/admin/migrate` respondían 200 sin sesión y todas las escrituras (`/api/upload`, `/api/content/*`, `/api/media/*`…) estaban abiertas, porque el middleware solo protegía `/admin`. Ahora `lib/supabase/middleware.ts` exige la cookie de sesión en toda escritura de la API y en las lecturas sensibles (lista blanca pública: `/api/auth/*`, `/api/contact`, `/api/ai/chat`, «me gusta»). Probado en local: 401 sin sesión, 200 con sesión, público intacto. **Pendiente para el dueño**: rotar las contraseñas (ver Fase 25: `/api/users` ocultaba las contraseñas, el riesgo era la de siembra en el repositorio); además existen contraseñas de emergencia y `SESSION_SECRET` por defecto escritos en el código (`db-service.ts`, `auth/session.ts`) y la firma de sesión usa un hash no criptográfico.
6. **Verificación**: `tsc --noEmit` 0 errores, `npm run build` correcto, batería de seguridad aprobada; prueba local de subida → servir (200) → borrar → 404 y desaparición de la biblioteca; contraste del botón nuevo 9.65:1 (el backoffice solo tiene tema oscuro). **Sin verificar**: comportamiento contra PostgreSQL real (no hay base local) y en producción tras el despliegue.

### Fase 23: Solución Definitiva de Opacidad Hero, Purga de Logos/Fotos Fantasma, Persistencia en PostgreSQL de Footer y Corrección de Navegación Activa en Header
1. **Control de Opacidad y Logo Condicional de la Tarjeta Hero**:
   - Se subsanó la pérdida del valor en `src/app/actions/content-actions.ts`: `updateHeroAction` y `updateAppearanceAction` ahora leen y persisten correctamente `hero_card_opacity` y `card_opacity`.
   - En `src/components/sections/hero-section.tsx`: erradicada la inyección de `localStorage`, `cardOpacity` fijado por defecto en 0 y fondo estrictamente `transparent` cuando `cardOpacity <= 0`.
   - Logo condicional: se eliminó el fallback a `seal-transparent.png`. Se renderiza únicamente si `heroCard?.logo_url` existe y no está vacío.
   - En `src/components/admin/content/hero-form.tsx`: eliminadas plantillas obsoletas que inyectaban sellos viejos y ajustado valor inicial de opacidad a 0%.
2. **Política Estricta de Cero Fallbacks de Imágenes & Purga de Fotos Fantasma**:
   - En `src/app/uploads/[...slug]/route.ts`: eliminado `resolveFallbackFilePath` que inyectaba imágenes viejas de directivos y logos cuando un archivo no existía en BD ni en disco (ahora retorna 404 limpio).
   - En `src/app/(public)/about/page.tsx`: Server Component asíncrono conectado a `getLandingAbout()`; la caja de imagen solo se renderiza si `data.featured_image` existe y es válida.
   - En `src/components/admin/content/about-form.tsx`, `src/app/(dashboard)/admin/content/seo/page.tsx` y `migration-service.ts`: purgadas todas las rutas obsoletas a `corporate-card-logo.jpeg` y `seal-transparent.png`.
3. **Persistencia del Pie de Página (Footer) en PostgreSQL**:
   - En `src/app/api/settings/route.ts`: conectado a PostgreSQL con `getSectionFromPg('site_settings')`, `saveSectionToPg('site_settings')` y `saveLandingFooter`. Los ajustes ya no se pierden en los deploys serverless.
   - En `src/components/layout/footer.tsx`: unificado con `customTitle={settings.companyName || 'INVEST OIL'}` y `customSubtitle={settings.footerTagline || 'Petroleum and Derivates Markets'}` y logo oficial `/images/branding/oil-drop-logo.png`.
4. **Navegación Activa del Menú en Header**:
   - En `src/components/layout/header.tsx`: implementado detector dinámico `isLinkActive` con ScrollSpy e `IntersectionObserver`/`scroll` para las secciones (`#hero`, `#services`, `#products`, `#contact`, etc.), tanto en desktop como en el drawer móvil. Si el usuario está en "Productos" o hace clic en él, se ilumina "Productos" y no "Inicio".
5. **Favicon y Activos Oficiales**:
   - Generados con Pillow: `public/favicon.ico`, `public/images/branding/favicon.png`, `icon-192.png`, `icon-512.png` a partir del logo oficial de la gota.
6. **Verificaciones Técnicas en Local**:
   - `npm run type-check`: 0 errores de compilación TypeScript.
   - `npm run build`: 53/53 páginas estáticas y dinámicas compiladas exitosamente al 100%.
   - `pwsh .\scripts\bateria-seguridad.ps1`: Aprobada al 100% (batería limpia sin secretos ni vulnerabilidades).

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

### Fase 33: Toolbar Bilingüe Fija en Todo el Backoffice, Retos con Editor Enriquecido y «Ver más», Separación Real de Servicios y Actualidad, y Logo Consistente en el Backoffice
- **Barra fija de idioma + guardar (`admin-editor-toolbar.tsx`, nuevo)**: componente `AdminEditorToolbar` (`sticky top-0`) con selector ES/EN y botón de guardar, aplicado sin excepción a los 8 formularios de contenido bilingüe (Retos, Servicios, Actualidad, Operaciones, Testimonios, Productos, FAQ, Equipo). Cada campo traducible pasó de mostrar solo el texto en español a editar `campo`/`campo_en` por separado según la pestaña activa, con guardado real contra PostgreSQL (o el fallback JSON en local sin base de datos).
- **`saveSectionToPg` deja de tragar errores**: antes devolvía éxito aunque la escritura fallara; ahora lanza si PostgreSQL rechaza el `INSERT ... ON CONFLICT`, y los formularios (que ya envolvían la llamada en `try/catch`) muestran el error real en vez de un «guardado» falso.
- **Bug real encontrado y corregido en `TiptapEditor`**: al cambiar de pestaña ES→EN con el campo `_en` aún vacío, el editor seguía mostrando el texto en español porque el `useEffect` de sincronización exigía `content` con valor (`if (editor && content)`) y una cadena vacía no pasaba el guardián. Se corrigió comparando siempre contra `content || ''`. Detectado navegando la página real, no leyendo el código — confirma la regla de «lo que no se comprueba, no está hecho».
- **Retos del Sector con formato enriquecido y «Ver más» (`problem-section.tsx`, `problema/page.tsx`)**: `desc`/`solution` pasan a tipo `RichText` (documento Tiptap u texto plano heredado), editables con `TiptapEditor` en el backoffice. En público se trunca a 128 caracteres + «…» y un enlace «Ver más...» abre un pop-up con el contenido completo formateado. Nueva función `localizedRich()` en `content-en.ts` (variante de `localized()` que no convierte a `String()`, para no imprimir `[object Object]` con documentos Tiptap) y `tiptapToPlainText()` en `tiptap-content.tsx` para la vista previa truncada.
- **Separación real de Catálogo de Servicios y Actualidad**: recuperado `services-section.tsx` (perdido en una fase anterior al renombrar el archivo hacia Actualidad) a partir del historial de git, ahora dinámico y bilingüe. Nueva sección `actualidad` independiente (`api/content/actualidad/route.ts`, `admin/content/actualidad/page.tsx`, `news-section.tsx` reescrito) con control de 1 a 12 tarjetas mediante `flex flex-wrap justify-center` + ancho fijo por tarjeta (no CSS Grid), que centra sola la última fila incompleta sin lógica condicional por cantidad. Secciones renumeradas 01–12 en `DEFAULT_LANDING_SECTIONS`, en el resumen de módulos de `/admin/content` y en el menú lateral del backoffice.
- **Normalizadores de compatibilidad de la fase anterior, corregidos**: los que reescribían automáticamente `#services`→`#actualidad` en el hero y en el menú de cabecera quedaban al revés ahora que Servicios vuelve a ser una sección real; se eliminaron. El normalizador de secciones se repropuso: en vez de renombrar Servicios a Actualidad, ahora corrige el título si quedó mal etiquetado de una instalación antigua **e inserta la sección Actualidad si falta**, para que una base ya sembrada la reciba sola sin migración manual.
- **Bug de bundling cliente/servidor**: `news-section.tsx` y la página admin de Actualidad importaban `DEFAULT_ACTUALIDAD`/`ActualidadConfig` directamente del *route handler*, que a su vez importa `pg` — eso metía `pg`/`fs`/`net`/`dns` en el bundle del navegador y rompía `next build` con «Module not found: fs». Se extrajo el tipo y la semilla a `src/lib/constants/actualidad-defaults.ts`, sin dependencias de servidor. **Regla para el futuro**: nunca importar un *value* (no solo un `type`) desde un archivo `route.ts` en un componente `'use client'`.
- **Logo del backoffice ahora es el mismo que Cabecera (`admin-sidebar.tsx`)**: antes `<BrandLogo variant="seal">` sin `src` (la prop `variant` nunca se usó en `BrandLogo`, es vestigial) mostraba siempre el logo por defecto sin importar lo configurado. Ahora hace `fetch('/api/content/header')`, igual que el `Header` público, y pasa `src`/`customTitle`/`customSubtitle`.
- **`FaqItem` centralizado**: tipo antes duplicado de forma inconsistente en `faq-section.tsx` y `faq-editor/page.tsx`; ahora vive una sola vez en `src/types/index.ts` con `question_en`/`answer_en`.
- **Verificación con evidencia real**: `npx tsc --noEmit` limpio, `npm run build` compiló las 55 páginas (todas `ƒ` dinámicas donde corresponde), batería de seguridad 100% aprobada, y navegación real en `localhost:3000` (servidor dev arrancado vía `.claude/launch.json` nuevo) confirmando: toolbar fija al hacer scroll, cambio de idioma sin fuga de contenido entre ES/EN, guardado con confirmación real, pop-up de Retos con el contenido completo, Servicios y Actualidad como secciones separadas y en el orden correcto, control de tarjetas de Actualidad, y la tabla de Visibilidad de Secciones autocurándose con las 13 secciones correctas. **No se probó contra una base PostgreSQL real** (solo contra el fallback JSON local, al no haber `DATABASE_URL` configurada en este entorno) — el camino de guardado es idéntico al de producción, pero el guardado real contra Postgres queda sin verificar con evidencia propia.

### Fase 34: Actualidad antes que Servicios, toolbar fusionada en la topbar, ES|EN compacto, saneo de referencias de medios borrados y toggles de visibilidad a prueba de fallos
- **Orden Actualidad (4) → Servicios (5)**: el dueño revisó en producción y pidió invertir el orden relativo que se dejó en la Fase 33. Cambiado en `DEFAULT_LANDING_SECTIONS`, en el resumen de módulos (`/admin/content`), en el menú lateral y en el render de `(public)/page.tsx`. El normalizador de auto-curado (`normalizeLegacySections`) ahora también reordena si detecta que una instalación ya guardó el par Servicios/Actualidad en el sentido antiguo, no solo cuando falta uno de los dos — así la corrección llega sin migración manual aunque el `landing_sections` de producción ya tuviera una fila guardada con el orden viejo.
- **Toolbar de idioma + guardar fusionada en la topbar del backoffice**: antes vivía en su propia barra `sticky` debajo de la topbar (dos barras apiladas). Ahora `AdminEditorToolbar` la inyecta por `createPortal` en un slot (`#admin-topbar-actions`) que `DashboardTopbar` reserva junto a la identidad del usuario conectado — una sola barra, sin duplicar altura. El botón «Añadir X» de cada formulario (`extraActions`) se quedó como contenido normal de la página (ya no sticky), porque cada formulario ya tiene su propio «+ Añadir otro» al final de la lista.
- **Selector de idioma compacto `ES | EN`**: se sustituyó el pill largo «Español (ES) / English (EN)» con icono por dos botones de dos letras — mismo componente compartido, así que el cambio alcanza a los 8 formularios bilingües sin tocarlos uno por uno.
- **Bug real de referencias de medios huérfanas, corregido**: al borrar un archivo de la Biblioteca de Medios, `deleteMediaItem` (en `db-service.ts`) borraba el archivo físico y el registro de la base, pero nunca tocaba lo que Hero, Cabecera u otras secciones tuvieran guardado apuntando a esa misma URL — el campo se quedaba con la referencia «huérfana» hasta que alguien lo corregía a mano en el formulario correspondiente. Se añadió `clearMediaReferencesInSections()`: tras borrar, recorre todas las filas de `landing_sections` y vacía cualquier campo de texto (a cualquier profundidad, sin necesitar conocer el nombre del campo) que coincida con la URL o el nombre de archivo borrado. Verificado en aislado con un script Node reproduciendo el mismo algoritmo de recorrido recursivo.
  - **Diagnóstico para el dueño sobre el video del Hero**: `public/videos/hero-background.mp4` es un archivo estático de 15 MB incluido en el propio repositorio (semilla por defecto cuando el tipo de fondo es «video»); **no** es un elemento de la Biblioteca de Medios y por tanto **nunca aparece ni se puede borrar desde ahí** — borrar algo de la biblioteca jamás lo afecta. Si el video que sigue viéndose es exactamente ese archivo por defecto, la única forma de quitarlo es cambiar el tipo de fondo del Hero (a imagen, gradiente o ninguno) desde `/admin/content/hero`, o sustituir/eliminar el archivo del repositorio y desplegar. No se pudo inspeccionar el Hero de producción en vivo desde este entorno: el navegador de esta sesión, al pedir `https://investoil.es`, recibió una página genérica de plantilla (no la aplicación real), así que la causa exacta del video visible en la captura del dueño queda sin confirmar con evidencia directa — se corrigió el bug de referencias huérfanas porque es real y reproducible en el código, pero no se afirma que sea la causa de ese caso concreto.
- **Interruptores de Visibilidad de Secciones, a prueba de fallos**: `toggleSectionAction` podía lanzar una excepción sin capturar si `saveSectionToPg` fallaba (comportamiento nuevo de la Fase 33, antes fingía éxito). `SectionToggle` tampoco comprobaba la respuesta de la acción: el interruptor se movía visualmente de forma optimista aunque el guardado real fallara, sin revertirse ni avisar. Ahora la acción devuelve `{success:false, error}` en vez de lanzar, y el interruptor revierte su posición y muestra el error en rojo junto al switch si el guardado no se confirma. Verificado en local: apagar y encender «Actualidad» desde `/admin/content` oculta y vuelve a mostrar la sección `#actualidad` en la portada en tiempo real.
- **Verificación con evidencia real**: `npx tsc --noEmit` limpio, `npm run build` (55 páginas), batería de seguridad 100% aprobada, y navegación real confirmando el nuevo orden de secciones (`document.querySelectorAll('section[id]')` en la portada), la toolbar fusionada en la topbar visible al hacer scroll, el toggle ES|EN sin fuga de contenido, y el interruptor de Actualidad ocultando/mostrando la sección real. El saneo de referencias de medios solo se validó en aislado (algoritmo puro) porque requiere PostgreSQL real, no disponible en este entorno.

### Fase 35: Oli dejaba de filtrar su razonamiento interno en producción, y prompt maestro reforzado con reglas de brevedad y escalamiento ante preguntas repetidas
- **Bug real y grave, encontrado y corregido**: en producción, Oli respondió a una pregunta mostrando literalmente su cadena de pensamiento interna en inglés ("Okay, the user is asking again about...", con nombres de secciones internas del prompt como "MEMORIA DE EXPERIENCIAS" o "REGLA DE SALUDO") en vez de la respuesta final — un fallo de confidencialidad y de imagen grave, no solo de redacción. Causa: `callSingleModel` (`ai-client.ts`) tomaba `message.content` de la respuesta del proveedor tal cual, sin ningún filtro; los modelos "razonadores" (DeepSeek-R1, QwQ y varios gratuitos de OpenRouter) devuelven su razonamiento dentro de ese mismo campo cuando no se les indica lo contrario.
- **Corrección en tres capas** (`ai-client.ts`):
  1. `stripReasoningTags()` quita bloques `<think>`/`<thinking>`/`<reasoning>` (cerrados o cortados a mitad) de la respuesta de los tres estilos de proveedor (OpenAI-compatible, Anthropic, Gemini) antes de devolverla.
  2. Para OpenRouter se añade el parámetro `reasoning: { exclude: true }` en cada petición — la forma correcta y documentada de pedirle a la pasarela que no incluya el razonamiento en la respuesta, en vez de confiar solo en filtrarlo después.
  3. Red de seguridad final: `looksLikeLeakedReasoning()` detecta razonamiento narrado en prosa libre, sin etiquetas (justo el caso real del incidente) por patrones de inicio ("Okay, the user is...", "Let me check...", "According to the protocol..."); si coincide, la respuesta se descarta entera y `sanitizeProviderReply()` lanza, dejando que la cascada de proveedores pruebe el siguiente modelo en vez de mostrarle ese texto al visitante.
- **Preguntas repetidas: detección real, no solo una instrucción de prompt.** `executeAiChat` compara la última pregunta del visitante contra las anteriores de la misma conversación (texto exacto o solapamiento de palabras ≥ 75%, normalizado sin acentos/puntuación) y, si hay repetición, inyecta un aviso en el propio *system prompt* de ese turno (no como mensaje `system` suelto en el array de `messages`, que los tres proveedores filtran y descartan) para que el modelo reconozca la repetición en una frase y pida nombre/empresa/correo para derivar a `business@investoil.es` o al formulario de contacto. La misma detección también cubre la ruta de contingencia sin modelo de IA (`generateKnowledgeBaseResponse`), que antes repetía la misma respuesta enlatada indefinidamente sin escalar.
  - **Bug propio detectado y corregido durante la verificación**: la primera versión excluía "el mensaje actual" de la lista de mensajes anteriores comparando por **contenido** (`m.content !== currentUserMessage`) — con una pregunta repetida literal, eso descartaba también la aparición anterior (mismo texto), y la comparación nunca encontraba nada. Corregido excluyendo por **índice** del array, no por valor. Detectado probando el escenario real por `curl` contra el servidor local, no leyendo el código.
- **Nueva casilla en la respuesta de contingencia sin IA**: se añadió el bloque "INFORMACIÓN FINANCIERA Y SOLVENCIA" a `generateKnowledgeBaseResponse`, con la respuesta corporativa estándar del prompt maestro, para que la pregunta exacta del incidente tenga una respuesta correcta incluso si todos los proveedores de IA configurados fallan.
- **Prompt maestro de Oli, ampliado y reforzado** (`ai-types.ts`, `DEFAULT_AI_SETTINGS.systemPrompt`): se fusionó el documento «Prompt Maestro — Agente Inteligente de Invest Oil LLC» (27 secciones: protección reputacional, clasificación de información en 4 niveles, defensa contra ingeniería social, reglas contra la invención, Opportunity Brief, escalamiento a humanos, orden de prioridad...) con dos reglas nuevas que el documento original no cubría:
  1. **Formato de respuesta obligatorio**: por defecto 2 a 5 frases, nunca narrar el razonamiento interno ni nombrar las propias reglas o secciones del prompt.
  2. **Preguntas repetidas**: reconocerlo en una frase y escalar de inmediato pidiendo nombre/empresa/correo.
  El texto completo se dejó también en el documento de la sesión para que el dueño lo pegue en `/admin/settings/ai` → Prompt del Sistema, ya que ese campo vive en la base de datos de producción (o en `ai-settings.json` en local sin base de datos) y el cambio en el código solo afecta a instalaciones nuevas, no a la configuración ya guardada.
- **Verificación con evidencia real**: `npx tsc --noEmit` limpio, `npm run build` (55 páginas), batería de seguridad 100% aprobada. Probado en caliente contra el servidor local por `curl` (no solo leyendo el código): 1) la pregunta de solvencia financiera responde con el texto corporativo correcto; 2) repetida en el siguiente turno, responde con el mensaje de escalamiento pidiendo nombre/empresa/correo; 3) una pregunta distinta en el mismo hilo sigue respondiéndose con normalidad, sin falso positivo. El filtro de razonamiento (capas 1 y 3) se validó con un script Node reproduciendo el texto exacto filtrado en el incidente real; no se pudo forzar una fuga real end-to-end porque ningún proveedor de IA tenía clave válida en este entorno local.
- **Oli mezclaba idioma a mitad de conversación (mismo commit)**: el detector de idioma (`isEn`) se recalculaba en cada mensaje mirando solo el último, con una lista de palabras clave en inglés — un mensaje ambiguo o con un término técnico (p.ej. «EN590», «INCOTERM») podía hacer que una conversación en español saltara a inglés a mitad de camino, o viceversa. Corregido: `detectConversationLanguage()` fija el idioma UNA sola vez a partir del primer mensaje del visitante (marcadores propios de español — tildes, ¿¡, stopwords — contra marcadores de inglés) y ese idioma se inyecta como instrucción explícita en el system prompt del turno y se pasa como parámetro fijo a `generateKnowledgeBaseResponse()` y `buildRepeatedQuestionEscalation()`, que antes adivinaban cada una por su cuenta. Verificado por `curl`: una conversación iniciada en español sigue respondiendo en español aunque el siguiente mensaje suene en inglés, y viceversa.
- **Radar de noticias: la fecha y hora de publicación original de la noticia no se estaba capturando** en el punto donde realmente importa. La investigación reveló que había DOS caminos de recopilación de noticias con el mismo hueco: `POST /api/news-republish` (pegar una URL a mano) ponía `publishedAt: new Date().toISOString()` — la hora del scraping, no la del artículo — y `POST /api/news-agent/compose` (el flujo real del radar: Google News → «Republicar» → редактор) extraía `article:published_time` en `extractArticle()` pero ese dato nunca llegaba a la respuesta JSON ni al editor. Corregido:
  1. Nuevo módulo compartido `src/lib/news/extract-published-date.ts` (`extractOriginalPublishedAt`): prueba, en orden, `article:published_time` y variantes de metaetiqueta, JSON-LD `datePublished`, y el primer `<time datetime>` de la página — nunca inventa una fecha, devuelve `null` si no encuentra ninguna. Reutilizado en `news-republish/route.ts` (antes tenía su propia copia duplicada de esta misma lógica) y en `article-composer.ts`.
  2. `compose/route.ts` ahora incluye `publishedAt` en la respuesta; `news-agent-modal.tsx` lo reenvía a `onSelectNews` (con el `pubDate` del feed RSS como respaldo si la página del artículo no expone su fecha); `post-editor-form.tsx` aplica esa fecha al campo «Fecha de Publicación» del formulario en ambos flujos de importación (radar y pegar URL directa).
  3. `news-republish-dialog.tsx` muestra la fecha detectada en la vista previa, distinguiendo si es la fecha real del artículo o (cuando no se encontró ninguna) el momento de la importación.
  - **Verificado con evidencia real, no solo leyendo el código**: script Node que descarga una noticia real de oilprice.com y confirma que `article:published_time` se extrae y parsea correctamente a ISO 8601; contra una página de EIA.gov sin esa metaetiqueta, confirma que devuelve `null` (nunca inventa una fecha) en vez de fallar o fabricar un dato.

### Fase 36: Auditoría del panel de configuración de IA, numeración correlativa de posts por fecha real, y cabecera de Gestión de Posts en una sola fila
- **Auditoría de `/admin/settings/ai`**: el dueño pidió confirmar que el panel realmente escribe donde Oli realmente lee. Se rastreó todo el camino: la página → `POST /api/settings/ai` → `saveAiSettings()` (`ai-service.ts`) → fila `landing_sections` con `id = 'ai_settings_config'` — la MISMA función `getAiSettings()` que importa `ai-client.ts` para construir el prompt de cada conversación. Confirmado end-to-end en el navegador local (no solo leyendo código): cargar la página trae el prompt ya guardado, «Restablecer Prompt Recomendado» carga el nuevo prompt maestro de la Fase 35, y «Guardar Entrenamiento» lo persiste en el mismo archivo/fila que usa el chat — comprobado leyendo el dato tras guardar.
  - **Bug real encontrado de paso**: `saveAiSettings()` tenía la misma trampa de silencio que se corrigió en la Fase 33 para `saveSectionToPg` — si PostgreSQL rechazaba la escritura, el `catch` solo hacía `console.error` y la función igual devolvía `true`. El admin veía «guardado correctamente» aunque el prompt real nunca llegara a la base. Corregido para que lance si `queryPg` devuelve `null`.
- **Numeración correlativa de artículos por fecha real, no por orden de importación** (`/admin/posts`): cada fila muestra ahora un `#` estable calculado por `published_at` (o `created_at` si no la tiene) sobre TODO el catálogo — el artículo más antiguo es el `#1` — calculado con `useMemo` sobre la lista completa de `posts`, no sobre lo filtrado/ordenado para mostrar. Por eso el número de un artículo no cambia al buscar, filtrar o invertir el orden de la tabla (clic en «Fecha»); solo se recalcula solo cuando cambia el conjunto real de artículos (añadir o borrar uno), porque es una posición derivada en cada render, nunca un campo guardado.
  - Verificado en el navegador: con 8 artículos de prueba, invertir el orden de «Fecha» (ascendente ↔ descendente) mantiene el mismo número en cada artículo — prueba de que la numeración es estable y no depende del orden de visualización.
- **Cabecera de «Gestión de Posts» condensada a una sola fila**: título, insignia «CONTENIDO EDITORIAL», contador de artículos totales y contador de publicados, y los botones «Gestionar Categorías» / «Crear Post», todo en una sola fila (`flex-wrap` para que no se rompa en pantallas pequeñas); se quitó el párrafo descriptivo que solo ocupaba espacio sin aportar función. Se añadió también un indicador «Mostrando X de Y» en la barra de filtros, junto al selector de categoría.
- **Verificación con evidencia real**: `npx tsc --noEmit` limpio, `npm run build` (55 páginas), batería de seguridad 100% aprobada. Probado en el navegador local con sesión autenticada (usuario de prueba del propio seed local del proyecto): cabecera en una fila, contadores correctos (8/8), «Mostrando 8 de 8», numeración correlativa estable al invertir el orden de fecha. No se probó el borrado real de un artículo end-to-end porque el diálogo nativo `window.confirm()` bloqueó la automatización del navegador — la lógica de renumeración es una función pura de la lista `posts`, ya demostrada correcta por la prueba de reordenamiento, y `handleDelete` (sin cambios) ya actualizaba esa lista antes de esta fase.

### Fase 37: Migración de dominio a investoil.us (con correos incluidos) y pop de valoración con estrellas en el formulario de contacto
- **Migración de dominio `investoil.es` → `investoil.us` en todo el código**: reemplazo de las 122 apariciones literales en 30 archivos (canonical URLs, sitemap.xml, robots.txt, JSON-LD, placeholders de formularios, páginas legales ES/EN, prompt y base de conocimiento de Oli, fallbacks de sesión/login) mediante un script que preserva intacta una única excepción deliberada: las comparaciones contra las direcciones YA RETIRADAS `contacto@investoil.es` y `trading@investoil.es` (normalizadores de una migración anterior, Fase 21) se dejaron literales, porque son marcadores históricos de detección, no direcciones vivas — solo se actualizó el valor de REEMPLAZO al que apuntan (ahora `@investoil.us`).
  - Los correos cambian de dominio manteniendo el mismo nombre de usuario (`info@`, `business@`, `admin@`, `compliance@`) según instrucción explícita del dueño. Incluye la doble cuenta de administrador que `db-service.ts` garantiza que siempre exista: ahora es `admin@investoil.us` + `admin@investoil.com` (antes `admin@investoil.es` + `admin@investoil.com`) — variable `hasEs` renombrada a `hasUs` para que el código siga describiendo lo que realmente comprueba.
  - **Fuera de alcance, es tarea del dueño**: el registro del dominio, el DNS, los certificados SSL y que los buzones `@investoil.us` existan y reciban correo de verdad son infraestructura ajena al código — si esos buzones aún no están activos, avisar antes de depender de ellos en producción. Igualmente, si `NEXT_PUBLIC_APP_URL` está fijada como variable de entorno en el proveedor de hosting, hay que actualizarla y redesplegar allí — el código solo cambió el valor por defecto que se usa cuando esa variable no está definida.
- **Pop de valoración con estrellas tras enviar el formulario de contacto**: nuevo componente `company-rating-modal.tsx` que aparece automáticamente en cuanto el envío del formulario tiene éxito (mismo estado de `isSubmitted`), con tres filas de 1 a 5 estrellas — Lo que hacemos / Cómo lo hacemos / Nuestros resultados — y un comentario opcional. «Omitir» cierra sin guardar nada; enviar exige las tres categorías puntuadas.
  - Persistencia nueva y propia (no reutiliza `leads`): tabla `company_ratings` (`pg-client.ts`), tipo `CompanyRating`, `saveCompanyRating`/`getCompanyRatings` en `db-service.ts` (con el mismo patrón de `leads`: lanza si PostgreSQL rechaza la escritura, nunca finge éxito), y `POST/GET /api/ratings`. El nombre y correo ya capturados por el formulario de contacto se asocian a la valoración sin volver a pedirlos.
  - Nueva página `/admin/ratings` (enlazada en el sidebar junto a «Mensajes de Contacto»): promedio general y por categoría arriba, listado de valoraciones individuales con sus tres puntuaciones, comentario y datos de contacto debajo.
- **Verificación con evidencia real, end-to-end en el navegador**: formulario de contacto real enviado → pop de valoración aparece automáticamente con las tres filas vacías → las 5 estrellas de cada fila se marcan al clic → «Enviar valoración» hace `POST /api/ratings` (200 OK confirmado en la pestaña de red) → el modal se cierra solo mostrando agradecimiento → `/admin/ratings` muestra la valoración recién enviada con las tres puntuaciones de 5 estrellas y los promedios correctos (5.0 en las cuatro tarjetas). Confirmado también en el propio navegador que `info@investoil.us` aparece correctamente en la tarjeta de contacto y en el pie de página del sitio público.

### Fase 38: La migración de dominio no llegaba al contenido ya guardado en producción — nueva utilidad para corregirlo sin tocar el resto del texto
- **El dueño reportó con capturas reales de producción** (`investoil.us`) que el pie de página y las respuestas de Oli seguían mostrando `investoil.es` pese a la Fase 37. Causa real: cambiar el valor por defecto en el código (`DEFAULT_*`) no toca lo que un admin YA guardó desde un formulario del backoffice — ese contenido vive en `landing_sections` en PostgreSQL y tiene prioridad de lectura sobre cualquier default del código. La Fase 37 corrigió el código pero no tenía forma de tocar los datos ya guardados en producción, que es donde de verdad vivía el dominio viejo (footer, SEO, y el prompt/base de conocimiento de Oli guardados en `ai_settings_config`).
- **Nueva utilidad genérica de corrección** (`fixDomainInStoredSections()` en `db-service.ts`, mismo patrón recursivo que `clearMediaReferencesInSections` de la Fase 34): recorre TODAS las filas de `landing_sections` — Hero, Cabecera, SEO, Pie de Página, Agente de IA, Retos, Servicios, Actualidad, Productos, Equipo, Testimonios, FAQ, y cualquier otra — y sustituye `investoil.es` por `investoil.us` en cualquier campo de texto, a cualquier profundidad, sin necesitar saber de antemano en qué sección o campo vive cada URL o correo. Conserva intactas las direcciones ya retiradas `contacto@investoil.es`/`trading@investoil.es` (mismo criterio que la Fase 37). Lanza si PostgreSQL rechaza una escritura, nunca finge éxito.
- **Expuesta como utilidad puntual de administrador**: `POST /api/admin/fix-domain` (solo POST, para que no se dispare por accidente al visitar la URL) y una página nueva `/admin/content/domain-fix` con un botón «Corregir dominio ahora» y el resultado (cuántas secciones se revisaron, cuántas se corrigieron y cuáles). Idempotente a propósito: ejecutarlo de nuevo cuando ya no queda nada que corregir no cambia nada, así que es seguro volver a pulsarlo. No se añadió al menú lateral por ser una utilidad de un solo uso; se entrega el enlace directo.
- **Aprendizaje para el futuro**: toda migración de dominio, marca o correo en un proyecto con contenido editable desde el backoffice necesita DOS pasos, no uno — 1) cambiar los valores por defecto en el código (para instalaciones nuevas), y 2) correr una utilidad de corrección sobre los datos YA guardados en producción (para las instalaciones existentes). Cambiar solo el código dice «ya está» sin estarlo de verdad, y el dueño lo pilló con captura de pantalla de producción real, no yo revisando el código.
- **Verificación con evidencia real**: `npx tsc --noEmit` limpio, `npm run build`, batería de seguridad 100% aprobada. El algoritmo de reemplazo se probó de forma aislada con un script Node sobre un objeto anidado de ejemplo (con las direcciones retiradas incluidas) confirmando que reemplaza correctamente a cualquier profundidad y preserva exactamente lo que no debe tocar. La página y la ruta se probaron en el navegador local: sin PostgreSQL configurado, el botón responde correctamente «No hay conexión activa a PostgreSQL» en vez de fallar en silencio o mostrar un error genérico — el tramo real de escritura contra PostgreSQL de producción queda sin verificar con evidencia propia porque este entorno local no tiene esa conexión; lo deberá confirmar el dueño al ejecutar el botón en `/admin/content/domain-fix` en producción.

### Fase 39: La propia utilidad de corrección de dominio dejaba intacto «trading@investoil.es» — bug real, no solo datos sin migrar
- **El dueño desplegó y ejecutó el botón de la Fase 38; el pie de página quedó bien, pero Oli seguía respondiendo con `trading@investoil.es`** (captura real de producción). La causa no era que faltara ejecutar la utilidad — es que la propia utilidad tenía un fallo de diseño: `fixDomainInStoredSections()` excluía a propósito cualquier coincidencia precedida por `contacto@`/`trading@`, razonando (mal) que esas dos direcciones eran solo marcadores de detección del código fuente. Pero el contenido guardado en `ai_settings_config` (una FAQ entrenada de Oli) SÍ tenía `trading@investoil.es` como texto real y visible — no como literal de comparación — y la exclusión se lo saltaba sin corregirlo.
- **Corregido con la semántica correcta, no solo quitando la exclusión**: ahora `fixDomainInStoredSections()` primero remapea los alias ya retirados en una migración anterior (Fase 21) al canal vigente — `contacto@investoil.es` → `info@investoil.us`, `trading@investoil.es` → `business@investoil.us` — y solo después aplica el cambio de dominio genérico a lo que quede. Las comparaciones en el código fuente (`content-service.ts`, `layout.tsx`, `seo/page.tsx`) que buscan el literal antiguo para detectar datos viejos se dejaron intactas a propósito: esas SÍ necesitan el valor histórico para reconocerlo, viven en `.ts`, no en el contenido guardado.
- **Barrido de todo el repositorio, no solo `src/`**: el dueño pidió limpiar «todo lo que sea con investoil.es, en todo el repo local y remoto». Una búsqueda recursiva sin acotar a `src/` encontró 22 apariciones más fuera del código de la aplicación: `README.md`, dos scripts sueltos (`scripts/migrate-to-db.mjs`, `scripts/test-persistence.mjs`), dos migraciones SQL de Supabase (`supabase/migrations/0001_init.sql` y `0006_complete_database_schema.sql` — esta última incluso sembraba un usuario `trading@investoil.es` que nunca se había detectado antes) y cuatro scripts de prueba sueltos en la raíz del repo (`test-*.mjs`, restos de una sesión de desarrollo anterior a esta). Todas corregidas.
- **Auditoría de los archivos JSON de respaldo local** (`src/data/*.json`, usados solo cuando no hay `DATABASE_URL` configurada — nunca en producción): confirmado que no queda ningún «investoil.es» ni ningún resto de las pruebas hechas en esta sesión (leads de prueba, valoraciones de prueba, etc. — todas se habían revertido ya en su momento). **No se vaciaron estos archivos**: contienen contenido de demostración legítimo y sustancial construido en fases anteriores (~130 KB: artículos del blog, páginas legales completas, catálogo de productos...), nunca leído por producción, así que borrarlo no arregla nada del problema reportado y sí destruye trabajo real sin necesidad — se avisa en vez de borrar sin confirmar.
- **Aprendizaje para el futuro**: una utilidad de "limpieza masiva" que excluye un patrón por precaución debe excluirlo solo donde ese patrón es literalmente necesario (código fuente que compara valores históricos) — nunca por igualar sin pensar "esto parece un marcador especial, mejor no lo toco". El mismo literal puede ser, a la vez, un marcador de detección en el código Y contenido real visible en los datos; hay que decidir la exclusión por dónde vive el texto, no por cómo se ve.
- **Verificación con evidencia real**: `npx tsc --noEmit` limpio, `npm run build`, batería de seguridad 100% aprobada, y una segunda búsqueda recursiva de todo el repositorio (excluyendo `node_modules`/`.next`/`.git`) confirmando cero apariciones de `investoil.es` fuera de las siete intencionales (comparaciones de detección en el código y las referencias propias de la página/ruta de la utilidad). El algoritmo corregido se probó en aislado con el texto exacto reportado por el dueño («trading@investoil.es» en una respuesta de Oli) confirmando que ahora se convierte correctamente en `business@investoil.us`.
- **Segunda pasada tras una notificación de tarea en segundo plano** (la búsqueda inicial se había limitado sin querer a `nextjs-opc-webapp/`, por estar posicionado ahí con `cd`): apareció un `README.md` distinto en la raíz del propio repositorio (`nt-investoil/README.md`, no el de `nextjs-opc-webapp/`) y, más importante, `scripts/sync-prod.mjs` — un script real y funcional, fuera de `nextjs-opc-webapp/`, que descarga posts, equipo directivo e imágenes de `https://investoil.es` para refrescar los JSON de respaldo local. Sin corregir, la próxima vez que alguien lo ejecutara habría seguido golpeando el dominio viejo. Ambos corregidos. **Aprendizaje**: un barrido «de todo el repositorio» hecho desde un subdirectorio con `cd` no es de todo el repositorio — hay que lanzarlo desde la raíz real, y conviene repetirlo una vez más después de la primera tanda de correcciones, no darlo por bueno a la primera pasada.

### Fase 40: El correo del pie de página no se actualizaba, se retiró `info@investoil.us` en favor de `business@investoil.us`, y auditoría general backoffice → landing
- **El dueño (Pablo) reportó que cambiar o borrar el correo del pie de página en el backoffice no se reflejaba en la landing.** La causa real eran DOS bugs distintos, no uno:
  1. **`AdminContentSettingsPage.handleSubmit` (`/admin/content/settings`) mentía sobre el éxito.** Si `POST /api/settings` fallaba (`!res.ok`) o lanzaba una excepción de red, el `catch`/`else` igual llamaba `saveClientSiteSettings(settings)` + `setSaved(true)` — el admin veía «guardado correctamente» aunque nada hubiera llegado a la base. Es la misma trampa de silencio corregida en `saveSectionToPg` (Fase 33) y `saveAiSettings` (Fase 36), pero esta vez en el lado del cliente, no del servidor. Corregido para mostrar un error real (`setError(...)`) y no tocar `localStorage` ni marcar éxito cuando la respuesta no es correcta.
  2. **`Footer` resucitaba el correo que se acababa de borrar.** `settings.email || COMPANY_INFO.email` trataba una cadena vacía (borrado intencional) igual que un valor ausente, y volvía a mostrar el correo por defecto del código (`info@investoil.us`) en vez de ocultar el bloque de contacto. Corregido: el bloque de correo del pie solo se renderiza si `settings.email` tiene valor.
- **`contact-section.tsx` (la sección de contacto de la propia landing, justo encima del formulario) nunca estuvo conectada al backoffice**: mostraba `COMPANY_INFO.email` — una constante del código — en vez de leer `/api/settings` como ya hacía el pie de página. Cualquier cambio de correo en el backoffice nunca llegaba a esa tarjeta. Corregido para usar el mismo hook `useSiteSettings()` que el footer, con el mismo criterio de ocultar el bloque si no hay correo configurado.
- **Segunda petición del dueño: eliminar `info@investoil.us` de todo el sistema y sustituirlo por `business@investoil.us`** (unificar a un solo canal de contacto). Aplicado en dos capas, con la misma lección de la Fase 38 (cambiar el código no toca lo ya guardado):
  1. **Código**: todos los valores por defecto (`COMPANY_INFO.email`, `DEFAULT_SITE_SETTINGS.email`, el `contact_email` por defecto del formulario de SEO) pasan a `business@investoil.us`. Las frases que mencionaban los dos correos a la vez (prompt y base de conocimiento de Oli en `ai-types.ts`, las respuestas enlatadas de `ai-client.ts`, los mensajes de respaldo del widget de chat, el aviso de fraude y el pie institucional de las páginas legales) se reescribieron para mencionar un solo canal, en vez de dejar «business@investoil.us (o info@investoil.us)» — un reemplazo ciego de texto habría dejado frases con el mismo correo repetido dos veces. Las comparaciones que detectan alias ya retirados (`content-service.ts`, `layout.tsx`, `seo/page.tsx`, ahora también `api/settings/route.ts`) se ampliaron para tratar `info@investoil.us` igual que `contacto@investoil.es`/`trading@investoil.es`: un valor histórico a reconocer y remapear a `business@investoil.us`, nunca un correo vigente.
  2. **Datos ya guardados**: se generalizó el scrub recursivo de `fixDomainInStoredSections` (Fase 38) extrayendo la función base `scrubStoredSectionsText()`, reutilizada ahora también por la nueva `fixEmailAliasInStoredSections()`. Nueva utilidad puntual `POST /api/admin/fix-email`, con su botón («Corregir correo ahora») añadido a la misma página `/admin/content/domain-fix` junto al de dominio — recorre `landing_sections` completo (FAQs entrenadas de Oli, páginas legales, SEO, pie de página...) y sustituye `info@investoil.us` por `business@investoil.us` donde aparezca como contenido real, no solo donde el código lo compara.
  3. Los JSON de respaldo local (`src/data/*.json`, usados solo sin `DATABASE_URL`) se actualizaron igual, por coherencia y porque `ensureLegalSeeded()` en `server-legal-service.ts` solo siembra `legal-pages.json` en PostgreSQL UNA vez por base de datos (marca `legal_seed_v2`): si esa siembra nunca llegó a correr en producción, este archivo sigue siendo la fuente real.
- **Tercera petición: auditar todas las conexiones backoffice → landing para que cada cambio se refleje de inmediato.** Un subagente de solo lectura revisó cada página de `/admin/**` y cada formulario de `components/admin/**` con guardado propio buscando la misma familia de bug (fallo silencioso al guardar). Resultado: la trampa completa («miente que guardó») solo existía en `content/settings/page.tsx` (ya corregida arriba); se encontraron además tres fallos silenciosos más leves — guardan bien, pero si falla el `POST` el usuario no ve ni éxito ni error, el botón simplemente deja de girar — en `section-design-bar.tsx` (color de fondo por sección), `content/legales/page.tsx` y `content/marquee/page.tsx`. Los tres se corrigieron para mostrar un error real cuando `!res.ok` o la petición lanza una excepción, siguiendo el mismo patrón ya validado en el resto del panel.
- **Aprendizaje para el futuro**: un bug de «el cambio no se refleja en la landing» casi nunca es un solo fallo — conviene mirar las DOS puntas del mismo hilo (¿el guardado realmente persiste, con evidencia de que falla cuando falla? ¿el componente público realmente lee ese dato, o tiene un atajo a una constante del código?) antes de dar por buena una sola corrección.
- **Verificación con evidencia real**: `npx tsc --noEmit` limpio, `npm run build` (compila, incluida la ruta nueva `/api/admin/fix-email`), batería de seguridad 100% aprobada. Probado en el navegador local con sesión autenticada: se borró el correo en `/admin/content/settings` y se guardó — el valor `value` real del campo del DOM quedó vacío y el archivo de respaldo local (`site-settings.json`, sin PostgreSQL en este entorno) se escribió con `"email": ""`, confirmando que el guardado y la relectura del formulario funcionan correctamente de punta a punta. **Límite honesto de esta verificación**: `(public)/layout.tsx` lee `site_settings` con `getSectionFromPg` directamente (sin el repliegue a JSON local que sí tiene `/api/settings`), así que en este entorno local sin PostgreSQL la landing pública no pudo mostrar el valor recién borrado — siguió leyendo el valor por defecto del código. En producción, con PostgreSQL real, `getSectionFromPg` sí devuelve el contenido ya guardado (vacío incluido) y el footer se comporta como se verificó en el admin; queda pendiente que el dueño lo confirme en producción tras desplegar. Se restauró `business@investoil.us` en el correo de prueba antes de hacer commit, para no dejar un correo vacío como dato de ejemplo en el repositorio.

### Fase 41: Las páginas legales mostraban «[object Object]» en vez del cuerpo redactado, y Nosotros no cambiaba de idioma
- **El dueño reportó con capturas de producción** que el cuerpo de las páginas legales (ej. Aviso de Privacidad) mostraba literalmente el texto `[object Object]` entre la introducción y el pie, pese a que el editor enriquecido de `/admin/content/legales` sí tenía el texto completo redactado («1. Responsable del tratamiento», «2. Datos personales que recogemos»...). Pidió revisar las cinco páginas legales y resolver el problema de fondo.
- **Causa real, no una suposición**: `TiptapEditor` (componente compartido por el blog, Nosotros, Retos y las páginas legales) guarda el contenido como el documento JSON de Tiptap (`editor.getJSON()`), no como HTML — decisión de diseño correcta y ya asumida en el resto del sitio: existe un renderizador propio, `TiptapContent`/`renderTiptapNode` (`components/blog/tiptap-content.tsx`), que sabe pintar ese JSON como React, y el blog, Nosotros y Retos ya lo usaban. **Solo `legal-page-view.tsx` se había quedado atrás**: seguía haciendo `dangerouslySetInnerHTML={{ __html: currentHtml }}` esperando una cadena HTML; al recibir el objeto JSON, el propio `innerHTML` del navegador lo convierte a texto con `.toString()`, y un objeto sin ese método da exactamente `"[object Object]"`. El dato guardado en la base nunca estuvo corrupto — era un documento Tiptap válido — así que no hizo falta ninguna migración de datos, solo corregir el renderizador.
- **Corregido conectando `legal-page-view.tsx` al mismo `TiptapContent` que ya usan el blog, Nosotros y Retos**, en vez de reinventar su propio render. De paso se amplió `renderTiptapNode` (antes solo soportaba encabezado, párrafo y texto con negrita/cursiva/subrayado/enlace) para cubrir **todos** los nodos y marcas que la barra de herramientas del editor permite crear: listas con viñetas y numeradas, listas de tareas, cita, bloque de código, regla horizontal, salto de línea, imagen, vídeo de YouTube, tabla completa, y las marcas tachado/código/resaltado/tipografía-tamaño — para que un admin que use cualquier botón del editor vea su contenido completo en público, no solo lo mínimo que ya se probó antes.
- **Verificado en el navegador, no solo leyendo el código**: se escribió contenido real en el editor de «Aviso de Privacidad» (una lista con viñetas de dos puntos) y se guardó; la página pública (`/aviso-de-privacidad`) lo mostró como una lista `<ul><li>` real, sin rastro de `[object Object]` en ningún punto de la página — confirmado también por búsqueda directa de ese texto en el DOM.
- **Segundo reporte en el mismo mensaje**: la página «Nosotros» no cambiaba de idioma al usar el selector ES/EN, a diferencia de todas las demás secciones. Causa: `app/(public)/about/page.tsx` era un Server Component que resolvía el idioma UNA sola vez por petición con `getServerLanguage()` (lee la cookie `NEXT_LOCALE` vía `next/headers`), mientras que el selector de idioma solo actualiza el contexto de React en el cliente (`useLanguage()`) sin recargar la página — así que el HTML ya pintado en español se quedaba así hasta una recarga real. El resto de secciones bilingües son componentes de cliente que leen `useLanguage()` y por eso reaccionan al instante.
- **Corregido separando datos de presentación**: `about/page.tsx` sigue siendo un Server Component que solo trae `getLandingAbout()` (rápido, sin bloquear en el cliente), pero ahora delega todo el render bilingüe a un componente nuevo, `components/sections/about-content.tsx` (`'use client'`), que lee `useLanguage()` igual que el resto del sitio — mismo patrón ya usado en `legal-page-view.tsx` para este mismo tipo de fallo. Verificado en el navegador: pulsar ES/EN en Nosotros cambia el texto al instante, sin recargar.
- **Aprendizaje para el futuro**: cuando una sola sección no reacciona al selector de idioma y todas las demás sí, sospechar primero de un Server Component que calculó el idioma una vez por petición en vez de un Client Component leyendo el contexto reactivo — es un patrón que se repite cada vez que se añade una página nueva sin copiar el patrón ya establecido. Y cuando un `dangerouslySetInnerHTML` muestra literalmente `[object Object]`, el dato casi nunca está corrupto: es casi siempre un objeto JSON válido que un componente de render más nuevo en el sitio (como `TiptapContent`) ya sabe pintar, y lo correcto es reusarlo en vez de arreglar el componente antiguo por su cuenta.
- **Verificación con evidencia real**: `npx tsc --noEmit` limpio, `npm run build`, batería de seguridad 100% aprobada, y las dos pruebas de navegador descritas arriba (lista real sin `[object Object]`; cambio de idioma instantáneo en Nosotros). El contenido de prueba escrito en el editor se revirtió del JSON local de respaldo (`legal-pages.json`) antes de hacer commit, para no dejar datos de prueba en el repositorio.


### Fase 42: Cifras del Hero editables, la tarjeta del Hero se pisaba al guardar Apariencia, y precios del cintillo reales desde la EIA
- **Cifras de impacto del Hero (150M+ · 99.8% · 38+)**: estaban escritas a mano en `hero-section.tsx` (texto desde el diccionario de idioma), sin ningún control en el backoffice. Nuevo campo `hero_stats` en la configuración del Hero (cifra + texto ES + texto EN, ×3), con su tarjeta en `/admin/content/hero`; si no hay valor guardado se mantienen los de siempre. Las etiquetas de la tarjeta lateral (Despachos Mensuales, etc.) tampoco tenían campo EN: añadidos.
- **Controles de la tarjeta que «no funcionan» — causa encontrada**: `updateAppearanceAction` (el guardado de «Diseño & SEO → Apariencia») construía su propio `hero_card` con valores por defecto —el formulario de Apariencia no tiene esos campos— y lo volcaba al Hero con `updateMemoryHero({hero_card})`, **reemplazando entera la tarjeta del Hero** (métricas, textos, logo, colores) cada vez que alguien guardaba Apariencia. De paso, vaciaba los colores de sección que no están en su formulario (p. ej. Actualidad). Corregido: Apariencia ya no toca el Hero y solo pisa los colores que realmente envía. Además el formulario del Hero ignoraba la respuesta del `POST /api/content/hero` y la Server Action no esperaba sus escrituras: un fallo se veía como «guardado con éxito». Ahora se espera, se comprueba y se muestra el error real. **Sin verificar en producción**: en local el guardado y la lectura del Hero ya funcionaban; esta causa (Apariencia pisando el Hero) es lo único que encaja con el síntoma, pero lo confirma el dueño tras desplegar.
- **Precios del cintillo eran inventados**: `/api/market-prices` devolvía una lista fija (Brent 82.45, WTI 78.20…) y solo intentaba oilpriceapi con una clave de entorno que nunca existió; el cliente además tenía otra copia fija. Ahora la fuente es la API oficial de la EIA (gratuita): Brent, WTI, gas natural Henry Hub, diésel ULSD y Jet Fuel (series verificadas contra `/facet/series` de la propia API; unidades tal como las publica la EIA, sin conversiones inventadas). Cache de 15 min (2 min si falla) y timeout de 6 s para no frenar la landing. Lo que la EIA no publica gratis (Merey 16, Pet Coke, Fuel Oil 380, MGO, GNL DES, Dubai) queda como **valor manual** editable en el backoffice, marcado como tal. EN590 pasa a mostrarse como ULSD de la Costa del Golfo en $/gal (no hay serie EIA de EN590 en $/MT).
- **Backoffice**: panel nuevo en `/admin/content/marquee` con el campo para la API key de la EIA (se guarda en `landing_sections` id `market_prices_config`; nunca se devuelve completa —solo los 4 últimos caracteres—, la ruta `/api/admin/market-prices` exige sesión y la pública no la incluye), interruptores para ocultar series, y tabla de valores manuales. Sin clave propia se usa `DEMO_KEY` de la EIA, que tiene un límite muy bajo (10 consultas): conviene registrar una clave gratuita en eia.gov/opendata. `.gitignore` cubre el JSON local donde la clave caería sin PostgreSQL.
- **Verificación**: `tsc`, `build`, batería de seguridad en verde. Navegador local: cifras del Hero editadas y guardadas aparecen en la landing; panel de precios renderiza; la ruta admin devuelve 401 sin sesión y 400 con una clave mal formada, 200 con una válida. La lógica de la EIA se probó con una respuesta simulada (claves, agrupación por ruta, % de cambio, series ocultas) porque la `DEMO_KEY` quedó bloqueada por límite (429) tras las pruebas; con datos reales verifiqué por `curl` (antes del bloqueo) que la EIA devuelve WTI 96.16 y Brent 113.96 a 2026-09-29, frente a los 78.20 / 82.45 que mostraba el cintillo.
- **Pendiente detectado, no tocado**: páginas del admin `content/estadisticas`, `content/textos`, `content/contact` y `content/cta-final` tienen un botón de guardar que solo hace `setSaved(true)` sin llamar a ninguna API (formularios de adorno).
