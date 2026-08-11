import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { customerService } from '../services/customerService.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';
import { CustomerStatus, CustomerType, UserRole } from '@prisma/client';

const router = Router();

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobileNumber: z.string().min(10, 'Valid mobile number required'),
  email: z.string().email('Valid email required'),
  businessName: z.string().min(1, 'Business name is required'),
  gstNumber: z.string().optional(),
  customerType: z.enum([CustomerType.RETAIL, CustomerType.WHOLESALE, CustomerType.DISTRIBUTOR]),
  address: z.string().min(1, 'Address is required'),
  status: z.enum([CustomerStatus.LEAD, CustomerStatus.ACTIVE, CustomerStatus.INACTIVE]).optional(),
  followUpDate: z.string().datetime().optional().transform(v => v ? new Date(v) : undefined),
  notes: z.string().optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

router.post('/', 
  authMiddleware,
  roleMiddleware([UserRole.SALES, UserRole.ADMIN]),
  async (req: Request, res: Response, next) => {
  try {
    const body = createCustomerSchema.parse(req.body);
    const customer = await customerService.createCustomer({
      ...body,
      createdBy: req.user!.id,
    });

    const response: ApiResponse = {
      success: true,
      data: customer,
      message: 'Customer created successfully',
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
    const status = (req.query.status as CustomerStatus) || undefined;

    const result = await customerService.listCustomers(limit, offset, search, status);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      message: 'Customers retrieved successfully',
      details: result.pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const customer = await customerService.getCustomer(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: customer,
      message: 'Customer retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', 
  authMiddleware,
  roleMiddleware([UserRole.SALES, UserRole.ADMIN]),
  async (req: Request, res: Response, next) => {
  try {
    const body = updateCustomerSchema.parse(req.body);
    const customer = await customerService.updateCustomer(req.params.id, body);

    const response: ApiResponse = {
      success: true,
      data: customer,
      message: 'Customer updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/follow-ups', 
  authMiddleware,
  roleMiddleware([UserRole.SALES, UserRole.ADMIN]),
  async (req: Request, res: Response, next) => {
  try {
    const noteSchema = z.object({
      note: z.string().min(1, 'Note is required'),
    });

    const body = noteSchema.parse(req.body);
    const followUp = await customerService.addFollowUp(
      req.params.id,
      body.note,
      req.user!.id
    );

    const response: ApiResponse = {
      success: true,
      data: followUp,
      message: 'Follow-up added successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/follow-ups', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await customerService.getFollowUps(req.params.id, limit, offset);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      message: 'Follow-ups retrieved successfully',
      details: result.pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
