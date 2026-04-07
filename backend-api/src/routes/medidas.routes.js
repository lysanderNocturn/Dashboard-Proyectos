import { Router } from 'express';
import { getMedidas, getMedidaById, createMedida, updateMedida, deleteMedida } from '../controllers/medidas.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/medidas', authenticateToken, getMedidas);
router.get('/medidas/:id', authenticateToken, getMedidaById);
router.post('/medidas', authenticateToken, createMedida);
router.put('/medidas/:id', authenticateToken, updateMedida);
router.delete('/medidas/:id', authenticateToken, deleteMedida);

export default router;
