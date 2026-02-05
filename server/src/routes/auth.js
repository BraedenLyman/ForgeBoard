import express from 'express';
import { register, login, refresh, logout, me, updatePassword, deleteAccount } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
router.post('/password', authMiddleware, updatePassword);
router.delete('/account', authMiddleware, deleteAccount);

export default router;
