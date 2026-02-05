import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
    },
    startDate: Date,
    dueDate: Date,
    hourlyRateCents: Number,
    flatFeeCents: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
