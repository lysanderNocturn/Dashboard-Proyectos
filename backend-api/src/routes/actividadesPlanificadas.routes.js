import { Router } from 'express';
import { getActividadesPlanificadas, getActividadPlanificadaById, createActividadPlanificada, updateActividadPlanificada, deleteActividadPlanificada } from '../controllers/actividadesPlanificadas.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/actividades-planificadas', authenticateToken, getActividadesPlanificadas);
router.get('/actividades-planificadas/:id', authenticateToken, getActividadPlanificadaById);
router.post('/actividades-planificadas', authenticateToken, createActividadPlanificada);
router.put('/actividades-planificadas/:id', authenticateToken, updateActividadPlanificada);
router.delete('/actividades-planificadas/:id', authenticateToken, deleteActividadPlanificada);

export default router;
