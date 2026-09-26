import { notFound } from 'next/navigation';
import { getLegalPage } from '@/lib/services/server-legal-service';
import { LegalPageView } from '@/components/legal/legal-page-view';
import { legalMetadata } from '@/lib/legal/legal-meta';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return legalMetadata('politica-de-cookies');
}

export default async function LegalPage() {
  const pageData = await getLegalPage('politica-de-cookies');
  if (!pageData) notFound();
  return <LegalPageView slug="politica-de-cookies" initialData={pageData} />;
}
