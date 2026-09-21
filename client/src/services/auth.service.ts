import api from './api';
import { User } from '@/types';

export const signup = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  const res = await api.post<User>('/auth/signup', data);
  return res.data;
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<User> => {
  const res = await api.post<User>('/auth/login', data);
  return res.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getMe = async (): Promise<User> => {
  const res = await api.get<User>('/auth/me');
  return res.data;
};
