import { Router } from 'express';
import { getAcciones, getAccionById, createAccion, updateAccion, deleteAccion } from '../controllers/acciones.controllers.js';

const router = Router();

router.get('/acciones', getAcciones);
router.get('/acciones/:id', getAccionById);
router.post('/acciones', createAccion);
router.put('/acciones/:id', updateAccion);
router.delete('/acciones/:id', deleteAccion);

export default router;
