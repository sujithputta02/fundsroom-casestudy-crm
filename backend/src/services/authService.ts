import bcryptjs from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { User, UserRole } from '@prisma/client';
import prisma from '../config/database';
import { env } from '../config/env';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import { JwtPayload } from '../types';

export const authService = {
  async login(username: string, password: string) {
    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid username or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  },

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        theme: true,
        enableStockAlerts: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  },

  async updateUserSettings(userId: string, data: {
    theme?: string;
    enableStockAlerts?: boolean;
  }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        theme: data.theme || user.theme,
        enableStockAlerts: data.enableStockAlerts !== undefined ? data.enableStockAlerts : user.enableStockAlerts,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        theme: true,
        enableStockAlerts: true,
      },
    });

    return updated;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password changed successfully' };
  },

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (existingUser) {
      throw new ValidationError('Username or email already exists');
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role,
      },
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  },
};

export function generateToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, env.JWT_SECRET, options);
}
