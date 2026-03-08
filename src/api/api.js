// src/api/api.js
const BASE_URL = 'http://YOUR_SERVER_IP:8000'; // ← change to your server IP

async function request(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

// ── Admin ─────────────────────────────────────────────────────
export const adminLogin = (username, password) =>
  request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const getAdminStats = (token) =>
  request('/api/admin/stats', {}, token);

export const listCodes = (token) =>
  request('/api/admin/codes', {}, token);

export const generateCode = (token, payload) =>
  request('/api/admin/codes/generate', { method: 'POST', body: JSON.stringify(payload) }, token);

export const revokeCode = (token, code_id) =>
  request('/api/admin/codes/revoke', { method: 'POST', body: JSON.stringify({ code_id }) }, token);

export const deleteCode = (token, code_id) =>
  request(`/api/admin/codes/${code_id}`, { method: 'DELETE' }, token);

export const listUsers = (token) =>
  request('/api/admin/users', {}, token);

// ── User ──────────────────────────────────────────────────────
export const activateCode = (username, code) =>
  request('/api/activate', { method: 'POST', body: JSON.stringify({ username, code }) });

export const getUserMe = (token) =>
  request('/api/user/me', {}, token);
