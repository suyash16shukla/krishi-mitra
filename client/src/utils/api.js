import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const weatherAPI = {
  get: (lat, lon, location) =>
    api.get(`/weather?lat=${lat}&lon=${lon}${location ? `&location=${encodeURIComponent(location)}` : ''}`),
  reverseGeocode: (lat, lon) =>
    api.get(`/weather/reverse-geocode?lat=${lat}&lon=${lon}`),
};

export const cropsAPI = {
  getAll: (params = {}) => api.get('/crops', { params }),
  getById: (id) => api.get(`/crops/${id}`),
  recommend: (data) => api.post('/crops/recommend', data),
};

export const schedulesAPI = {
  getByCropName: (cropName) => api.get(`/schedules?cropName=${encodeURIComponent(cropName)}`),
  getByCropId: (cropId) => api.get(`/schedules/crop/${cropId}`),
};

export const schemesAPI = {
  getAll: (params = {}) => api.get('/schemes', { params }),
  getById: (id) => api.get(`/schemes/${id}`),
};

export const soilAPI = {
  recommend: (district, state) =>
    api.get('/soil/recommend', { params: { district, state } }),
  getMetrics: () => api.get('/soil/metrics'),
};

export const farmerAPI = {
  register: (data) => api.post('/farmers/register', data),
  save: (data) => api.post('/farmers/register', data),
  getProfile: (mobile) =>
    api.get('/farmers/profile', { params: mobile ? { mobile, phone: mobile } : {} }),
  getById: (id) => api.get(`/farmers/${id}`),
  getAdvisory: (data) => api.post('/farmers/advisory', data),
};

export const aiAPI = {
  chat: (message, language, conversationHistory) =>
    api.post('/chat/advisor', { message, language, conversationHistory }),
};

export default api;
