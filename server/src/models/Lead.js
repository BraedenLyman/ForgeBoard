import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    title: { type: String, required: true },
    valueCents: { type: Number, default: 0 },
    stage: {
      type: String,
      enum: ['lead', 'contacted', 'proposal', 'won', 'lost'],
      default: 'lead',
    },
    source: { type: String, default: 'direct' },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);
