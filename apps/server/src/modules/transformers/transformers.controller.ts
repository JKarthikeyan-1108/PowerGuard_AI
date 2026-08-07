import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { transformersService } from './transformers.service';

export class TransformersController {
  async getTransformers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await transformersService.getTransformers(req.query as Record<string, string>);
      res.json({ success: true, data: result.transformers, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getTransformerById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transformer = await transformersService.getTransformerById(req.params.id as string);
      res.json({ success: true, data: transformer });
    } catch (error) {
      next(error);
    }
  }

  async createTransformer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transformer = await transformersService.createTransformer(req.body, req.user!);
      res.status(201).json({ success: true, data: transformer });
    } catch (error) {
      next(error);
    }
  }
}

export const transformersController = new TransformersController();
