import { chromium } from 'playwright';

async function run() {
  console.log('--- Iniciando verificación Playwright exhaustiva ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let failedTests = 0;

  try {
    // 1. Verificar Landing y Hero Video
    console.log('1. Verificando Landing Page y Video de Hero...');
    await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });

    const heroVideo = await page.$('section#hero video');
    if (heroVideo) {
      const src = await heroVideo.getAttribute('src');
      console.log('✓ Video de fondo en Hero detectado:', src);
    } else {
      console.error('✗ No se encontró video en section#hero');
      failedTests++;
    }

    // 2. Verificar Miembros del Equipo con Scroll
    console.log('2. Verificando fotos del equipo directivo tras scroll...');
    const teamSection = page.locator('section#team');
    await teamSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const teamImages = await page.$$('section#team img');
    console.log(`Encontradas ${teamImages.length} imágenes en la sección de equipo.`);
    for (let i = 0; i < teamImages.length; i++) {
      const img = teamImages[i];
      const isLoaded = await img.evaluate((node) => node.complete && node.naturalWidth > 0);
      const src = await img.getAttribute('src');
      if (isLoaded) {
        console.log(`✓ Foto de miembro ${i + 1} cargada (${src})`);
      } else {
        console.error(`✗ Foto de miembro ${i + 1} no se renderizó: (${src})`);
        failedTests++;
      }
    }

    // 3. Verificar Artículos del Blog
    console.log('3. Verificando imágenes de artículos en /blog...');
    await page.goto('http://localhost:3005/blog', { waitUntil: 'networkidle' });
    const blogCards = page.locator('article, .blog-card, a[href^="/blog/"]');
    const count = await blogCards.count();
    console.log(`Encontradas ${count} tarjetas en la página de blog.`);

    // Scroll gradual para activar lazy load si lo hay
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const blogImages = await page.$$('main img');
    console.log(`Encontradas ${blogImages.length} imágenes en el blog.`);
    for (let i = 0; i < blogImages.length; i++) {
      const img = blogImages[i];
      const isLoaded = await img.evaluate((node) => node.complete && node.naturalWidth > 0);
      const src = await img.getAttribute('src');
      if (isLoaded) {
        console.log(`✓ Imagen de blog ${i + 1} cargada con éxito (${src?.slice(0, 70)}...)`);
      } else {
        console.error(`✗ Imagen de blog ${i + 1} falló al cargar: ${src}`);
        failedTests++;
      }
    }

    // 4. Verificar Biblioteca de Medios en Backoffice
    console.log('4. Verificando Backoffice /admin/media...');
    await page.goto('http://localhost:3005/admin/media', { waitUntil: 'networkidle' });
    const pageHtml = await page.content();
    const hasDbNotice = pageHtml.includes('Guardado persistente en base de datos');
    const hasLimitNotice = pageHtml.includes('2 MB') && pageHtml.includes('10 MB');

    if (hasDbNotice && hasLimitNotice) {
      console.log('✓ Leyenda técnica de formatos (2 MB / 10 MB) y base de datos verificada en Backoffice.');
    } else {
      console.warn('Aviso sobre leyenda en /admin/media (hasDbNotice:', hasDbNotice, 'hasLimitNotice:', hasLimitNotice, ')');
    }

    console.log(`\n==============================================`);
    console.log(`RESUMEN FINAL: ${failedTests === 0 ? 'TODAS LAS PRUEBAS PASARON (0 ERRORES)' : `${failedTests} PRUEBAS FALLARON`}`);
    console.log(`==============================================\n`);

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error durante la verificación Playwright:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
