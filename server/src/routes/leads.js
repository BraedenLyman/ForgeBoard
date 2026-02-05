import express from 'express';
import {
  getLeads,
  createLead,
  updateLeadStage,
  deleteLead,
} from '../controllers/leadController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getLeads);
router.post('/', createLead);
router.patch('/:id/stage', updateLeadStage);
router.delete('/:id', deleteLead);

export default router;
