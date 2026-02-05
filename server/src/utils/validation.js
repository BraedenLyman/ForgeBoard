import { z } from 'zod';

const leadTitleRegex = /^[A-Za-z0-9 ]+$/;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string(),
});

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .regex(/^[A-Za-z ]+$/, 'Name may only include letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(
      /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/,
      'Invalid email'
    ),
  phone: z.string().optional(),
  company: z
    .string()
    .trim()
    .min(1, 'Company is required')
    .regex(/^[A-Za-z0-9 -]+$/, 'Company may only include letters, numbers, dashes, and spaces'),
  notes: z
    .string()
    .max(150, 'Notes must be 150 characters or fewer')
    .regex(/^[A-Za-z0-9 .,\-?!()]+$/, 'Notes may only include letters, numbers, spaces, and . , - ? ! ( )')
    .optional()
    .or(z.literal('')),
  tags: z.array(z.string()).optional(),
});

export const leadSchema = z.object({
  clientId: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .regex(leadTitleRegex, 'Title may only include letters, numbers, and spaces'),
  valueCents: z.number().min(0),
  stage: z.enum(['lead', 'contacted', 'proposal', 'won', 'lost']).optional(),
  source: z
    .string()
    .trim()
    .min(1, 'Source is required')
    .regex(
      /^[A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=% ]+$/,
      'Source contains invalid characters'
    ),
  notes: z
    .string()
    .max(150, 'Notes must be 150 characters or fewer')
    .regex(/^[A-Za-z0-9. ]+$/, 'Notes may only include letters, numbers, spaces, and periods')
    .optional(),
});

export const projectSchema = z.object({
  clientId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed']).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  hourlyRateCents: z.number().optional(),
  flatFeeCents: z.number().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  dueDate: z.string().optional(),
  assignedToUserId: z.string().optional(),
});

export const invoiceSchema = z.object({
  clientId: z.string(),
  projectId: z.string().optional(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      qty: z.number().min(1),
      unitPriceCents: z.number().min(0),
    })
  ),
  issueDate: z.string(),
  dueDate: z.string(),
  notes: z.string().optional(),
});
