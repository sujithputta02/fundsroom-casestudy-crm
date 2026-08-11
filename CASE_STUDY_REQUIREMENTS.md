# Full Stack Developer Case Study
## Mini ERP + CRM Operations Portal

**Project Deadline:** 48 hours from assignment start

---

## 1. Business Context

You are building a small ERP/CRM system for a wholesale/distribution company that deals with:
- Customers
- Products
- Stock management
- Purchase orders
- Sales challans
- Invoices
- Basic CRM follow-ups

The system will be used by internal employees from sales, warehouse, and accounts teams.

**Goal:** Demonstrate understanding of:
- Full-stack development
- Backend APIs design
- Database design
- Frontend UI implementation
- Deployment and DevOps
- Real-world business flow

---

## 2. Required Tech Stack

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js or NestJS
- **Database:** PostgreSQL or MySQL
- **API Style:** REST APIs with proper validation and error handling

### Frontend
- **Framework:** React
- **Language:** HTML, CSS, JavaScript/TypeScript
- **UI:** Responsive UI design

### Deployment & DevOps
- **Preferred:** AWS deployment
- **Alternative (Free):** Vercel (frontend), Render/Railway/Fly.io (backend), Supabase/Neon (database)
- **Documentation Required:**
  - Server setup instructions
  - Environment variable management
  - Local setup guide
  - Deployment guide
  - GitHub repository with proper commit history
  - README with complete setup instructions

---

## 3. Core Modules

### 3.1 Authentication and Roles

**Functionality:**
- Login with role-based access control
- JWT-based authentication (simple implementation acceptable)

**Roles:**
1. Admin
2. Sales
3. Warehouse
4. Accounts

**Requirements:**
- Protected routes based on roles
- Role identification from JWT token
- Logout functionality
- Role-based frontend access control
- Role-based backend authorization

---

### 3.2 Customer CRM Module

**Customer Fields:**
| Field | Type | Required |
|-------|------|----------|
| Customer Name | String | Yes |
| Mobile Number | String | Yes |
| Email | String | Yes |
| Business Name | String | Yes |
| GST Number | String | No |
| Customer Type | Enum | Yes |
| Address | String | Yes |
| Status | Enum | Yes |
| Follow-up Date | Date | Yes |
| Notes | Text | No |

**Customer Type Values:**
- Retail
- Wholesale
- Distributor

**Customer Status Values:**
- Lead
- Active
- Inactive

**Required Features:**
- Add customer
- Edit customer
- Search customer (by name, email, mobile)
- View customer detail page
- Add follow-up notes to customers
- View follow-up history

**Follow-up Notes:**
- Store text notes
- Track creation date/time
- Track created by (user)
- Maintain history

---

### 3.3 Product and Inventory Module

**Product Fields:**
| Field | Type | Required |
|-------|------|----------|
| Product Name | String | Yes |
| SKU/Code | String | Yes (Unique) |
| Category | String | Yes |
| Unit Price | Decimal | Yes |
| Current Stock | Integer | Yes |
| Minimum Stock Alert Quantity | Integer | Yes |
| Location/Warehouse | String | Yes |

**Stock Movement Tracking:**

Each stock movement must record:
| Field | Type | Notes |
|-------|------|-------|
| Product | Reference | Link to Product |
| Quantity Changed | Integer | Positive or Negative |
| Movement Type | Enum | IN or OUT |
| Reason | String | Why stock changed |
| Created By | Reference | User who created |
| Timestamp | DateTime | When it occurred |

**Movement Type Values:**
- IN (Stock received)
- OUT (Stock dispatched)

**Required Features:**
- Add product
- Edit product
- View product list with search/filter
- View product details
- Track stock movements with complete history
- Alert when stock falls below minimum

---

### 3.4 Sales Challan Module

**Business Logic Flow:**

```
Sales User:
  1. Select Customer
     ↓
  2. Add Multiple Products
     ↓
  3. Enter Quantity for Each Product
     ↓
  4. System Generates Challan Number (Auto)
     ↓
  5. Choose: Save as Draft OR Confirm
```

**Draft Challan:**
- Stock does NOT change
- Can be edited
- Can be cancelled
- Can be confirmed later

