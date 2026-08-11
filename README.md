# Fundsroom Mini ERP/CRM System

A full-stack ERP/CRM operations portal built with Node.js, Express, React, and PostgreSQL. Designed for small wholesale/distribution companies with support for 4 user roles and complete order-to-delivery workflow.

---

## 🚀 Live Deployment

### Live URLs
- **Frontend**: https://fundsroom-casestudy-crm.vercel.app
- **Backend API**: https://fundsroom-casestudy-crm.onrender.com
- **GitHub Repository**: https://github.com/sujithputta02/fundsroom-casestudy-crm

### Test Login Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Admin** | `admin` | `admin123` | Full system access |
| **Sales** | `sales` | `sales123` | Customer CRM, Sales Challans |
| **Warehouse** | `warehouse` | `warehouse123` | Inventory, Stock Management |
| **Accounts** | `accounts` | `accounts123` | Read-only access |

### Documentation

| Document | Description |
|----------|-------------|
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | Complete REST API reference with 26 endpoints, curl examples, request/response formats |
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Step-by-step local development setup instructions |
| **[RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)** | Production deployment guide for Render + Vercel |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | Architecture explanation, tech stack, database schema, design decisions |
| **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** | Testing workflows and verification steps |
| **[SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)** | Complete feature checklist with 100% completion status |

---

## Features

✨ **Core Modules**
- 🔐 Role-based authentication (Admin, Sales, Warehouse, Accounts)
- 👥 Customer CRM with follow-ups
- 📦 Product & Inventory management
- 📄 Sales Challan system with stock validation
- 📊 Dashboard with KPI metrics
- 🌓 Dark/Light mode support

🎯 **Business Logic**
- Automatic challan number generation
- Stock validation on confirmation
- Stock movement tracking
- Product snapshots in transactions
- Transaction-based consistency
- Low stock alerts

🛠️ **Tech Stack**

**Backend**
- Node.js + Express.js + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Zod Validation
- Global error handling

**Frontend**
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Dark/Light mode

---

## Project Structure

```
fundsroom/
├── backend/                    # Express API
│   ├── src/
│   │   ├── config/            # Config & DB
│   │   ├── middleware/        # Auth & Error handlers
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Helpers & errors
│   │   ├── seed.ts            # Database seed
│   │   └── index.ts           # App entry
│   ├── prisma/
│   │   └── schema.prisma      # DB schema
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React App
│   ├── src/
│   │   ├── components/        # UI Components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Zustand stores
│   │   ├── lib/               # API client
│   │   ├── hooks/             # Custom hooks
│   │   ├── types/             # TypeScript types
│   │   ├── index.css          # Global styles
│   │   ├── App.tsx            # Router
│   │   └── main.tsx           # Entry point
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Installation & Setup

### Prerequisites

- **Bun** (1.3.14+) - [Install](https://bun.sh)
- **PostgreSQL** (14+) - Local or Docker
- **Node.js** (18+) - For compatibility

### 1. Clone & Setup Backend

```bash
cd backend

# Install dependencies
bun install

# Create .env file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/fundsroom"
```

### 2. Setup Database

```bash
# Generate Prisma client
bun run prisma:generate

# Create tables
bun run db:push

# Seed with test data
bun run db:seed
```

### 3. Start Backend Server

```bash
bun run dev
```

Server runs on: `http://localhost:5000`

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
bun install

# Create .env file
cp .env.example .env

# Start dev server
bun run dev
```

Frontend runs on: `http://localhost:5173`

---

## Test Credentials

Use these credentials to login after seeding:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Sales | sales | sales123 |
| Warehouse | warehouse | warehouse123 |
| Accounts | accounts | accounts123 |

---

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer {token}
```

### Core Endpoints

#### Authentication
```
POST   /auth/login              # Login user
GET    /auth/me                 # Get current user
```

#### Customers
```
GET    /customers               # List customers (paginated, searchable)
POST   /customers               # Create customer
GET    /customers/:id           # Get customer details
PUT    /customers/:id           # Update customer
GET    /customers/:id/follow-ups    # Get follow-up notes
POST   /customers/:id/follow-ups    # Add follow-up note
```

#### Products
```
GET    /products                # List products (searchable)
POST   /products                # Create product
GET    /products/:id            # Get product
PUT    /products/:id            # Update product
GET    /products/low-stock      # Get low stock products
```

#### Stock Movements
```
GET    /stock/movements         # List movements (filterable)
POST   /stock/movements         # Record manual movement
```

#### Challans (Critical Business Logic)
```
GET    /challans                # List challans (by status/customer)
POST   /challans                # Create draft challan
GET    /challans/:id            # Get challan details
PUT    /challans/:id            # Update draft challan items
POST   /challans/:id/confirm    # Confirm & process challan
POST   /challans/:id/cancel     # Cancel confirmed challan
```

### Response Format

**Success**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful",
  "details": { /* pagination info */ }
}
```

