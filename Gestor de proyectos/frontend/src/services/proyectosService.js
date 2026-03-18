import api from './api.js';

export const proyectosService = {
  async getProyectos() {
    const response = await api.get('/proyectos');
    // Handle paginated response format
    return response.data.data || response.data || [];
  },

  async getProyectoById(id) {
    const response = await api.get(`/proyectos/${id}`);
    return response.data;
  },

  async createProyecto(proyectoData) {
    const response = await api.post('/proyectos', proyectoData);
    return response.data;
  },

  async updateProyecto(id, proyectoData) {
    const response = await api.put(`/proyectos/${id}`, proyectoData);
    return response.data;
  },

  async deleteProyecto(id) {
    const response = await api.delete(`/proyectos/${id}`);
    return response.data;
  },
};
