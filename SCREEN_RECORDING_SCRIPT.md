# FundsRoom Case Study - Screen Recording Demo Script (CONDENSED)

**Duration:** 7-10 minutes | **Designed for:** Full Stack Developer Interview Round 1

---

## 🎯 QUICK OVERVIEW

This is a **rapid-fire demo** showing:
1. Login & ADMIN Dashboard
2. Customer creation (CRM)
3. Create & Confirm Challan (core logic + stock deduction)
4. Show different role (role-based access)
5. Brief architecture explanation

**Key principle:** Show the app works. Explain the hard parts. Move fast.

---

## 🎬 SECTION 1: INTRO & LOGIN (1 minute)

**[Start Recording]**

### NARRATION:

"Hi, I'm Sujith Putta. This is **FundsRoom** - a Mini ERP/CRM system for wholesale distribution companies. 

It has 4 user roles with different permissions, real-time inventory management, and atomic stock transactions to prevent overselling. Built with React, Node.js, PostgreSQL, and Prisma.

Let me show you how it works."

**[Action: Show login screen and enter ADMIN credentials]**

---

## 🎬 SECTION 2: DASHBOARD & KPIs (1.5 minutes)

### NARRATION:

"Perfect! This is the **ADMIN Operations Portal**. Key metrics on the dashboard:

- **Today's Sales**: ₹[X] from all confirmed orders
- **Stock Alerts**: [Y] products below minimum threshold
- **Pending Challans**: [Z] draft orders waiting confirmation
- **Follow-ups Due**: [W] active leads to contact

The dashboard auto-refreshes every 30 seconds. You can see a 7-day sales trend chart and stock health visualization.

The system has 4 roles: ADMIN (full access), SALES (orders + customers), WAREHOUSE (inventory), ACCOUNTS (read-only). Each role sees different data.

Let me create a customer to demonstrate the workflow."

**[Action: Navigate to Customers section]**

---

## 🎬 SECTION 3: CUSTOMER CRM (1 minute)

**[Show Customers page]**

### NARRATION:

"Here's the CRM module. I can search, filter, and manage customers. Let me create a new customer."

**[Action: Click 'Add New Customer' - form appears]**

### NARRATION:

"I'll fill in:
- Name: ABC Retail Store
- Mobile: 9876543210
- Email: info@abcretail.com
- Customer Type: Retail
- GST Number: 18AABCT1234H1Z0
- Status: LEAD
- Follow-up Date: Tomorrow
- Note: 'Initial contact - interested in supply'"

**[Action: Fill form and save]**

### NARRATION:

"Done! The customer appears in the list with a LEAD badge. The follow-up tracking ensures no lead is forgotten. Now let me show the core business logic - creating a sales order."

**[Navigate to Challans]**

---

## 🎬 SECTION 4: SALES CHALLAN - THE CRITICAL PART (3.5 minutes)

**[Show Challans list]**

### NARRATION:

"This is **Sales Challans** - the core business logic. A Challan is a sales order. Notice three statuses:
- **DRAFT**: Order being prepared, stock NOT deducted yet, can be edited
- **CONFIRMED**: Order locked, stock IS deducted in atomic transaction
- **CANCELLED**: Order cancelled, stock reversed back

This 3-state lifecycle prevents data corruption. Let me create a new challan."

**[Action: Click 'Create New Challan']**

### NARRATION:

"I select customer: ABC Retail Store (the one I just created). Now I add products:
- USB Keyboard: 5 units @ ₹500 = ₹2500
- Mouse: 10 units @ ₹300 = ₹3000

Total: ₹5500"

**[Action: Select customer and add items to the form]**

### NARRATION:

"I'm adding multiple items. Notice the form calculates totals instantly. The key thing: **at this stage, stock is NOT deducted**. This is a DRAFT. I can still edit or delete without affecting inventory."

**[Action: Click Save/Create Draft]**

### NARRATION:

"Challan created! Auto-generated number: **CH-240812-XXXXX**. Status: DRAFT. Now watch what happens when I CONFIRM it. This is where the transaction magic happens."

**[Action: Click on the challan, then click CONFIRM]**

### NARRATION:

"When I confirm, the backend does an **atomic transaction**:

1. Check: Do we have 5 keyboards + 10 mice in stock?
2. If YES for ALL items:
   - Deduct stock from products
   - Create stock movement records automatically (OUT, quantity, 'Challan confirmed')
   - Change status to CONFIRMED
   - Commit transaction
3. If NO for ANY item:
   - Rollback EVERYTHING (no partial updates)
   - Show error: 'Insufficient stock for [Product]'

Either ALL items confirm or NOTHING happens. This prevents overselling."

**[Action: Observe confirmation result]**

**[If successful:]**

### NARRATION:

"Transaction successful! Status is now CONFIRMED. Challan is locked. Check the Products page - stock has been deducted:
- USB Keyboard: -5
- Mouse: -10

And in Stock Movements, you'll see OUT records created automatically. This audit trail is permanent - no deletions, only inserts. Perfect for compliance.

That's the core business logic. Now let me show role-based access."

**[Navigate to Products to briefly show stock changes]**

---

## 🎬 SECTION 5: ROLE-BASED ACCESS CONTROL (1.5 minutes)

**[Logout and login as different role, or navigate to Settings]**

### NARRATION:

"FundsRoom has 4 roles with different permissions. Let me login as a **SALES** user to show different access.

**SALES role can:**
- Create/manage customers
- Create and confirm sales challans
- View products (read-only)
- Cannot access user management

**WAREHOUSE role can:**
- Manage products and inventory
- Record stock IN/OUT movements
- View challans (read-only)
- Cannot create customers or orders

