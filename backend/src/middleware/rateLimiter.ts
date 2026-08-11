import rateLimit from 'express-rate-limit';

// Global rate limiter to prevent API scraping and DoS
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    code: 'TOO_MANY_REQUESTS',
  },
});

// Stricter rate limiter for authentication routes to prevent brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 auth attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login or auth attempts from this IP, please try again after 15 minutes.',
    code: 'TOO_MANY_LOGIN_ATTEMPTS',
  },
});
