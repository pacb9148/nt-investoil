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
