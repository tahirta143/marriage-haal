# 💒 ShaadiPro — Complete Marriage Hall & Event Management Platform

ShaadiPro is an end-to-end Marriage Hall Booking, Custom Event Planning, and Operations Management Platform built with **Next.js 14**, **Node.js Express**, and **MySQL**.

---

## 🏛️ System Architecture

```
ShaadiPro System Architecture
├── client/                     # Next.js 14 Frontend Application
│   ├── app/                    # App Router Routes & Pages
│   │   ├── my-bookings/        # Standalone Customer Portal
│   │   ├── dashboard/          # Operations & Admin Suite
│   │   ├── categories/         # Vendor Directories
│   │   └── venues/             # Marriage Halls Directory
│   ├── components/             # Reusable UI Components
│   └── lib/                    # Auth Context, API Client & RBAC Guards
│
└── server/                     # Node.js Express Backend API
    ├── config/                 # DB Connection & Nodemailer Config
    ├── controllers/            # Auth, Bookings, Payments, Jobs, RBAC Controllers
    ├── middleware/             # Auth JWT Interceptor & Granular Permission Guard
    ├── database/               # MySQL Schema & Seed Scripts
    └── routes/                 # Express API Endpoint Routes
```

---

## 🔑 User Roles & Permissions

1. **Super Owner (`owner@shaadipro.com`)**:
   * **Full Control**: Executive Reports, Hall Management, Package Pricing, Vendor Approvals, Financial Ledger & RBAC Permissions.

2. **Customer (`Customer Role`)**:
   * **Customer Portal (`/my-bookings`)**: Create Custom Event Inquiries, View Reservations, Track Package Costs, and Print Invoices.

3. **Booking Manager (`manager@shaadipro.com`)**:
   * Manage Reservation Inquiries, Confirm Hall Slots, Record Token/Final Payments.

4. **Partnered Vendor (`vendor@shaadipro.com`)**:
   * View Assigned Line Item Tasks (*Decor, Catering, Photography*) in Task Assignments Desk (`/dashboard/my-jobs`).

---

## 🚀 Running the Project Locally

### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev
# Server running at http://localhost:5000
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
# Client running at http://localhost:3000
```
