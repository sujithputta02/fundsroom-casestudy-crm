import prisma from '../config/database.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';

export const productService = {
  async createProduct(data: {
    name: string;
    sku: string;
    category: string;
    unitPrice: number;
    currentStock: number;
    minimumStockAlert: number;
    location: string;
  }) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new ConflictError('Product with this SKU already exists', 'SKU_EXISTS');
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        unitPrice: data.unitPrice,
        currentStock: data.currentStock,
        minimumStockAlert: data.minimumStockAlert,
        location: data.location,
      },
    });

    return product;
  },

  async updateProduct(id: string, data: Partial<{
    name?: string;
    sku?: string;
    category?: string;
    unitPrice?: number;
    currentStock?: number;
    minimumStockAlert?: number;
    location?: string;
  }>) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check SKU uniqueness if being updated
    if (data.sku && data.sku !== product.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        throw new ConflictError('Product with this SKU already exists', 'SKU_EXISTS');
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return updated;
  },

  async getProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  },

  async listProducts(
    limit: number = 10,
    offset: number = 0,
    search?: string,
    category?: string
  ) {
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  },

  async getLowStockProducts(limit: number = 50) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        currentStock: { lte: prisma.product.fields.minimumStockAlert },
      },
      orderBy: { currentStock: 'asc' },
      take: limit,
    });

    return products;
  },
};
