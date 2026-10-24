import axios from 'axios';

// Keep the frontend connected to the existing Express API.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Account requests
export async function signup(data) {
  const response = await api.post('/auth/signup', data);
  return response.data;
}

export async function login(data) {
  const response = await api.post('/auth/login', data);
  return response.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data;
}

// Event requests
export async function getEvents(search) {
  const response = await api.get('/events', {
    params: search ? { search } : {},
  });
  return response.data;
}

export async function getEventById(id) {
  const response = await api.get(`/events/${id}`);
  return response.data;
}

export async function createEvent(formData) {
  const response = await api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function updateEvent(id, formData) {
  const response = await api.put(`/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function deleteEvent(id) {
  await api.delete(`/events/${id}`);
}

export async function getEventRegistrations(id) {
  const response = await api.get(`/events/${id}/registrations`);
  return response.data;
}

// Event registration requests
export async function registerForEvent(eventId) {
  const response = await api.post(`/registrations/${eventId}`);
  return response.data;
}

export async function cancelRegistration(eventId) {
  await api.delete(`/registrations/${eventId}`);
}

export async function getMyRegistrations() {
  const response = await api.get('/registrations/me');
  return response.data;
}

export async function checkRegistration(eventId) {
  const response = await api.get(`/registrations/${eventId}/status`);
  return response.data;
}

export default api;



