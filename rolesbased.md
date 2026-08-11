Yes. Based on the **case study/PRD + the four portal screenshots**, the correct approach is to make this a **real role-based ERP/CRM portal**, where every number, table row, status, stock quantity, challan, customer, and dashboard metric comes from the database—not hardcoded/mock arrays.

The case study explicitly defines four roles—**Admin, Sales, Warehouse, Accounts**—and requires CRM, inventory, sales challans, REST APIs, validation, and deployment.  

# Mini ERP + CRM — Role-Based Portal Data & Functional Specification

## 1. Core principle: NO MOCK DATA

The frontend should **never contain business data like this**:

```ts
const customers = [
  { name: "ABC Retail Store", ... },
  { name: "XYZ Wholesale Traders", ... }
];
```

Instead:

```text
Frontend
   ↓
REST API
   ↓
Backend Service
   ↓
Prisma ORM
   ↓
PostgreSQL
```

For example:

```text
Customer CRM page
       ↓
GET /api/v1/customers
       ↓
Database
       ↓
Actual customer records
       ↓
React table
```

So when you click:

**+ Add Customer**

the customer is actually inserted into PostgreSQL.

Then when you refresh the page:

```text
GET /customers
```

retrieves that same customer from the database.

The case study specifically requires customer creation/edit/search/details/follow-ups, so these should all operate on persistent records. 

---

# 2. Role structure

I recommend locking the roles like this:

| Module / Action |  Admin |           Sales |   Warehouse |        Accounts |
| --------------- | -----: | --------------: | ----------: | --------------: |
| Dashboard       | ✅ Full |     ✅ Sales/CRM | ✅ Inventory | ✅ Business view |
| Customers       | ✅ Full |          ✅ Full |     👁 Read |         👁 Read |
| Products        | ✅ Full |         👁 Read |      ✅ Full |         👁 Read |
| Stock Movements | ✅ Full |         👁 Read |      ✅ Full |         👁 Read |
| Sales Challans  | ✅ Full | ✅ Create/Manage |     👁 Read |         👁 Read |
| Confirm Challan |      ✅ |               ✅ |     👁 Read |         👁 Read |
| Cancel Challan  |      ✅ |               ✅ |     👁 Read |         👁 Read |
| Users/Roles     |      ✅ |               ❌ |           ❌ |               ❌ |
| System Settings |      ✅ |               ❌ |           ❌ |               ❌ |

**Important:** the PRD explicitly defines the four roles, but it does **not** prescribe every permission for each role. 

So the matrix above is the **recommended implementation**, not something you should claim was explicitly specified by the case study.

---

# 3. ADMIN PORTAL

Admin should get the **complete Operations Portal** shown in your first screenshot.

## Admin navigation

```text
Operations Portal
│
├── Dashboard
├── Customer CRM
├── Product Inventory
├── Sales Challans
│
├── Administration
│   ├── Users
│   └── Settings
│
└── Profile / Logout
```

The screenshots' four primary business areas map nicely to the PRD:

* Dashboard
* Customer CRM
* Product Inventory
* Sales Challans

The PRD expects a clean admin-style UI. 

---

# 4. ADMIN DASHBOARD — YOUR FIRST SCREENSHOT

Your screenshot has:

### Top

```text
Operations Portal

Overview of sales challans, inventory alerts, and CRM leads
```

This is good.

But **all values must be calculated from PostgreSQL**.

---

## Card 1 — Today's Sales

Your screenshot currently shows:

```text
TODAY'S SALES

₹12,250

2 confirmed orders today
```

Do NOT hardcode this.

It should be calculated from confirmed challans created today.

Example:

```text
Confirmed Challan #1
₹5,000

Confirmed Challan #2
₹7,250

----------------
Today's Sales
₹12,250
```

If there are no challans:

```text
₹0

0 confirmed orders today
```

### API

```http
GET /api/v1/dashboard/summary
```

Response:

```json
{
  "todaySales": 12250,
  "confirmedOrdersToday": 2
}
```

---

# 5. Stock Alerts

Your screenshot:

```text
STOCK ALERTS

1

Items below minimum stock threshold
```

This should come directly from:

```text
products.currentStock <= products.minimumStock
```

Example:

```text
USB Type-C Hub
Current stock: 15
Minimum stock: 30

→ LOW STOCK
```

Then:

