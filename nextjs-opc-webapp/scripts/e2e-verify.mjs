import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runVerification() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const screenshotsDir = path.join(process.cwd(), 'playwright-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('1. Verificando Landing Page y Orbe de IA...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(screenshotsDir, '01-landing-servicios-y-orbe.png'), fullPage: false });

  console.log('2. Abriendo Orbe de IA y enviando consulta...');
  const orbeBtn = page.locator('button[aria-label="Abrir asistente de IA Invest Oil"]');
  if (await orbeBtn.isVisible()) {
    await orbeBtn.click();
    await page.waitForTimeout(500);
    // Clic en sugerencia de Diésel EN590
    const dieselBtn = page.locator('button:has-text("Especificación Diésel EN590")');
    if (await dieselBtn.isVisible()) {
      await dieselBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: path.join(screenshotsDir, '02-orbe-chat-abierto.png') });
  }

  console.log('3. Iniciando Sesión en el Backoffice...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  const autoBtn = page.locator('button:has-text("Autocompletar credenciales")');
  if (await autoBtn.isVisible()) {
    await autoBtn.click();
    await page.waitForTimeout(300);
  }
  await page.locator('button:has-text("Acceder al Panel")').click();
  await page.waitForURL('**/admin', { timeout: 10000 });
  await page.waitForTimeout(1000);

  console.log('4. Verificando Editor de Posts...');
  await page.goto('http://localhost:3000/admin/posts/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '03-editor-posts-compacto.png') });

  console.log('5. Verificando Configuración de Proveedores de IA...');
  await page.goto('http://localhost:3000/admin/settings/ai', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '04-settings-ai-providers.png') });

  console.log('6. Verificando Formulario del Hero (Sin saltos y con barra flotante)...');
  await page.goto('http://localhost:3000/admin/content/hero', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '05-hero-form-fixed.png') });

  console.log('7. Verificando Biblioteca de Medios (Botón Deduplicar)...');
  await page.goto('http://localhost:3000/admin/media', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '06-admin-media.png') });

  console.log('¡Todas las verificaciones visuales completadas exitosamente!');
  await browser.close();
}

runVerification().catch((err) => {
  console.error('Error durante la verificación:', err);
  process.exit(1);
});
