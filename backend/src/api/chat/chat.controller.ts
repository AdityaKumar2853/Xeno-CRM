import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { ChatService } from '../../services/chat.service';

export class ChatController {
  static generateContent = asyncHandler(async (req: Request, res: Response) => {
    const { message } = req.body;

    logger.info('Chat API request:', { message: message?.substring(0, 100) + '...' });

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is required and must be a non-empty string' },
      });
    }

    try {
      const result = await ChatService.generateContent(message.trim());
      
      logger.info('Chat response generated successfully');
      
      res.json({
        success: true,
        data: result,
        message: 'Content generated successfully',
      });
    } catch (error) {
      logger.error('Chat generation failed:', error);
      throw error;
    }
  });
}
