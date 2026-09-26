import { notFound } from 'next/navigation';
import { getLegalPage } from '@/lib/services/server-legal-service';
import { LegalPageView } from '@/components/legal/legal-page-view';
import { legalMetadata } from '@/lib/legal/legal-meta';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return legalMetadata('aviso-de-privacidad');
}

export default async function LegalPage() {
  const pageData = await getLegalPage('aviso-de-privacidad');
  if (!pageData) notFound();
  return <LegalPageView slug="aviso-de-privacidad" initialData={pageData} />;
}
