# Render Deployment Guide

## Prerequisites

- GitHub repository with the code
- Render account (free tier works)
- PostgreSQL database (can be created on Render)

---

## Step 1: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"PostgreSQL"**
3. Configure the database:
   - **Name**: `fundsroom-db` (or your preferred name)
   - **Database**: `fundsroom`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 16 (latest)
   - **Plan**: Free
4. Click **"Create Database"**
5. Wait for the database to be created (takes ~2 minutes)
6. **Copy the "Internal Database URL"** - you'll need this for the backend

---

## Step 2: Deploy Backend Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

### Basic Settings
- **Name**: `fundsroom-backend` (or your preferred name)
- **Region**: Same as database
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Docker`
- **Plan**: Free

### Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | (Internal Database URL from Step 1) | Paste the full URL |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-me-123456` | Change to a random string |
| `JWT_EXPIRY` | `7d` | Token expiration time |
| `PORT` | `5000` | Port number |
| `NODE_ENV` | `production` | Environment |
| `FRONTEND_URL` | `https://your-frontend-url.onrender.com` | Add after deploying frontend |

**Important**: Replace the `JWT_SECRET` with a random, secure string (at least 32 characters).

### Auto-Deploy
- ✅ Enable "Auto-Deploy" (deploys automatically on git push)

4. Click **"Create Web Service"**
5. Wait for the build to complete (~5-10 minutes on first deploy)

---

## Step 3: Run Database Migrations and Seed

After the backend is deployed, you need to initialize the database:

### Option A: Using Render Shell (Recommended)

1. Go to your backend service in Render
2. Click **"Shell"** in the left sidebar
3. Run these commands:

```bash
# Generate Prisma client
npm run prisma:generate

# Push database schema
npm run db:push

# Seed the database with test users
npm run db:seed
```

### Option B: Using a One-off Job

1. In your backend service, click **"Manual Deploy"** → **"Clear build cache & deploy"**
2. This will trigger a fresh build

### Test Users Created

After seeding, these test accounts will be available:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `sales` | `sales123` | Sales |
| `warehouse` | `warehouse123` | Warehouse |
| `accounts` | `accounts123` | Accounts |

---

## Step 4: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:

### Basic Settings
- **Name**: `fundsroom-frontend` (or your preferred name)
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Environment Variables

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://fundsroom-backend.onrender.com` |

**Replace** `fundsroom-backend` with your actual backend service name.

4. Click **"Create Static Site"**
5. Wait for the build to complete

---

## Step 5: Update Backend CORS

After frontend is deployed:

1. Go to your backend service
2. Click **"Environment"** in the left sidebar
3. Update the `FRONTEND_URL` variable:
   - **Value**: `https://your-frontend-name.onrender.com` (your actual frontend URL)
4. Click **"Save Changes"**
5. The service will automatically redeploy

---

## Step 6: Verify Deployment

### Test Backend Health

Visit: `https://your-backend.onrender.com/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-08-11T17:00:00.000Z"
}
```

### Test Frontend

1. Visit your frontend URL
2. Try logging in with test credentials:
   - Username: `admin`
   - Password: `admin123`
3. You should be able to access the dashboard

---

## Common Issues & Solutions

### Issue 1: "Cannot find module" errors
**Solution**: Clear build cache and redeploy
- Go to service → Manual Deploy → Clear build cache & deploy

### Issue 2: CORS errors
**Solution**: Make sure `FRONTEND_URL` in backend matches your actual frontend URL

### Issue 3: Database connection errors
**Solution**: 
- Verify `DATABASE_URL` is set correctly in backend environment variables
- Use the **Internal Database URL** (not External)
- Make sure database and backend are in the same region

### Issue 4: 500 errors on login
**Solution**: Run database seed command
```bash
npm run db:seed
```

### Issue 5: Rate limiter errors
**Solution**: Already fixed with `trust proxy` setting

---

## Production Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong, random string
- [ ] Set up proper PostgreSQL database (not free tier for production)
- [ ] Add custom domain (optional)
- [ ] Set up monitoring/alerts in Render
- [ ] Review and adjust rate limits in `backend/src/middleware/rateLimiter.ts`
- [ ] Enable database backups
- [ ] Review CORS settings
- [ ] Update test credentials or disable seed accounts

---

## Useful Commands

### Database Management

```bash
# Connect to database shell (from Render Shell)
psql $DATABASE_URL

# Reset database (CAUTION: deletes all data)
npm run db:reset

# Run migrations
npm run db:migrate

# View Prisma Studio (local only)
npx prisma studio
```

### Logs

- Backend logs: Go to service → Logs
- Database logs: Go to database → Logs
- Frontend logs: Go to static site → Logs

---

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│  (Static Site)  │
│   Port 443      │
└────────┬────────┘
         │
         │ HTTPS
         │
         ▼
┌─────────────────┐
│    Backend      │
│  (Web Service)  │
│   Port 5000     │
└────────┬────────┘
         │
         │ Internal
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Database)    │
│   Port 5432     │
└─────────────────┘
```

---

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Rate Limit](https://express-rate-limit.github.io/)

---

## Next Steps

After successful deployment:

1. Create actual users through the admin panel
2. Add customers, products, and inventory
3. Test the full workflow (create challans, manage stock, etc.)
4. Set up proper monitoring and error tracking
5. Consider upgrading to paid plans for better performance
