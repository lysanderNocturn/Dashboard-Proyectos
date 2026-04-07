import { Router } from 'express';
import { getAcciones, getAccionById, createAccion, updateAccion, deleteAccion } from '../controllers/acciones.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/acciones', authenticateToken, getAcciones);
router.get('/acciones/:id', authenticateToken, getAccionById);
router.post('/acciones', authenticateToken, createAccion);
router.put('/acciones/:id', authenticateToken, updateAccion);
router.delete('/acciones/:id', authenticateToken, deleteAccion);

export default router;
