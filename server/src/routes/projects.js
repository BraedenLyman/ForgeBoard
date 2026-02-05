import express from 'express';
import {
  getProjects,
  createProject,
  getProjectDetail,
  updateProject,
  deleteProject,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTimeLogs,
  createTimeLog,
} from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectDetail);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

// Tasks
router.get('/:id/tasks', getTasks);
router.post('/:id/tasks', createTask);
router.patch('/:id/tasks/:taskId', updateTask);
router.delete('/:id/tasks/:taskId', deleteTask);

// Time Logs
router.get('/:id/timelogs', getTimeLogs);
router.post('/:id/timelogs', createTimeLog);

export default router;
