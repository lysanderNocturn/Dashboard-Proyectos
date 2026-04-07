import { Router } from 'express';
import { getPresupuestos, getPresupuestoById, createPresupuesto, updatePresupuesto, deletePresupuesto } from '../controllers/presupuestos.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/presupuestos', authenticateToken, getPresupuestos);
router.get('/presupuestos/:id', authenticateToken, getPresupuestoById);
router.post('/presupuestos', authenticateToken, createPresupuesto);
router.put('/presupuestos/:id', authenticateToken, updatePresupuesto);
router.delete('/presupuestos/:id', authenticateToken, deletePresupuesto);

export default router;
