import mongoose from 'mongoose';

const invoiceLineItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => /^[A-Za-z0-9 .!?$#%(),'" ]+$/.test(value),
      message: 'Description contains invalid characters',
    },
  },
  qty: { type: Number, default: 1 },
  unitPriceCents: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    number: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid'],
      default: 'draft',
    },
    lineItems: [invoiceLineItemSchema],
    totalCents: { type: Number, required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    paidDate: Date,
    notes: String,
  },
  { timestamps: true }
);

invoiceSchema.index({ ownerUserId: 1, number: 1 }, { unique: true });

export default mongoose.model('Invoice', invoiceSchema);
