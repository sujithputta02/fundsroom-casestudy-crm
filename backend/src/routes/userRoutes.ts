import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { userService } from '../services/userService';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { ApiResponse } from '../types';
import { UserRole } from '@prisma/client';

const router = Router();

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum([UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS]),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email('Valid email required').optional(),
  fullName: z.string().min(1, 'Full name is required').optional(),
  role: z.enum([UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS]).optional(),
  isActive: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

// All user management routes require ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware([UserRole.ADMIN]));

router.get('/', async (req: Request, res: Response, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await userService.getAllUsers(limit, offset);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      message: 'Users retrieved successfully',
      details: result.pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next) => {
  try {
    const body = createUserSchema.parse(req.body);
    const user = await userService.createUser(body);

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const body = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(req.params.id, body);

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: result.message,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/reset-password', async (req: Request, res: Response, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const result = await userService.resetPassword(req.params.id, body.newPassword);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: result.message,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;