import { Request, Response } from 'express';
import { AssistantService } from '../services/assistant.service';
import { success } from '../utils/error';

export interface AssistantChatBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const AssistantController = {
  chat: async (req: Request, res: Response) => {
    const { messages } = req.body as AssistantChatBody;
    const result = await AssistantService.chat(messages);
    res.json(success(result));
  },
};
