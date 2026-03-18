import { Router } from 'express';
import { 
    asignarPresupuestoAProyecto,
    getAsignacionesByPresupuesto,
    getAsignacionByProyecto,
    eliminarAsignacion
} from '../controllers/presupuestoAsignaciones.controllers.js';

const router = Router();

// Asignar presupuesto a proyecto (con descuento automático)
router.post('/presupuesto-asignaciones', asignarPresupuestoAProyecto);

// Obtener asignaciones de un presupuesto
router.get('/presupuesto-asignaciones/presupuesto/:presupuesto_id', getAsignacionesByPresupuesto);

// Obtener asignación de un proyecto
router.get('/presupuesto-asignaciones/proyecto/:proyecto_id', getAsignacionByProyecto);

// Eliminar asignación
router.delete('/presupuesto-asignaciones/:id', eliminarAsignacion);

export default router;
