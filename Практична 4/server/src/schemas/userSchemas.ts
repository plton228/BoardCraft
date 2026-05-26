import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, { message: "Ім'я повинно містити щонайменше 2 символи" }),
  email: z.string().email({ message: 'Некоректний формат електронної пошти' }),
  role: z.string().min(1, { message: 'Роль є обовязковим полем' }),
  department: z.string().min(1, { message: 'Підрозділ є обовязковим полем' }),
});

export const updateUserSchema = createUserSchema.partial();

export const userQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'role', 'department', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
