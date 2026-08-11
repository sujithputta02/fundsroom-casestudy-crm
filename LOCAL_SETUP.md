# Local Development Setup

## Current Status ✅

- ✅ Frontend running on `http://localhost:5174`
- ✅ Backend dependencies installed
- ⏳ Backend waiting for database configuration

## What's Next: Connect to Supabase

The backend won't start without a valid database connection. You need to add your Supabase credentials.

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Create a new project
4. Wait for the database to be ready

### Step 2: Get Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Find the **Connection String** section
3. Select **URI** tab
4. Copy the connection string

It looks like:
```
postgresql://postgres:YOUR_PASSWORD@db.supabase.co:5432/postgres
```

### Step 3: Update Backend Environment

Edit `/Users/sujithputta/Projects/Fundsroom case study/backend/.env`:

Replace this line:
```env
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres"
```

With your actual Supabase connection string.

**Example:**
```env
DATABASE_URL="postgresql://postgres:MyPassword123@db.supabase.co:5432/postgres"
```

### Step 4: Initialize Database

Open a terminal in the backend directory and run:

```bash
cd backend

# Generate Prisma client
bun run prisma:generate

# Push schema to Supabase
bun run db:push

# Seed with test data
bun run db:seed
```

Expected output:
```
✓ Created 8 tables
✓ Seeded 20+ records
✓ Ready for use
```

### Step 5: Start Backend

```bash
cd backend
bun run dev
```

Expected output:
```
✅ Database connected successfully
Server running on http://localhost:5001
```

### Step 6: Test the Full Stack

Open http://localhost:5174 in your browser.

**Test Credentials:**
- Email: `admin@fundsroom.com`
- Password: `admin123`

## Architecture

```
Frontend (React + Vite)
  ↓ http://localhost:5174
  ↓ API calls to http://localhost:5001/api/v1
Backend (Express + TypeScript)
  ↓ Connects to Supabase PostgreSQL
Supabase PostgreSQL Database
  ↓ 8 tables with test data
```

## Troubleshooting

### Backend won't start: "Is port 5000 in use?"
The port 5001 is already being used. Check:
```bash
# Kill any Bun processes
pkill -f "bun run dev"
```

### Database connection error
1. Verify DATABASE_URL is correct
2. Check Supabase project is running
3. Try with `?sslmode=require` added to the URL

### Prisma errors
```bash
# Regenerate Prisma client
bun run prisma:generate

# Check schema
bun run db:push
```

### Frontend can't connect to backend
1. Check backend is running on port 5001
2. Verify VITE_API_URL in frontend/.env is `http://localhost:5001/api/v1`
3. Check CORS settings in backend

## Files Modified

- `backend/.env` - Updated PORT to 5001
- `frontend/.env` - Updated API URL to port 5001
- `frontend/src/index.css` - Fixed Tailwind placeholder class

## Next Steps After Setup

1. ✅ Test all workflows locally
2. Initialize Git repository
3. Deploy to GitHub
4. Deploy frontend to Vercel
5. Deploy backend to Render
6. Submit project

See SUBMISSION_CHECKLIST.md for detailed deployment instructions.
