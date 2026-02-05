import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TimeLog from '../models/TimeLog.js';
import { projectSchema, taskSchema } from '../utils/validation.js';
import { asyncHandler } from '../middleware/error.js';

export const getProjects = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { ownerUserId: req.userId };

  if (status) filter.status = status;

  const projects = await Project.find(filter).populate('clientId', 'name company');
  res.json(projects);
});

export const createProject = asyncHandler(async (req, res) => {
  const data = projectSchema.parse(req.body);

  const project = new Project({
    ...data,
    ownerUserId: req.userId,
    startDate: data.startDate ? new Date(data.startDate) : new Date(),
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  });

  await project.save();
  res.status(201).json(project);
});

export const getProjectDetail = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    ownerUserId: req.userId,
  }).populate('clientId');

  if (!project) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Project not found' },
    });
  }

  const tasks = await Task.find({ projectId: project._id });
  const timeLogs = await TimeLog.find({ projectId: project._id });

  const totalMinutes = timeLogs.reduce((sum, log) => sum + log.minutes, 0);
  const totalCents = timeLogs.length > 0
    ? (() => {
      const sum = timeLogs.reduce((acc, log) => {
        const rate = log.rateCents ?? project.hourlyRateCents ?? 0;
        return acc + (log.minutes / 60) * rate;
      }, 0);
      return sum > 0 ? sum : (project.flatFeeCents || 0);
    })()
    : project.hourlyRateCents
      ? (totalMinutes / 60) * project.hourlyRateCents
      : project.flatFeeCents || 0;

  res.json({
    ...project.toObject(),
    tasks,
    timeLogs,
    totalMinutes,
    totalCents: Math.round(totalCents),
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const data = projectSchema.partial().parse(req.body);

  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.dueDate) data.dueDate = new Date(data.dueDate);

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, ownerUserId: req.userId },
    data,
    { new: true, runValidators: true }
  );

  if (!project) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Project not found' },
    });
  }

  res.json(project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({
    _id: req.params.id,
    ownerUserId: req.userId,
  });

  if (!project) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Project not found' },
    });
  }

  res.json({ message: 'Project deleted' });
});

// Tasks
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ projectId: req.params.id });
  res.json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
  const data = taskSchema.parse(req.body);

  const task = new Task({
    ...data,
    projectId: req.params.id,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  });

  await task.save();
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const data = taskSchema.partial().parse(req.body);

  if (data.dueDate) data.dueDate = new Date(data.dueDate);

  const task = await Task.findByIdAndUpdate(
    req.params.taskId,
    data,
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Task not found' },
    });
  }

  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.taskId);

  if (!task) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Task not found' },
    });
  }

  res.json({ message: 'Task deleted' });
});

// Time Logs
export const getTimeLogs = asyncHandler(async (req, res) => {
  const timeLogs = await TimeLog.find({ projectId: req.params.id });
  res.json(timeLogs);
});

export const createTimeLog = asyncHandler(async (req, res) => {
  const { date, minutes, note, rateCents } = req.body;

  if (!date || !minutes) {
    return res.status(400).json({
      error: { code: 'MISSING_FIELDS', message: 'date and minutes are required' },
    });
  }

  const timeLog = new TimeLog({
    projectId: req.params.id,
    userId: req.userId,
    date: new Date(date),
    minutes: parseInt(minutes),
    rateCents: rateCents !== undefined && rateCents !== null && rateCents !== ''
      ? parseInt(rateCents)
      : undefined,
    note,
  });

  await timeLog.save();
  res.status(201).json(timeLog);
});
