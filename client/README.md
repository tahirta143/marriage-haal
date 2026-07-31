# 💒 ShaadiPro Client Frontend Application

Modern Next.js 14 (App Router) Marriage Hall Booking & Event Operations Marketplace Frontend.

---

## 📁 Directory & Architecture Structure

```
client/
├── app/                        # Next.js 14 App Router Pages
│   ├── page.jsx                # Public Landing Page with Hero & Featured Venues
│   ├── layout.jsx              # Global App Layout & Provider Setup
│   ├── globals.css             # Vanilla CSS Design System & Theme Utilities
│   │
│   ├── my-bookings/            # 👑 Dedicated Customer Portal
│   │   └── page.jsx            # Customer Reservations, Invoice Bills & Status
│   │
│   ├── categories/             # Vendor Service Directories
│   │   ├── page.jsx            # Category Cards Grid (Catering, Decor, Photographers)
│   │   └── [slug]/             # Filterable Category Marketplace View
│   │
│   ├── venues/                 # Marriage Halls Directory
│   │   └── page.jsx            # Ballrooms, Marquees, Lawns & Capacity Filters
│   │
│   ├── events/                 # Event Function Packages
│   │   └── [slug]/             # Baraat, Walima & Mehndi Package Explorer
│   │
│   ├── login/                  # Role-Based Authentication Desk
│   │   └── page.jsx            # Demo Role Selector & Password Login
│   │
│   └── dashboard/              # 🏛️ Unified Management Suite Layout
│       ├── layout.jsx          # Operation Suite Sidebar & Live Search Top Header
│       ├── home/               # Executive Overview Metrics & Chart Desk
│       ├── book-event/         # Interactive Event Customizer & Budget Builder
│       ├── bookings/           # Reservation Desk & Invoice Generator
│       ├── calendar/           # Interactive Event Schedule Calendar
│       ├── payments/           # Financial Ledger & Payment Transactions
│       ├── vendors/            # Partnered Vendor Accounts Management
│       ├── halls/              # Hall Venue Slot Management
│       ├── categories/         # Service Categories & Pricing Rules
│       ├── events/             # Event Function Master Configurations
│       ├── my-jobs/            # Staff & Vendor Task Assignment Desk
│       ├── users/              # User Accounts Management
│       └── settings/groups/    # Granular RBAC Permission Group Settings
│
├── components/                 # Shared Reusable UI Components
│   ├── MarketplaceHeader.jsx   # Top Header, Live Search & Profile Dropdown
│   └── OtpAuthModal.jsx        # OTP Verification & Quick Login Modal
│
└── lib/                        # Core Utilities & State Context
    ├── api.js                  # Axios Client with Auto JWT Bearer Interceptor
    ├── auth.js                 # React AuthContext Provider & Token State
    └── permissions.js          # Permission Constants & <Can /> Guard Component
```

---

## 🔑 Key Portals

1. **Public Marketplace (`/`)**:
   * Browse venues, vendor categories (*Makeup, Photographers, Catering, Stage Decor*), and event functions.
   * Press `Ctrl + K` or use the search bar for instant live search.

2. **Standalone Customer Portal (`/my-bookings`)**:
   * Clean view for customers to track their reserved events, guest counts, total package prices, and printable invoices.

3. **Operations & Admin Suite (`/dashboard`)**:
   * Protected management suite for Owners, Managers, Staff, and Vendors to manage bookings, payments, schedules, and RBAC permissions.
