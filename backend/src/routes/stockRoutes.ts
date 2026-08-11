import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { stockService } from '../services/stockService.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';
import { StockMovementType, UserRole } from '@prisma/client';

const router = Router();

const createMovementSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantityChanged: z.number().int().positive('Quantity must be positive'),
  movementType: z.enum([StockMovementType.IN, StockMovementType.OUT]),
  reason: z.string().min(1, 'Reason is required'),
});

router.post(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.WAREHOUSE, UserRole.ADMIN]),
  async (req: Request, res: Response, next) => {
    try {
      const body = createMovementSchema.parse(req.body);
      const movement = await stockService.recordStockMovement({
        ...body,
        createdBy: req.user!.id,
      });

      const response: ApiResponse = {
        success: true,
        data: movement,
        message: 'Stock movement recorded successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const productId = (req.query.productId as string) || undefined;
    const movementType = (req.query.movementType as StockMovementType) || undefined;

    const result = await stockService.listStockMovements(
      limit,
      offset,
      productId,
      movementType
    );

    const response: ApiResponse = {
      success: true,
      data: result.data,
      message: 'Stock movements retrieved successfully',
      details: result.pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
