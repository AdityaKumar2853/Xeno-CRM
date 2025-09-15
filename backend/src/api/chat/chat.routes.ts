import { Router } from 'express';
import { ChatController } from './chat.controller';

const router = Router();

// Chat routes
router.post('/generate', ChatController.generateContent);

export default router;
