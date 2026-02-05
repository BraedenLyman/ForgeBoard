import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: String,
    phone: String,
    company: String,
    notes: String,
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Client', clientSchema);
