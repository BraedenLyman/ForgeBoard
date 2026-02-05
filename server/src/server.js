import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import { errorHandler } from './middleware/error.js';

// Routes
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import leadRoutes from './routes/leads.js';
import projectRoutes from './routes/projects.js';
import invoiceRoutes from './routes/invoices.js';
import timeLogRoutes from './routes/timeLogs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/timelogs', timeLogRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
