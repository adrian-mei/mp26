import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function bufferToBlobUrl(buffer: ArrayBuffer | undefined, type: string = 'image/jpeg'): string | null {
  if (!buffer) return null;
  const blob = new Blob([buffer], { type });
  return URL.createObjectURL(blob);
}
