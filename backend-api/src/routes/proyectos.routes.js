import { Router} from 'express';
import { getProyectos, getProyectoById, createProyecto, deleteProyecto, updateProyecto } from "../controllers/proyectos.controllers.js";
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/proyectos', authenticateToken, getProyectos);
router.get('/proyectos/:id', authenticateToken, getProyectoById);
router.post('/proyectos', authenticateToken, createProyecto);
router.delete('/proyectos/:id', authenticateToken, deleteProyecto);
router.put('/proyectos/:id', authenticateToken, updateProyecto);

export default router;