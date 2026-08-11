# Settings Feature Implementation Guide

## Overview
The Settings page is now fully functional with complete database persistence. Users can manage their profile, preferences, password, and view stock movement history.

## Database Changes

### Updated User Model (Prisma)
Added two new fields to the `User` model:
```prisma
theme       String   @default("light")    // "light" or "dark"
enableStockAlerts Boolean @default(true)  // Stock alert notifications
```

**To apply the migration:**
```bash
cd backend
npm run db:push
# or
bun run db:push
```

## Backend API Endpoints

### New Auth Routes

#### 1. Update User Settings
```
PUT /api/v1/auth/settings
Authorization: Bearer <token>

Request Body:
{
  "theme": "light" | "dark",  // optional
  "enableStockAlerts": true    // optional
}

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS",
    "theme": "light",
    "enableStockAlerts": true
  },
  "message": "Settings updated successfully"
}
```

#### 2. Change Password
```
POST /api/v1/auth/change-password
Authorization: Bearer <token>

Request Body:
{
  "currentPassword": "string",    // required
  "newPassword": "string"         // min 6 chars, required
}

Response:
{
  "success": true,
  "data": {
    "success": true,
    "message": "Password changed successfully"
  },
  "message": "Password changed successfully"
}
```

#### 3. Get Current User (Updated)
```
GET /api/v1/auth/me
Authorization: Bearer <token>

Response now includes:
{
  "id": "string",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "role": "string",
  "isActive": boolean,
  "theme": "light",              // NEW
  "enableStockAlerts": true      // NEW
}
```

## Frontend Changes

### New Files Created
- `/frontend/src/pages/Settings.tsx` - Complete Settings page with 3 tabs

### Modified Files

#### 1. App.tsx
- Added Settings route import
- Added Settings protected route at `/settings`

#### 2. types/index.ts
- Updated `User` interface with `theme` and `enableStockAlerts` fields
- Updated `AuthState` interface with `updateSettings` and `changePassword` methods

#### 3. lib/api.ts
- Added `updateSettings` method to `authAPI`
- Added `changePassword` method to `authAPI`

#### 4. store/authStore.ts
- Added `updateSettings` action - saves preferences to DB and localStorage
- Added `changePassword` action - calls backend to change password

## Settings Page Structure

### Tab 1: Profile
**User Information Section:**
- Full Name (read-only)
- Email (read-only)
- Username (read-only)
- Role badge (read-only)

**Change Password Section:**
- Current Password input (with show/hide toggle)
- New Password input (with show/hide toggle)
- Confirm Password input
- Validation:
  - Current password is required
  - New password minimum 6 characters
  - New password and confirm must match
- Error and success messages

### Tab 2: Preferences
**Theme Preference:**
- Light Mode button
- Dark Mode button
- Selection persists and applies immediately

**Notifications:**
- Checkbox to enable/disable stock alerts
- Preference saved to user record in DB

**Save Button:**
- Saves both theme and notification preferences
- Updates theme in real-time
- Shows success/error messages

### Tab 3: Stock Movements
**Filters:**
- Movement Type dropdown (All/In/Out)
- Records per page (10/25/50/100)
- Export to CSV button

**Table Display:**
- Product name
- SKU
- Movement Type (with color-coded badges)
- Quantity Changed
- Reason
- Created By (user name)
- Date

**CSV Export:**
- Downloads current filtered data as CSV file
- Filename: `stock-movements-YYYY-MM-DD.csv`

## How It Works

### Saving Preferences Flow
```
User clicks "Save Preferences" in Preferences tab
    ↓
Frontend validates selections
    ↓
Calls updateSettings() from authStore
    ↓
API sends PUT /auth/settings with new preferences
    ↓
Backend validates and updates User record in PostgreSQL
    ↓
Updated user object returned to frontend
    ↓
Frontend updates localStorage and auth store
    ↓
Theme changes applied immediately
    ↓
Success message shown to user
```

### Changing Password Flow
```
User submits password change form
    ↓
Frontend validates:
  - Current password not empty
  - New password >= 6 chars
  - New password === confirm password
    ↓
Calls changePassword() from authStore
    ↓
API sends POST /auth/change-password
    ↓
Backend:
  - Finds user by ID (from JWT token)
  - Compares current password with bcrypt hash
  - If match: hashes new password and updates
  - If no match: returns 401 error
    ↓
Frontend shows success or error
    ↓
Form cleared on success
```

### Stock Movements Display
```
User opens Stock Movements tab
    ↓
Frontend loads stock movements via stockAPI.getAll()
    ↓
Filters applied: type and limit
    ↓
API retrieves movements with filters
    ↓
Table populated with results
    ↓
User can change filters and page size
```

## Sidebar Integration
The Settings link is already present in the Sidebar component:
- Icon: Settings (gear icon from lucide-react)
- Path: `/settings`
- Protected route (requires authentication)

## Testing Checklist

- [ ] Run `npm run db:push` in backend to create new columns
- [ ] Login with a test user
- [ ] Navigate to Settings → Profile tab
- [ ] Verify user information displays correctly
- [ ] Try changing password:
  - [ ] Wrong current password shows error
  - [ ] Short new password shows error
  - [ ] Non-matching passwords show error
  - [ ] Correct change shows success
- [ ] Navigate to Settings → Preferences tab
- [ ] Change theme preference and verify it saves
- [ ] Toggle stock alerts checkbox and save
- [ ] Navigate to Settings → Stock Movements tab
- [ ] Filter by movement type
- [ ] Change records per page
- [ ] Export to CSV
- [ ] Verify CSV file downloads with correct data

## Environment Variables
No new environment variables required. Uses existing:
- `VITE_API_URL` (frontend) - API base URL
- `DATABASE_URL` (backend) - PostgreSQL connection string

## Data Persistence
All settings are:
1. Saved to PostgreSQL database (permanent storage)
2. Cached in localStorage (quick access)
3. Stored in Zustand auth store (React state)

Settings persist across:
- Page refreshes
- Tab closures
- Application restarts
- Device changes (stored in DB)

## Error Handling
- Network errors caught and displayed to user
- Invalid password change attempts return helpful messages
- API validation prevents bad data from reaching database
- Frontend validation catches errors before API call
