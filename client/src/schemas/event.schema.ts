import { z } from 'zod';

export const eventSchema = z.object({
  department: z.enum(['All departments', 'Computer', 'IT', 'AIDS', 'ENTC', 'Mechanical', 'Civil', 'Electrical', 'Instru']).optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dateTime: z.string().min(1, 'Date and time is required'),
  venue: z.string().min(2, 'Venue is required'),
  organizerName: z.string().min(2, 'Organizer name is required'),
  capacity: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
