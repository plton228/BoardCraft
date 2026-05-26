import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

interface GetUsersParams {
  search?: string;
  sortBy?: 'name' | 'email' | 'role' | 'department' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class UserService {
  static async getAllUsers(params: GetUsersParams) {
    const {
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async createUser(data: {
    name: string;
    email: string;
    role: string;
    department: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  static async updateUser(
    id: number,
    data: Partial<{
      name: string;
      email: string;
      role: string;
      department: string;
    }>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async deleteUser(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }
}
