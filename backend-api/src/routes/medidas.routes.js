import { Router } from 'express';
import { getMedidas, getMedidaById, createMedida, updateMedida, deleteMedida } from '../controllers/medidas.controllers.js';

const router = Router();

router.get('/medidas', getMedidas);
router.get('/medidas/:id', getMedidaById);
router.post('/medidas', createMedida);
router.put('/medidas/:id', updateMedida);
router.delete('/medidas/:id', deleteMedida);

export default router;
