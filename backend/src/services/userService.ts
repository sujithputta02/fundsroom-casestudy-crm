import bcryptjs from 'bcryptjs';
import prisma from '../config/database.js';
import { UserRole } from '@prisma/client';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export const userService = {
  async getAllUsers(limit = 50, offset = 0) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        theme: true,
        enableStockAlerts: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    isActive?: boolean;
  }) {
    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email },
        ],
      },
    });

    if (existingUser) {
      throw new ValidationError('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },

  async updateUser(id: string, data: {
    email?: string;
    fullName?: string;
    role?: UserRole;
    isActive?: boolean;
  }) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ValidationError('Email already exists');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        isActive: data.isActive,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  },

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Don't allow deletion if user has created records
    const [customersCount, challansCount, stockMovementsCount] = await Promise.all([
      prisma.customer.count({ where: { createdBy: id } }),
      prisma.challan.count({ where: { createdBy: id } }),
      prisma.stockMovement.count({ where: { createdBy: id } }),
    ]);

    if (customersCount > 0 || challansCount > 0 || stockMovementsCount > 0) {
      throw new ValidationError('Cannot delete user with existing records. Deactivate instead.');
    }

    await prisma.user.delete({
      where: { id },
    });

    return { success: true, message: 'User deleted successfully' };
  },

  async resetPassword(id: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password reset successfully' };
  },
};