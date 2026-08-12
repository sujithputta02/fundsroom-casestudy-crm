import { Router, Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService.js';
import { authMiddleware } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';
import { realtimeService } from '../services/realtimeService.js';

const router = Router();

router.get('/live', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  realtimeService.addClient(res);

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
    } catch (err) {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    realtimeService.removeClient(res);
  });
});


router.get('/summary', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary();

    const response: ApiResponse = {
      success: true,
      data: summary,
      message: 'Dashboard summary retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/sales-trend', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const trend = await dashboardService.getWeeklySalesTrend();

    const response: ApiResponse = {
      success: true,
      data: trend,
      message: 'Weekly sales trend retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/stock-health', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const health = await dashboardService.getStockHealth();

    const response: ApiResponse = {
      success: true,
      data: health,
      message: 'Stock health retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
