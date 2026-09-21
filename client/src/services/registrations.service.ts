import api from './api';
import { Registration } from '@/types';

export const registerForEvent = async (eventId: string): Promise<Registration> => {
  const res = await api.post<Registration>(`/registrations/${eventId}`);
  return res.data;
};

export const cancelRegistration = async (eventId: string): Promise<void> => {
  await api.delete(`/registrations/${eventId}`);
};

export const getMyRegistrations = async (): Promise<Registration[]> => {
  const res = await api.get<Registration[]>('/registrations/me');
  return res.data;
};

export const checkRegistration = async (
  eventId: string
): Promise<{ registered: boolean }> => {
  const res = await api.get<{ registered: boolean }>(
    `/registrations/${eventId}/status`
  );
  return res.data;
};
