'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations, TranslationDictionary } from './translations';
import { applyTextOverrides, type TextOverrides } from './text-overrides';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  t: translations.es,
});

const STORAGE_KEY = 'investoil_locale';

export function LanguageProvider({
  children,
  initialLanguage,
  textOverrides,
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
  textOverrides?: TextOverrides;
}) {
  // El servidor conoce el idioma por la cookie: la primera pintura ya sale en él (sin saltar de ES a EN).
  const [language, setLanguageState] = useState<Language>(initialLanguage ?? 'es');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Con cookie del servidor esa elección manda; solo sin ella se recurre a localStorage y al navegador.
    if (initialLanguage) {
      setMounted(true);
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'es' || saved === 'en')) {
        setLanguageState(saved);
      } else {
        const browserLang = navigator.language.startsWith('en') ? 'en' : 'es';
        setLanguageState(browserLang);
      }
    } catch {
      // Ignorar fallo en entornos sin localStorage
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = lang;
    } catch {
      // Ignorar fallo
    }
  };

  const t = applyTextOverrides(translations[language] || translations.es, textOverrides?.[language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
}