**ACCOUNTS role can:**
- Read-only access to all data
- View confirming challans with product snapshots
- Cannot modify anything

This role-based system is enforced at both frontend (route guards) and backend (API middleware). A sales person physically can't access warehouse functions, even if they hack the URL."

**[Action: Show quick navigation menu difference or dashboard difference]**

---

## 🎬 SECTION 6: ARCHITECTURE & CONCLUSION (2 minutes)

### NARRATION:

"Quick technical overview:

**Tech Stack:**
- Frontend: React + TypeScript, Zustand for state, Tailwind CSS
- Backend: Node.js + Express, Prisma ORM
- Database: PostgreSQL
- Auth: JWT with 7-day expiry

**Key Architectural Decisions:**

1. **Atomic Transactions** (Prisma `$transaction`):
   - Stock deduction is atomic: all-or-nothing
   - Prevents race conditions where partial orders succeed
   - Database consistency guaranteed

2. **Product Snapshots**:
   - Each challan item stores product name, SKU, price AT TIME OF SALE
   - If product price changes later, old invoices still show correct amount
   - Historical accuracy for auditing

3. **Immutable Audit Trail**:
   - Every stock movement is logged (IN/OUT with reason)
   - No updates/deletes - only inserts
   - Permanent compliance record

4. **Role-Based Access Control**:
   - Backend enforces via API middleware (not just UI hiding)
   - Prevents privilege escalation
   - Different users see different data

5. **Real-time Dashboard**:
   - Polls every 30 seconds for latest KPIs
   - Could upgrade to WebSockets for instant updates

**What This Demonstrates:**
✓ Full-stack capability (frontend, backend, database)
✓ Complex business logic (3-state challan lifecycle)
✓ Transaction safety and data consistency
✓ Role-based access control
✓ Audit trail and compliance
✓ Real-time data synchronization

**Current Limitations & Known Issues:**

Let me be transparent about what's not included in this version:

1. **Single Warehouse Only**
   - Currently supports one warehouse location
   - Multi-warehouse inventory transfers not implemented
   - Would need location-based stock tracking for multiple branches

2. **Basic Analytics Dashboard**
   - Shows core KPIs only (Today's Sales, Stock Alerts, Pending Challans, Follow-ups)
   - No advanced reports (sales by customer, revenue trends, inventory forecast)
   - No data export functionality (CSV, Excel)

3. **No Product Images**
   - File upload for product photos not implemented
   - Could add S3 integration for image storage

4. **No Email Notifications**
   - Stock alerts don't trigger email notifications automatically
   - Low stock notifications only visible in the app
   - Would require Nodemailer or SendGrid integration

5. **Basic Audit Trail**
   - Logs show timestamps but limited activity details
   - No comprehensive user activity log
   - No digital signatures or approval workflows

6. **No Payment Tracking**
   - System doesn't track payment status of challans
   - No integration with payment gateways (Razorpay, Stripe)
   - All transactions assumed paid

7. **Real-time Updates Use Polling**
   - Dashboard polls every 30 seconds instead of WebSockets
   - Fine for small teams but not ideal for 1000+ concurrent users
   - Could upgrade to Socket.io or Redis pub/sub

8. **Render Free Tier Cold Starts**
   - Backend may sleep after 15 minutes inactivity on Render
   - Causes 30-45 second cold start on first request
   - Normal for free tier; resolves with paid hosting

9. **Limited Error Recovery**
   - No automatic retry logic for failed API calls
   - Users must manually refresh on network errors
   - Would add retry middleware and exponential backoff

**What IS Complete (100% Working):**
✅ Authentication & JWT tokens
✅ All 4 user roles with backend permission enforcement
✅ Customer CRM with follow-ups
✅ Product & inventory management
✅ Stock movement tracking
✅ Sales challan workflow (draft → confirm → cancel)
✅ Atomic stock transactions (prevents overselling)
✅ Stock validation & alerts
✅ Product snapshots in orders
✅ Dark/Light theme
✅ Production deployment (Render + Vercel)
✅ Role-based access control

**Priority for Production:**
1. WebSocket real-time updates
2. Multi-warehouse support
3. Advanced reporting & analytics
4. Payment gateway integration

That's FundsRoom. It demonstrates full-stack capability with proper architecture, transaction safety, and role-based access control. It solves the core problem: preventing overselling, maintaining audit trails, and keeping inventory data consistent."

**[End Recording]**

---

## ✅ CHECKLIST (BEFORE RECORDING)

- [ ] Backend running on `http://localhost:5000` (or your port)
- [ ] Frontend running on `http://localhost:5173` (or your port)
- [ ] Database has seed data (customers, products, challans)
- [ ] Have test credentials ready (admin, sales users)
- [ ] Quiet room, clear audio
- [ ] Use QuickTime (Mac) or OBS/Loom (any OS)

## 🎙️ RECORDING TIPS

- Speak clearly, moderate pace
- Pause after major points
- Show the actual UI while narrating
- Demonstrate complete workflows (create → confirm → verify)
- Keep eye contact with camera
- Aim for 7-10 minutes total

## 📤 POST-RECORDING

1. **Upload video:**
   - YouTube (unlisted) or Google Drive
   - Get shareable link

2. **Fill Google Form:**
   - Your name and email
   - GitHub repo: https://github.com/sujithputta02/fundsroom-casestudy-crm
   - Deployed URLs (if available)
   - Video link
   - Brief description: "FundsRoom is a full-stack Mini ERP/CRM with role-based access, atomic stock transactions, and real-time inventory management. Key feature: atomic transaction ensures orders either fully confirm with stock deducted or fail entirely, preventing data inconsistency."

3. **Submit before August 12, 1:21 PM IST**

---

**You got this! � The script is solid, the app is ready, just record and submit.**
