# Fundsroom ERP - Complete Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Bun (1.3.14+): https://bun.sh
- PostgreSQL (14+)
- Git

### Step 1: Install Dependencies

```bash
# Backend
cd backend
bun install

# Frontend (in another terminal)
cd frontend
bun install
```

### Step 2: Setup Database

```bash
# In backend directory
bun run prisma:generate
bun run db:push
bun run db:seed
```

### Step 3: Start Services

```bash
# Terminal 1 - Backend
cd backend
bun run dev
# Runs on http://localhost:5000

# Terminal 2 - Frontend  
cd frontend
bun run dev
# Runs on http://localhost:5173
```

### Step 4: Login
Visit http://localhost:5173 and login with:
- **Username:** admin
- **Password:** admin123

---

## Detailed Setup

### 1. PostgreSQL Setup

#### Option A: Local Installation (macOS)
```bash
# Install via Homebrew
brew install postgresql@15

# Start service
brew services start postgresql@15

# Create database and user
createdb fundsroom
createuser fundsroom -P
# Enter password: fundsroom_dev_password
```

#### Option B: Docker (Recommended)
```bash
docker run --name fundsroom-db \
  -e POSTGRES_USER=fundsroom \
  -e POSTGRES_PASSWORD=fundsroom_dev_password \
  -e POSTGRES_DB=fundsroom \
  -p 5432:5432 \
  -d postgres:15-alpine
```

#### Option C: Using Docker Compose
```bash
# From project root
docker-compose up -d
# Waits for DB to be ready, then starts backend
```

#### Verify Connection
```bash
psql -U fundsroom -h localhost -d fundsroom
# Should connect successfully
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
bun install

# Generate Prisma client
bun run prisma:generate

# Create database schema
bun run db:push

# Seed test data
bun run db:seed
```

**Expected output:**
```
✨ Database seeded successfully!
📋 Test Credentials:
   Admin: admin / admin123
   Sales: sales / sales123
   Warehouse: warehouse / warehouse123
   Accounts: accounts / accounts123
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
bun install

# Create .env if not exists (already provided)
cp .env.example .env
```

### 4. Run Applications

#### Development Mode

**Backend:**
```bash
cd backend
bun run dev
```

**Output:**
```
✅ Server running on http://localhost:5000
📚 Environment: development
```

**Frontend:**
```bash
cd frontend
bun run dev
```

**Output:**
```
➜  Local:   http://localhost:5173/
```

### 5. Verify Everything Works

1. Open http://localhost:5173
2. Login with: `admin` / `admin123`
3. Check Dashboard loads
4. Navigate to Customers, Products, Challans
5. Backend API should respond to requests

---

## Database Management

### Reset Database
```bash
cd backend
bun run db:reset
# Deletes all data and re-seeds
```

### Run Migrations
```bash
bun run db:migrate
# Create and run new migrations
```

### Check Database
```bash
# Connect to database
psql -U fundsroom -h localhost -d fundsroom

# List tables
\dt

# Exit
\q
```

### Prisma Studio (Visual Database)
```bash
bun run exec prisma studio
# Opens http://localhost:5555
# Visual interface to browse/edit data
```

---

## Environment Variables

### Backend (.env)
```env
# Database connection
DATABASE_URL="postgresql://user:password@host:port/dbname"

# JWT Configuration
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRY="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
# API URL
VITE_API_URL="http://localhost:5000/api/v1"
```

---

## Build for Production

### Backend
```bash
cd backend

# Build TypeScript
bun run build

# Start production server
npm start
```

### Frontend
```bash
cd frontend

# Build optimized bundle
bun run build

# Preview production build
bun run preview
```

---

## Docker Deployment

### Build Images

**Backend:**
```bash
cd backend
docker build -t fundsroom-api:latest .
```

**Frontend:**
```bash
cd frontend
docker build -t fundsroom-web:latest .
```

### Run with Docker Compose
```bash
docker-compose up -d

# Backend: http://localhost:5000
# Frontend: http://localhost:5173
# Database: localhost:5432
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Stop Services
```bash
docker-compose down
```

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
1. Check PostgreSQL is running: `brew services list`
2. Verify credentials in .env
3. Test connection: `psql -U fundsroom -h localhost -d fundsroom`

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 bun run dev
```

### Issue: "Module not found" errors
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

### Issue: Frontend can't connect to API
**Solution:**
1. Check backend is running on port 5000
2. Verify VITE_API_URL in frontend/.env
3. Check CORS is enabled in backend/src/index.ts
4. Check browser console for errors

### Issue: Seed data not created
**Solution:**
```bash
# Check if tables exist
bun run prisma:generate
bun run db:push
bun run db:seed

# Check database
psql -U fundsroom -d fundsroom -c "SELECT COUNT(*) FROM users;"
```

### Issue: Cannot login with test credentials
**Solution:**
1. Run seed again: `bun run db:seed`
2. Check users table: `psql -U fundsroom -d fundsroom -c "SELECT * FROM users;"`
3. Make sure .env JWT_SECRET is set

---

## Development Workflow

### Adding New Feature

1. **Backend:**
   - Update Prisma schema (if needed)
   - Run migration: `bun run db:migrate`
   - Add service logic
   - Add API route

2. **Frontend:**
   - Add API client function
   - Create React component/page
   - Add types
   - Connect to store

3. **Test:**
   - Test in browser
   - Check API with curl/Postman
   - Verify database changes

### Making Commits
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature-branch
```

---

## Testing APIs

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Get Customers:**
```bash
curl -X GET "http://localhost:5000/api/v1/customers" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import collection from `postman_collection.json`
2. Set `base_url` variable to `http://localhost:5000/api/v1`
3. Set `token` variable from login response
4. Run requests

---

## Performance Tips

### Backend
- Use pagination (limit results)
- Index frequently queried fields
- Use database transactions (already implemented)
- Cache static data

### Frontend
- Lazy load routes
- Use code splitting
- Cache API responses
- Optimize images

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for secrets
- [ ] Validate all inputs (already done with Zod)
- [ ] Use strong database passwords
- [ ] Enable database backups
- [ ] Regular security audits

---

## Useful Commands

```bash
# Backend
bun run dev              # Start dev server
bun run build            # Build for production
bun run db:seed          # Seed database
bun run db:reset         # Reset database
bun run prisma:generate  # Generate Prisma client

# Frontend
bun run dev              # Start dev server
bun run build            # Build for production
bun run preview          # Preview production build
bun run lint             # Run linter

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
```

---

## Next Steps

1. ✅ Local development set up
2. 📚 Read API_DOCUMENTATION.md for API details
3. 🎨 Review DESIGN_SYSTEM.md for UI guidelines
4. 📋 Check CASE_STUDY_REQUIREMENTS.md for full requirements
5. 🚀 Deploy to cloud (Vercel, Render, Supabase)

---

## Support

For issues:
1. Check this guide
2. Review error messages in console
3. Check README.md
4. Review API_DOCUMENTATION.md
5. Consult CASE_STUDY_REQUIREMENTS.md

---

**Last Updated:** January 2024
**Version:** 1.0.0
