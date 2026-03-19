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

// Rutas específicas primero (orden es importante en Express)

// Obtener reportes por proyecto
router.get('/proyecto/:proyecto_id', getReportesByProyecto);

// Obtener reportes por unidad administrativa
router.get('/unidad/:unidad_id', getReportesByUnidad);

// Obtener reporte por ID
router.get('/:id', getReporteById);

// Obtener todos los reportes (con filtros)
router.get('/', getReportes);

// Crear reporte
router.post('/', createReporte);

// Actualizar reporte
router.put('/:id', updateReporte);

// Eliminar reporte
router.delete('/:id', deleteReporte);

// Ruta de prueba
router.get('/test', (req, res) => {
    res.json({ message: 'Rutas de reportes funcionando' });
});

export default router;