```text
Stock Alerts = 1
```

If five products are below threshold:

```text
Stock Alerts = 5
```

No mock value.

---

# 6. Pending Challans

Your screenshot shows:

```text
PENDING CHALLANS

0

Drafts awaiting manager confirmation
```

This should query:

```text
challans.status = DRAFT
```

So:

```text
Draft
Draft
Draft
```

means:

```text
Pending Challans = 3
```

The PRD requires Draft, Confirmed and Cancelled challan states. 

---

# 7. Follow-ups Due

Your screenshot:

```text
FOLLOW-UPS DUE

1

Active CRM lead follow-ups this week
```

This should come from the CRM.

For example:

```text
Customer: ABC Retail
Status: Lead
Follow-up Date: 13 Aug 2026
```

The dashboard calculates:

```text
followUpDate >= today
AND
followUpDate <= end of current week
AND
customer.status = LEAD
```

The PRD explicitly includes follow-up date and notes in the customer record. 

---

# 8. Weekly Sales Trend

Your screenshot has:

```text
Weekly Sales Trend
Mon Tue Wed Thu Fri Sat
```

Again, this must be dynamic.

Backend calculates:

```text
Monday → confirmed challan totals
Tuesday → confirmed challan totals
Wednesday → confirmed challan totals
...
```

Example:

```json
{
  "Mon": 4500,
  "Tue": 7200,
  "Wed": 5100,
  "Thu": 8900,
  "Fri": 11200,
  "Sat": 12250
}
```

The frontend converts that into your graph.

**Don't build fake graph values.**

---

# 9. Stock Health

Your screenshot shows:

```text
Healthy Inventory Ratio
88%
```

Calculate it.

For example:

```text
Total products = 100
Healthy products = 88
Low-stock products = 12

Health = 88%
```

Formula:

```text
healthyInventoryRatio =
(healthyProducts / totalProducts) × 100
```

If there are no products:

```text
No inventory data
```

rather than:

```text
88%
```

---

# 10. Recent Challans

Your screenshot:

```text
RECENT ACTIVITY

Recent Challans

CH-240111-DEF
XYZ Wholesale Traders
₹3,000
CONFIRMED
```

This should be:

```http
GET /api/v1/challans?limit=5
```

ordered by:

```text
createdAt DESC
```

So every new challan automatically appears here.

---

# 11. Low Stock Warnings

Your screenshot:

```text
ACTION REQUIRED

Low Stock Warnings

USB Type-C Hub
15 left
Min: 30
```

This should query products where:

```text
currentStock <= minimumStock
```

Clicking:

```text
Manage Stock →
```

should navigate to:

```text
Product Inventory
```

with the low-stock products visible.

---

# 12. SALES ROLE DASHBOARD

Sales should **not see the same Admin dashboard**.

Their dashboard should focus on:

```text
Sales Dashboard
```

### Cards

```text
Today's Confirmed Sales
Pending Challans
Active Leads
Follow-ups Due
```

Then:

```text
Recent Challans
Recent Customers
Follow-ups
```

Sales should have:

```text
Customer CRM
Sales Challans
```

and preferably **read-only product availability** so they can select products while creating a challan.

---

# 13. SALES — CUSTOMER CRM

Your second screenshot is already a good structure.

```text
Customer CRM

+ Add Customer

Search Clients
Filter by Status
```

Table:

```text
CUSTOMER
CONTACT INFO
TYPE
GSTIN
STATUS
ACTIONS
```

But you need to make the actual fields match the PRD.

The PRD requires:

```text
Customer Name
Mobile
Email
Business Name
GST Number
Customer Type
Address
Status
Follow-up Date
Notes
```



---

# 14. ADD CUSTOMER FLOW

When Sales/Admin clicks:

**+ Add Customer**

open:

```text
Add Customer
────────────────────────

Customer Name *
Mobile Number *
Email
Business Name *
GST Number

Customer Type *
[ Retail ▼ ]

Address *

Status *
[ Lead ▼ ]

Follow-up Date

Notes

[Cancel] [Create Customer]
```

When clicking **Create Customer**:

```text
React
 ↓
POST /api/v1/customers
 ↓
Validation
 ↓
Customer Service
 ↓
Prisma
 ↓
PostgreSQL
 ↓
201 Created
 ↓
Refresh customer list
```

No mock data.

---

