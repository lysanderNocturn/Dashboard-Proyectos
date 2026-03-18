import axios from './api';

export const asignacionesService = {
  // Asignar presupuesto a un proyecto (con descuento automático)
  asignarPresupuesto: async (data) => {
    const response = await axios.post('/presupuesto-asignaciones', data);
    return response.data;
  },

  // Obtener asignaciones de un presupuesto
  getAsignacionesByPresupuesto: async (presupuestoId) => {
    const response = await axios.get(`/presupuesto-asignaciones/presupuesto/${presupuestoId}`);
    return response.data;
  },

  // Obtener asignación de un proyecto
  getAsignacionByProyecto: async (proyectoId) => {
    const response = await axios.get(`/presupuesto-asignaciones/proyecto/${proyectoId}`);
    return response.data;
  },

  // Eliminar asignación (revierte el descuento)
  eliminarAsignacion: async (asignacionId) => {
    const response = await axios.delete(`/presupuesto-asignaciones/${asignacionId}`);
    return response.data;
  }
};
