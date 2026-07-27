'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { PERMISSIONS } from '../../lib/permissions';
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Building2,
  Package,
  Users,
  Briefcase,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Lock,
  CreditCard,
  BarChart3,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';

export default function UnifiedDashboardLayout({ children }) {
  const { user, permissions = [], logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading RBAC workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  const NAV_ITEMS = [
    {
      label: 'Executive Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      permission: PERMISSIONS.REPORT_VIEW,
    },
    {
      label: 'Event Customizer',
      href: '/dashboard/book-event',
      icon: HeartHandshake,
      permission: PERMISSIONS.BOOKING_CREATE,
    },
    {
      label: 'Booking Calendar',
      href: '/dashboard/calendar',
      icon: Calendar,
      permission: PERMISSIONS.BOOKING_VIEW,
    },
    {
      label: 'Bookings Desk',
      href: '/dashboard/bookings',
      icon: PlusCircle,
      permission: PERMISSIONS.BOOKING_VIEW,
    },
    {
      label: 'Financial Ledger',
      href: '/dashboard/payments',
      icon: CreditCard,
      permission: PERMISSIONS.PAYMENT_VIEW,
    },
    {
      label: 'Executive Reports',
      href: '/dashboard/reports',
      icon: BarChart3,
      permission: PERMISSIONS.REPORT_VIEW,
    },
    {
      label: 'Halls & Slots',
      href: '/dashboard/halls',
      icon: Building2,
      permission: PERMISSIONS.HALL_MANAGE,
    },
    {
      label: 'Categories & Packages',
      href: '/dashboard/categories',
      icon: Package,
      permission: PERMISSIONS.CATEGORY_MANAGE,
    },
    {
      label: 'Vendors & Partners',
      href: '/dashboard/vendors',
      icon: Users,
      permission: PERMISSIONS.VENDOR_MANAGE,
    },
    {
      label: 'Task Assignments',
      href: '/dashboard/my-jobs',
      icon: Briefcase,
      permission: PERMISSIONS.STAFF_VIEW_OWN,
    },
    {
      label: 'User Accounts',
      href: '/dashboard/users',
      icon: UserCheck,
      permission: PERMISSIONS.RBAC_MANAGE,
    },
    {
      label: 'RBAC Groups & Security',
      href: '/dashboard/settings/groups',
      icon: Lock,
      permission: PERMISSIONS.RBAC_MANAGE,
    },
  ];

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    permissions.includes(item.permission)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="font-bold font-serif-title text-lg">ShaadiPro</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2.5 px-6 py-6 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold font-serif-title tracking-wide text-white">
                Shaadi<span className="text-amber-500">Pro</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                RBAC Security Engine
              </p>
            </div>
          </div>

          {/* User Badge */}
          <div className="mx-4 my-4 p-3 rounded-xl glass-card border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-sm uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {permissions.length} Permissions Active
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-3 space-y-1 mt-2">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Authorized Modules
            </div>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:border-red-500/40 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
