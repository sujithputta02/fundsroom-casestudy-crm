import prisma from '../config/database.js';
import { ChallanStatus, CustomerStatus } from '@prisma/client';

export const dashboardService = {
  async getDashboardSummary() {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Today's Sales - Sum of confirmed challans created today
    const todayChallans = await prisma.challan.findMany({
      where: {
        status: ChallanStatus.CONFIRMED,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        items: true,
      },
    });

    const todaySales = todayChallans.reduce((total, challan) => {
      const challanTotal = challan.items.reduce((sum, item) => {
        return sum + Number(item.total);
      }, 0);
      return total + challanTotal;
    }, 0);

    const confirmedOrdersToday = todayChallans.length;

    // 2. Stock Alerts - Products where currentStock <= minimumStockAlert
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
      },
    });

    // Filter in JavaScript since Prisma doesn't support column comparison directly
    const stockAlerts = lowStockProducts.filter(
      (product) => product.currentStock <= product.minimumStockAlert
    ).length;

    // 3. Pending Challans - Count of DRAFT status challans
    const pendingChallans = await prisma.challan.count({
      where: {
        status: ChallanStatus.DRAFT,
      },
    });

    // 4. Follow-ups Due - Leads with follow-up date this week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const followUpsDue = await prisma.customer.count({
      where: {
        status: CustomerStatus.LEAD,
        followUpDate: {
          gte: today,
          lt: endOfWeek,
        },
      },
    });

    return {
      todaySales: Math.round(todaySales),
      confirmedOrdersToday,
      stockAlerts,
      pendingChallans,
      followUpsDue,
    };
  },

  async getWeeklySalesTrend() {
    // Get last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const confirmedChallans = await prisma.challan.findMany({
      where: {
        status: ChallanStatus.CONFIRMED,
        createdAt: {
          gte: sevenDaysAgo,
          lt: new Date(),
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by day
    const salesByDay: { [key: string]: number } = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize all days with 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const dayName = days[date.getDay()];
      salesByDay[dayName] = 0;
    }

    // Sum sales by day
    confirmedChallans.forEach((challan) => {
      const dayName = days[challan.createdAt.getDay()];
      const challanTotal = challan.items.reduce((sum, item) => {
        return sum + Number(item.total);
      }, 0);
      salesByDay[dayName] += challanTotal;
    });

    return salesByDay;
  },

  async getStockHealth() {
    const totalProducts = await prisma.product.count({
      where: { isActive: true },
    });

    if (totalProducts === 0) {
      return {
        healthyProducts: 0,
        lowStockProducts: 0,
        totalProducts: 0,
        healthPercentage: 0,
      };
    }

    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
      },
    });

    // Filter in JavaScript since Prisma doesn't support column comparison directly
    const lowStockCount = lowStockProducts.filter(
      (product) => product.currentStock <= product.minimumStockAlert
    ).length;

    const healthyProducts = totalProducts - lowStockCount;
    const healthPercentage = Math.round((healthyProducts / totalProducts) * 100);

    return {
      healthyProducts,
      lowStockProducts: lowStockCount,
      totalProducts,
      healthPercentage,
    };
  },
};
