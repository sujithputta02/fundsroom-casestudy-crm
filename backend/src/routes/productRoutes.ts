import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { productService } from '../services/productService';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { ApiResponse } from '../types';
import { UserRole } from '@prisma/client';

const router = Router();

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currentStock: z.number().int().nonnegative('Stock cannot be negative'),
  minimumStockAlert: z.number().int().nonnegative('Alert quantity cannot be negative'),
  location: z.string().min(1, 'Location is required'),
});

const updateProductSchema = createProductSchema.partial();

router.post('/', 
  authMiddleware,
  roleMiddleware([UserRole.WAREHOUSE, UserRole.ADMIN]),
  async (req: Request, res: Response, next) => {
  try {
    const body = createProductSchema.parse(req.body);
    const product = await productService.createProduct(body);

    const response: ApiResponse = {
      success: true,
      data: product,
      message: 'Product created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.search as string) || undefined;
    const category = (req.query.category as string) || undefined;

    const result = await productService.listProducts(limit, offset, search, category);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      message: 'Products retrieved successfully',
      details: result.pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/low-stock', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const products = await productService.getLowStockProducts(limit);

    const response: ApiResponse = {
      success: true,
      data: products,
      message: 'Low stock products retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const product = await productService.getProduct(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: product,
      message: 'Product retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', 
  authMiddleware,
  roleMiddleware([UserRole.WAREHOUSE, UserRole.ADMIN]),
  async (req: Request, res: Response, next) => {
  try {
    const body = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(req.params.id, body);

    const response: ApiResponse = {
      success: true,
      data: product,
      message: 'Product updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
