# Memoria de Desarrollo (DEVmemory) — nt-investoil

## Sesión: Creación e Implementación de la WebApp Invest Oil LLC
**Fecha:** 2026-09-22  
**Repositorio:** `https://github.com/pacb9148/nt-investoil`  
**Autor:** Antigravity (Equipo Sistema OPC)

### 1. Decisiones Técnicas y Arquitectura
- **Next.js 14+ (App Router):** Estructura monolítica modular en `nextjs-opc-webapp` con páginas públicas en `(public)`, autenticación en `(auth)`, panel administrativo en `(dashboard)` y endpoints API en `api/`.
- **Aislamiento Absoluto:** Las carpetas locales de referencia en `C:\Users\pacb9\Documents\GitHub\opc\` se mantuvieron estrictamente en modo solo lectura; ningún archivo fue alterado ni creado allí.
- **Tokens de Diseño:** Se adoptó la paleta dark obsidiana de `opc/public/landing.html` (fondo `#050d1f`, acento petróleo `#00c9a7`, ámbar `#f5a623`, neón `#eaff3f`), logrando contraste superior a 4.5:1 (WCAG AA).
- **Editor Tiptap Avanzado:** Implementado con extensiones completas para tablas, listas de tareas, bloques de código, inserción de imágenes y embeds de YouTube/Vimeo.
- **Herramienta de Republicación de Noticias:** Endpoint `/api/news-republish` que extrae metadatos OpenGraph (título, resumen, imagen, fuente canónica) y permite republicar con 1 clic atribuyendo la fuente externa.
- **Branding Extraído:** Se procesó el activo subido (`media_1790109740389.png`) para generar:
  - Sello oficial circular con fondo transparente (`public/images/branding/seal-transparent.png`).
  - Logotipo de la gota con la torre petrolífera y pastilla "INVEST OIL LLC" (`public/images/branding/logo.png`).
  - Favicons multirresolución (`favicon.ico`, `favicon.png`, `icon-192.png`, `icon-512.png`).
- **Seguridad Strix & AppSec:** Suite de seguridad instalada en `scripts/bateria-seguridad.ps1` y workflow en `.github/workflows/strix-security-scan.yml`. Batería ejecutada y aprobada al 100%.

### 2. Estado de Verificación
- `pnpm type-check`: 0 errores de tipado TypeScript estricto.
- `pnpm build`: 27 rutas estáticas y dinámicas compiladas exitosamente.
- `pwsh ./scripts/bateria-seguridad.ps1`: APROBADO (0 secretos filtrados, dependencias sin alertas críticas).
- Documentación técnica guardada en `README.md` y `C:\Users\pacb9\Documents\Github Docs\Guia-InvestOil-Nextjs-Supabase-Webapp.md`.
