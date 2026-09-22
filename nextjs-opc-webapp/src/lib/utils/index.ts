import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, '-') // spaces to dashes
    .replace(/[^\w\-]+/g, '') // remove non-words
    .replace(/\-\-+/g, '-') // collapse dashes
    .replace(/^-+/, '') // trim starting dash
    .replace(/-+$/, ''); // trim ending dash
}

export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  } catch (e) {
    return String(dateStr);
  }
}

export function formatDateTime(dateStr?: string | Date | null): string {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, "d MMM yyyy, HH:mm", { locale: es });
  } catch (e) {
    return String(dateStr);
  }
}

export function formatBytes(bytes?: number | null, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function calculateReadingTime(content: any): number {
  if (!content) return 3;
  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (typeof content === 'object') {
    text = JSON.stringify(content);
  }
  const words = text.replace(/<[^>]+>/g, '').split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

export function truncate(text: string, length = 120): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '…';
}
