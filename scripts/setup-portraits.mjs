import fs from 'fs';
import path from 'path';
import https from 'https';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'nextjs-opc-webapp', 'public');
const teamDir = path.join(publicDir, 'images', 'team');
const testDir = path.join(publicDir, 'images', 'testimonials');

fs.mkdirSync(teamDir, { recursive: true });
fs.mkdirSync(testDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Descargando retratos oficiales del Team y Testimonios...');

  // Si existen fotos previas subidas en uploads, copiarlas también como retratos
  const uploaded36 = path.join(publicDir, 'uploads', '1790121109706-descarga__36_.jpg');
  const uploaded2 = path.join(publicDir, 'uploads', '1790121037141-descarga__2_.jpg');

  if (fs.existsSync(uploaded2)) {
    fs.copyFileSync(uploaded2, path.join(teamDir, 'carlos-medina.jpg'));
    console.log('✓ carlos-medina.jpg copiado desde uploads');
  } else {
    await download('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=85', path.join(teamDir, 'carlos-medina.jpg'));
  }

  if (fs.existsSync(uploaded36)) {
    fs.copyFileSync(uploaded36, path.join(teamDir, 'paulo-dasilva.jpg'));
    console.log('✓ paulo-dasilva.jpg copiado desde uploads');
  } else {
    await download('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=600&q=85', path.join(teamDir, 'paulo-dasilva.jpg'));
  }

  // Descarga del resto de miembros ejecutivos
  const teamDownloads = [
    { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=600&q=85', file: 'elena-torres.jpg' },
    { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=600&q=85', file: 'marco-ferreira.jpg' },
    { url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&h=600&q=85', file: 'aisha-rahman.jpg' },
    { url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&h=600&q=85', file: 'ana-villalobos.jpg' },
  ];

  for (const item of teamDownloads) {
    const dest = path.join(teamDir, item.file);
    console.log(`Descargando ${item.file}...`);
    await download(item.url, dest);
  }

  // Descarga de fotos para testimonios
  const testDownloads = [
    { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&h=600&q=85', file: 'test-01.jpg' },
    { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=85', file: 'test-02.jpg' },
    { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=600&q=85', file: 'test-03.jpg' },
    { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=600&q=85', file: 'test-04.jpg' },
    { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=600&q=85', file: 'test-05.jpg' },
  ];

  for (const item of testDownloads) {
    const dest = path.join(testDir, item.file);
    console.log(`Descargando testimonio ${item.file}...`);
    await download(item.url, dest);
  }

  console.log('¡Todos los retratos descargados y guardados en public/images/!');
}

main().catch(console.error);
