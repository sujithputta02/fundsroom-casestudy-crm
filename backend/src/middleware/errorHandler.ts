import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors.js';
import { ApiResponse } from '../types/index.js';
import { isDevelopment } from '../config/env.js';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details: any = undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof SyntaxError) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

  const response: ApiResponse = {
    success: false,
    message,
    code,
  };

  if (details) {
    response.details = details;
  }

  if (isDevelopment) {
    console.error('Error:', error);
    response.details = {
      ...response.details,
      stack: error.stack,
    };
  }

  res.status(statusCode).json(response);
};
