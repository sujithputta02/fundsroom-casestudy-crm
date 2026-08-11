import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalLimiter, authLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import challanRoutes from './routes/challanRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Trust proxy - required when running behind Render's load balancer
app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// CORS - Allow multiple origins for development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://fundsroom-casestudy-crm.vercel.app',
  'https://fundsroom-casestudy-crm-git-main-sujithputtas-projects.vercel.app', // Vercel preview URLs
  'https://fundsroom-casestudy-crm-sujithputtas-projects.vercel.app', // Vercel project URLs
  env.FRONTEND_URL // From environment variable
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel preview deployments
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply global rate limiting to all requests
app.use(globalLimiter);

// Health check with keep-alive
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Keep-alive endpoint for preventing Render cold starts
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// API Routes (Apply authLimiter strictly to auth endpoints)
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/stock/movements', stockRoutes);
app.use('/api/v1/challans', challanRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    code: 'NOT_FOUND',
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = env.PORT;

const server = app.listen(PORT, '0.0.0.0', () => {
  const host = env.NODE_ENV === 'production' 
    ? process.env.RENDER_EXTERNAL_URL || `http://0.0.0.0:${PORT}`
    : `http://localhost:${PORT}`;
  
  console.log(`✅ Server running on ${host}`);
  console.log(`📚 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    console.log('✅ HTTP server closed');
    
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
