import { clsx } from 'clsx';
import { z } from 'zod';

// Join optional class names without needing a CSS framework helper.
export function cn(...inputs) {
  return clsx(inputs);
}
/** Format an ISO date string to a human-readable date + time. */
export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
/** Format ISO to date only. */
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
/** Return true if the event start time is in the past. */
export function isEventPast(dateTime) {
  return new Date() >= new Date(dateTime);
}
/** Build the full URL for an uploaded image. */
export function imageUrl(path) {
  if (!path)
    return undefined;
  return `/uploads/${path}`;
}
/** Convert a local datetime-local input value to UTC ISO string. */
export function localToUTC(localValue) {
  return new Date(localValue).toISOString();
}
/** Convert a UTC ISO string to datetime-local input value. */
export function utcToLocal(iso) {
  const d = new Date(iso);
  // datetime-local expects "YYYY-MM-DDTHH:mm"
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const DEPARTMENTS = ['All departments', 'Computer', 'IT', 'AIDS', 'ENTC', 'Mechanical', 'Civil', 'Electrical', 'Instru'];

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const eventSchema = z.object({
  department: z.enum(['All departments', 'Computer', 'IT', 'AIDS', 'ENTC', 'Mechanical', 'Civil', 'Electrical', 'Instru']).optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dateTime: z.string().min(1, 'Date and time is required'),
  venue: z.string().min(2, 'Venue is required'),
  organizerName: z.string().min(2, 'Organizer name is required'),
  capacity: z.string().optional(),
});




