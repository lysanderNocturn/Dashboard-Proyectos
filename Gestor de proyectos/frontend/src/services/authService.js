import api from './api.js';

export const authService = {
  // Login using the backend authentication endpoint
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  },

  // Verify user password
  async verifyPassword(userId, password) {
    try {
      const response = await api.post('/auth/verify-password', { userId, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Contraseña incorrecta');
    }
  },

  // Change user password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', { 
        userId, 
        currentPassword, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cambiar la contraseña');
    }
  },

  // Get all users
  async getUsers() {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const response = await api.post('/usuarios', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear usuario');
    }
  },
};

export default authService;
