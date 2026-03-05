import axios from 'axios';

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          if (!error.config.url.includes('/auth/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Acceso denegado');
          break;
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 409:
          return Promise.reject(new Error(data.message || 'Conflicto de datos'));
        case 500:
          console.error('Error del servidor');
          break;
      }
    } else if (error.request) {
      console.error('Error de conexión');
    }
    
    return Promise.reject(error);
  }
);

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await axios.get('http://localhost:4000/health', { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('API no disponible:', error.message);
    return null;
  }
};

export default api;
