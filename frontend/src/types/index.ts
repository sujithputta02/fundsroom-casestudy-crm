export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  theme?: string;
  enableStockAlerts?: boolean;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  setToken: (token: string, user: User) => void;
  updateSettings: (theme?: string, enableStockAlerts?: boolean) => Promise<any>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<any>;
  hasRole: (allowedRoles: string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';

export interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  creator: {
    fullName: string;
  };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number | string;
  currentStock: number;
  minimumStockAlert: number;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
  };
  quantityChanged: number;
  movementType: StockMovementType;
  reason: string;
  createdBy: string;
  creator: {
    fullName: string;
  };
  createdAt: string;
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number | string;
  quantity: number;
  total: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    businessName: string;
  };
  totalQuantity: number;
  status: ChallanStatus;
  items: ChallanItem[];
  createdBy: string;
  creator: {
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  code?: string;
  details?: any;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
