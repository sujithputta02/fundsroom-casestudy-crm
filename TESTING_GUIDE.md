# Fundsroom ERP - Testing & Verification Guide

## Quick Test (10 minutes)

### 1. Start Services

```bash
# Terminal 1 - Backend
cd backend
bun install
bun run db:push
bun run db:seed
bun run dev

# Terminal 2 - Frontend
cd frontend
bun install
bun run dev
```

### 2. Test Login
- Go to http://localhost:5173
- Login with `admin` / `admin123`
- Dashboard should load with KPI cards

### 3. Test Dark/Light Mode
- Click moon/sun icon in sidebar
- Theme should toggle smoothly

### 4. Test Navigation
- Click sidebar icons
- Navigate to Customers, Products, Challans
- Pages should load

---

## Comprehensive Testing Workflows

### Test 1: Authentication Flow

**Goal:** Verify login, token generation, and role-based access

```bash
# 1. Login with different roles
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sales","password":"sales123"}'

# Save the token from response

# 2. Verify token (should work)
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Test with invalid token (should fail with 401)
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer invalid_token"

# 4. Test unauthorized access (should fail with 403)
# Create token as SALES user
# Try to record stock movement (warehouse only)
curl -X POST http://localhost:5000/api/v1/stock/movements \
  -H "Authorization: Bearer SALES_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"xyz","quantityChanged":10,"movementType":"IN","reason":"test"}'
```

✅ **Expected Results:**
- Login returns valid JWT token
- Valid token allows access to `/auth/me`
- Invalid token returns 401
- SALES user cannot access warehouse-only endpoints

---

### Test 2: Customer Management

**Goal:** Test CRUD operations on customers

```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sales","password":"sales123"}' | jq -r '.data.token')

# 1. List customers
curl -X GET "http://localhost:5000/api/v1/customers?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"

# 2. Create new customer
CUSTOMER_ID=$(curl -s -X POST http://localhost:5000/api/v1/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "mobileNumber": "9999999999",
    "email": "test@example.com",
    "businessName": "Test Business",
    "customerType": "RETAIL",
    "address": "Test Address",
    "status": "LEAD"
  }' | jq -r '.data.id')

# 3. Get customer details
curl -X GET "http://localhost:5000/api/v1/customers/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN"

# 4. Update customer
curl -X PUT "http://localhost:5000/api/v1/customers/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "ACTIVE"}'

# 5. Add follow-up note
curl -X POST "http://localhost:5000/api/v1/customers/$CUSTOMER_ID/follow-ups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note": "Test follow-up note"}'

# 6. Get follow-ups
curl -X GET "http://localhost:5000/api/v1/customers/$CUSTOMER_ID/follow-ups" \
  -H "Authorization: Bearer $TOKEN"
```

✅ **Expected Results:**
- Create returns new customer ID
- Get returns customer details with follow-ups array
- Update changes customer status
- Follow-up is recorded and retrieved

---

### Test 3: Product Management

**Goal:** Test product operations and stock alerts

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

# 1. Create product
PRODUCT_ID=$(curl -s -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-SKU-001",
    "category": "Test",
    "unitPrice": 100,
    "currentStock": 50,
    "minimumStockAlert": 20,
    "location": "A1"
  }' | jq -r '.data.id')

# 2. List products
curl -X GET "http://localhost:5000/api/v1/products?search=Test" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get low stock alert
curl -X GET "http://localhost:5000/api/v1/products/low-stock" \
  -H "Authorization: Bearer $TOKEN"

# 4. Update product
curl -X PUT "http://localhost:5000/api/v1/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"minimumStockAlert": 30}'
```

✅ **Expected Results:**
- Product created successfully
- List returns paginated products
- Low stock endpoint works
- Update modifies product

---

### Test 4: Stock Movement Tracking

**Goal:** Test stock IN/OUT movements (warehouse role only)

```bash
WAREHOUSE_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"warehouse","password":"warehouse123"}' | jq -r '.data.token')

