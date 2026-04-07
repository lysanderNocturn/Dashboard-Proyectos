import { Router } from 'express';
import { getUnidadAdministrativas, getUnidadAdministrativaById, createUnidadAdministrativa, updateUnidadAdministrativa, deleteUnidadAdministrativa } from '../controllers/unidadAdministrativa.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/unidad-administrativas', authenticateToken, getUnidadAdministrativas);
router.get('/unidad-administrativas/:id', authenticateToken, getUnidadAdministrativaById);
router.post('/unidad-administrativas', authenticateToken, createUnidadAdministrativa);
router.put('/unidad-administrativas/:id', authenticateToken, updateUnidadAdministrativa);
router.delete('/unidad-administrativas/:id', authenticateToken, deleteUnidadAdministrativa);

export default router;
