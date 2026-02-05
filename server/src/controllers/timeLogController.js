import TimeLog from '../models/TimeLog.js';
import { asyncHandler } from '../middleware/error.js';

export const getTimeLogs = asyncHandler(async (req, res) => {
  const { projectId, from, to, uninvoiced } = req.query;
  const filter = { userId: req.userId };

  if (projectId) filter.projectId = projectId;
  if (uninvoiced === '1') filter.invoiced = { $ne: true };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const timeLogs = await TimeLog.find(filter)
    .populate({
      path: 'projectId',
      select: 'title hourlyRateCents clientId',
      populate: { path: 'clientId', select: 'name company' },
    })
    .sort({ date: -1, createdAt: -1 });

  res.json(timeLogs);
});
