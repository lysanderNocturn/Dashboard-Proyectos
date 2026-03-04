import { Router} from 'express';
import { getProyectos, getProyectoById, createProyecto, deleteProyecto, updateProyecto } from "../controllers/proyectos.controllers.js";

const router = Router();
router.get('/proyectos', getProyectos);
router.get('/proyectos/:id', getProyectoById);
router.post('/proyectos', createProyecto);
router.delete('/proyectos/:id', deleteProyecto);
router.put('/proyectos/:id', updateProyecto);

export default router;