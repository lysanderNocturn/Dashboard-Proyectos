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
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas específicas primero (orden es importante en Express)

// Obtener reportes por proyecto
router.get('/proyecto/:proyecto_id', authenticateToken, getReportesByProyecto);

// Obtener reportes por unidad administrativa
router.get('/unidad/:unidad_id', authenticateToken, getReportesByUnidad);

// Obtener reporte por ID
router.get('/:id', authenticateToken, getReporteById);

// Obtener todos los reportes (con filtros)
router.get('/', authenticateToken, getReportes);

// Crear reporte
router.post('/', authenticateToken, createReporte);

// Actualizar reporte
router.put('/:id', authenticateToken, updateReporte);

// Eliminar reporte
router.delete('/:id', authenticateToken, deleteReporte);

// Ruta de prueba
router.get('/test', authenticateToken, (req, res) => {
    res.json({ message: 'Rutas de reportes funcionando' });
});

export default router;
