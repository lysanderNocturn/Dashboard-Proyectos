import api from './api.js';

export const presupuestoService = {
  async getPresupuestos(page = 1, limit = 50) {
    const response = await api.get(`/presupuestos?page=${page}&limit=${limit}`);
    return response.data.data || response.data || [];
  },

  async getPresupuestoById(id) {
    const response = await api.get(`/presupuestos/${id}`);
    return response.data;
  },

  async createPresupuesto(data) {
    const response = await api.post('/presupuestos', data);
    return response.data;
  },

  async updatePresupuesto(id, data) {
    const response = await api.put(`/presupuestos/${id}`, data);
    return response.data;
  },

  async deletePresupuesto(id) {
    const response = await api.delete(`/presupuestos/${id}`);
    return response.data;
  },

  async getPresupuestosDisponibles(unidadId = null, departamentoId = null) {
    const params = new URLSearchParams();
    if (unidadId) params.append('unidad_id', unidadId);
    if (departamentoId) params.append('departamento_id', departamentoId);
    const response = await api.get(`/presupuestos?${params.toString()}`);
    return response.data;
  },
};
