import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

// ─── Employee API ────────────────────────────────────────────

export const getEmployees = (params = {}) =>
    api.get('/employees/', { params });

export const getEmployee = (id) =>
    api.get(`/employees/${id}/`);

export const createEmployee = (data) =>
    api.post('/employees/', data);

export const deleteEmployee = (id) =>
    api.delete(`/employees/${id}/`);

// ─── Attendance API ──────────────────────────────────────────

export const getAttendance = (params = {}) =>
    api.get('/attendance/', { params });

export const markAttendance = (data) =>
    api.post('/attendance/', data);

export const updateAttendance = (id, data) =>
    api.patch(`/attendance/${id}/`, data);

export default api;
