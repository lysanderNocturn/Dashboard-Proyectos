import { Router } from 'express';
import { getPresupuestos, getPresupuestoById, createPresupuesto, updatePresupuesto, deletePresupuesto } from '../controllers/presupuestos.controllers.js';

const router = Router();

router.get('/presupuestos', getPresupuestos);
router.get('/presupuestos/:id', getPresupuestoById);
router.post('/presupuestos', createPresupuesto);
router.put('/presupuestos/:id', updatePresupuesto);
router.delete('/presupuestos/:id', deletePresupuesto);

export default router;
