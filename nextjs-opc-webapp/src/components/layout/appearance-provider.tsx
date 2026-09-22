'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { LandingAppearanceConfig } from '@/types/content';
import { DEFAULT_APPEARANCE_CONFIG } from '@/lib/services/content-service';

const AppearanceContext = createContext<LandingAppearanceConfig>(DEFAULT_APPEARANCE_CONFIG);

export function AppearanceProvider({
  initialAppearance,
  children,
}: {
  initialAppearance?: LandingAppearanceConfig;
  children: React.ReactNode;
}) {
  const [appearance] = useState<LandingAppearanceConfig>(
    initialAppearance || DEFAULT_APPEARANCE_CONFIG
  );

  useEffect(() => {
    // Aplicar estilos personalizados y variables de color en runtime
    const root = document.documentElement;
    if (appearance.primary_color) {
      root.style.setProperty('--color-accent-custom', appearance.primary_color);
    }
  }, [appearance]);

  return (
    <AppearanceContext.Provider value={appearance}>
      <div
        className={
          appearance.font_heading === 'Outfit'
            ? 'font-outfit'
            : appearance.font_heading === 'Syne'
            ? 'font-syne'
            : appearance.font_heading === 'Cinzel'
            ? 'font-serif'
            : 'font-sans'
        }
      >
        {children}
      </div>
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
