import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getTimeLogs } from '../controllers/timeLogController.js';

const router = express.Router();

router.get('/', authMiddleware, getTimeLogs);

export default router;
