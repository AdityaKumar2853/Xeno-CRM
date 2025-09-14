import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database';
import { config } from '../config/app';
import { logger } from '../utils/logger';
import { errors } from '../utils/errorHandler';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export class AuthService {
  private static googleClient = new OAuth2Client(config.auth.googleClientId);

  static async verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: config.auth.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw errors.UNAUTHORIZED('Invalid Google token');
      }

      return {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture || '',
      };
    } catch (error) {
      logger.error('Google token verification failed:', error);
      throw errors.UNAUTHORIZED('Invalid Google token');
    }
  }

  static async findOrCreateUser(googleUser: GoogleUserInfo): Promise<UserPayload> {
    try {
      let user = await prisma.user.findUnique({
        where: { googleId: googleUser.id },
      });

      if (!user) {
        // Check if user exists with same email
        user = await prisma.user.findUnique({
          where: { email: googleUser.email },
        });

        if (user) {
          // Update existing user with Google ID
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: googleUser.id,
              avatar: googleUser.picture || null,
            },
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: googleUser.email,
              name: googleUser.name,
              avatar: googleUser.picture || null,
              googleId: googleUser.id,
            },
          });
        }
      } else {
        // Update user info
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: googleUser.name,
            avatar: googleUser.picture || null,
          },
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || '',
        avatar: user.avatar || '',
      };
    } catch (error) {
      logger.error('Failed to find or create user:', error);
      throw errors.INTERNAL_SERVER_ERROR('Authentication failed');
    }
  }

  static generateToken(payload: UserPayload): string {
    return jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  static verifyToken(token: string): UserPayload {
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as UserPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw errors.UNAUTHORIZED('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw errors.UNAUTHORIZED('Invalid token');
      }
      throw errors.UNAUTHORIZED('Token verification failed');
    }
  }

  static async getUserById(id: string): Promise<UserPayload | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      });

      return {
        id: user!.id,
        email: user!.email,
        name: user!.name || '',
        avatar: user!.avatar || '',
      };
    } catch (error) {
      logger.error('Failed to get user by ID:', error);
      return null;
    }
  }

  static async updateUser(id: string, data: Partial<UserPayload>): Promise<UserPayload> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          name: data.name || null,
          avatar: data.avatar || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name || '',
        avatar: user.avatar || '',
      };
    } catch (error) {
      logger.error('Failed to update user:', error);
      throw errors.INTERNAL_SERVER_ERROR('Failed to update user');
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('Failed to delete user:', error);
      throw errors.INTERNAL_SERVER_ERROR('Failed to delete user');
    }
  }

  static async refreshToken(token: string): Promise<string> {
    try {
      const payload = this.verifyToken(token);
      const user = await this.getUserById(payload.id);
      
      if (!user) {
        throw errors.UNAUTHORIZED('User not found');
      }

      return this.generateToken(user);
    } catch (error) {
      throw errors.UNAUTHORIZED('Token refresh failed');
    }
  }

  static async logout(token: string): Promise<void> {
    // In a more sophisticated implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Store blacklisted tokens in Redis
    // 3. Check blacklist during token verification
    
    // For now, we'll just log the logout
    logger.info('User logged out:', { token: token.substring(0, 20) + '...' });
  }

  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, config.security.bcryptRounds);
  }

  static comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