**Confirmed Challan:**
- Stock validation occurs:
  - Check if sufficient stock for ALL items
  - If insufficient: Return proper API error
  - If sufficient: Proceed
- Stock is reduced (OUT movement created)
- Stock cannot go negative
- Cannot be edited after confirmation
- Can be cancelled (stock restored)

**Challan Fields:**
| Field | Type | Required |
|-------|------|----------|
| Challan Number | String | Yes (Auto-generated, Unique) |
| Customer | Reference | Yes |
| Products | Array | Yes (Multiple items) |
| Total Quantity | Integer | Calculated |
| Status | Enum | Yes |
| Created By | Reference | Yes |
| Created Date | DateTime | Yes |

**Challan Status Values:**
- Draft
- Confirmed
- Cancelled

**Product Snapshot in Challan:**

Important: Store product snapshot data with each challan item, not just product ID:

```json
{
  "product_id": "uuid",
  "product_name_snapshot": "Mouse",
  "sku_snapshot": "SKU-001",
  "unit_price_snapshot": 250.00,
  "quantity": 10,
  "total": 2500.00
}
```

This ensures challan accuracy even if product details change later.

**Challan Confirmation Logic (Critical):**

```
BEGIN TRANSACTION
  ↓
Validate Request (user role, data)
  ↓
Lock Products (prevent concurrent edits)
  ↓
For each item:
  - Check: Product stock >= required quantity
  - If any item fails: ROLLBACK + Return Error
  ↓
For each item (if all checks pass):
  - Reduce Product stock by quantity
  - Create Stock Movement (OUT)
  - Store product snapshot
  ↓
Mark Challan as CONFIRMED
  ↓
COMMIT
```

**Challan Cancellation Logic:**

```
If status is Confirmed:
  BEGIN TRANSACTION
    ↓
  For each item in challan:
    - Restore Product stock
    - Create Stock Movement (IN - reversal)
    ↓
  Mark Challan as CANCELLED
    ↓
  COMMIT
```

---

## 4. API Expectations

### REST API Design

**API Structure:**
```
/api/v1/auth
  POST /login
  POST /logout
  POST /register (optional)
  GET /me

/api/v1/customers
  GET / (paginated, searchable)
  POST / (create)
  GET /:id (detail)
  PUT /:id (update)
  DELETE /:id (optional)
  GET /:id/follow-ups
  POST /:id/follow-ups (add note)

/api/v1/products
  GET / (paginated, searchable, filterable)
  POST / (create)
  GET /:id (detail)
  PUT /:id (update)
  DELETE /:id (optional)

/api/v1/stock/movements
  GET / (paginated, filterable by type/product)
  POST / (create - for manual IN/OUT)

/api/v1/challans
  GET / (paginated, filterable by status)
  POST / (create new)
  GET /:id (detail with product snapshot)
  POST /:id/confirm (confirm challan)
  POST /:id/cancel (cancel challan)
  PUT /:id (update - only if Draft)
```

### API Requirements

**All Endpoints Must Have:**
1. **Input Validation**
   - Validate all input data
   - Return 400 Bad Request with clear error message if invalid

2. **Proper HTTP Status Codes**
   - 200 OK - Successful GET/PUT
   - 201 Created - Successful POST
   - 204 No Content - Successful DELETE (optional)
   - 400 Bad Request - Validation failed
   - 401 Unauthorized - Not authenticated
   - 403 Forbidden - Role-based access denied
   - 404 Not Found - Resource not found
   - 409 Conflict - Insufficient stock, duplicate challan, etc.
   - 500 Internal Server Error - Server error

3. **Error Messages**
   - Consistent JSON format
   - Clear, actionable error messages
   - Error codes for frontend handling

4. **Pagination (where applicable)**
   - Limit and offset parameters
   - Return total count
   - Consistent response structure

5. **Search/Filter (where applicable)**
   - Search by relevant fields
   - Filter by status, type, date range
   - Case-insensitive search

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful"
}
```

**List Response (with pagination):**
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  },
  "message": "Items retrieved successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Insufficient stock for Mouse",
  "code": "INSUFFICIENT_STOCK",
  "details": { /* optional additional info */ }
}
```

---

## 5. Frontend Expectations

### UI Requirements
- Clean admin-style interface
- Responsive design (mobile, tablet, desktop)
- Role-based page visibility
- Intuitive navigation

