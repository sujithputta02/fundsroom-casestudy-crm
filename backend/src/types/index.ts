import { UserRole } from '@prisma/client';

export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  code?: string;
  details?: any;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  code: string;
}
