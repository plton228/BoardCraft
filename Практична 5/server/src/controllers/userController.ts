import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
} from '../schemas/userSchemas.js';
import { AppError } from '../middlewares/errorHandler.js';

export class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedQuery = userQuerySchema.parse(req.query);
      const result = await UserService.getAllUsers(parsedQuery);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Некоректний ID користувача', 400);
      }

      const user = await UserService.getUserById(id);
      if (!user) {
        throw new AppError('Користувача не знайдено', 404);
      }

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = createUserSchema.parse(req.body);
      const user = await UserService.createUser(parsedBody);
      return res.status(201).json({
        status: 'success',
        message: 'Користувача успішно створено',
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Некоректний ID користувача', 400);
      }

      const parsedBody = updateUserSchema.parse(req.body);
      const user = await UserService.updateUser(id, parsedBody);
      return res.status(200).json({
        status: 'success',
        message: 'Дані користувача успішно оновлено',
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Некоректний ID користувача', 400);
      }

      await UserService.deleteUser(id);
      return res.status(200).json({
        status: 'success',
        message: 'Користувача успішно видалено',
      });
    } catch (error) {
      next(error);
    }
  }
}