# 15. Customer Details

Clicking a customer should open:

```text
Customer Details
```

### Customer information

```text
ABC Retail Store

Business Name
ABC Enterprises

Mobile
9876543210

Email
abc@retail.com

GST
18AABCT1234F1Z5

Type
Retail

Status
Active

Address
...
```

Then:

```text
CRM Follow-ups

Follow-up Date
Notes
Created By
Created At
```

This satisfies the required customer detail and follow-up functionality. 

---

# 16. PRODUCT INVENTORY

Your third screenshot is also correct structurally.

```text
Product Inventory

+ Add Product
```

Search:

```text
Search by product name, SKU, or model
```

Filter:

```text
Category
```

Table:

```text
Product Details
SKU
Category
Unit Price
Stock Level
Location
Actions
```

The PRD requires these product fields. 

---

# 17. ADD PRODUCT

Click:

**+ Add Product**

Form:

```text
Product Name *
SKU / Code *
Category *
Unit Price *
Current Stock *
Minimum Stock Alert Quantity *
Location / Warehouse *

[Cancel] [Create Product]
```

When submitted:

```text
POST /api/v1/products
```

Database:

```text
products
```

Then the inventory table automatically updates.

---

# 18. VERY IMPORTANT — STOCK SHOULD NOT BE JUST AN EDITABLE NUMBER

You need actual stock movement logic.

Example:

```text
USB Hub
Current Stock = 15
```

Warehouse receives 50.

Instead of blindly changing:

```text
15 → 65
```

create a movement:

```text
Product: USB Hub
Quantity: 50
Type: IN
Reason: Purchase/Restock
Created By: Warehouse User
Timestamp: 11 Aug 2026 18:10
```

Then:

```text
15 + 50 = 65
```

The PRD explicitly requires the stock movement log to record product, quantity, IN/OUT type, reason, creator and timestamp. 

---

# 19. WAREHOUSE PORTAL

Warehouse should focus on:

```text
Warehouse Dashboard
│
├── Inventory
├── Stock Movements
└── Challans
```

Dashboard cards:

```text
Total Products
Low Stock Items
Today's IN
Today's OUT
```

Then:

```text
Low Stock Products
Recent Stock Movements
```

Warehouse can create:

### Stock IN

```text
Product
Quantity
Reason
```

Example:

```text
Product: HDMI Cable
Quantity: 100
Reason: New Purchase
```

System:

```text
Current Stock
180

+

100

=

280
```

and creates:

```text
Stock Movement
IN
+100
```

---

# 20. WAREHOUSE — STOCK OUT

Stock OUT should happen primarily through the **confirmed Sales Challan business flow**.

The important PRD rule is:

```text
Draft Challan
     ↓
NO stock change

Confirmed Challan
     ↓
Check stock
     ↓
Reduce stock
     ↓
Create OUT movement
```

The case study explicitly requires stock deduction on confirmation and prohibits negative stock. 

---

# 21. SALES CHALLANS

Your fourth screenshot:

```text
Sales Challans

+ New Sales Challan
```

is exactly the right main structure.

Table:

```text
Challan No.
Customer
Items Qty
Status
Created By
Date Issued
Actions
```

The PRD requires these challan fields and statuses. 

---

# 22. NEW SALES CHALLAN FLOW

This is the most important workflow.

Click:

**+ New Sales Challan**

### Step 1 — Customer

```text
Select Customer
[ ABC Retail Store ▼ ]
```

### Step 2 — Products

```text
Add Product

Product              Qty       Price
────────────────────────────────────
USB Keyboard          5        ₹800
HDMI Cable           10       ₹150

+ Add Product
```

### Step 3

System automatically calculates:

```text
Total Quantity: 15
```

### Step 4

System generates:

```text
CH-20260811-0001
```

### Step 5

User chooses:

```text
Save Draft
```

or

```text
Confirm Challan
```

The PRD explicitly requires customer selection, multiple products, quantities, automatic challan number generation, and Draft/Confirmed handling. 

---

# 23. DRAFT CHALLAN

If Sales clicks:

**Save Draft**

database:

```text
challan.status = DRAFT
```

Stock:

```text
UNCHANGED
```

Example:

```text
USB Keyboard
Stock = 40

Draft quantity = 5

Stock remains:

40
```

This is extremely important.

---

# 24. CONFIRM CHALLAN

