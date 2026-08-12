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
    // Get last 7 days including today (current period)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 13);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Fetch confirmed challans for current period (last 7 days)
    const confirmedChallansCurrent = await prisma.challan.findMany({
      where: {
        status: ChallanStatus.CONFIRMED,
        createdAt: {
          gte: sevenDaysAgo,
          lt: tomorrow,
        },
      },
      include: {
        items: true,
      },
    });

    // Fetch confirmed challans for previous period (prior 7 days)
    const confirmedChallansPrevious = await prisma.challan.findMany({
      where: {
        status: ChallanStatus.CONFIRMED,
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
      include: {
        items: true,
      },
    });

    // Calculate current total sales
    const currentTotal = confirmedChallansCurrent.reduce((total, challan) => {
      const challanTotal = challan.items.reduce((sum, item) => sum + Number(item.total), 0);
      return total + challanTotal;
    }, 0);

    // Calculate previous total sales
    const previousTotal = confirmedChallansPrevious.reduce((total, challan) => {
      const challanTotal = challan.items.reduce((sum, item) => sum + Number(item.total), 0);
      return total + challanTotal;
    }, 0);

    // Calculate percentage change
    let percentageChange = 0;
    if (previousTotal > 0) {
      percentageChange = parseFloat((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1));
    } else if (currentTotal > 0) {
      percentageChange = 100.0;
    }

    // Construct chronological trend data (oldest 6 days ago -> newest today)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trend = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      
      const dayName = days[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      const isToday = date.getTime() === today.getTime();

      // Sum sales for this specific day
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayChallans = confirmedChallansCurrent.filter(c => {
        const cDate = new Date(c.createdAt);
        return cDate >= dayStart && cDate < dayEnd;
      });

      const daySales = dayChallans.reduce((total, challan) => {
        const challanTotal = challan.items.reduce((sum, item) => sum + Number(item.total), 0);
        return total + challanTotal;
      }, 0);

      trend.push({
        day: dayName,
        sales: Math.round(daySales),
        date: dateStr,
        isToday,
      });
    }

    return {
      trend,
      percentageChange,
      currentTotal: Math.round(currentTotal),
      previousTotal: Math.round(previousTotal),
    };
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