# Get a product ID first (use admin token)
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

PRODUCT_ID=$(curl -s -X GET "http://localhost:5000/api/v1/products?limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.data[0].id')

# 1. Record stock IN movement
curl -X POST http://localhost:5000/api/v1/stock/movements \
  -H "Authorization: Bearer $WAREHOUSE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantityChanged\": 25,
    \"movementType\": \"IN\",
    \"reason\": \"Stock received from supplier\"
  }"

# 2. List movements
curl -X GET "http://localhost:5000/api/v1/stock/movements" \
  -H "Authorization: Bearer $WAREHOUSE_TOKEN"

# 3. Test that SALES user cannot record movements
SALES_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sales","password":"sales123"}' | jq -r '.data.token')

curl -X POST http://localhost:5000/api/v1/stock/movements \
  -H "Authorization: Bearer $SALES_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantityChanged\":10,\"movementType\":\"IN\",\"reason\":\"test\"}"
# Should return 403 Forbidden
```

✅ **Expected Results:**
- Warehouse user can record movements
- Movements are listed
- SALES user gets 403 error

---

### Test 5: Sales Challan Workflow (Critical Business Logic)

**Goal:** Test complete challan flow with stock validation

```bash
SALES_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sales","password":"sales123"}' | jq -r '.data.token')

ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

