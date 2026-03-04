import { Router } from 'express';
import { login, verifyPassword, changePassword, getMe } from '../controllers/auth.controllers.js';

const router = Router();

router.post('/auth/login', login);
router.post('/auth/verify-password', verifyPassword);
router.post('/auth/change-password', changePassword);
router.post('/auth/me', getMe);

export default router;
