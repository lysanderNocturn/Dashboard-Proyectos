import api from './api.js';

// Unidad Administrativa
export const unidadService = {
  async getUnidades() {
    const response = await api.get('/unidad-administrativa');
    return response.data;
  },
  async createUnidad(data) {
    const response = await api.post('/unidad-administrativa', data);
    return response.data;
  },
  async updateUnidad(id, data) {
    const response = await api.put(`/unidad-administrativa/${id}`, data);
    return response.data;
  },
  async deleteUnidad(id) {
    const response = await api.delete(`/unidad-administrativa/${id}`);
    return response.data;
  },
};

// Departamentos
export const departamentoService = {
  async getDepartamentos() {
    const response = await api.get('/departamentos');
    return response.data;
  },
  async getDepartamentosByUnidad(unidadId) {
    const response = await api.get(`/departamentos?unidad_id=${unidadId}`);
    return response.data;
  },
  async createDepartamento(data) {
    const response = await api.post('/departamentos', data);
    return response.data;
  },
  async updateDepartamento(id, data) {
    const response = await api.put(`/departamentos/${id}`, data);
    return response.data;
  },
  async deleteDepartamento(id) {
    const response = await api.delete(`/departamentos/${id}`);
    return response.data;
  },
};

// Ejes
export const ejeService = {
  async getEjes() {
    const response = await api.get('/ejes');
    return response.data;
  },
  async createEje(data) {
    const response = await api.post('/ejes', data);
    return response.data;
  },
  async updateEje(id, data) {
    const response = await api.put(`/ejes/${id}`, data);
    return response.data;
  },
  async deleteEje(id) {
    const response = await api.delete(`/ejes/${id}`);
    return response.data;
  },
};