When user clicks:

**Confirm**

backend performs:

```text
BEGIN TRANSACTION
        ↓
Check all products
        ↓
Check available stock
        ↓
Enough?
   ↓          ↓
 YES         NO
 ↓            ↓
Deduct       ROLLBACK
stock        ↓
 ↓           Error
Create
OUT movements
 ↓
Save product snapshots
 ↓
Mark challan CONFIRMED
 ↓
COMMIT
```

This should happen **in the backend**, not React.

---

# 25. PRODUCT SNAPSHOT

This is another very important PRD requirement.

Suppose today:

```text
USB Keyboard
SKU: SKU-002-UK
Price: ₹800
```

Customer buys 5.

Challan stores:

```text
product_id: xyz
product_name_snapshot: USB Keyboard
sku_snapshot: SKU-002-UK
unit_price_snapshot: 800
quantity: 5
```

Later you change:

```text
USB Keyboard
Price: ₹900
```

Old challan must still show:

```text
₹800
```

The case study explicitly says the challan must store product snapshot data rather than relying only on product ID. 

---

# 26. ACCOUNTS PORTAL

This needs to be handled carefully.

The case study mentions invoices in the **business context**, but the required core modules do **not** define an invoice module. 

Therefore, **do not waste your 48-hour implementation time building a complete invoicing system.**

Instead, Accounts can have:

```text
Accounts Dashboard
```

showing data already generated by the system:

```text
Today's Confirmed Sales
This Week's Sales
Confirmed Challans
Cancelled Challans
Pending/Draft Challans
```

And:

```text
Sales Challans
```

as read-only.

This gives the Accounts role meaningful access without inventing a whole new accounting module.

---

# 27. ROLE-BASED DASHBOARD SUMMARY

I would therefore make the dashboards:

### ADMIN

```text
Operations Dashboard

Today's Sales
Stock Alerts
Pending Challans
Follow-ups Due

Weekly Sales Trend
Stock Health

Recent Challans
Low Stock Warnings
```

### SALES

```text
Sales Dashboard

Today's Sales
My Challans
Pending Challans
Follow-ups Due

Recent Customers
Recent Challans
Upcoming Follow-ups
```

### WAREHOUSE

```text
Warehouse Dashboard

Total Products
Low Stock
Today's Stock IN
Today's Stock OUT

Low Stock Products
Recent Stock Movements
```

### ACCOUNTS

```text
Accounts Dashboard

Today's Confirmed Sales
Weekly Sales
Confirmed Challans
Pending Challans

Recent Confirmed Challans
Sales Summary
```

---

# 28. ADMIN — USER MANAGEMENT

Because you want **actual platform-created users instead of mock users**, Admin should have:

```text
Administration
    ↓
Users
```

Table:

```text
Name
Email
Role
Status
Created At
Actions
```

Example:

```text
Sujith
admin@company.com
ADMIN
ACTIVE

Rahul
sales@company.com
SALES
ACTIVE

Kiran
warehouse@company.com
WAREHOUSE
ACTIVE

Anil
accounts@company.com
ACCOUNTS
ACTIVE
```

Admin can:

```text
+ Add User
```

Form:

```text
Name
Email
Password
Role
Status

[Create User]
```

Password should be hashed with bcrypt.

---

# 29. HOW THE DATA CREATION SHOULD WORK

This is the part you specifically asked about.

The platform should follow this lifecycle:

```text
                ADMIN
                  │
          Create platform users
                  │
       ┌──────────┼──────────┐
       ↓          ↓          ↓
     SALES     WAREHOUSE   ACCOUNTS
       │          │
       │          │
       ↓          ↓
   Customers    Products
       │          │
       │          ↓
       │     Stock IN
       │          │
       ↓          ↓
   Challan ← Product
       │       Inventory
       │
       ↓
     DRAFT
       │
       ↓
   CONFIRM
       │
       ↓
 Stock validation
       │
       ↓
 Stock deduction
       │
       ↓
 Stock OUT
       │
       ↓
 CONFIRMED
```

**Every arrow represents actual database operations.**

---

# 30. INITIAL DATA — WHAT SHOULD EXIST BEFORE THE USER STARTS?

If you truly want **zero mock business data**, then don't preload:

```text
ABC Retail Store
XYZ Wholesale
USB Hub
HDMI Cable
Fake Challans
Fake Sales
```

