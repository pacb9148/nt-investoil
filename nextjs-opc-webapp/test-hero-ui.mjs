import { chromium } from 'playwright';

async function runAudit() {
  console.log('--- INICIANDO AUDITORÍA PLAYWRIGHT ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Escuchar errores de consola y red
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[Browser Console Error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    console.log(`[Browser Page Error] ${err.message}`);
  });

  // 1. Login
  console.log('1. Navegando a login...');
  await page.goto('https://investoil.es/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@investoil.es');
  await page.fill('input[type="password"]', 'InvestOil2026!*');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin**', { timeout: 15000 });
  console.log('Login exitoso, URL actual:', page.url());

  // 2. Navegar a /admin/content/hero
  console.log('2. Navegando a /admin/content/hero...');
  await page.goto('https://investoil.es/admin/content/hero', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 3. Inspeccionar barras de scroll (Window / Document / Body / Main)
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
      main: main ? {
        clientHeight: main.clientHeight,
        scrollHeight: main.scrollHeight,
        hasScroll: main.scrollHeight > main.clientHeight,
        overflowY: window.getComputedStyle(main).overflowY,
      } : null,
      aside: aside ? {
        clientHeight: aside.clientHeight,
        scrollHeight: aside.scrollHeight,
        hasScroll: aside.scrollHeight > aside.clientHeight,
        overflowY: window.getComputedStyle(aside).overflowY,
      } : null,
    };
  });

  console.log('Métricas de Scroll detectadas:', JSON.stringify(scrollMetrics, null, 2));

  // 4. Capturar pantalla de /admin/content/hero
  await page.screenshot({ path: 'scripts/screenshot-admin-hero-top.png' });

  // 5. Simular scroll hacia abajo en main y en window
  if (scrollMetrics.main?.hasScroll) {
    console.log('Haciendo scroll en <main>...');
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = 800;
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scripts/screenshot-admin-hero-scrolled.png' });
  }

  // 6. Inspeccionar el video de fondo en el formulario
  const videoDetails = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.map((v) => ({
      src: v.src,
      currentSrc: v.currentSrc,
      paused: v.paused,
      muted: v.muted,
      readyState: v.readyState,
      networkState: v.networkState,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      duration: v.duration,
      error: v.error ? { code: v.error.code, message: v.error.message } : null,
    }));
  });

  console.log('Detalles de videos en /admin/content/hero:', JSON.stringify(videoDetails, null, 2));

  // 7. Navegar a /admin/media para auditar la biblioteca de medios
  console.log('3. Navegando a /admin/media...');
  await page.goto('https://investoil.es/admin/media', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scripts/screenshot-admin-media.png' });

  const mediaVideos = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.map((v) => ({
      src: v.src,
      currentSrc: v.currentSrc,
      paused: v.paused,
      readyState: v.readyState,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      duration: v.duration,
      error: v.error ? { code: v.error.code, message: v.error.message } : null,
    }));
  });
  console.log('Detalles de videos en /admin/media:', JSON.stringify(mediaVideos, null, 2));

  // 8. Navegar al home público
  console.log('4. Navegando al Home público https://investoil.es/ ...');
  await page.goto('https://investoil.es/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const homeVideoDetails = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.map((v) => ({
      src: v.src,
      currentSrc: v.currentSrc,
      paused: v.paused,
      muted: v.muted,
      readyState: v.readyState,
      networkState: v.networkState,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      duration: v.duration,
      error: v.error ? { code: v.error.code, message: v.error.message } : null,
    }));
  });

  console.log('Detalles de videos en Home público:', JSON.stringify(homeVideoDetails, null, 2));
  await page.screenshot({ path: 'scripts/screenshot-home-hero.png' });

  await browser.close();
  console.log('--- AUDITORÍA PLAYWRIGHT COMPLETADA ---');
}

runAudit().catch((err) => {
  console.error('Error en auditoría Playwright:', err);
  process.exit(1);
});
