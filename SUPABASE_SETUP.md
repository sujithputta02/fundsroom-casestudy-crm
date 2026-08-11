# Supabase PostgreSQL Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in:
   - **Project name**: `fundsroom` (or your preference)
   - **Database password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project" and wait 1-2 minutes for setup

## Step 2: Get Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Under "Connection String", select **URI** tab
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR_PASSWORD]@[HOST]:5432/postgres
   ```

## Step 3: Update Backend .env

Open `backend/.env` and replace:

```env
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres"
```

With your actual Supabase credentials from Step 2.

**Example:**
```env
DATABASE_URL="postgresql://postgres:MySuper$ecurePassword@db.supabase.co:5432/postgres"
```

## Step 4: Initialize Database Schema

Run from the backend directory:

```bash
cd backend

# Generate Prisma client
bun run prisma:generate

# Push schema to Supabase
bun run db:push

# Seed database with test data
bun run db:seed
```

## Step 5: Start Backend Server

```bash
bun run dev
```

You should see:
```
✅ Database connected successfully
Server running on http://localhost:5000
```

## Step 6: Start Frontend Server

In another terminal:

```bash
cd frontend
bun run dev
```

Open http://localhost:5173 in your browser.

## Login Credentials (Test Users)

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fundsroom.com | admin123 |
| Sales | sales@fundsroom.com | sales123 |
| Warehouse | warehouse@fundsroom.com | warehouse123 |
| Accounts | accounts@fundsroom.com | accounts123 |

## Troubleshooting

### Connection Refused
- Check DATABASE_URL is correct
- Verify password doesn't have special characters that need escaping
- Ensure Supabase project is running (check Status in dashboard)

### SSL Certificate Error
Add `?sslmode=require` to the end of DATABASE_URL if needed:
```env
DATABASE_URL="postgresql://postgres:password@host:5432/postgres?sslmode=require"
```

### Schema Mismatch
If you get migration errors:
```bash
# Reset database (deletes all data)
bun run db:reset

# Then seed again
bun run db:seed
```

## Optional: View Data in Supabase

1. Go to Supabase dashboard
2. Click "SQL Editor"
3. Select tables from left sidebar to view data
4. Or run queries directly

## Next: Deploy

Once everything works locally:
1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Update FRONTEND_URL in backend .env
4. Run seed on deployed database

See SUBMISSION_CHECKLIST.md for deployment steps.
