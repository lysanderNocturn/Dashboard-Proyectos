import { Router } from 'express';
import { getRoles, getRolById, createRol, updateRol, deleteRol } from '../controllers/roles.controllers.js';

const router = Router();

router.get('/roles', getRoles);
router.get('/roles/:id', getRolById);
router.post('/roles', createRol);
router.put('/roles/:id', updateRol);
router.delete('/roles/:id', deleteRol);

export default router;
