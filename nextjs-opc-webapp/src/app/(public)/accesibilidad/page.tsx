import { notFound } from 'next/navigation';
import { getLegalPage } from '@/lib/services/server-legal-service';
import { LegalPageView } from '@/components/legal/legal-page-view';
import { legalMetadata } from '@/lib/legal/legal-meta';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return legalMetadata('accesibilidad');
}

export default async function LegalPage() {
  const pageData = await getLegalPage('accesibilidad');
  if (!pageData) notFound();
  return <LegalPageView slug="accesibilidad" initialData={pageData} />;
}