### Pages/Sections

**1. Login Page**
- Role selection or auto-detection
- Credentials input
- Error handling

**2. Dashboard**
- Overview of key metrics
- Recent activity
- Quick actions

**3. Customers Section**
- Customer list with search
- Add customer form
- Edit customer form
- Customer detail page with follow-ups

**4. Inventory Section**
- Product list
- Add product form
- Edit product form
- Stock movement log

**5. Sales Challans Section**
- Challan list (filterable by status)
- Create new challan (multi-product form)
- Challan detail page
- Confirmation dialog with stock validation
- Error handling for insufficient stock

**6. Administration (optional)**
- User management
- Role assignment
- Activity logs

---

## 6. Database Schema

**Minimum Tables Required:**

### users
```
- id (UUID, Primary Key)
- username (String, Unique)
- email (String, Unique)
- password_hash (String)
- role (Enum: admin, sales, warehouse, accounts)
- full_name (String)
- is_active (Boolean)
- created_at (DateTime)
- updated_at (DateTime)
```

### customers
```
- id (UUID, Primary Key)
- name (String)
- mobile_number (String)
- email (String)
- business_name (String)
- gst_number (String, Optional)
- customer_type (Enum: retail, wholesale, distributor)
- address (String)
- status (Enum: lead, active, inactive)
- follow_up_date (Date, Optional)
- notes (Text, Optional)
- created_at (DateTime)
- updated_at (DateTime)
```

### follow_ups
```
- id (UUID, Primary Key)
- customer_id (UUID, Foreign Key)
- note (Text)
- created_by (UUID, Foreign Key to users)
- created_at (DateTime)
```

### products
```
- id (UUID, Primary Key)
- name (String)
- sku (String, Unique)
- category (String)
- unit_price (Decimal)
- current_stock (Integer)
- minimum_stock_alert (Integer)
- location (String)
- is_active (Boolean)
- created_at (DateTime)
- updated_at (DateTime)
```

### stock_movements
```
- id (UUID, Primary Key)
- product_id (UUID, Foreign Key)
- quantity_changed (Integer)
- movement_type (Enum: in, out)
- reason (String)
- created_by (UUID, Foreign Key to users)
- created_at (DateTime)
```

### challans
```
- id (UUID, Primary Key)
- challan_number (String, Unique)
- customer_id (UUID, Foreign Key)
- total_quantity (Integer)
- status (Enum: draft, confirmed, cancelled)
- created_by (UUID, Foreign Key to users)
- created_at (DateTime)
- updated_at (DateTime)
```

### challan_items
```
- id (UUID, Primary Key)
- challan_id (UUID, Foreign Key)
- product_id (UUID, Foreign Key)
- product_name_snapshot (String)
- sku_snapshot (String)
- unit_price_snapshot (Decimal)
- quantity (Integer)
- total (Decimal)
- created_at (DateTime)
```

---

## 7. Deployment Expectations

### Deployment Options (Free Platforms)

**Frontend:**
- Vercel
- Netlify
- Render Static Site
- GitHub Pages

**Backend:**
- Render (with Docker)
- Railway
- Fly.io
- Heroku (free tier may be limited)

**Database:**
- Supabase (PostgreSQL)
- Neon (PostgreSQL)
- Render Postgres
- Aiven
- CockroachDB Serverless

### AWS Deployment
- Optional and treated as bonus
- Candidate not expected to spend money
- If AWS not used, must provide clear local setup & deployment documentation

### Documentation Requirements

**README Must Include:**
1. Project Overview
2. Tech Stack
3. Local Setup Instructions
   - Prerequisites
   - Installation steps
   - Environment variables setup
   - Database setup (migrations)
   - Running the project locally
4. Deployment Instructions
   - Step-by-step deployment guide
   - Environment variable configuration
   - Database migration in production
5. Architecture Explanation
   - Folder structure
   - Key design decisions
   - API flow diagrams
6. Known Limitations
   - Incomplete features
   - Known issues
   - Future improvements

---

## 8. Submission Requirements

**Submit the following:**

1. **GitHub Repository Link**
   - Proper commit history
   - Clear commit messages
   - .gitignore properly configured
   - Branch structure (main/develop)

