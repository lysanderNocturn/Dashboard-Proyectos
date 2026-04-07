import { Router } from 'express';
import { getEjes, getEjeById, createEje, updateEje, deleteEje } from '../controllers/ejes.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/ejes', authenticateToken, getEjes);
router.get('/ejes/:id', authenticateToken, getEjeById);
router.post('/ejes', authenticateToken, createEje);
router.put('/ejes/:id', authenticateToken, updateEje);
router.delete('/ejes/:id', authenticateToken, deleteEje);

export default router;
