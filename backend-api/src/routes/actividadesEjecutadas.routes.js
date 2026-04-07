import { Router } from 'express';
import { getActividadesEjecutadas, getActividadEjecutadaById, createActividadEjecutada, updateActividadEjecutada, deleteActividadEjecutada } from '../controllers/actividadesEjecutadas.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/actividades-ejecutadas', authenticateToken, getActividadesEjecutadas);
router.get('/actividades-ejecutadas/:id', authenticateToken, getActividadEjecutadaById);
router.post('/actividades-ejecutadas', authenticateToken, createActividadEjecutada);
router.put('/actividades-ejecutadas/:id', authenticateToken, updateActividadEjecutada);
router.delete('/actividades-ejecutadas/:id', authenticateToken, deleteActividadEjecutada);

export default router;