2. **Live Frontend URL** (if deployed)
   - Fully functional
   - All roles testable
   - Responsive design

3. **Live Backend API URL** (if deployed)
   - All endpoints working
   - Proper error handling
   - API documentation accessible

4. **Test Login Credentials**
   - For all 4 roles:
     - Admin: username, password
     - Sales: username, password
     - Warehouse: username, password
     - Accounts: username, password
   - Sample data (customers, products, challans)

5. **Postman Collection or API Documentation**
   - All API endpoints documented
   - Example requests and responses
   - Authentication setup
   - Environment variables

6. **README with Instructions**
   - Setup guide
   - Deployment guide
   - Architecture explanation
   - Known limitations

7. **Architecture Explanation**
   - High-level system design
   - Technology choices and reasoning
   - Database design explanation
   - Authentication flow
   - Challan business logic flow

8. **Known Limitations or Incomplete Parts**
   - List any features not implemented
   - Explain why (time constraints, etc.)
   - How they could be completed

---

## 9. Bonus Features (Not Mandatory)

These are nice-to-have features but not required:

1. **Docker Setup**
   - Dockerfile for backend
   - Docker Compose for local development

2. **GitHub Actions**
   - CI/CD pipeline
   - Automated testing
   - Deployment automation

3. **PDF Export**
   - Export challan as PDF
   - Export invoice as PDF
   - Export reports

4. **AWS S3 Integration**
   - Upload product images
   - Store files in S3
   - Generate signed URLs

5. **Advanced Analytics**
   - Sales reports
   - Stock analytics
   - Customer insights

6. **Testing**
   - Unit tests for critical business logic
   - API integration tests
   - Frontend component tests

7. **Advanced Features**
   - Invoice generation
   - Payment tracking
   - Multi-warehouse support
   - Barcode scanning

---

## 10. Evaluation Criteria

**You will be evaluated on:**

1. **Functionality**
   - All core modules working correctly
   - Business logic correctly implemented
   - No critical bugs

2. **Code Quality**
   - Clean, readable code
   - Proper error handling
   - Input validation
   - Following best practices

3. **Database Design**
   - Normalized schema
   - Proper relationships
   - Efficient queries
   - Data integrity

4. **API Design**
   - RESTful principles
   - Proper HTTP status codes
   - Consistent response format
   - Clear error messages

5. **UI/UX**
   - Intuitive design
   - Responsive layout
   - Professional appearance
   - Accessibility considerations

6. **Deployment**
   - Successfully deployed
   - Live and accessible
   - Proper configuration

7. **Documentation**
   - Clear README
   - Setup instructions
   - Deployment guide
   - Architecture explanation

8. **Git History**
   - Regular commits
   - Clear commit messages
   - Logical commit structure

---

## 11. Time Management Tips

**48-Hour Breakdown (Suggested):**

- **Hours 0-4:** Setup, database schema, project initialization
- **Hours 4-12:** Backend APIs (authentication, CRUD for all modules)
- **Hours 12-24:** Frontend (pages, forms, tables, styling)
- **Hours 24-36:** Integration, testing, bug fixes
- **Hours 36-42:** Deployment, documentation
- **Hours 42-48:** Final testing, polish, submission

**Priority Order:**
1. Authentication (foundation)
2. Challan confirmation logic (critical business logic)
3. Basic CRUD for all modules
4. Frontend UI
5. Deployment
6. Documentation
7. Bonus features (if time permits)

---

## 12. Key Success Factors

✅ **Must Have:**
- Working authentication with all 4 roles
- Complete CRUD for customers, products, challans
- Correct challan confirmation logic with stock validation
- All APIs with proper validation and error handling
- Responsive frontend UI
- Working local setup
- Clear documentation

⚠️ **Should Have:**
- Deployed backend and frontend
- Postman collection
- Seed data for demo
- GitHub Actions or CI/CD

🎁 **Nice to Have:**
- Docker setup
- Advanced features
- Comprehensive testing
- Beautiful UI polish

---

## Contact & Support

- **Assignment Duration:** 48 hours
- **Tech Stack:** Node.js, TypeScript, React, PostgreSQL
- **Deployment:** Free platforms (Vercel, Render, Supabase)
- **No Budget Required:** Avoid AWS/paid services unless necessary
