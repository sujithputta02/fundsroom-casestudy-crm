# Fundsroom ERP - Quick Reference Card

## 🚀 Start in 5 Minutes

```bash
# Terminal 1
cd backend
bun install && bun run db:seed && bun run dev

# Terminal 2  
cd frontend
bun install && bun run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api/v1

---

## 👤 Test Users

| Role | Username | Password |
|------|----------|----------|
| 👨‍💼 Admin | `admin` | `admin123` |
| 💼 Sales | `sales` | `sales123` |
| 🏭 Warehouse | `warehouse` | `warehouse123` |
| 📊 Accounts | `accounts` | `accounts123` |

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **README.md** | Project overview & features |
| **SETUP_GUIDE.md** | Detailed installation steps |
| **API_DOCUMENTATION.md** | API reference with examples |
| **TESTING_GUIDE.md** | Testing workflows & scenarios |
| **PROJECT_SUMMARY.md** | Architecture & metrics |
| **DESIGN_SYSTEM.md** | UI/UX design guidelines |

---

## 🔗 Key API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Customers (6 endpoints)
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer details
- `PUT /customers/:id` - Update customer
- `POST /customers/:id/follow-ups` - Add follow-up
- `GET /customers/:id/follow-ups` - Get follow-ups

### Products (5 endpoints)
- `GET /products` - List products
- `POST /products` - Create product
- `GET /products/:id` - Get product
- `PUT /products/:id` - Update product
- `GET /products/low-stock` - Low stock alert

### Stock (2 endpoints)
- `POST /stock/movements` - Record movement
- `GET /stock/movements` - List movements

### Challans (7 endpoints)
- `GET /challans` - List challans
- `POST /challans` - Create challan (DRAFT)
- `GET /challans/:id` - Get challan details
- `PUT /challans/:id` - Update items (DRAFT only)
- `POST /challans/:id/confirm` - Confirm & deduce stock
- `POST /challans/:id/cancel` - Cancel & restore stock

---

## 🎨 Dark/Light Mode

- Click **Moon/Sun icon** in sidebar
- Theme persists automatically
- Applied to all pages

---

## 📋 Database Commands

```bash
cd backend

# Create schema
bun run db:push

# Seed test data
bun run db:seed

# Reset database
bun run db:reset

# View database UI
bun run exec prisma studio
```

---

## 🧪 Quick Test (30 seconds)

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

# 2. Get customers
curl -X GET "http://localhost:5000/api/v1/customers" \
  -H "Authorization: Bearer $TOKEN"

# 3. Should return customer list ✅
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
bun install
bun run db:push
bun run dev
```

### Frontend can't reach API
- Check backend is running on port 5000
- Check `frontend/.env` has correct API URL

### Database connection failed
```bash
# Check PostgreSQL running:
brew services list

# Or start with Docker:
docker-compose up -d postgres
```

### Port already in use
```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9
```

---

## 💡 Tips & Tricks

### API Testing with cURL
```bash
# Get token
TOKEN=$(curl -s ... | jq -r '.data.token')

# Use token for requests
curl -H "Authorization: Bearer $TOKEN" ...
```

### Pretty Print JSON
```bash
curl ... | jq '.'
curl ... | jq '.data | length'  # Get array length
```

### Save Response
```bash
curl ... > response.json
cat response.json | jq '.'
```

---

## 🔐 Security

- Never commit `.env` files
- Change `JWT_SECRET` in production
- Use HTTPS in production
- Use strong database passwords

---

## 📊 Features at a Glance

✅ Role-based login (4 roles)
✅ Customer CRM with follow-ups
✅ Inventory management
✅ Stock movement tracking
✅ Sales challan workflow
✅ Stock validation on confirmation
✅ Dark/Light mode toggle
✅ Real-time form validation
✅ API error handling
✅ Database transactions

---

## 🚀 Deployment

### Docker
```bash
docker-compose up -d
# Runs backend + PostgreSQL
```

### Frontend
Deploy to Vercel:
```bash
vercel deploy
```

### Backend
Deploy to Render:
```
- Connect GitHub repo
- Set environment variables
- Deploy
```

### Database
Use Supabase or Neon

---

## 📞 Useful Commands

```bash
# Backend
bun run dev              # Start dev server
bun run build            # Build for production
bun run db:seed          # Seed database
bun run db:reset         # Reset database

# Frontend
bun run dev              # Start dev server
bun run build            # Build for production
bun run lint             # Run linter

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs      # View logs
```

---

## 🎯 Common Workflows

### Workflow 1: Create & Confirm Challan
1. Login as Sales user
2. Go to Challans
3. Click "Create Challan"
4. Select customer
5. Add products
6. Confirm → Stock deducts

### Workflow 2: Track Low Stock
1. Login as Admin
2. Go to Inventory
3. Products with ⚠️ are low
4. Update stock or reorder

### Workflow 3: Customer Follow-up
1. Go to Customers
2. Select customer
3. View follow-ups
4. Add new note
5. Set follow-up date

---

## 💾 File Locations

```
Backend:     backend/src/
Frontend:    frontend/src/
Database:    backend/prisma/schema.prisma
Config:      .env files in backend/ & frontend/
Docker:      docker-compose.yml
Docs:        *.md files in root
```

---

## ✨ Quality Metrics

- **API Endpoints:** 26
- **Database Tables:** 8
- **Frontend Pages:** 5
- **React Components:** 10+
- **Test Scenarios:** 20+
- **Dark/Light Themes:** ✅ Both
- **Error Handling:** Comprehensive
- **Input Validation:** Full coverage

---

## 🏆 What Works

✅ Full authentication flow
✅ All CRUD operations
✅ Stock validation & deduction
✅ Role-based access control
✅ Pagination & search
✅ Dark/Light mode
✅ Error handling
✅ API documentation
✅ Database transactions
✅ Responsive design

---

## 📅 Estimated Timelines

| Task | Time |
|------|------|
| Setup | 5 min |
| First login | 1 min |
| Create customer | 2 min |
| Create challan | 3 min |
| Confirm & test stock | 2 min |
| **Total** | **~13 min** |

---

## 🎓 What You Can Learn

- Full-stack development
- TypeScript best practices
- React patterns
- Express.js API design
- Prisma ORM usage
- Database transactions
- Authentication systems
- Dark/Light mode implementation
- Docker containerization
- API design principles

---

## 📞 Need Help?

1. Check **SETUP_GUIDE.md** for installation
2. Check **API_DOCUMENTATION.md** for API usage
3. Check **TESTING_GUIDE.md** for testing workflows
4. Read error messages carefully
5. Check browser console for frontend errors
6. Check server logs for backend errors

---

**Version:** 1.0.0
**Status:** ✅ Complete & Ready
**Last Updated:** January 2024

---

## Quick Links

- 📖 [Setup Guide](./SETUP_GUIDE.md)
- 📚 [API Docs](./API_DOCUMENTATION.md)
- 🧪 [Testing Guide](./TESTING_GUIDE.md)
- 🎨 [Design System](./DESIGN_SYSTEM.md)
- 📊 [Project Summary](./PROJECT_SUMMARY.md)
- 📋 [Requirements](./CASE_STUDY_REQUIREMENTS.md)

---

**Happy coding! 🚀**
