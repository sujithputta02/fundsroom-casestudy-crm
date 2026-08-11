import prisma from '../config/database';
import { Challan, ChallanStatus, StockMovementType } from '@prisma/client';
import {
  NotFoundError,
  ConflictError,
  InsufficientStockError,
  ValidationError,
} from '../utils/errors';

function generateChallanNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `CH-${timestamp}-${random}`;
}

export const challanService = {
  async createChallan(data: {
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    createdBy: string;
  }) {
    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new ValidationError('Challan must contain at least one item');
    }

    // Fetch all products to validate and get prices
    const products = await prisma.product.findMany({
      where: {
        id: { in: data.items.map((i) => i.productId) },
      },
    });

    if (products.length !== data.items.length) {
      throw new NotFoundError('One or more products not found');
    }

    const challanNumber = generateChallanNumber();
    let totalQuantity = 0;

    const challanItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new NotFoundError('Product not found');

      totalQuantity += item.quantity;

      return {
        productId: item.productId,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        total: product.unitPrice.toNumber() * item.quantity,
      };
    });

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId: data.customerId,
        totalQuantity,
        status: ChallanStatus.DRAFT,
        createdBy: data.createdBy,
        items: {
          createMany: {
            data: challanItems,
          },
        },
      },
      include: {
        items: true,
        customer: { select: { name: true } },
        creator: { select: { fullName: true } },
      },
    });

    return challan;
  },

  async getChallan(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        items: true,
        customer: { select: { id: true, name: true, businessName: true } },
        creator: { select: { fullName: true } },
      },
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    return challan;
  },

  async listChallans(
    limit: number = 10,
    offset: number = 0,
    status?: ChallanStatus,
    customerId?: string
  ) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [data, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        include: {
          items: true,
          customer: { select: { name: true } },
          creator: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.challan.count({ where }),
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

  async confirmChallan(challanId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id: challanId },
      include: { items: true },
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    if (challan.status !== ChallanStatus.DRAFT) {
      throw new ConflictError(
        `Cannot confirm challan with status ${challan.status}`,
        'INVALID_CHALLAN_STATUS'
      );
    }

    // BEGIN TRANSACTION - This is critical for data integrity
    try {
      // Step 1: Validate stock for all items
      const productIds = challan.items.map((item) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      for (const item of challan.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new NotFoundError(`Product ${item.productId} not found`);
        }

        if (product.currentStock < item.quantity) {
          throw new InsufficientStockError(
            product.name,
            item.quantity,
            product.currentStock
          );
        }
      }

      // Step 2: Use transaction to update stock and create movements
      const updatedChallan = await prisma.$transaction(async (tx) => {
        // Update stock and create movements for each item
        for (const item of challan.items) {
          const product = products.find((p) => p.id === item.productId);
          if (!product) throw new NotFoundError('Product not found');

          // Reduce stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: product.currentStock - item.quantity,
            },
          });

          // Create OUT movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: StockMovementType.OUT,
              reason: `Challan ${challan.challanNumber} confirmed`,
              createdBy: challan.createdBy,
            },
          });
        }

        // Mark challan as confirmed
        return tx.challan.update({
          where: { id: challanId },
          data: { status: ChallanStatus.CONFIRMED },
          include: {
            items: true,
            customer: { select: { name: true } },
            creator: { select: { fullName: true } },
          },
        });
      });

      return updatedChallan;
    } catch (error) {
      // Transaction automatically rolled back on error
      throw error;
    }
  },

  async cancelChallan(challanId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id: challanId },
      include: { items: true },
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    if (challan.status !== ChallanStatus.CONFIRMED) {
      throw new ConflictError(
        `Can only cancel confirmed challans. Current status: ${challan.status}`,
        'INVALID_CHALLAN_STATUS'
      );
    }

    // Use transaction to restore stock and create reverse movements
    const updatedChallan = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: challan.items.map((i) => i.productId) } },
      });

      // Restore stock and create IN movements
      for (const item of challan.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new NotFoundError('Product not found');

        // Restore stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: product.currentStock + item.quantity,
          },
        });

        // Create IN movement (reversal)
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: StockMovementType.IN,
            reason: `Challan ${challan.challanNumber} cancelled (reversal)`,
            createdBy: challan.createdBy,
          },
        });
      }

      // Mark challan as cancelled
      return tx.challan.update({
        where: { id: challanId },
        data: { status: ChallanStatus.CANCELLED },
        include: {
          items: true,
          customer: { select: { name: true } },
          creator: { select: { fullName: true } },
        },
      });
    });

    return updatedChallan;
  },

  async updateChallanItems(
    challanId: string,
    items: Array<{
      productId: string;
      quantity: number;
    }>
  ) {
    const challan = await prisma.challan.findUnique({
      where: { id: challanId },
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    if (challan.status !== ChallanStatus.DRAFT) {
      throw new ConflictError(
        'Can only edit draft challans',
        'INVALID_CHALLAN_STATUS'
      );
    }

    // Validate items
    if (!items || items.length === 0) {
      throw new ValidationError('Challan must contain at least one item');
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });

    if (products.length !== items.length) {
      throw new NotFoundError('One or more products not found');
    }

    const challanItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new NotFoundError('Product not found');

      return {
        productId: item.productId,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        total: product.unitPrice.toNumber() * item.quantity,
      };
    });

    let totalQuantity = 0;
    challanItems.forEach((item) => {
      totalQuantity += item.quantity;
    });

    // Delete old items and create new ones
    const updated = await prisma.challan.update({
      where: { id: challanId },
      data: {
        totalQuantity,
        items: {
          deleteMany: {},
          createMany: {
            data: challanItems,
          },
        },
      },
      include: {
        items: true,
        customer: { select: { name: true } },
        creator: { select: { fullName: true } },
      },
    });

    return updated;
  },
};