Instead, the initial database contains only what is necessary to bootstrap the system.

### Option A — Bootstrap Admin

During deployment:

```bash
npm run db:seed
```

creates only:

```text
Admin account
```

Then Admin logs in and creates:

```text
Sales user
Warehouse user
Accounts user
```

Then those users create:

```text
Customers
Products
Stock movements
Challans
```

This is the cleanest approach for your requirement.

The case study does require test login credentials for all four roles in the submission, so you need a way to provision those accounts. 

---

# 31. BUT HOW WILL YOU DEMO IT?

This is where you can still demonstrate the entire system without mock data.

Before recording/submitting:

### Login as Admin

Create:

```text
Sales User
Warehouse User
Accounts User
```

### Login as Warehouse

Create:

```text
USB Keyboard
HDMI Cable
Wireless Mouse
USB Type-C Hub
```

Add actual inventory through:

```text
Stock IN
```

### Login as Sales

Create:

```text
ABC Retail Store
XYZ Wholesale Traders
```

Then:

```text
Create Challan
      ↓
Save Draft
      ↓
Show stock unchanged
      ↓
Confirm
      ↓
Show stock reduced
```

Now your dashboard automatically becomes populated.

**That is much stronger than hardcoded mock data.**

---

# 32. DATABASE SHOULD BE THE SINGLE SOURCE OF TRUTH

Your data model should roughly be:

```text
users
│
├── id
├── name
├── email
├── password_hash
├── role
└── status


customers
│
├── id
├── name
├── mobile
├── email
├── business_name
├── gst_number
├── customer_type
├── address
├── status
├── follow_up_date
├── notes
└── created_by


follow_ups
│
├── id
├── customer_id
├── follow_up_date
├── notes
├── created_by
└── created_at


products
│
├── id
├── name
├── sku
├── category
├── unit_price
├── current_stock
├── minimum_stock
└── location


stock_movements
│
├── id
├── product_id
├── quantity
├── movement_type
├── reason
├── created_by
└── created_at


challans
│
├── id
├── challan_number
├── customer_id
├── total_quantity
├── status
├── created_by
└── created_at


challan_items
│
├── id
├── challan_id
├── product_id
├── product_name_snapshot
├── sku_snapshot
├── unit_price_snapshot
└── quantity
```

---

# 33. DASHBOARD SHOULD NEVER HAVE ITS OWN FAKE DATA

For example:

### Bad

```tsx
const stockAlerts = 1;
const today'sSales = 12250;
const pendingChallans = 0;
```

### Correct

```tsx
const { data } = useDashboardSummary();
```

Backend:

```text
GET /api/v1/dashboard/summary
```

Database queries calculate:

```text
todaySales
stockAlerts
pendingChallans
followUpsDue
weeklySales
inventoryHealth
recentChallans
lowStockProducts
```

Then React simply displays the returned values.

---

# 34. GLOBAL SEARCH IN YOUR SCREENSHOT

Your top bar:

```text
Global search across CRM, inventory, challans...
```

should also be real.

For example, searching:

```text
ABC
```

could return:

```text
CUSTOMER
ABC Retail Store

CHALLAN
CH-20260811-0001

PRODUCT
ABC Adapter
```

API:

```http
GET /api/v1/search?q=ABC
```

But don't over-engineer it. Basic database search across the three required areas is enough.

---

# 35. API STRUCTURE

I would lock the backend like this:

```text
/api/v1

/auth
    POST /login
    GET  /me

/users
    GET    /
    POST   /
    PATCH  /:id

/customers
    GET    /
    POST   /
    GET    /:id
    PATCH  /:id

/customers/:id/follow-ups
    GET    /
    POST   /

/products
    GET    /
    POST   /
    GET    /:id
    PATCH  /:id

/stock
    GET /movements
    POST /movements

/challans
    GET  /
    POST /
    GET  /:id
    PATCH /:id

/challans/:id/confirm
    POST /

/challans/:id/cancel
    POST /

/dashboard
    GET /summary
    GET /sales-trend
    GET /stock-health

/search
    GET /?q=
```

The PRD specifically expects clean REST APIs, validation, status codes, errors, pagination and search/filtering. 

---

# 36. FRONTEND ROUTES

