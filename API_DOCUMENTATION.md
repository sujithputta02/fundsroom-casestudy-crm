# Fundsroom ERP/CRM - API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

All API endpoints (except `/auth/login`) require JWT authentication.

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Get Token
```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "username": "admin",
      "email": "admin@fundsroom.com",
      "fullName": "Admin User",
      "role": "ADMIN"
    }
  },
  "message": "Login successful"
}
```

---

## API Endpoints

### Authentication

#### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "role": "ADMIN|SALES|WAREHOUSE|ACCOUNTS"
    }
  },
  "message": "Login successful"
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "ADMIN|SALES|WAREHOUSE|ACCOUNTS",
    "isActive": true
  },
  "message": "User retrieved successfully"
}
```

---

### Customers

#### List Customers
```
GET /customers?limit=10&offset=0&search=john&status=ACTIVE
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Items per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `search` (optional): Search by name, email, mobile
- `status` (optional): LEAD | ACTIVE | INACTIVE

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "customer-123",
      "name": "ABC Retail Store",
      "mobileNumber": "9876543210",
      "email": "abc@retail.com",
      "businessName": "ABC Enterprises",
      "gstNumber": "18AABCT1234F1Z5",
      "customerType": "RETAIL|WHOLESALE|DISTRIBUTOR",
      "address": "123 Main Street, Mumbai",
      "status": "ACTIVE",
      "followUpDate": "2024-01-20T00:00:00.000Z",
      "notes": "Good customer",
      "createdAt": "2024-01-10T10:30:00.000Z",
      "updatedAt": "2024-01-15T14:20:00.000Z"
    }
  ],
  "message": "Customers retrieved successfully",
  "details": {
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Create Customer
```
POST /customers
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "ABC Retail Store",
  "mobileNumber": "9876543210",
  "email": "abc@retail.com",
  "businessName": "ABC Enterprises",
  "gstNumber": "18AABCT1234F1Z5",
  "customerType": "RETAIL",
  "address": "123 Main Street, Mumbai",
  "status": "LEAD",
  "followUpDate": "2024-01-20T00:00:00Z",
  "notes": "Initial contact"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "customer-123",
    "name": "ABC Retail Store",
    ...
  },
  "message": "Customer created successfully"
}
```

#### Get Customer Details
```
GET /customers/:id
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "customer-123",
    "name": "ABC Retail Store",
    "mobileNumber": "9876543210",
    "email": "abc@retail.com",
    "businessName": "ABC Enterprises",
    "gstNumber": "18AABCT1234F1Z5",
    "customerType": "RETAIL",
    "address": "123 Main Street, Mumbai",
    "status": "ACTIVE",
    "followUpDate": "2024-01-20T00:00:00.000Z",
    "notes": "Good customer",
    "followUps": [
      {
        "id": "followup-1",
        "customerId": "customer-123",
        "note": "Called for follow-up",
        "createdBy": "user-456",
        "creator": {
          "fullName": "Sales Manager"
        },
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z"
  },
  "message": "Customer retrieved successfully"
}
```

#### Update Customer
```
PUT /customers/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "name": "ABC Retail Store",
  "status": "ACTIVE",
  "followUpDate": "2024-02-01T00:00:00Z",
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "customer-123",
    ...
  },
  "message": "Customer updated successfully"
}
```

#### Get Customer Follow-ups
```
GET /customers/:id/follow-ups?limit=50&offset=0
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "followup-1",
      "customerId": "customer-123",
      "note": "Called for follow-up",
      "createdBy": "user-456",
      "creator": {
        "fullName": "Sales Manager"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "message": "Follow-ups retrieved successfully",
  "details": {
    "total": 5,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Add Follow-up Note
```
POST /customers/:id/follow-ups
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "note": "Discussed new product requirements"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "followup-2",
    "customerId": "customer-123",
    "note": "Discussed new product requirements",
    "createdBy": "user-456",
    "creator": {
      "fullName": "Sales Manager"
    },
    "createdAt": "2024-01-15T14:30:00.000Z"
  },
  "message": "Follow-up added successfully"
}
```

---

### Products

#### List Products
```
GET /products?limit=20&offset=0&search=mouse&category=Electronics
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Items per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `search` (optional): Search by name or SKU
- `category` (optional): Filter by category

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "product-123",
      "name": "Wireless Mouse",
      "sku": "SKU-001-WM",
      "category": "Electronics",
      "unitPrice": 250.00,
      "currentStock": 100,
      "minimumStockAlert": 20,
      "location": "A1",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "message": "Products retrieved successfully",
  "details": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Create Product
```
POST /products
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Wireless Mouse",
  "sku": "SKU-001-WM",
  "category": "Electronics",
  "unitPrice": 250.00,
  "currentStock": 100,
  "minimumStockAlert": 20,
  "location": "A1"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "product-123",
    ...
  },
  "message": "Product created successfully"
}
```

#### Get Product
```
GET /products/:id
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "product-123",
    "name": "Wireless Mouse",
    ...
  },
  "message": "Product retrieved successfully"
}
```

#### Update Product
```
PUT /products/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "currentStock": 95,
  "minimumStockAlert": 25
}
```

**Response:** `200 OK`

#### Get Low Stock Products
```
GET /products/low-stock?limit=50
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "product-124",
      "name": "USB Type-C Hub",
      "sku": "SKU-004-UCH",
      "currentStock": 15,
      "minimumStockAlert": 30,
      ...
    }
  ],
  "message": "Low stock products retrieved successfully"
}
```

---

### Stock Movements

