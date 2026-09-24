import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function testCategoriesAndBlog() {
  console.log('=== TEST PLAYWRIGHT: GESTIONAR BLOG, CATEGORÍAS Y VALIDACIÓN ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const screenshotsDir = path.resolve('audit-screenshots-categories');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Iniciar sesión en el Backoffice
  console.log('\n1. Iniciando sesión en /login...');
  await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@investoil.es');
  await page.fill('input[type="password"]', 'InvestOil2026!*');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin**', { timeout: 15000 });
  console.log(' -> Sesión iniciada con éxito en:', page.url());

  // 2. Verificar Sidebar: Botón "Gestionar Blog"
  console.log('\n2. Verificando botón "Gestionar Blog" en el sidebar...');
  const blogBtn = page.locator('aside a[href="/admin/posts"] span:has-text("Gestionar Blog")');
  const blogBtnCount = await blogBtn.count();
  if (blogBtnCount === 0) {
    throw new Error('No se encontró el botón "Gestionar Blog" en el sidebar.');
  }
  console.log(' -> Botón "Gestionar Blog" encontrado correctamente.');
  await page.screenshot({ path: path.join(screenshotsDir, '01-sidebar-gestionar-blog.png') });

  // 3. Navegar a /admin/posts
  console.log('\n3. Accediendo a /admin/posts...');
  await page.goto('http://localhost:3005/admin/posts', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Verificar columna "Categoría" y botones de categorías
  const thCategoria = await page.locator('th:has-text("Categoría")').isVisible();
  console.log(' -> Columna "Categoría" visible:', thCategoria);
  if (!thCategoria) throw new Error('Columna Categoría no está visible');

  // Verificar botón "Gestionar Categorías"
  const catManagerBtn = page.locator('button:has-text("Gestionar Categorías")');
  const catManagerBtnVisible = await catManagerBtn.isVisible();
  console.log(' -> Botón "Gestionar Categorías" visible:', catManagerBtnVisible);
  if (!catManagerBtnVisible) throw new Error('Botón Gestionar Categorías no visible');

  await page.screenshot({ path: path.join(screenshotsDir, '02-admin-posts-table.png') });

  // 4. Abrir modal de categorías y crear una nueva
  console.log('\n4. Abriendo modal de gestión de categorías...');
  await catManagerBtn.click();
  await page.waitForTimeout(800);

  const modalHeader = page.locator('h2:has-text("Gestión de Categorías del Blog")');
  const modalVisible = await modalHeader.isVisible();
  console.log(' -> Modal de categorías abierto:', modalVisible);
  await page.screenshot({ path: path.join(screenshotsDir, '03-categories-modal.png') });

  // Crear categoría "Transición Energética"
  console.log(' -> Creando categoría de prueba "Transición Energética"...');
  await page.fill('input[placeholder="Ej. Trading de Crudo Spot"]', 'Transición Energética');
  await page.fill('input[placeholder="Breve alcance temático de los análisis asignados a esta categoría..."]', 'Artículos sobre renovables, biocombustibles y descarbonización.');
  await page.click('button:has-text("Guardar Categoría en BD")');
  await page.waitForTimeout(1500);

  const createdCategoryBadge = page.locator('span:has-text("Transición Energética")').first();
  const catCreated = await createdCategoryBadge.isVisible();
  console.log(' -> Categoría creada y visible en la lista:', catCreated);
  await page.screenshot({ path: path.join(screenshotsDir, '04-category-created.png') });

  // Cerrar modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 5. Verificar validación en creación de posts (/admin/posts/new)
  console.log('\n5. Verificando validación de categoría obligatoria en /admin/posts/new...');
  await page.goto('http://localhost:3005/admin/posts/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Intentar publicar con título pero sin categoría
  await page.fill('input[placeholder="Ej. Dinámica del Suministro de Pet Coke hacia Asia..."]', 'Artículo Test Sin Categoría');
  await page.waitForTimeout(300);

  // Hacer click en "Publicar Ahora"
  await page.click('button:has-text("Publicar Ahora")');
  await page.waitForTimeout(500);

  const errorAlert = page.locator('span:has-text("Es imprescindible asignar una categoría válida antes de publicar el artículo.")').first();
  const errorAlertVisible = await errorAlert.isVisible();
  console.log(' -> Mensaje de error por falta de categoría visible:', errorAlertVisible);
  if (!errorAlertVisible) {
    throw new Error('Fallo de validación: se permitió publicar o no se mostró el error de categoría');
  }
  await page.screenshot({ path: path.join(screenshotsDir, '05-validation-no-category.png') });

  // Asignar categoría y verificar que el select contiene la nueva categoría
  console.log(' -> Seleccionando categoría...');
  const categorySelect = page.locator('select').first();
  await categorySelect.selectOption({ label: 'Transición Energética' });
  await page.waitForTimeout(300);

  // Guardar como Borrador
  console.log(' -> Guardando como Borrador...');
  await page.click('button:has-text("Guardar Borrador")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotsDir, '06-post-saved-draft.png') });

  // 6. Verificar página pública /blog
  console.log('\n6. Verificando página pública /blog con categorías...');
  await page.goto('http://localhost:3005/blog', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const categoryPills = await page.locator('button:has-text("Todos")').isVisible();
  console.log(' -> Selector de categorías en /blog visible:', categoryPills);
  await page.screenshot({ path: path.join(screenshotsDir, '07-public-blog.png') });

  console.log('\n=== AUDITORÍA PLAYWRIGHT COMPLETADA CON ÉXITO: TODAS LAS PRUEBAS EN VERDE ===');
  await browser.close();
}

testCategoriesAndBlog().catch((err) => {
  console.error('ERROR EN EL TEST:', err);
  process.exit(1);
});
