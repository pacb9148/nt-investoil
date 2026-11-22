'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';

interface PostViewCountProps {
  postId: string;
  initialViews?: number;
}

/**
 * Muestra las lecturas y registra una al abrir el artículo. Una lectura por pestaña y artículo
 * (sessionStorage): recargar o volver atrás no infla el contador. El número mostrado es el que
 * devuelve el servidor tras sumar, así coincide con lo que verá cualquier otro visitante.
 */
export function PostViewCount({ postId, initialViews = 0 }: PostViewCountProps) {
  const { language } = useLanguage();
  const [views, setViews] = useState<number>(initialViews);

  useEffect(() => {
    const key = `viewed_post_${postId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // Sin sessionStorage (modo privado estricto) se cuenta igualmente: mejor una lectura de más.
    }

    let cancelled = false;
    fetch(`/api/posts/${postId}/view`, { method: 'POST' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.views === 'number') setViews(data.views);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [postId]);

  return <span>{views} {language === 'en' ? 'views' : 'lecturas'}</span>;
}
