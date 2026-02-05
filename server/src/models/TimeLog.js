import mongoose from 'mongoose';

const timeLogSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    minutes: { type: Number, required: true },
    rateCents: { type: Number },
    invoiced: { type: Boolean, default: false },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    note: String,
  },
  { timestamps: true }
);

export default mongoose.model('TimeLog', timeLogSchema);
