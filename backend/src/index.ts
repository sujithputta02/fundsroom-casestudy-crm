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
  'https://fundsroom-casestudy-crm.vercel.app',
  env.FRONTEND_URL // From environment variable
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
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
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply global rate limiting to all requests
app.use(globalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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

app.listen(PORT, '0.0.0.0', () => {
  const host = env.NODE_ENV === 'production' 
    ? process.env.RENDER_EXTERNAL_URL || `http://0.0.0.0:${PORT}`
    : `http://localhost:${PORT}`;
  
  console.log(`✅ Server running on ${host}`);
  console.log(`📚 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});
