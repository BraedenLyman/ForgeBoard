import express from 'express';
import {
  getInvoices,
  createInvoice,
  getInvoiceDetail,
  updateInvoice,
  generateInvoicePDF,
} from '../controllers/invoiceController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoiceDetail);
router.patch('/:id', updateInvoice);
router.get('/:id/pdf', generateInvoicePDF);

export default router;