```text
/login

/dashboard

/customers
/customers/new
/customers/:id
/customers/:id/edit

/inventory
/inventory/new
/inventory/:id/edit
/inventory/movements

/challans
/challans/new
/challans/:id

/users
/users/new

/settings
```

Then the frontend checks:

```text
user.role
```

and hides unauthorized navigation.

But **hiding buttons is not security**.

Backend must also check:

```text
JWT
  ↓
Role
  ↓
Permission
  ↓
Controller
```

---

# 37. THE MOST IMPORTANT RULE FOR YOUR IMPLEMENTATION

You should think of the whole application as:

```text
             ┌────────────────────┐
             │      DATABASE      │
             │    PostgreSQL      │
             └─────────┬──────────┘
                       │
                Actual Records
                       │
                       ▼
             ┌────────────────────┐
             │      BACKEND       │
             │ Node + Express     │
             │ Prisma + Zod       │
             └─────────┬──────────┘
                       │
                     REST
                       │
                       ▼
             ┌────────────────────┐
             │      FRONTEND      │
             │ React + TypeScript │
             └────────────────────┘
```

**Not:**

```text
React
  ↓
Hardcoded mock data
```

---

# 38. FINAL SCREEN LIST TO BUILD

Based on your screenshots and the PRD, I would lock the UI to:

### Authentication

```text
1. Login
```

### Admin

```text
2. Admin Dashboard
3. Customer CRM
4. Customer Details
5. Add/Edit Customer
6. Product Inventory
7. Add/Edit Product
8. Stock Movements
9. Sales Challans
10. New Challan
11. Challan Details
12. Users
```

### Sales

```text
13. Sales Dashboard
14. Customer CRM
15. Customer Details
16. New Sales Challan
17. Challan Details
18. Product Selection
```

### Warehouse

```text
19. Warehouse Dashboard
20. Product Inventory
21. Stock Movements
22. Stock IN
23. Product Details
24. Challans — Read Only
```

### Accounts

```text
25. Accounts Dashboard
26. Sales Challans — Read Only
27. Sales Summary
```

You **do not need 27 completely different designs**. Many are variations of the same reusable pages.

---

# 39. What I would NOT add

Because the assignment is only **48 hours**, don't turn this into a huge ERP.

The case study explicitly says the goal is not to build a huge system, but to demonstrate full-stack development, APIs, database design, UI, deployment and business flow. 

So avoid:

```text
❌ AI chatbot
❌ Payments
❌ Full accounting system
❌ Complex invoicing
❌ GST filing
❌ Purchase order module
❌ Redis
❌ Microservices
❌ Kubernetes
❌ Complex analytics
❌ Notification infrastructure
❌ AWS S3 initially
```

Focus on:

```text
✅ Authentication
✅ RBAC
✅ CRM
✅ Inventory
✅ Stock movements
✅ Challans
✅ Stock deduction
✅ Product snapshots
✅ Dashboard
✅ PostgreSQL
✅ REST API
✅ Validation
✅ Deployment
```

Docker is explicitly listed as a bonus, while Vercel/Render/Neon are acceptable free deployment choices.  

---

# 40. FINAL IMPLEMENTATION PRINCIPLE

The four screenshots you created should be treated as the **UI reference**, not as a source of static data.

The actual behavior should be:

```text
                    ADMIN
                      │
                Creates Users
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
        SALES      WAREHOUSE    ACCOUNTS
          │           │
          ▼           ▼
      Customers    Products
          │           │
          │        Stock IN
          │           │
          ▼           ▼
       Challan ─── Inventory
          │
       DRAFT
          │
       CONFIRM
          │
          ▼
   Validate Stock
          │
    ┌─────┴─────┐
    │           │
 Insufficient   Enough
    │           │
  Error      Deduct Stock
                │
          Create OUT Movement
                │
          Mark CONFIRMED
                │
                ▼
           DASHBOARD
                │
      ┌─────────┼─────────┐
      ▼         ▼         ▼
   Sales     Inventory   CRM
   Trend      Health    Follow-ups
```

That gives you a **real ERP/CRM workflow**, rather than a frontend that merely looks like an ERP.

And most importantly, **when the evaluator creates a customer/product/challan themselves, the data should immediately appear everywhere it is relevant**—CRM table, inventory, stock movements, challans, dashboard cards, charts and alerts. That's the behavior that will make the project feel genuinely built rather than mocked.
