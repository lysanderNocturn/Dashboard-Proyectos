import { Router } from 'express';
import { getDepartamentos, getDepartamentoById, createDepartamento, updateDepartamento, deleteDepartamento } from '../controllers/departamentos.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/departamentos', authenticateToken, getDepartamentos);
router.get('/departamentos/:id', authenticateToken, getDepartamentoById);
router.post('/departamentos', authenticateToken, createDepartamento);
router.put('/departamentos/:id', authenticateToken, updateDepartamento);
router.delete('/departamentos/:id', authenticateToken, deleteDepartamento);

export default router;
