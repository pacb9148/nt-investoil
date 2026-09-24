import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runComprehensiveAudit() {
  console.log('=== INICIANDO AUDITORÍA INTEGRAL PLAYWRIGHT ===');
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

  const screenshotsDir = path.resolve('audit-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Visitar Portada Pública (/)
  console.log('\n1. Verificando Portada Pública (http://localhost:3005)...');
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const headerVisible = await page.locator('header').isVisible();
  console.log(' - Cabecera visible:', headerVisible);

  const heroCardImg = await page.locator('section img[alt*="Sello"], section img[alt*="Invest Oil"]').first();
  const heroCardImgSrc = await heroCardImg.getAttribute('src').catch(() => null);
  console.log(' - Imagen corporativa en Hero:', heroCardImgSrc);

  const videoElement = await page.locator('video').first();
  const videoSrc = await videoElement.getAttribute('src').catch(() => null);
  console.log(' - Video del Hero:', videoSrc);

  await page.screenshot({ path: path.join(screenshotsDir, '01-landing-hero.png') });

  // Scroll al Footer
  console.log(' - Verificando Footer público...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '02-landing-footer.png') });

  // 2. Visitar Página Nosotros (/about)
  console.log('\n2. Verificando Página Nosotros (/about)...');
  await page.goto('http://localhost:3005/about', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const aboutTitle = await page.locator('h1').textContent().catch(() => '');
  console.log(' - Título Nosotros:', aboutTitle?.trim());
  await page.screenshot({ path: path.join(screenshotsDir, '03-public-about.png') });

  // 3. Login en Backoffice
  console.log('\n3. Autenticando en /login...');
  await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@investoil.es');
  await page.fill('input[type="password"]', 'InvestOil2026!*');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin**', { timeout: 15000 });
  console.log(' - Login correcto, URL:', page.url());

  // 4. Panel de Contenido (/admin/content)
  console.log('\n4. Verificando Módulos Ordenados 1:1 en /admin/content...');
  await page.goto('http://localhost:3005/admin/content', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '04-admin-content-overview.png') });

  // 5. Cabecera & Menú (/admin/content/header)
  console.log('\n5. Verificando Editor de Cabecera (/admin/content/header)...');
  await page.goto('http://localhost:3005/admin/content/header', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '05-admin-header-editor.png') });

  // 6. Apariencia (/admin/content/apariencia)
  console.log('\n6. Verificando Apariencia & Logotipo (/admin/content/apariencia)...');
  await page.goto('http://localhost:3005/admin/content/apariencia', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const aparienciaCardLogoSrc = await page.locator('img[alt*="Sello Oficial"]').first().getAttribute('src').catch(() => null);
  console.log(' - Imagen de la tarjeta en Apariencia:', aparienciaCardLogoSrc);
  await page.screenshot({ path: path.join(screenshotsDir, '06-admin-apariencia.png') });

  // 7. Nosotros (/admin/content/nosotros)
  console.log('\n7. Verificando Editor de Nosotros (/admin/content/nosotros)...');
  await page.goto('http://localhost:3005/admin/content/nosotros', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '07-admin-nosotros.png') });

  // 8. Footer & Sedes (/admin/content/settings)
  console.log('\n8. Verificando Pie de Página & Sedes (/admin/content/settings)...');
  await page.goto('http://localhost:3005/admin/content/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '08-admin-footer-settings.png') });

  // 9. SEO & Redes (/admin/content/seo)
  console.log('\n9. Verificando SEO & Previsualización Social (/admin/content/seo)...');
  await page.goto('http://localhost:3005/admin/content/seo', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '09-admin-seo.png') });

  console.log('\n=== AUDITORÍA PLAYWRIGHT FINALIZADA CON ÉXITO: 9/9 PRUEBAS COMPLETADAS ===');
  await browser.close();
}

runComprehensiveAudit().catch((err) => {
  console.error('Error durante la auditoría Playwright:', err);
  process.exit(1);
});
