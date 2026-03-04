import { Router } from 'express';
import { getActividadesPlanificadas, getActividadPlanificadaById, createActividadPlanificada, updateActividadPlanificada, deleteActividadPlanificada } from '../controllers/actividadesPlanificadas.controllers.js';

const router = Router();

router.get('/actividades-planificadas', getActividadesPlanificadas);
router.get('/actividades-planificadas/:id', getActividadPlanificadaById);
router.post('/actividades-planificadas', createActividadPlanificada);
router.put('/actividades-planificadas/:id', updateActividadPlanificada);
router.delete('/actividades-planificadas/:id', deleteActividadPlanificada);

export default router;
