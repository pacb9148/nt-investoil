import { permanentRedirect } from 'next/navigation';

// «Servicios» pasó a ser la sección «Actualidad» de la portada; se conservan los enlaces antiguos.
export default function ServicesPage() {
  permanentRedirect('/#actualidad');
}
