import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('=== INICIANDO BATERÍA DE PRUEBAS DE ACCESO Y PERSISTENCIA ===\n');
  let failures = 0;

  // 1. Probar Login
  console.log('1. Probando Login de Administrador...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@investoil.es',
      password: 'InvestOil2026!*'
    })
  });
  
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get('set-cookie');
  console.log(`- Status: ${loginRes.status}`);
  console.log(`- Success: ${loginData.success}`);
  console.log(`- Usuario: ${loginData.user?.email} (${loginData.user?.role})`);
  console.log(`- Set-Cookie recibido: ${Boolean(cookies)}`);
  
  if (loginRes.status !== 200 || !loginData.success || !cookies) {
    console.error('❌ FALLÓ EL LOGIN');
    failures++;
  } else {
    console.log('✅ LOGIN EXITOSO');
  }

  // 2. Extraer cookie para llamadas autenticadas
  const sessionCookie = cookies ? cookies.split(';')[0] : '';

  // 3. Probar verificación de sesión /api/auth/me
  console.log('\n2. Verificando sesión con /api/auth/me...');
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: sessionCookie }
  });
  const meData = await meRes.json();
  console.log(`- Status: ${meRes.status}`);
  console.log(`- Usuario verificado: ${meData.user?.email}`);
  if (meRes.status === 200 && meData.user?.email === 'admin@investoil.es') {
    console.log('✅ SESIÓN VERIFICADA');
  } else {
    console.error('❌ FALLÓ LA VERIFICACIÓN DE SESIÓN');
    failures++;
  }

  // 4. Probar acceso al Backoffice /admin
  console.log('\n3. Verificando acceso a /admin con cookie de sesión...');
  const adminRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: sessionCookie },
    redirect: 'manual'
  });
  console.log(`- Status: ${adminRes.status}`);
  if (adminRes.status === 200) {
    console.log('✅ ACCESO A BACKOFFICE AUTORIZADO (200 OK)');
  } else {
    console.error(`❌ ERROR DE ACCESO A BACKOFFICE (Status: ${adminRes.status})`);
    failures++;
  }

  // 5. Probar creación de Post con Imagen y Video en la Base de Datos
  console.log('\n4. Creando nuevo post con imagen y video en la Base de Datos...');
  const testPost = {
    title: 'Proyecto Estratégico de Oleoductos 2026',
    slug: 'proyecto-estrategico-oleoductos-2026',
    excerpt: 'Análisis detallado de la infraestructura de transporte petrolífero y modernización.',
    content: '<p>Contenido completo del artículo técnico con proyecciones y detalles operativos.</p>',
    status: 'published',
    featured_image_url: '/uploads/featured-pipeline.jpg',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tags: ['Infraestructura', 'Crudo', 'Inversión'],
    categories: [{ id: 'cat-mercados', name: 'Mercados', slug: 'mercados' }]
  };

  const createPostRes = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Cookie: sessionCookie 
    },
    body: JSON.stringify(testPost)
  });
  const createPostData = await createPostRes.json();
  console.log(`- Status: ${createPostRes.status}`);
  console.log(`- Post creado: ID=${createPostData.post?.id}, Título="${createPostData.post?.title}"`);
  console.log(`- Video asociado: ${createPostData.post?.video_url}`);
  console.log(`- Imagen destacada: ${createPostData.post?.featured_image_url}`);

  if (createPostRes.ok && createPostData.post?.id) {
    console.log('✅ POST GUARDADO CORRECTAMENTE EN LA BASE DE DATOS');
  } else {
    console.error('❌ FALLÓ LA CREACIÓN DEL POST');
    failures++;
  }

  // 6. Verificar persistencia física en posts.json
  console.log('\n5. Verificando persistencia física en disco (src/data/posts.json)...');
  const postsJsonPath = path.join(process.cwd(), 'src', 'data', 'posts.json');
  const postsOnDisk = JSON.parse(fs.readFileSync(postsJsonPath, 'utf8'));
  const foundPost = postsOnDisk.find(p => p.slug === 'proyecto-estrategico-oleoductos-2026');
  if (foundPost && foundPost.video_url && foundPost.featured_image_url) {
    console.log(`✅ POST ENCONTRADO EN DISCO: "${foundPost.title}" con video "${foundPost.video_url}"`);
  } else {
    console.error('❌ EL POST NO SE PERSISTIÓ CORRECTAMENTE EN DISCO');
    failures++;
  }

  // 7. Probar registro de Medios (imágenes/videos) en la Base de Datos
  console.log('\n6. Guardando elemento multimedia en /api/media...');
  const testMedia = {
    filename: 'oleoducto-valvula-inspeccion.jpg',
    url: '/uploads/oleoducto-valvula-inspeccion.jpg',
    type: 'image',
    mime_type: 'image/jpeg',
    size: 245000,
    alt_text: 'Válvula de seguridad en estación de compresión'
  };

  const mediaRes = await fetch(`${BASE_URL}/api/media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie
    },
    body: JSON.stringify(testMedia)
  });
  const mediaData = await mediaRes.json();
  console.log(`- Status: ${mediaRes.status}`);
  console.log(`- Media ID: ${mediaData.media?.id}`);

  // Verificar en disco src/data/media.json
  const mediaJsonPath = path.join(process.cwd(), 'src', 'data', 'media.json');
  const mediaOnDisk = JSON.parse(fs.readFileSync(mediaJsonPath, 'utf8'));
  const foundMedia = mediaOnDisk.find(m => m.filename === 'oleoducto-valvula-inspeccion.jpg');
  if (foundMedia) {
    console.log(`✅ ARCHIVO MULTIMEDIA PERSISTIDO EN DISCO (${foundMedia.filename})`);
  } else {
    console.error('❌ EL MULTIMEDIA NO SE PERSISTIÓ EN DISCO');
    failures++;
  }

  // 8. Probar actualización y persistencia del Equipo (Team)
  console.log('\n7. Verificando persistencia del Equipo (/api/content/team)...');
  const teamGetRes = await fetch(`${BASE_URL}/api/content/team`);
  const initialTeam = await teamGetRes.json();
  console.log(`- Miembros actuales: ${initialTeam.length}`);

  const updatedTeam = [
    ...initialTeam,
    {
      id: 'team-director-operaciones',
      name: 'Ing. Carlos Mendoza',
      role: 'Director de Operaciones & Logística',
      bio: 'Especialista en distribución de hidrocarburos y comercio internacional con más de 18 años de experiencia.',
      avatar_url: '/uploads/team-carlos.jpg',
      email: 'carlos.mendoza@investoil.es',
      order: initialTeam.length + 1
    }
  ];

  const teamPostRes = await fetch(`${BASE_URL}/api/content/team`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie
    },
    body: JSON.stringify({ members: updatedTeam })
  });
  const teamPostData = await teamPostRes.json();
  console.log(`- Guardado team: ${teamPostData.success}`);

  // Verificar en disco src/data/team.json
  const teamJsonPath = path.join(process.cwd(), 'src', 'data', 'team.json');
  const teamOnDisk = JSON.parse(fs.readFileSync(teamJsonPath, 'utf8'));
  const foundTeamMember = teamOnDisk.find(m => m.name === 'Ing. Carlos Mendoza');
  if (foundTeamMember) {
    console.log(`✅ NUEVO MIEMBRO DEL EQUIPO PERSISTIDO EN DISCO: ${foundTeamMember.name}`);
  } else {
    console.error('❌ EL EQUIPO NO SE PERSISTIÓ EN DISCO');
    failures++;
  }

  // 9. Comprobar renderizado público del nuevo Post en el Blog
  console.log('\n8. Verificando renderizado en la página pública del blog...');
  const blogPageRes = await fetch(`${BASE_URL}/blog`);
  const blogHtml = await blogPageRes.text();
  const inBlogGrid = blogHtml.includes('Proyecto Estratégico de Oleoductos 2026');
  console.log(`- ¿Aparece el post en /blog?: ${inBlogGrid}`);

  const postSlugRes = await fetch(`${BASE_URL}/blog/proyecto-estrategico-oleoductos-2026`);
  const postHtml = await postSlugRes.text();
  const hasTitle = postHtml.includes('Proyecto Estratégico de Oleoductos 2026');
  const hasVideo = postHtml.includes('dQw4w9WgXcQ');
  console.log(`- ¿Página de detalle /blog/[slug] carga correctamente (200)?: ${postSlugRes.status === 200}`);
  console.log(`- ¿Contiene el título?: ${hasTitle}`);
  console.log(`- ¿Contiene el reproductor de video?: ${hasVideo}`);

  if (inBlogGrid && hasTitle && hasVideo) {
    console.log('✅ BLOG PÚBLICO MUESTRA ARTÍCULO, IMAGEN Y VIDEO CORRECTAMENTE');
  } else {
    console.error('❌ FALLÓ EL RENDERIZADO DEL BLOG PÚBLICO');
    failures++;
  }

  console.log(`\n========================================`);
  if (failures === 0) {
    console.log('🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE (0 FALLOS)');
  } else {
    console.error(`⚠️ SE ENCONTRARON ${failures} FALLOS EN LAS PRUEBAS`);
  }
  console.log(`========================================\n`);

  process.exit(failures > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Error fatal durante la prueba:', err);
  process.exit(1);
});
