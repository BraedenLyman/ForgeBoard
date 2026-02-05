import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Za-z ]+$/, 'Name may only include letters and spaces'],
    },
    email: { type: String, required: true, trim: true },
    phone: String,
    company: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Za-z0-9 -]+$/, 'Company may only include letters, numbers, dashes, and spaces'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 150,
      match: [/^[A-Za-z0-9 .,\-?!()]+$/, 'Notes may only include letters, numbers, spaces, and . , - ? ! ( )'],
    },
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Client', clientSchema);
