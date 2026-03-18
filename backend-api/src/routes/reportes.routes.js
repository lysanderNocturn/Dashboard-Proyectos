import { Router } from 'express';
import {
    getReportes,
    getReporteById,
    getReportesByProyecto,
    createReporte,
    updateReporte,
    deleteReporte,
    getReportesByUnidad
} from '../controllers/reportes.controllers.js';

const router = Router();

// Obtener todos los reportes (con filtros)
router.get('/reportes', getReportes);

// Obtener reportes por unidad administrativa
router.get('/reportes/unidad/:unidad_id', getReportesByUnidad);

// Obtener reportes por proyecto
router.get('/reportes/proyecto/:proyecto_id', getReportesByProyecto);

// Obtener reporte por ID
router.get('/reportes/:id', getReporteById);

// Crear reporte
router.post('/reportes', createReporte);

// Actualizar reporte
router.put('/reportes/:id', updateReporte);

// Eliminar reporte
router.delete('/reportes/:id', deleteReporte);

export default router;
