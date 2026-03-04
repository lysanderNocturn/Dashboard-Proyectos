import api from './api.js';

export const usuariosService = {
  async getUsuarios() {
    const response = await api.get('/usuarios');
    return response.data;
  },

  async getUsuarioById(id) {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  async createUsuario(usuarioData) {
    const response = await api.post('/usuarios', usuarioData);
    return response.data;
  },

  async updateUsuario(id, usuarioData) {
    const response = await api.put(`/usuarios/${id}`, usuarioData);
    return response.data;
  },

  async deleteUsuario(id) {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
};