#### List Stock Movements
```
GET /stock/movements?limit=20&offset=0&productId=product-123&movementType=OUT
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Items per page
- `offset` (optional): Pagination offset
- `productId` (optional): Filter by product
- `movementType` (optional): IN | OUT

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "movement-1",
      "productId": "product-123",
      "product": {
        "name": "Wireless Mouse",
        "sku": "SKU-001-WM"
      },
      "quantityChanged": 10,
      "movementType": "OUT",
      "reason": "Challan CH-240111-ABC confirmed",
      "createdBy": "user-456",
      "creator": {
        "fullName": "Sales Manager"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "Stock movements retrieved successfully",
  "details": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Record Stock Movement (Warehouse only)
```
POST /stock/movements
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** WAREHOUSE

**Request Body:**
```json
{
  "productId": "product-123",
  "quantityChanged": 50,
  "movementType": "IN",
  "reason": "Stock received from supplier"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "movement-2",
    ...
  },
  "message": "Stock movement recorded successfully"
}
```

---

### Sales Challans (Critical Business Logic)

#### List Challans
```
GET /challans?limit=10&offset=0&status=CONFIRMED&customerId=customer-123
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Items per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): DRAFT | CONFIRMED | CANCELLED
- `customerId` (optional): Filter by customer

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "challan-123",
      "challanNumber": "CH-240111-ABC",
      "customerId": "customer-123",
      "customer": {
        "id": "customer-123",
        "name": "ABC Retail Store",
        "businessName": "ABC Enterprises"
      },
      "totalQuantity": 15,
      "status": "CONFIRMED",
      "items": [
        {
          "id": "challan-item-1",
          "challanId": "challan-123",
          "productId": "product-123",
          "productNameSnapshot": "Wireless Mouse",
          "skuSnapshot": "SKU-001-WM",
          "unitPriceSnapshot": 250.00,
          "quantity": 5,
          "total": 1250.00
        }
      ],
      "createdBy": "user-456",
      "creator": {
        "fullName": "Sales Manager"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  ],
  "message": "Challans retrieved successfully",
  "details": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Create Challan (Sales/Admin)
```
POST /challans
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** SALES, ADMIN

**Request Body:**
```json
{
  "customerId": "customer-123",
  "items": [
    {
      "productId": "product-123",
      "quantity": 5
    },
    {
      "productId": "product-124",
      "quantity": 10
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "challan-123",
    "challanNumber": "CH-240111-ABC",
    "status": "DRAFT",
    ...
  },
  "message": "Challan created successfully"
}
```

#### Get Challan Details
```
GET /challans/:id
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "challan-123",
    "challanNumber": "CH-240111-ABC",
    ...
  },
  "message": "Challan retrieved successfully"
}
```

#### Update Challan Items (Draft only)
```
PUT /challans/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** SALES, ADMIN
**Challan Status:** DRAFT

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product-123",
      "quantity": 8
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "challan-123",
    ...
  },
  "message": "Challan updated successfully"
}
```

#### Confirm Challan (Critical - Stock Deduction)
```
POST /challans/:id/confirm
Authorization: Bearer {token}
```

**Required Role:** SALES, ADMIN
**Challan Status:** DRAFT

**Request Body:** (empty)
```json
{}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "challan-123",
    "status": "CONFIRMED",
    ...
  },
  "message": "Challan confirmed successfully"
}
```

**Error Response (Insufficient Stock):** `409 Conflict`
```json
{
  "success": false,
  "message": "Insufficient stock for Wireless Mouse. Required: 10, Available: 5",
  "code": "INSUFFICIENT_STOCK",
  "details": {
    "productName": "Wireless Mouse",
    "required": 10,
    "available": 5
  }
}
```

**Business Logic on Confirm:**
1. BEGIN TRANSACTION
2. Validate all products have sufficient stock
3. If insufficient → ROLLBACK and return error
4. If sufficient:
   - Reduce stock for each product
   - Create OUT stock movements
   - Store product snapshots
   - Mark challan as CONFIRMED
   - COMMIT

#### Cancel Challan
```
POST /challans/:id/cancel
Authorization: Bearer {token}
```

**Required Role:** SALES, ADMIN, WAREHOUSE
**Challan Status:** CONFIRMED

**Request Body:** (empty)
```json
{}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "challan-123",
    "status": "CANCELLED",
    ...
  },
  "message": "Challan cancelled successfully"
}
```

**Business Logic on Cancel:**
1. BEGIN TRANSACTION
2. Restore stock for each item
3. Create IN stock movements (reversals)
4. Mark challan as CANCELLED
5. COMMIT

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden - Role-based Access
```json
{
  "success": false,
  "message": "This action requires one of these roles: WAREHOUSE",
  "code": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Customer not found",
  "code": "NOT_FOUND"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Product with this SKU already exists",
  "code": "SKU_EXISTS"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Sales | sales | sales123 |
| Warehouse | warehouse | warehouse123 |
| Accounts | accounts | accounts123 |

---

## Common Workflows

### Creating and Confirming a Sales Order

```bash
# 1. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sales","password":"sales123"}'

# Response contains: token

# 2. Create Draft Challan
curl -X POST http://localhost:5000/api/v1/challans \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId":"customer-123",
    "items":[{"productId":"product-123","quantity":5}]
  }'

# Response contains: challan id

# 3. Confirm Challan (deducts stock)
curl -X POST http://localhost:5000/api/v1/challans/{challan-id}/confirm \
  -H "Authorization: Bearer {token}"

# Stock is now deducted, movement created
```

---

## Rate Limiting & Pagination

All list endpoints support pagination:
- Default limit: 10 items
- Max limit: 100 items
- Offset: 0-based
- Response includes `hasMore` flag

---

## WebSocket Events (Future Enhancement)

Real-time notifications for:
- Low stock alerts
- Challan confirmations
- Stock movements
- Customer follow-ups due

---

**Last Updated:** January 2024
**API Version:** v1
