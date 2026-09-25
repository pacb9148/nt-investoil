'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface PostLikeButtonProps {
  postId: string;
  initialLikes?: number;
}

export function PostLikeButton({ postId, initialLikes = 0 }: PostLikeButtonProps) {
  const [likes, setLikes] = useState<number>(initialLikes);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`liked_post_${postId}`);
      if (stored === 'true') {
        setHasLiked(true);
      }
    } catch {}
  }, [postId]);

  const handleLike = async () => {
    if (hasLiked || isLiking) return;

    setIsLiking(true);
    setHasLiked(true);
    setLikes((prev) => prev + 1);

    try {
      localStorage.setItem(`liked_post_${postId}`, 'true');
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.likes !== undefined) {
          setLikes(data.likes);
        }
      }
    } catch (e) {
      console.warn('Error sending like:', e);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={hasLiked || isLiking}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
        hasLiked
          ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-bold shadow-sm'
          : 'bg-card/70 border-border/70 text-text-muted hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 cursor-pointer'
      }`}
      title={hasLiked ? 'Ya recomendaste este artículo' : 'Dar like / Recomendar análisis'}
    >
      <Heart className={`w-3.5 h-3.5 transition-transform ${hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
      <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
    </button>
  );
}
