import { verifyAccessToken } from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No access token provided' } });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }

  req.userId = decoded.userId;
  next();
};

export const optionalAuthMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.userId = decoded.userId;
    }
  }

  next();
};
