import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Handler]:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'validation_error',
      message: 'Помилка валідації вхідних даних',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[]) || [];
      return res.status(409).json({
        status: 'error',
        message: `Користувач із таким ${fields.join(', ') || 'email'} вже існує`,
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Запис не знайдено в базі даних',
      });
    }
  }

  return res.status(500).json({
    status: 'error',
    message: 'Внутрішня помилка сервера. Спробуйте пізніше.',
  });
};
