import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { challanService } from '../services/challanService';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { ApiResponse } from '../types';
import { ChallanStatus, UserRole } from '@prisma/client';

const router = Router();

const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().positive('Quantity must be positive'),
    })
  ).min(1, 'At least one item is required'),
});

const updateChallanSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().positive('Quantity must be positive'),
    })
  ).min(1, 'At least one item is required'),
});

router.post(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.SALES, UserRole.ADMIN]),
  async (req: Request, res: Response, next) => {
    try {
      const body = createChallanSchema.parse(req.body);
      const challan = await challanService.createChallan({
        ...body,
        createdBy: req.user!.id,
      });

      const response: ApiResponse = {
        success: true,
        data: challan,
        message: 'Challan created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Validate status parameter - only accept valid ChallanStatus enum values
    let status: ChallanStatus | undefined = undefined;
    if (req.query.status) {
      const statusValue = (req.query.status as string).toUpperCase();
      if (Object.values(ChallanStatus).includes(statusValue as ChallanStatus)) {
        status = statusValue as ChallanStatus;
      }
      // If invalid status is provided, ignore it (don't filter by status)
    }
    
    const customerId = (req.query.customerId as string) || undefined;

    const result = await challanService.listChallans(limit, offset, status, customerId);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      message: 'Challans retrieved successfully',
      details: result.pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const challan = await challanService.getChallan(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: challan,
      message: 'Challan retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.SALES, UserRole.ADMIN]),
  async (req: Request, res: Response, next) => {
    try {
      const body = updateChallanSchema.parse(req.body);
      const challan = await challanService.updateChallanItems(req.params.id, body.items);

      const response: ApiResponse = {
        success: true,
        data: challan,
        message: 'Challan updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/confirm',
  authMiddleware,
  roleMiddleware([UserRole.SALES, UserRole.ADMIN]),
  async (req: Request, res: Response, next) => {
    try {
      const challan = await challanService.confirmChallan(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: challan,
        message: 'Challan confirmed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware([UserRole.SALES, UserRole.ADMIN]),
  async (req: Request, res: Response, next) => {
    try {
      const challan = await challanService.cancelChallan(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: challan,
        message: 'Challan cancelled successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
