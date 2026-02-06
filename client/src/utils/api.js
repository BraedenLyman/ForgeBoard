const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

// Auth
export const api = {
  auth: {
    register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => apiRequest('/auth/logout', { method: 'POST' }),
    refresh: () => apiRequest('/auth/refresh', { method: 'POST' }),
    me: () => apiRequest('/auth/me'),
    updatePassword: (data) => apiRequest('/auth/password', { method: 'POST', body: JSON.stringify(data) }),
    deleteAccount: () => apiRequest('/auth/account', { method: 'DELETE' }),
  },
  
  clients: {
    getAll: () => apiRequest('/clients'),
    create: (data) => apiRequest('/clients', { method: 'POST', body: JSON.stringify(data) }),
    getDetail: (id) => apiRequest(`/clients/${id}`),
    update: (id, data) => apiRequest(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/clients/${id}`, { method: 'DELETE' }),
  },

  leads: {
    getAll: (params) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/leads?${query}`);
    },
    create: (data) => apiRequest('/leads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateStage: (id, stage) => apiRequest(`/leads/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
    delete: (id) => apiRequest(`/leads/${id}`, { method: 'DELETE' }),
  },

  projects: {
    getAll: (params) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/projects?${query}`);
    },
    create: (data) => apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) }),
    getDetail: (id) => apiRequest(`/projects/${id}`),
    update: (id, data) => apiRequest(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),

    tasks: {
      getAll: (projectId) => apiRequest(`/projects/${projectId}/tasks`),
      create: (projectId, data) => apiRequest(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
      update: (projectId, taskId, data) => apiRequest(`/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (projectId, taskId) => apiRequest(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
    },

    timeLogs: {
      getAll: (projectId) => apiRequest(`/projects/${projectId}/timelogs`),
      create: (projectId, data) => apiRequest(`/projects/${projectId}/timelogs`, { method: 'POST', body: JSON.stringify(data) }),
    },
  },

  invoices: {
    getAll: (params) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/invoices?${query}`);
    },
    create: (data) => apiRequest('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    getDetail: (id) => apiRequest(`/invoices/${id}`),
    update: (id, data) => apiRequest(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    getPDF: (id) => `${API_URL}/invoices/${id}/pdf`,
  },

  timeLogs: {
    getAll: (params) => {
      const query = params ? new URLSearchParams(params).toString() : '';
      return apiRequest(`/timelogs${query ? `?${query}` : ''}`);
    },
  },
};
