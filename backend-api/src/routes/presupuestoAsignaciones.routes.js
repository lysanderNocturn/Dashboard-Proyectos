import { Router } from 'express';
import { 
    asignarPresupuestoAProyecto,
    getAsignacionesByPresupuesto,
    getAsignacionByProyecto,
    eliminarAsignacion
} from '../controllers/presupuestoAsignaciones.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Asignar presupuesto a proyecto (con descuento automático)
router.post('/presupuesto-asignaciones', authenticateToken, asignarPresupuestoAProyecto);

// Obtener asignaciones de un presupuesto
router.get('/presupuesto-asignaciones/presupuesto/:presupuesto_id', authenticateToken, getAsignacionesByPresupuesto);

// Obtener asignación de un proyecto
router.get('/presupuesto-asignaciones/proyecto/:proyecto_id', authenticateToken, getAsignacionByProyecto);

// Eliminar asignación
router.delete('/presupuesto-asignaciones/:id', authenticateToken, eliminarAsignacion);

export default router;