**Error**
```json
{
  "success": false,
  "message": "Insufficient stock for Mouse",
  "code": "INSUFFICIENT_STOCK",
  "details": { "productName": "Mouse", "required": 10, "available": 5 }
}
```

---

## Database Schema

### Core Tables

**users**
- id, username, email, password, fullName, role, isActive, timestamps

**customers**
- id, name, mobileNumber, email, businessName, gstNumber, customerType, address, status, followUpDate, notes, timestamps

**follow_ups**
- id, customerId, note, createdBy, timestamps

**products**
- id, name, sku, category, unitPrice, currentStock, minimumStockAlert, location, isActive, timestamps

**stock_movements**
- id, productId, quantityChanged, movementType (IN/OUT), reason, createdBy, timestamps

**challans**
- id, challanNumber, customerId, totalQuantity, status (DRAFT/CONFIRMED/CANCELLED), createdBy, timestamps

**challan_items** (Product snapshot)
- id, challanId, productId, productNameSnapshot, skuSnapshot, unitPriceSnapshot, quantity, total

---

## Business Logic: Sales Challan Flow

### Draft Challan
1. Sales user creates challan and selects products
2. Adds quantities for each product
3. **Stock does NOT change**
4. Can be edited or deleted
5. Can be confirmed later

### Confirming Challan
1. **Validation Phase**
   - Check all products have sufficient stock
   - Return error if insufficient
   
2. **Transaction Phase** (Atomic)
   - BEGIN TRANSACTION
   - Reduce stock for each product
   - Create OUT movements with snapshots
   - Mark challan as CONFIRMED
   - COMMIT

3. **Error Handling**
   - If any step fails, ROLLBACK entire transaction
   - No partial stock deductions

### Cancelling Challan
1. Only confirmed challans can be cancelled
2. Restore stock for all items
3. Create IN movements (reversals)
4. Mark challan as CANCELLED

---

## Frontend Features

### Pages

**Login**
- Role-based credentials
- Dark/Light mode toggle
- Test credentials display

**Dashboard**
- KPI cards (glass morphism design)
- Recent activity
- Quick navigation

**Customers**
- Paginated list with search
- Add/Edit forms
- Follow-up notes management
- Customer details view

**Inventory**
- Product management
- Stock movement log
- Low stock alerts
- Search & filter

**Sales Challans**
- Create multi-product challans
- Real-time stock validation
- Confirmation with error handling
- Status tracking
- Cancel & modify capabilities

---

## Dark/Light Mode

### Implementation
- Uses system preference by default
- Toggle button in sidebar
- Persists to localStorage
- TailwindCSS dark mode support

### Theme Colors

**Dark Mode**
- Background: `#0a0a0d`
- Cards: `#16161d`
- Accent: `#7c5cff` (purple)
- Text: `#f5f5f7`

**Light Mode**
- Background: `#ffffff`
- Cards: `#f5f7fa`
- Accent: `#7c5cff` (purple)
- Text: `#1a1a1a`

---

## Error Handling

**Centralized Error Handler** (Backend)
- Catches all errors via middleware
- Returns consistent JSON format
- Includes error codes for frontend handling
- Different status codes for different error types

**Error Types**
- `400` - Validation Error
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate, insufficient stock, invalid status)
- `500` - Server Error

---

## Deployment

### ✅ Production Deployment

**Backend (Render):**
- Platform: Render Web Service with Docker
- URL: https://fundsroom-casestudy-crm.onrender.com
- Database: Supabase PostgreSQL (ap-southeast-2)
- Auto-deploy: Enabled on git push to main
- Health check: `GET /health`
- **Note**: Free tier may spin down after 15 minutes of inactivity, causing 30-45 second cold starts. This is normal Render behavior and resolves automatically.

**Frontend (Vercel):**
- Platform: Vercel Static Site
- URL: https://fundsroom-casestudy-crm.vercel.app
- Build: React 18 + Vite + Tailwind
- Auto-deploy: Enabled on git push to main

**Complete Deployment Guide:** See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)

### Local Development Setup

1. **Clone Repository**
```bash
git clone https://github.com/sujithputta02/fundsroom-casestudy-crm.git
cd fundsroom-casestudy-crm
```

2. **Backend Setup**
```bash
cd backend
bun install  # or npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
bun run prisma:generate
bun run db:push
bun run db:seed
bun run dev
```

3. **Frontend Setup** (in new terminal)
```bash
cd frontend
bun install  # or npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api/v1
bun run dev
```

4. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- Login with test credentials listed above

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Development Commands

### Backend
```bash
bun run dev              # Start dev server
bun run build            # Build for production
bun run db:push          # Create/update DB schema
bun run db:migrate       # Run migrations
bun run db:seed          # Seed test data
bun run db:reset         # Reset database
bun run prisma:generate  # Generate Prisma client
```

### Frontend
```bash
bun run dev              # Start dev server
bun run build            # Build for production
bun run preview          # Preview production build
bun run lint             # Run ESLint
```

---

## Known Limitations & Incomplete Parts

### Current Limitations
1. **Single Warehouse** - Currently supports one warehouse location (can extend to multi-warehouse)
2. **Basic Analytics** - Dashboard shows core metrics only (no advanced charts/reports)
3. **No Product Images** - File upload for product photos not implemented
4. **No Email Notifications** - No automated emails for orders/alerts
5. **Basic Audit Trail** - Only timestamps; no comprehensive activity logs
6. **No Payment Tracking** - Payment status not tracked (accounts receivable)
7. **Render Free Tier** - Backend may experience cold starts (15-30 seconds) after inactivity due to Render's free tier spin-down. This is expected behavior and will resolve with paid hosting.

### What's Working (✅ 100% Complete)
- ✅ Authentication & JWT tokens
- ✅ All 4 user roles with backend API protection
- ✅ Customer CRM with follow-ups
- ✅ Product & inventory management
- ✅ Stock movement tracking
- ✅ Sales challan workflow (draft → confirm → cancel)
- ✅ Transaction-based stock deduction
- ✅ Stock validation (prevents negative stock)
- ✅ Product snapshots in transactions
- ✅ Low stock alerts with notifications
- ✅ Dark/Light theme
- ✅ Responsive design
- ✅ Production deployment (Render + Vercel)
- ✅ Role-based UI guards and access control
- ✅ User management (Admin only)
- ✅ PDF Export for challans
- ✅ CSV Export/Import functionality
- ✅ Invoice generation from challans

### Architecture Details
**For complete architecture explanation, see:** [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

**Key Design Decisions:**
- **Database Transactions** - Challan confirmation uses atomic transactions to ensure stock consistency
- **Product Snapshots** - Stores product name, SKU, price at time of sale (historical accuracy)
- **Normalized Schema** - 8 tables with proper foreign keys and indexes
- **JWT Authentication** - Stateless auth with 7-day token expiry
- **Role-based Middleware** - Backend enforces permissions at API level
- **Prisma ORM** - Type-safe database queries, prevents SQL injection

---

## Future Enhancements

- 🔄 Multi-warehouse inventory transfer
- 📈 Advanced analytics & reporting
- 🧾 Invoice generation & printing
- 📧 Email notifications
- 📱 Mobile app
- 🏷️ Barcode scanning
- 💳 Payment integration
- 🗂️ Advanced audit logs
- 👥 Team collaboration features
- 📊 Custom report builder

---

## Code Quality

- **Type Safety** - Full TypeScript
- **Validation** - Zod schemas
- **Error Handling** - Centralized
- **Authentication** - JWT + Role-based
- **Database** - Prisma ORM with migrations
- **API Design** - RESTful with versioning
- **Component Structure** - Modular & reusable

---

## Performance

- Pagination on all list endpoints
- Indexed queries
- Transaction-based operations
- Request caching
- Lazy loading on frontend
- Code splitting with Vite

---

## Security

- ✅ Password hashing (bcryptjs)
- ✅ JWT token validation
- ✅ CORS enabled
- ✅ Role-based access control
- ✅ Input validation with Zod
- ✅ Environment variables for secrets
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React)

**Recommendations for Production**
- Use HTTPS only
- Set strong JWT_SECRET
- Enable database SSL
- Use environment-specific configs
- Implement rate limiting
- Add request logging
- Enable CSRF protection
- Regular security audits

---

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Run `bun run db:push`

### Frontend can't connect to API
- Verify backend is running on port 5000
- Check VITE_API_URL in .env
- Check CORS is enabled in backend

### Database errors
- Clear node_modules and reinstall
- Run `bun run db:reset`
- Check Prisma schema syntax

### Login fails
- Run `bun run db:seed` to create test users
- Check JWT_SECRET is set

---

## Contributing

1. Create feature branch
2. Make changes with meaningful commits
3. Test thoroughly
4. Push and create pull request

---

## License

This project is built for the Fundsroom case study assignment.

---

## Support & Questions

For issues or questions:
1. Check this README
2. Review the CASE_STUDY_REQUIREMENTS.md
3. Check the DESIGN_SYSTEM.md

---

**Last Updated:** January 2024
**Version:** 1.0.0
