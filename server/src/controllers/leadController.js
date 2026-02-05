import Lead from '../models/Lead.js';
import { leadSchema } from '../utils/validation.js';
import { asyncHandler } from '../middleware/error.js';

export const getLeads = asyncHandler(async (req, res) => {
  const { stage, clientId } = req.query;
  const filter = { ownerUserId: req.userId };

  if (stage) filter.stage = stage;
  if (clientId) filter.clientId = clientId;

  const leads = await Lead.find(filter).populate('clientId', 'name email company');
  res.json(leads);
});

export const createLead = asyncHandler(async (req, res) => {
  const data = leadSchema.parse(req.body);

  const lead = new Lead({
    ...data,
    ownerUserId: req.userId,
  });

  await lead.save();
  res.status(201).json(lead);
});

export const updateLeadStage = asyncHandler(async (req, res) => {
  const { stage } = req.body;

  if (!['lead', 'contacted', 'proposal', 'won', 'lost'].includes(stage)) {
    return res.status(400).json({
      error: { code: 'INVALID_STAGE', message: 'Invalid stage' },
    });
  }

  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id, ownerUserId: req.userId },
    { stage },
    { new: true }
  );

  if (!lead) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Lead not found' },
    });
  }

  res.json(lead);
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndDelete({
    _id: req.params.id,
    ownerUserId: req.userId,
  });

  if (!lead) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Lead not found' },
    });
  }

  res.json({ message: 'Lead deleted' });
});
