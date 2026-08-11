import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { authMiddleware } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  enableStockAlerts: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.username, body.password);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Login successful',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);

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

router.put('/settings', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const body = settingsSchema.parse(req.body);
    const user = await authService.updateUserSettings(req.user!.id, body);

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'Settings updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/change-password', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const body = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(req.user!.id, body.currentPassword, body.newPassword);

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
