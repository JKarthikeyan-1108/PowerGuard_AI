import { Request, Response, NextFunction } from 'express';
import { gridService } from './grid.service';
import logger from '../../config/logger';

export class GridController {
  public getTopology = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topology = await gridService.getTopology();
      res.json({
        success: true,
        data: topology,
      });
    } catch (error: any) {
      logger.error(`Error in getTopology: ${error.message}`);
      next(error);
    }
  };
}

export const gridController = new GridController();
