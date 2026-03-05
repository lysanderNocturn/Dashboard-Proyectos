import { Router } from 'express';
import {getUsers, getUserById, createUser, deleteUser, updateUser} from '../controllers/users.controllers.js';

const router = Router();

router.get('/usuarios', getUsers);
router.get('/usuarios/:id', getUserById);
router.post('/usuarios', createUser);
router.delete('/usuarios/:id', deleteUser);
router.put('/usuarios/:id', updateUser);

export default router;