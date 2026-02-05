import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TimeLog from '../models/TimeLog.js';
import Invoice from '../models/Invoice.js';
import connectDB from '../db.js';

dotenv.config();

async function seed() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Client.deleteMany({}),
      Lead.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      TimeLog.deleteMany({}),
      Invoice.deleteMany({}),
    ]);

    console.log('Cleared existing data');

    // Create test user
    const user = new User({
      name: 'John Freelancer',
      email: 'john@example.com',
      passwordHash: 'password123',
      role: 'user',
      organization: 'Freelance Ventures',
    });
    await user.save();
    console.log('Created test user');

    // Create clients
    const clients = await Client.insertMany([
      {
        ownerUserId: user._id,
        name: 'TechCorp Inc',
        email: 'contact@techcorp.com',
        phone: '555-0101',
        company: 'TechCorp',
        tags: ['startup', 'web'],
      },
      {
        ownerUserId: user._id,
        name: 'Design Studio',
        email: 'hello@designstudio.com',
        phone: '555-0102',
        company: 'Design Studio',
        tags: ['design', 'branding'],
      },
      {
        ownerUserId: user._id,
        name: 'Marketing Pro',
        email: 'info@marketingpro.com',
        phone: '555-0103',
        company: 'Marketing Pro',
        tags: ['marketing'],
      },
    ]);
    console.log('Created test clients');

    // Create leads
    const leads = await Lead.insertMany([
      {
        ownerUserId: user._id,
        clientId: clients[0]._id,
        title: 'Website Redesign',
        valueCents: 500000,
        stage: 'proposal',
        source: 'referral',
      },
      {
        ownerUserId: user._id,
        clientId: clients[1]._id,
        title: 'Logo Design',
        valueCents: 200000,
        stage: 'contacted',
        source: 'direct',
      },
      {
        ownerUserId: user._id,
        title: 'Mobile App Development',
        valueCents: 1000000,
        stage: 'lead',
        source: 'inbound',
      },
    ]);
    console.log('Created test leads');

    // Create projects
    const projects = await Project.insertMany([
      {
        ownerUserId: user._id,
        clientId: clients[0]._id,
        title: 'Website Redesign - TechCorp',
        description: 'Complete redesign of TechCorp website',
        status: 'active',
        startDate: new Date('2025-12-01'),
        dueDate: new Date('2026-02-28'),
        hourlyRateCents: 10000,
      },
      {
        ownerUserId: user._id,
        clientId: clients[1]._id,
        title: 'Logo Design - Design Studio',
        description: 'Create new brand logo',
        status: 'active',
        startDate: new Date('2026-01-15'),
        dueDate: new Date('2026-02-15'),
        flatFeeCents: 150000,
      },
    ]);
    console.log('Created test projects');

    // Create tasks
    const tasks = await Task.insertMany([
      {
        projectId: projects[0]._id,
        title: 'Design Homepage',
        description: 'Create homepage design mockups',
        status: 'doing',
        priority: 'high',
        dueDate: new Date('2026-02-10'),
      },
      {
        projectId: projects[0]._id,
        title: 'Develop Backend API',
        description: 'Build REST API endpoints',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2026-02-20'),
      },
      {
        projectId: projects[1]._id,
        title: 'Brainstorm Concepts',
        description: 'Initial logo concept brainstorm',
        status: 'done',
        priority: 'high',
        dueDate: new Date('2026-01-20'),
      },
    ]);
    console.log('Created test tasks');

    // Create time logs
    const timeLogs = await TimeLog.insertMany([
      {
        projectId: projects[0]._id,
        userId: user._id,
        date: new Date('2026-01-20'),
        minutes: 480,
        note: 'Homepage design work',
      },
      {
        projectId: projects[0]._id,
        userId: user._id,
        date: new Date('2026-01-21'),
        minutes: 360,
        note: 'API integration',
      },
      {
        projectId: projects[1]._id,
        userId: user._id,
        date: new Date('2026-01-22'),
        minutes: 240,
        note: 'Logo brainstorm session',
      },
    ]);
    console.log('Created test time logs');

    // Create invoices
    const invoices = await Invoice.insertMany([
      {
        ownerUserId: user._id,
        clientId: clients[0]._id,
        projectId: projects[0]._id,
        number: 'INV-00001',
        status: 'sent',
        lineItems: [
          {
            description: 'Website Redesign Services',
            qty: 1,
            unitPriceCents: 500000,
          },
        ],
        totalCents: 500000,
        issueDate: new Date('2026-01-15'),
        dueDate: new Date('2026-02-15'),
      },
      {
        ownerUserId: user._id,
        clientId: clients[1]._id,
        projectId: projects[1]._id,
        number: 'INV-00002',
        status: 'draft',
        lineItems: [
          {
            description: 'Logo Design Package',
            qty: 1,
            unitPriceCents: 150000,
          },
        ],
        totalCents: 150000,
        issueDate: new Date('2026-01-25'),
        dueDate: new Date('2026-02-25'),
      },
    ]);
    console.log('Created test invoices');

    console.log('\n✓ Seed completed successfully!');
    console.log(`Test user email: john@example.com`);
    console.log(`Test user password: password123`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
