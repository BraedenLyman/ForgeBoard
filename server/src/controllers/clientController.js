import Client from '../models/Client.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import Invoice from '../models/Invoice.js';
import { clientSchema } from '../utils/validation.js';
import { asyncHandler } from '../middleware/error.js';

export const getClients = asyncHandler(async (req, res) => {
  const clients = await Client.find({ ownerUserId: req.userId });
  res.json(clients);
});

export const createClient = asyncHandler(async (req, res) => {
  const data = clientSchema.parse(req.body);

  const client = new Client({
    ...data,
    ownerUserId: req.userId,
  });

  await client.save();
  res.status(201).json(client);
});

export const getClientDetail = asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    ownerUserId: req.userId,
  });

  if (!client) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Client not found' },
    });
  }

  const leads = await Lead.find({ clientId: client._id });
  const projects = await Project.find({ clientId: client._id });
  const invoices = await Invoice.find({ clientId: client._id });

  res.json({
    ...client.toObject(),
    leads,
    projects,
    invoices,
  });
});

export const updateClient = asyncHandler(async (req, res) => {
  const data = clientSchema.partial().parse(req.body);

  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, ownerUserId: req.userId },
    data,
    { new: true, runValidators: true }
  );

  if (!client) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Client not found' },
    });
  }

  res.json(client);
});

export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndDelete({
    _id: req.params.id,
    ownerUserId: req.userId,
  });

  if (!client) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Client not found' },
    });
  }

  res.json({ message: 'Client deleted' });
});
