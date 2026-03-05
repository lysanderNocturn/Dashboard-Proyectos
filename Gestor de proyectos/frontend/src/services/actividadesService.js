import api from './api.js';

export const actividadesService = {
  // Actividades Planificadas
  async getActividadesPlanificadas() {
    const response = await api.get('/actividades-planificadas');
    return response.data;
  },

  async getActividadesPlanificadasByProyecto(proyectoId) {
    const response = await api.get(`/actividades-planificadas?proyecto_id=${proyectoId}`);
    return response.data;
  },

  async createActividadPlanificada(data) {
    const response = await api.post('/actividades-planificadas', data);
    return response.data;
  },

  async updateActividadPlanificada(id, data) {
    const response = await api.put(`/actividades-planificadas/${id}`, data);
    return response.data;
  },

  async deleteActividadPlanificada(id) {
    const response = await api.delete(`/actividades-planificadas/${id}`);
    return response.data;
  },

  // Actividades Ejecutadas (Avance Trimestral)
  async getActividadesEjecutadas() {
    const response = await api.get('/actividades-ejecutadas');
    return response.data;
  },

  async getActividadesEjecutadasByActividad(actividadPlanificadaId) {
    const response = await api.get(`/actividades-ejecutadas?actividad_planificada_id=${actividadPlanificadaId}`);
    return response.data;
  },

  async createActividadEjecutada(data) {
    const response = await api.post('/actividades-ejecutadas', data);
    return response.data;
  },

  async updateActividadEjecutada(id, data) {
    const response = await api.put(`/actividades-ejecutadas/${id}`, data);
    return response.data;
  },

  async deleteActividadEjecutada(id) {
    const response = await api.delete(`/actividades-ejecutadas/${id}`);
    return response.data;
  },
};
