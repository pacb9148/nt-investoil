import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PublicAiOrbe } from '@/components/chat/public-ai-orbe';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <PublicAiOrbe />
    </div>
  );
}
