import { Router } from 'express';
import { AssistantController } from '../controllers/assistant.controller';
import { assistantChatSchema } from '../validators/assistant';
import { validate } from '../middleware/validate';
import { assistantLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/chat', assistantLimiter, validate(assistantChatSchema), AssistantController.chat);

export default router;
