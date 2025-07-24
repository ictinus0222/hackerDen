import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  projectId?: string;
}

export const authenticateProject = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access denied. No token provided.',
        },
        timestamp: new Date()
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const decoded = jwt.verify(token, jwtSecret) as { projectId: string };
    
    req.projectId = decoded.projectId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token.',
      },
      timestamp: new Date()
    });
  }
};

export const generateProjectToken = (projectId: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
  return jwt.sign({ projectId }, jwtSecret, { expiresIn: '7d' });
};