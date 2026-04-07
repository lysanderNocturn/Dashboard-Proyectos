import { Router } from 'express';
import {getUsers, getUserById, createUser, deleteUser, updateUser} from '../controllers/users.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/usuarios', authenticateToken, getUsers);
router.get('/usuarios/:id', authenticateToken, getUserById);
router.post('/usuarios', authenticateToken, createUser);
router.delete('/usuarios/:id', authenticateToken, deleteUser);
router.put('/usuarios/:id', authenticateToken, updateUser);

export default router;