import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date string to a human-readable date + time. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format ISO to date only. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Return true if the event start time is in the past. */
export function isEventPast(dateTime: string): boolean {
  return new Date() >= new Date(dateTime);
}

/** Build the full URL for an uploaded image. */
export function imageUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  return `/uploads/${path}`;
}

/** Convert a local datetime-local input value to UTC ISO string. */
export function localToUTC(localValue: string): string {
  return new Date(localValue).toISOString();
}

/** Convert a UTC ISO string to datetime-local input value. */
export function utcToLocal(iso: string): string {
  const d = new Date(iso);
  // datetime-local expects "YYYY-MM-DDTHH:mm"
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
