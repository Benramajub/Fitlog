import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
};

export const membersApi = {
  list: () => api.get('/members').then(r => r.data),
  get: (id: string) => api.get(`/members/${id}`).then(r => r.data),
  stats: (id: string) => api.get(`/members/${id}/stats`).then(r => r.data),
  create: (data: any) => api.post('/members', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/members/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/members/${id}`).then(r => r.data),
};

export const sessionsApi = {
  list: (params?: { memberId?: string; date?: string }) =>
    api.get('/sessions', { params }).then(r => r.data),
  get: (id: string) => api.get(`/sessions/${id}`).then(r => r.data),
  schedule: (data: any) => api.post('/sessions/schedule', data).then(r => r.data),
  start: (id: string) => api.patch(`/sessions/${id}/start`).then(r => r.data),
  end: (id: string, notes?: string) => api.patch(`/sessions/${id}/end`, { notes }).then(r => r.data),
  cancel: (id: string) => api.patch(`/sessions/${id}/cancel`).then(r => r.data),
  calendar: (year: number, month: number) =>
    api.get('/calendar', { params: { year, month } }).then(r => r.data),
};

export const programsApi = {
  listByMember: (memberId: string) =>
    api.get('/programs', { params: { memberId } }).then(r => r.data),
  get: (id: string) => api.get(`/programs/${id}`).then(r => r.data),
  create: (data: any) => api.post('/programs', data).then(r => r.data),
  remove: (id: string) => api.delete(`/programs/${id}`).then(r => r.data),
  addDay: (programId: string, data: any) =>
    api.post(`/programs/${programId}/days`, data).then(r => r.data),
  updateDay: (dayId: string, title: string) =>
    api.patch(`/programs/days/${dayId}`, { title }).then(r => r.data),
  addExercise: (dayId: string, data: any) =>
    api.post(`/programs/days/${dayId}/exercises`, data).then(r => r.data),
  updateExercise: (exId: string, data: any) =>
    api.patch(`/programs/exercises/${exId}`, data).then(r => r.data),
  removeExercise: (exId: string) =>
    api.delete(`/programs/exercises/${exId}`).then(r => r.data),
};

export const nutritionApi = {
  calculate: (data: any) => api.post('/nutrition/calculate', data).then(r => r.data),
  createPlan: (data: any) => api.post('/nutrition/plans', data).then(r => r.data),
  getActivePlan: (memberId: string) =>
    api.get(`/nutrition/plans/member/${memberId}`).then(r => r.data),
  getChart: (memberId: string, days = 30) =>
    api.get(`/nutrition/chart/${memberId}`, { params: { days } }).then(r => r.data),
  upsertLog: (planId: string, data: any) =>
    api.post(`/nutrition/plans/${planId}/logs`, data).then(r => r.data),
  getLogs: (memberId: string, from: string, to: string) =>
    api.get(`/nutrition/logs/${memberId}`, { params: { from, to } }).then(r => r.data),
};

export const workoutLogsApi = {
  getForSession: (sessionId: string) =>
    api.get(`/workout-logs/session/${sessionId}`).then(r => r.data),
  getPrefilled: (sessionId: string) =>
    api.get(`/workout-logs/session/${sessionId}/prefilled`).then(r => r.data),
  saveBulk: (sessionId: string, logs: any[]) =>
    api.post(`/workout-logs/session/${sessionId}/bulk`, { logs }).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/workout-logs/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/workout-logs/${id}`).then(r => r.data),
  history: (memberId: string, exercise?: string) =>
    api.get(`/workout-logs/history/${memberId}`, { params: { exercise } }).then(r => r.data),
};
