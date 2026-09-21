import api from './api';
import { Event } from '@/types';

export const getEvents = async (search?: string): Promise<Event[]> => {
  const res = await api.get<Event[]>('/events', {
    params: search ? { search } : {},
  });
  return res.data;
};

export const getEventById = async (id: string): Promise<Event> => {
  const res = await api.get<Event>(`/events/${id}`);
  return res.data;
};

export const createEvent = async (formData: FormData): Promise<Event> => {
  const res = await api.post<Event>('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateEvent = async (
  id: string,
  formData: FormData
): Promise<Event> => {
  const res = await api.put<Event>(`/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`);
};

export const getEventRegistrations = async (id: string) => {
  const res = await api.get(`/events/${id}/registrations`);
  return res.data;
};
