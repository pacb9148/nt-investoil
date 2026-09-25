import fs from 'fs';
import path from 'path';

async function syncProductionData() {
  console.log('--- Sincronizando datos de produccion ---');
  
  // 1. Obtener posts de produccion
  const postsRes = await fetch('https://investoil.es/api/posts');
  const posts = await postsRes.json();
  console.log('Encontrados ' + posts.length + ' posts en produccion.');
  
  const postsPaths = [
    path.join(process.cwd(), 'src', 'data', 'posts.json'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data', 'posts.json')
  ];
  for (const p of postsPaths) {
    if (fs.existsSync(path.dirname(p))) {
      fs.writeFileSync(p, JSON.stringify(posts, null, 2), 'utf-8');
      console.log('✓ Guardado posts.json en ' + p);
    }
  }

  // 2. Obtener team de produccion
  const teamRes = await fetch('https://investoil.es/api/content/team');
  const team = await teamRes.json();
  console.log('Encontrados ' + team.length + ' miembros del team en produccion.');
  
  const teamPaths = [
    path.join(process.cwd(), 'src', 'data', 'team.json'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data', 'team.json')
  ];
  for (const p of teamPaths) {
    if (fs.existsSync(path.dirname(p))) {
      fs.writeFileSync(p, JSON.stringify(team, null, 2), 'utf-8');
      console.log('✓ Guardado team.json en ' + p);
    }
  }

  // 3. Descargar todas las imagenes de uploads que esten en posts y team
  const urlsToDownload = new Set();
  posts.forEach(p => {
    if (p.featured_image_url && p.featured_image_url.startsWith('/uploads/')) {
      urlsToDownload.add(p.featured_image_url);
    }
  });
  team.forEach(m => {
    if (m.image && m.image.startsWith('/uploads/')) {
      urlsToDownload.add(m.image);
    }
  });

  const uploadDirs = [
    path.join(process.cwd(), 'public', 'uploads'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'public', 'uploads')
  ];
  uploadDirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  for (const relUrl of urlsToDownload) {
    const filename = path.basename(relUrl);
    console.log('Descargando ' + relUrl + '...');
    try {
      const res = await fetch('https://investoil.es' + relUrl);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        for (const dir of uploadDirs) {
          fs.writeFileSync(path.join(dir, filename), buffer);
        }
        console.log('✓ Guardado ' + filename + ' (' + buffer.length + ' bytes) en uploads locales');
      } else {
        console.warn('Aviso: HTTP ' + res.status + ' al descargar ' + relUrl);
      }
    } catch (err) {
      console.error('Error al descargar ' + relUrl + ':', err);
    }
  }
  console.log('--- Sincronización completada con éxito ---');
}

syncProductionData().catch(console.error);
