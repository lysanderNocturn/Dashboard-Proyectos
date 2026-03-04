import api from './api.js';

export const authService = {
  // Login usando el endpoint de autenticación del backend
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  },

  // Verificar contraseña del usuario
  async verifyPassword(userId, password) {
    try {
      const response = await api.post('/auth/verify-password', { userId, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Contraseña incorrecta');
    }
  },

  // Cambiar contraseña del usuario
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

  async getUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },
};
