import { chromium } from 'playwright';

async function runLocalAudit() {
  console.log('=== INICIANDO AUDITORÍA PLAYWRIGHT LOCAL (PUERTO 3005) ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[Browser Console Error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    console.log(`[Browser Page Error] ${err.message}`);
  });

  // 1. Login en local
  console.log('1. Navegando a login local...');
  await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@investoil.es');
  await page.fill('input[type="password"]', 'InvestOil2026!*');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin**', { timeout: 15000 });
  console.log('Login exitoso local, URL actual:', page.url());

  // 2. Navegar a /admin/content/hero
  console.log('2. Navegando a /admin/content/hero...');
  await page.goto('http://localhost:3005/admin/content/hero', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 3. Inspeccionar métricas de scroll (Window, Document, Body, Main)
  const scrollMetrics = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const main = document.querySelector('main');
    const aside = document.querySelector('aside');

    return {
      windowScrollY: window.scrollY,
      html: {
        clientHeight: html.clientHeight,
        scrollHeight: html.scrollHeight,
        hasScroll: html.scrollHeight > html.clientHeight,
        overflowY: window.getComputedStyle(html).overflowY,
      },
      body: {
        clientHeight: body.clientHeight,
        scrollHeight: body.scrollHeight,
        hasScroll: body.scrollHeight > body.clientHeight,
        overflowY: window.getComputedStyle(body).overflowY,
      },
      main: main
        ? {
            clientHeight: main.clientHeight,
            scrollHeight: main.scrollHeight,
            hasScroll: main.scrollHeight > main.clientHeight,
            overflowY: window.getComputedStyle(main).overflowY,
          }
        : null,
      aside: aside
        ? {
            clientHeight: aside.clientHeight,
            scrollHeight: aside.scrollHeight,
            hasScroll: aside.scrollHeight > aside.clientHeight,
            overflowY: window.getComputedStyle(aside).overflowY,
          }
        : null,
    };
  });

  console.log('MÉTRICAS DE SCROLL LOCAL:', JSON.stringify(scrollMetrics, null, 2));

  // 4. Capturar screenshots de /admin/content/hero
  await page.screenshot({ path: 'scripts/screenshot-local-admin-hero-top.png' });

  // 5. Scroll en <main> para comprobar que el scroll interior funciona de maravilla y no mueve el window
  if (scrollMetrics.main?.hasScroll) {
    console.log('Realizando scroll interno en <main>...');
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = 900;
    });
    await page.waitForTimeout(1000);

    const postScrollWindowY = await page.evaluate(() => window.scrollY);
    console.log('window.scrollY después de hacer scroll en <main>:', postScrollWindowY);
    await page.screenshot({ path: 'scripts/screenshot-local-admin-hero-scrolled.png' });
  }

  // 6. Navegar a /admin/media para auditar la biblioteca de medios
  console.log('6. Navegando a /admin/media...');
  await page.goto('http://localhost:3005/admin/media', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scripts/screenshot-local-admin-media.png' });

  const mediaVideos = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.map((v) => ({
      src: v.src,
      currentSrc: v.currentSrc,
      paused: v.paused,
      muted: v.muted,
      readyState: v.readyState,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      duration: v.duration,
    }));
  });
  console.log('Videos en /admin/media:', JSON.stringify(mediaVideos, null, 2));

  // 7. Navegar a la Landing pública
  console.log('7. Navegando a Home público http://localhost:3005/ ...');
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scripts/screenshot-local-home-hero.png' });

  const homeHeroVideo = await page.evaluate(() => {
    const v = document.querySelector('#hero video');
    if (!v) return null;
    return {
      src: v.src,
      currentSrc: v.currentSrc,
      paused: v.paused,
      muted: v.muted,
      readyState: v.readyState,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      duration: v.duration,
    };
  });
  console.log('Video Hero en Home público:', JSON.stringify(homeHeroVideo, null, 2));

  await browser.close();
  console.log('=== AUDITORÍA PLAYWRIGHT LOCAL COMPLETADA EXITOSAMENTE ===');
}

runLocalAudit().catch((err) => {
  console.error('Error en auditoría Playwright:', err);
  process.exit(1);
});
