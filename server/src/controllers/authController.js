import User from '../models/User.js';
import Client from '../models/Client.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TimeLog from '../models/TimeLog.js';
import Invoice from '../models/Invoice.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { registerSchema, loginSchema, updatePasswordSchema } from '../utils/validation.js';
import { asyncHandler } from '../middleware/error.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      error: { code: 'EMAIL_EXISTS', message: 'Email already registered' },
    });
  }

  const user = new User({
    name,
    email,
    passwordHash: password,
  });

  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens: { accessToken, refreshToken },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens: { accessToken, refreshToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token provided' },
    });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
    });
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(401).json({
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    });
  }

  const newAccessToken = generateAccessToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('accessToken', newAccessToken, cookieOptions);

  res.json({ accessToken: newAccessToken });
});

export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('-passwordHash');

  if (!user) {
    return res.status(404).json({
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    });
  }

  res.json(user);
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { newPassword } = updatePasswordSchema.parse(req.body);
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    });
  }

  user.passwordHash = newPassword;
  await user.save();

  res.json({ message: 'Password updated' });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const projects = await Project.find({ ownerUserId: userId }).select('_id');
  const projectIds = projects.map((p) => p._id);
  if (projectIds.length > 0) {
    await Promise.all([
      Task.deleteMany({ projectId: { $in: projectIds } }),
      TimeLog.deleteMany({ projectId: { $in: projectIds } }),
    ]);
  }

  await Promise.all([
    Client.deleteMany({ ownerUserId: userId }),
    Lead.deleteMany({ ownerUserId: userId }),
    Project.deleteMany({ ownerUserId: userId }),
    Invoice.deleteMany({ ownerUserId: userId }),
    User.findByIdAndDelete(userId),
  ]);

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Account deleted' });
});
