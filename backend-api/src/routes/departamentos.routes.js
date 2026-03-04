import { Router } from 'express';
import { getDepartamentos, getDepartamentoById, createDepartamento, updateDepartamento, deleteDepartamento } from '../controllers/departamentos.controllers.js';

const router = Router();

router.get('/departamentos', getDepartamentos);
router.get('/departamentos/:id', getDepartamentoById);
router.post('/departamentos', createDepartamento);
router.put('/departamentos/:id', updateDepartamento);
router.delete('/departamentos/:id', deleteDepartamento);

export default router;