# Get IDs
CUSTOMER_ID=$(curl -s -X GET "http://localhost:5000/api/v1/customers?limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.data[0].id')

PRODUCT_ID=$(curl -s -X GET "http://localhost:5000/api/v1/products?limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.data[0].id')

PRODUCT_STOCK=$(curl -s -X GET "http://localhost:5000/api/v1/products?limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.data[0].currentStock')

echo "Customer: $CUSTOMER_ID, Product: $PRODUCT_ID, Stock: $PRODUCT_STOCK"

# 1. Create draft challan
CHALLAN_ID=$(curl -s -X POST http://localhost:5000/api/v1/challans \
  -H "Authorization: Bearer $SALES_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"items\": [{\"productId\": \"$PRODUCT_ID\", \"quantity\": 5}]
  }" | jq -r '.data.id')

echo "Created challan: $CHALLAN_ID"

# 2. Verify it's in DRAFT status
curl -X GET "http://localhost:5000/api/v1/challans/$CHALLAN_ID" \
  -H "Authorization: Bearer $SALES_TOKEN" | jq '.data.status'

# 3. Try to confirm challan
echo "Confirming challan..."
curl -X POST "http://localhost:5000/api/v1/challans/$CHALLAN_ID/confirm" \
  -H "Authorization: Bearer $SALES_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# 4. Verify stock was deducted
echo "Checking stock after confirmation..."
curl -X GET "http://localhost:5000/api/v1/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.currentStock'

# 5. Verify stock movement was created
curl -X GET "http://localhost:5000/api/v1/stock/movements?productId=$PRODUCT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data[] | select(.movementType=="OUT")'

# 6. Cancel the challan
echo "Cancelling challan..."
curl -X POST "http://localhost:5000/api/v1/challans/$CHALLAN_ID/cancel" \
  -H "Authorization: Bearer $SALES_TOKEN" | jq '.'

# 7. Verify stock was restored
echo "Checking stock after cancellation..."
curl -X GET "http://localhost:5000/api/v1/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.currentStock'
```

✅ **Expected Results:**
- Draft challan created (status: DRAFT)
- Confirmation succeeds
- Stock decreased by 5
- OUT movement created
- Challan status: CONFIRMED
- Cancellation succeeds
- Stock restored to original
- IN movement created (reversal)

---

### Test 6: Insufficient Stock Error

**Goal:** Test stock validation and error handling

```bash
SALES_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sales","password":"sales123"}' | jq -r '.data.token')

ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

# Get IDs
CUSTOMER_ID=$(curl -s -X GET "http://localhost:5000/api/v1/customers?limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.data[0].id')

PRODUCT_ID=$(curl -s -X GET "http://localhost:5000/api/v1/products?limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.data[0].id')

# Create challan with quantity > available stock
CHALLAN_ID=$(curl -s -X POST http://localhost:5000/api/v1/challans \
  -H "Authorization: Bearer $SALES_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"items\": [{\"productId\": \"$PRODUCT_ID\", \"quantity\": 999}]
  }" | jq -r '.data.id')

# Try to confirm - should fail with INSUFFICIENT_STOCK error
echo "Attempting confirmation with insufficient stock..."
curl -X POST "http://localhost:5000/api/v1/challans/$CHALLAN_ID/confirm" \
  -H "Authorization: Bearer $SALES_TOKEN" | jq '.code, .message'
```

✅ **Expected Results:**
- Confirmation fails with `409 Conflict`
- Error code: `INSUFFICIENT_STOCK`
- Error message contains product name and stock info
- Challan status remains DRAFT
- No stock was deducted

---

## Frontend Testing

### Test Dark/Light Mode
1. Open http://localhost:5173
2. Click theme toggle in sidebar
3. Verify all pages and components update colors
4. Close and reopen - theme persists

### Test Customer Page
1. Navigate to Customers
2. Click "Add Customer"
3. Fill form and submit
4. New customer appears in list
5. Search by name
6. Click to view details
7. Add follow-up note
8. Edit customer

### Test Products Page
1. Navigate to Inventory
2. Click "Add Product"
3. Create product with low stock alert
4. Product appears with alert icon
5. Edit product
6. Search by SKU

### Test Challans Page
1. Navigate to Challans
2. Click "Create Challan"
3. Select customer and products
4. Add multiple items
5. Create challan
6. View in list (DRAFT status)
7. Click confirm
8. Verify status changes to CONFIRMED
9. Try to cancel
10. Verify status changes to CANCELLED

---

## Error Scenarios to Test

### 1. Validation Errors
- Create customer without required fields
- Create product with invalid price
- Create challan without products

### 2. Authorization Errors
- Access API without token (401)
- Warehouse user tries to create customer (403)
- Sales user tries to record stock movement (403)

### 3. Not Found Errors
- Get non-existent customer
- Update non-existent product
- Cancel non-existent challan

### 4. Conflict Errors
- Create product with duplicate SKU
- Confirm challan with insufficient stock
- Confirm already confirmed challan

---

## Performance Testing

### Load Testing
```bash
# Create multiple customers quickly
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/v1/customers \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Customer $i\",\"mobileNumber\":\"999999999$i\",\"email\":\"customer$i@test.com\",\"businessName\":\"Business $i\",\"customerType\":\"RETAIL\",\"address\":\"Address $i\",\"status\":\"LEAD\"}" &
done
wait
```

### Database Performance
- List 1000 items with pagination
- Search across all customers
- Filter by multiple criteria

---

## Checklist

- [ ] Authentication flow works
- [ ] Login with all 4 roles
- [ ] Role-based access control works
- [ ] Customer CRUD operations
- [ ] Add/retrieve follow-ups
- [ ] Product management
- [ ] Stock movements (warehouse only)
- [ ] Create draft challan
- [ ] Confirm challan (stock deducted)
- [ ] Insufficient stock error handling
- [ ] Cancel challan (stock restored)
- [ ] Dark/light mode toggle
- [ ] All pages load correctly
- [ ] Forms validate inputs
- [ ] Error messages display properly
- [ ] Pagination works
- [ ] Search/filter works
- [ ] API documentation accurate
- [ ] No console errors
- [ ] No performance issues

---

## Bug Report Template

If you find bugs:

```
Title: [Brief description]
Severity: [Critical/High/Medium/Low]
Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Result:
Actual Result:
Screenshots/Logs:
```

---

**Last Updated:** January 2024
**Version:** 1.0.0
