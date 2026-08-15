import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Gộp class Tailwind an toàn (điều kiện + khử trùng lặp). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
