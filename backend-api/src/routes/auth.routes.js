import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, verifyPassword, changePassword, getMe } from '../controllers/auth.controllers.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { message: 'Demasiados intentos de login, intente más tarde' }
});

router.post('/auth/login', loginLimiter, login);
router.post('/auth/verify-password', verifyPassword);
router.post('/auth/change-password', changePassword);
router.post('/auth/me', getMe);

export default router;
