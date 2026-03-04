import { Router } from 'express';
import { getActividadesEjecutadas, getActividadEjecutadaById, createActividadEjecutada, updateActividadEjecutada, deleteActividadEjecutada } from '../controllers/actividadesEjecutadas.controllers.js';

const router = Router();

router.get('/actividades-ejecutadas', getActividadesEjecutadas);
router.get('/actividades-ejecutadas/:id', getActividadEjecutadaById);
router.post('/actividades-ejecutadas', createActividadEjecutada);
router.put('/actividades-ejecutadas/:id', updateActividadEjecutada);
router.delete('/actividades-ejecutadas/:id', deleteActividadEjecutada);

export default router;
