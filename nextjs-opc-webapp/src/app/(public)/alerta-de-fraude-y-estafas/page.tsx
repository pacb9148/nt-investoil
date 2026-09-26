import { notFound } from 'next/navigation';
import { getLegalPage } from '@/lib/services/server-legal-service';
import { LegalPageView } from '@/components/legal/legal-page-view';
import { legalMetadata } from '@/lib/legal/legal-meta';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return legalMetadata('alerta-de-fraude-y-estafas');
}

export default async function LegalPage() {
  const pageData = await getLegalPage('alerta-de-fraude-y-estafas');
  if (!pageData) notFound();
  return <LegalPageView slug="alerta-de-fraude-y-estafas" initialData={pageData} />;
}
