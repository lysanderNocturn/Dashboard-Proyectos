import { Router } from 'express';
import { getEjes, getEjeById, createEje, updateEje, deleteEje } from '../controllers/ejes.controllers.js';

const router = Router();

router.get('/ejes', getEjes);
router.get('/ejes/:id', getEjeById);
router.post('/ejes', createEje);
router.put('/ejes/:id', updateEje);
router.delete('/ejes/:id', deleteEje);

export default router;
