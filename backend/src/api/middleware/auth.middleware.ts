import { Request, Response, NextFunction } from 'express';
import { AuthService, UserPayload } from '../../services/auth.service';
import { errors } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw errors.UNAUTHORIZED('Access token required');
    }

    const user = AuthService.verifyToken(token);
    
    // Verify user still exists in database
    const dbUser = await AuthService.getUserById(user.id);
    if (!dbUser) {
      throw errors.UNAUTHORIZED('User not found');
    }

    req.user = dbUser;
    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    next(error);
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const user = AuthService.verifyToken(token);
        const dbUser = await AuthService.getUserById(user.id);
        if (dbUser) {
          req.user = dbUser;
        }
      } catch (error) {
        // Ignore auth errors for optional auth
        logger.debug('Optional auth failed:', error);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw errors.UNAUTHORIZED('Authentication required');
    }

    // For now, we don't have roles in our schema
    // This is a placeholder for future role-based access control
    next();
  };
};

export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw errors.UNAUTHORIZED('Authentication required');
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      throw errors.FORBIDDEN('Access denied: You can only access your own resources');
    }

    next();
  };
};
