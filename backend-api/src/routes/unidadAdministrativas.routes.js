import { Router } from 'express';
import { getUnidadAdministrativas, getUnidadAdministrativaById, createUnidadAdministrativa, updateUnidadAdministrativa, deleteUnidadAdministrativa } from '../controllers/unidadAdministrativa.controllers.js';

const router = Router();

router.get('/unidad-administrativas', getUnidadAdministrativas);
router.get('/unidad-administrativas/:id', getUnidadAdministrativaById);
router.post('/unidad-administrativas', createUnidadAdministrativa);
router.put('/unidad-administrativas/:id', updateUnidadAdministrativa);
router.delete('/unidad-administrativas/:id', deleteUnidadAdministrativa);

export default router;
