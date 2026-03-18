import axios from './api';

export const reportesService = {
  // Obtener todos los reportes con filtros
  getReportes: async (filtros = {}) => {
    const response = await axios.get('/reportes', { params: filtros });
    return response.data;
  },

  // Obtener reporte por ID
  getReporteById: async (id) => {
    const response = await axios.get(`/reportes/${id}`);
    return response.data;
  },

  // Obtener reportes de un proyecto
  getReportesByProyecto: async (proyectoId, tipo = null) => {
    const response = await axios.get(`/reportes/proyecto/${proyectoId}`, { 
      params: tipo ? { tipo } : {} 
    });
    return response.data;
  },

  // Obtener reportes por unidad administrativa
  getReportesByUnidad: async (unidadId, filtros = {}) => {
    const response = await axios.get(`/reportes/unidad/${unidadId}`, { params: filtros });
    return response.data;
  },

  // Crear reporte
  createReporte: async (data) => {
    const response = await axios.post('/reportes', data);
    return response.data;
  },

  // Actualizar reporte
  updateReporte: async (id, data) => {
    const response = await axios.put(`/reportes/${id}`, data);
    return response.data;
  },

  // Eliminar reporte
  deleteReporte: async (id) => {
    const response = await axios.delete(`/reportes/${id}`);
    return response.data;
  }
};
