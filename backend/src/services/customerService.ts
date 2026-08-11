import prisma from '../config/database.js';
import { Customer, CustomerStatus, CustomerType } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export const customerService = {
  async createCustomer(data: {
    name: string;
    mobileNumber: string;
    email: string;
    businessName: string;
    gstNumber?: string;
    customerType: CustomerType;
    address: string;
    status?: CustomerStatus;
    followUpDate?: Date;
    notes?: string;
    createdBy: string;
  }) {
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        mobileNumber: data.mobileNumber,
        email: data.email,
        businessName: data.businessName,
        gstNumber: data.gstNumber || null,
        customerType: data.customerType,
        address: data.address,
        status: data.status || CustomerStatus.LEAD,
        followUpDate: data.followUpDate,
        notes: data.notes,
        createdBy: data.createdBy,
      },
    });

    return customer;
  },

  async updateCustomer(id: string, data: Partial<Customer>) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const updated = await prisma.customer.update({
      where: { id },
      data,
    });

    return updated;
  },

  async getCustomer(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: { creator: { select: { fullName: true } } },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  },

  async listCustomers(
    limit: number = 10,
    offset: number = 0,
    search?: string,
    status?: CustomerStatus
  ) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
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

  async addFollowUp(customerId: string, note: string, createdBy: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const followUp = await prisma.followUp.create({
      data: {
        customerId,
        note,
        createdBy,
      },
      include: { creator: { select: { fullName: true } } },
    });

    return followUp;
  },

  async getFollowUps(customerId: string, limit: number = 50, offset: number = 0) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const [data, total] = await Promise.all([
      prisma.followUp.findMany({
        where: { customerId },
        include: { creator: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.followUp.count({ where: { customerId } }),
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
};
