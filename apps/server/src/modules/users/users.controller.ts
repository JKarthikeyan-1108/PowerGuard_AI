import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { usersService } from './users.service';

export class UsersController {
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await usersService.getUsers(req.query as Record<string, string>);
      res.json({ success: true, data: result.users, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getUserById(req.params.id as string, req.user!);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.updateUser(req.params.id as string, req.body, req.user!);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await usersService.deleteUser(req.params.id as string, req.user!);
      res.json({ success: true, message: 'User deactivated' });
    } catch (error) {
      next(error);
    }
  }

  async suspendUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await usersService.changeUserStatus(req.params.id as string, 'SUSPENDED', req.user!);
      res.json({ success: true, message: 'User suspended' });
    } catch (error) {
      next(error);
    }
  }

  async activateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await usersService.changeUserStatus(req.params.id as string, 'ACTIVE', req.user!);
      res.json({ success: true, message: 'User activated' });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
