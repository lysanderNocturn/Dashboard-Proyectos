import { Router } from 'express';
import { getRoles, getRolById, createRol, updateRol, deleteRol } from '../controllers/roles.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/roles', authenticateToken, getRoles);
router.get('/roles/:id', authenticateToken, getRolById);
router.post('/roles', authenticateToken, createRol);
router.put('/roles/:id', authenticateToken, updateRol);
router.delete('/roles/:id', authenticateToken, deleteRol);

export default router;
