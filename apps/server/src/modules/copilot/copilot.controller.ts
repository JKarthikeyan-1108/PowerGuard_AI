import { Request, Response, NextFunction } from 'express';
import { copilotService } from './copilot.service';

export class CopilotController {
  
  public handleChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, history } = req.body;
      const user = req.user;
      
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      
      const response = await copilotService.generateChatResponse(
        user.id,
        user.role,
        req.tenantId || null,
        message,
        history
      );
      
      res.json({ success: true, response });
    } catch (error) {
      next(error);
    }
  };
}

export const copilotController = new CopilotController();
