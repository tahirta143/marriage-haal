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
  Home,
} from 'lucide-react';

export default function UnifiedDashboardLayout({ children }) {
  const { user, permissions = [], logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-white flex items-center justify-center text-[#705562]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#AA336A] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading ShaadiPro workspace...</span>
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
      label: 'Home',
      href: '/dashboard/home',
      icon: Home,
      permission: null,
    },
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
      label: 'Event Functions',
      href: '/dashboard/events',
      icon: Calendar,
      permission: null,
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
      label: 'Access Control',
      href: '/dashboard/settings/groups',
      icon: Lock,
      permission: PERMISSIONS.RBAC_MANAGE,
    },
  ];

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    !item.permission || permissions.includes(item.permission)
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-[#111827] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E7EB] z-40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#AA336A]" />
          <span className="font-bold font-serif-title text-lg text-[#111827]">
            Shaadi<span className="text-[#AA336A]">Pro</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-gray-50 border border-[#E5E7EB] text-gray-600"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Fixed Desktop / Mobile Drawer Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 h-full bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-300 flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className="hidden md:flex items-center gap-2.5 px-6 py-5 border-b border-[#E5E7EB] flex-shrink-0">
            <div className="p-2 rounded-xl bg-[#AA336A]/10 border border-[#AA336A]/25 text-[#AA336A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold font-serif-title tracking-wide text-[#111827]">
                Shaadi<span className="text-[#AA336A]">Pro</span>
              </span>
              <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
                Management Suite
              </p>
            </div>
          </div>

          {/* Scrollable Nav Area */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            {/* User Profile Badge */}
            <div className="p-3 rounded-xl bg-gray-50 border border-[#E5E7EB] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#AA336A] text-white font-bold flex items-center justify-center text-sm uppercase shadow-sm flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[#111827] truncate">{user.name}</div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-[#AA336A] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                  {permissions.length} Active Perms
                </div>
              </div>
            </div>

            {/* Nav Items List */}
            <nav className="space-y-1">
              <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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
                        ? 'bg-[#AA336A] text-white font-bold shadow-md shadow-[#AA336A]/20'
                        : 'text-gray-600 hover:text-[#AA336A] hover:bg-[#FDF2F7]'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Sign Out Button */}
          <div className="p-4 border-t border-[#E5E7EB] flex-shrink-0 bg-white">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-xs font-semibold text-gray-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Independent Scroll) */}
      <main className="flex-1 h-full overflow-y-auto p-6 md:p-8 bg-white">
        {children}
      </main>
    </div>
  );
}
