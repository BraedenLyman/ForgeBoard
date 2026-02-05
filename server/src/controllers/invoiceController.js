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
  doc.moveDown(2);

  // From/To (side-by-side)
  const sectionWidth = 460;
  const sectionLeft = (doc.page.width - sectionWidth) / 2;
  const leftX = sectionLeft;
  const rightX = sectionLeft + 260;
  const sectionTop = doc.y;

  doc.font('Helvetica-Bold').fontSize(12).text('From', leftX, sectionTop);
  doc.font('Helvetica').fontSize(10);
  doc.text(user.name, leftX, sectionTop + 16);
  doc.text(user.email, leftX);
  if (user.organization) doc.text(user.organization, leftX);

  doc.font('Helvetica-Bold').fontSize(12).text('To', rightX, sectionTop);
  doc.font('Helvetica').fontSize(10);
  doc.text(invoice.clientId.name, rightX, sectionTop + 16);
  if (invoice.clientId.email) doc.text(invoice.clientId.email, rightX);
  if (invoice.clientId.company) doc.text(invoice.clientId.company, rightX);

  doc.y = Math.max(doc.y, sectionTop + 70);
  doc.moveDown();

  // Line items table
  doc.font('Helvetica-Bold').fontSize(10);
  const tableLeft = 50;
  const tableRight = 550;
  const col = {
    desc: tableLeft,
    qty: 300,
    unit: 360,
    amount: 470,
  };

  const tableTop = doc.y;
  doc.text('Description', col.desc, tableTop);
  doc.text('Qty', col.qty, tableTop);
  doc.text('Unit Price', col.unit, tableTop);
  doc.text('Amount', col.amount, tableTop);

  doc.moveTo(tableLeft, tableTop + 15).lineTo(tableRight, tableTop + 15).stroke();

  let y = tableTop + 22;
  doc.font('Helvetica').fontSize(9);

  for (const item of invoice.lineItems) {
    const amount = item.qty * item.unitPriceCents;
    const descWidth = col.qty - col.desc - 10;
    const descHeight = doc.heightOfString(item.description, { width: descWidth });
    const rowHeight = Math.max(16, descHeight + 4);

    doc.text(item.description, col.desc, y, { width: descWidth });
    doc.text(String(item.qty), col.qty, y);
    doc.text(`$${(item.unitPriceCents / 100).toFixed(2)}`, col.unit, y);
    doc.text(`$${(amount / 100).toFixed(2)}`, col.amount, y);

    y += rowHeight;
    doc.moveTo(tableLeft, y).lineTo(tableRight, y).stroke();
    y += 6;
  }

  // Total
  y += 12;
  doc.font('Helvetica-Bold').fontSize(11);
  doc.text('Total:', col.amount - 40, y);
  doc.text(`$${(invoice.totalCents / 100).toFixed(2)}`, col.amount, y);


  if (invoice.status === 'paid') {
    doc.fontSize(14).fillColor('green').text('PAID', { align: 'center' });
  }

  doc.end();
});
