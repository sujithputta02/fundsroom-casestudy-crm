import prisma from '../config/database.js';
import { StockMovementType } from '@prisma/client';
import { NotFoundError, ConflictError, InsufficientStockError } from '../utils/errors.js';
import { realtimeService } from './realtimeService.js';

export const stockService = {
  async recordStockMovement(data: {
    productId: string;
    quantityChanged: number;
    movementType: StockMovementType;
    reason: string;
    createdBy: string;
  }) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const movement = await prisma.stockMovement.create({
      data: {
        productId: data.productId,
        quantityChanged: data.quantityChanged,
        movementType: data.movementType,
        reason: data.reason,
        createdBy: data.createdBy,
      },
      include: { product: true, creator: { select: { fullName: true } } },
    });

    return movement;
  },

  async listStockMovements(
    limit: number = 20,
    offset: number = 0,
    productId?: string,
    movementType?: StockMovementType
  ) {
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (movementType) {
      where.movementType = movementType;
    }

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { name: true, sku: true } },
          creator: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.stockMovement.count({ where }),
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

  async adjustStock(
    productId: string,
    quantity: number,
    type: StockMovementType,
    reason: string,
    createdBy: string
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    let newStock = product.currentStock;

    if (type === StockMovementType.OUT) {
      newStock = product.currentStock - quantity;
      if (newStock < 0) {
        throw new InsufficientStockError(product.name, quantity, product.currentStock);
      }
    } else {
      newStock = product.currentStock + quantity;
    }

    const [updatedProduct, movement] = await Promise.all([
      prisma.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      }),
      this.recordStockMovement({
        productId,
        quantityChanged: quantity,
        movementType: type,
        reason,
        createdBy,
      }),
    ]);

    realtimeService.broadcastUpdate();
    return { product: updatedProduct, movement };
  },
};
