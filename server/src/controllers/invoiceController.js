import Invoice from '../models/Invoice.js';
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import User from '../models/User.js';
import { invoiceSchema } from '../utils/validation.js';
import { asyncHandler } from '../middleware/error.js';
import PDFDocument from 'pdfkit';

const generateInvoiceNumber = async (userId) => {
  const user = await User.findById(userId);
  const latestInvoice = await Invoice.findOne({ ownerUserId: userId }).sort({ createdAt: -1 });
  const count = latestInvoice ? parseInt(latestInvoice.number.split('-')[1]) + 1 : 1;
  return `INV-${String(count).padStart(5, '0')}`;
};

export const getInvoices = asyncHandler(async (req, res) => {
  const { status, clientId } = req.query;
  const filter = { ownerUserId: req.userId };

  if (status) filter.status = status;
  if (clientId) filter.clientId = clientId;

  const invoices = await Invoice.find(filter)
    .populate('clientId', 'name email company')
    .populate('projectId', 'title');

  res.json(invoices);
});

export const createInvoice = asyncHandler(async (req, res) => {
  const data = invoiceSchema.parse(req.body);

  const totalCents = data.lineItems.reduce(
    (sum, item) => sum + item.qty * item.unitPriceCents,
    0
  );

  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const number = await generateInvoiceNumber(req.userId);

      const invoice = new Invoice({
        ...data,
        ownerUserId: req.userId,
        number,
        totalCents,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
      });

      await invoice.save();
      return res.status(201).json(invoice);
    } catch (err) {
      if (err?.code === 11000) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError;
});

export const getInvoiceDetail = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    ownerUserId: req.userId,
  })
    .populate('clientId')
    .populate('projectId');

  if (!invoice) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Invoice not found' },
    });
  }

  res.json(invoice);
});

export const updateInvoice = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const updateData = {};
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  if (status === 'paid') {
    updateData.paidDate = new Date();
  }

  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, ownerUserId: req.userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!invoice) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Invoice not found' },
    });
  }

  res.json(invoice);
});

export const generateInvoicePDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    ownerUserId: req.userId,
  }).populate('clientId');

  if (!invoice) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Invoice not found' },
    });
  }

  const user = await User.findById(req.userId);

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.number}.pdf"`);

  doc.pipe(res);

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
  doc.moveDown();

  // Invoice details
  doc.fontSize(10).font('Helvetica');
  doc.text(`Invoice #: ${invoice.number}`);
  doc.text(
    `Date: ${invoice.issueDate.toLocaleDateString()}`
  );
  doc.text(`Due: ${invoice.dueDate.toLocaleDateString()}`);
  doc.moveDown();

  // From/To
  doc.font('Helvetica-Bold').fontSize(12).text('From');
  doc.font('Helvetica').fontSize(10);
  doc.text(user.name);
  doc.text(user.email);
  if (user.organization) doc.text(user.organization);
  doc.moveDown();

  doc.font('Helvetica-Bold').fontSize(12).text('To');
  doc.font('Helvetica').fontSize(10);
  doc.text(invoice.clientId.name);
  if (invoice.clientId.email) doc.text(invoice.clientId.email);
  if (invoice.clientId.company) doc.text(invoice.clientId.company);
  doc.moveDown();

  // Line items table
  doc.font('Helvetica-Bold').fontSize(10);
  const tableTop = doc.y;
  doc.text('Description', 50);
  doc.text('Qty', 250);
  doc.text('Unit Price', 300);
  doc.text('Amount', 400);

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let y = tableTop + 25;
  doc.font('Helvetica').fontSize(9);

  for (const item of invoice.lineItems) {
    const amount = item.qty * item.unitPriceCents;
    doc.text(item.description, 50);
    doc.text(item.qty, 250);
    doc.text(`$${(item.unitPriceCents / 100).toFixed(2)}`, 300);
    doc.text(`$${(amount / 100).toFixed(2)}`, 400);
    y += 20;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
  }

  // Total
  y += 10;
  doc.font('Helvetica-Bold').fontSize(11);
  doc.text(`Total: $${(invoice.totalCents / 100).toFixed(2)}`, 400);

  if (invoice.status === 'paid') {
    doc.fontSize(14).fillColor('green').text('PAID', { align: 'center' });
  }

  doc.end();
});
