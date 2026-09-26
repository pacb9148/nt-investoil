import { notFound } from 'next/navigation';
import { getLegalPage } from '@/lib/services/server-legal-service';
import { LegalPageView } from '@/components/legal/legal-page-view';
import { legalMetadata } from '@/lib/legal/legal-meta';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return legalMetadata('opciones-de-privacidad');
}

export default async function LegalPage() {
  const pageData = await getLegalPage('opciones-de-privacidad');
  if (!pageData) notFound();
  return <LegalPageView slug="opciones-de-privacidad" initialData={pageData} />;
}
