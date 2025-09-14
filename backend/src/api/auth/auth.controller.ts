import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';
import { asyncHandler } from '../../utils/errorHandler';
import { validate } from '../../utils/validation';
import { schemas } from '../../utils/validation';
import { logger } from '../../utils/logger';

export class AuthController {
  static googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: { message: 'Google token is required' },
      });
    }

    try {
      // Verify Google token
      const googleUser = await AuthService.verifyGoogleToken(token);
      
      // Find or create user
      const user = await AuthService.findOrCreateUser(googleUser);
      
      // Generate JWT token
      const jwtToken = AuthService.generateToken(user);

      logger.info('User logged in successfully:', { userId: user.id, email: user.email });

      res.json({
        success: true,
        data: {
          user,
          token: jwtToken,
        },
      });
    } catch (error) {
      logger.error('Google login failed:', error);
      throw error;
    }
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: { message: 'Token is required' },
      });
    }

    try {
      const newToken = await AuthService.refreshToken(token);
      
      res.json({
        success: true,
        data: {
          token: newToken,
        },
      });
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await AuthService.logout(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const { name, avatar } = req.body;
    const updatedUser = await AuthService.updateUser(req.user.id, { name, avatar });

    logger.info('User profile updated:', { userId: req.user.id });

    res.json({
      success: true,
      data: {
        user: updatedUser,
      },
    });
  });

  static deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    await AuthService.deleteUser(req.user.id);

    logger.info('User account deleted:', { userId: req.user.id });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  });

  static verifyToken = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token is required' },
      });
    }

    try {
      const user = AuthService.verifyToken(token);
      const dbUser = await AuthService.getUserById(user.id);
      
      if (!dbUser) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not found' },
        });
      }

      res.json({
        success: true,
        data: {
          user: dbUser,
          valid: true,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid token' },
      });
    }
  });
}
