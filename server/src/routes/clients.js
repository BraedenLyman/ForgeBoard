import express from 'express';
import {
  getClients,
  createClient,
  getClientDetail,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getClients);
router.post('/', createClient);
router.get('/:id', getClientDetail);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
