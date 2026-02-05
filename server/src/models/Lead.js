import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    title: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Za-z0-9 ]+$/, 'Title may only include letters, numbers, and spaces'],
    },
    valueCents: { type: Number, required: true, min: 0 },
    stage: {
      type: String,
      enum: ['lead', 'contacted', 'proposal', 'won', 'lost'],
      default: 'lead',
    },
    source: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=% ]+$/,
        'Source contains invalid characters',
      ],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 150,
      validate: {
        validator: (value) => !value || /^[A-Za-z0-9 .!?$#%(),'" ]+$/.test(value),
        message: 'Notes may only include letters, numbers, spaces, and . ! ? $ # % ( ) , \' "',
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);
