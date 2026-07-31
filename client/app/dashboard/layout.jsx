'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
} from 'lucide-react';

const DASHBOARD_SEARCH_ITEMS = [
  { title: 'Dashboard Overview', desc: 'Main management desk & activity metrics', href: '/dashboard/home', category: 'Page' },
  { title: 'Event Customizer & Booking', desc: 'Custom package builder & budget planner', href: '/dashboard/book-event', category: 'Tool' },
  { title: 'Bookings & Inquiries', desc: 'Manage customer bookings & venue quotes', href: '/dashboard/bookings', category: 'Management' },
  { title: 'Calendar & Event Schedule', desc: 'Event timelines, baraat dates & booking schedule', href: '/dashboard/calendar', category: 'Schedule' },
  { title: 'Payments & Escrow', desc: 'Transaction history, vendor payouts & receipts', href: '/dashboard/payments', category: 'Finance' },
  { title: 'Vendor Categories', desc: 'Explore catering, decor, makeup & photography vendors', href: '/categories', category: 'Directory' },
  { title: 'Wedding Venues', desc: 'Browse ballrooms, marquees, lawns & farmhouses', href: '/venues', category: 'Directory' },
  { title: 'Vendor Management', desc: 'Manage registered vendor accounts & approval statuses', href: '/dashboard/vendors', category: 'Admin' },
  { title: 'User Roles & Groups', desc: 'Manage permission groups & staff access', href: '/dashboard/settings/groups', category: 'Admin' },
];

export default function UnifiedDashboardLayout({ children }) {
  const { user, permissions = [], logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success && res.data.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.warn('Failed to load live notifications:', err.message);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (_) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const filteredDashboardItems = headerSearch.trim()
    ? DASHBOARD_SEARCH_ITEMS.filter((item) => {
        const q = headerSearch.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      })
    : [];

  const handleDashboardSearchSubmit = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      if (filteredDashboardItems.length > 0) {
        router.push(filteredDashboardItems[0].href);
      } else {
        router.push(`/categories?search=${encodeURIComponent(headerSearch.trim())}`);
      }
      setHeaderSearch('');
      setSearchFocused(false);
    }
  };

  // Global Keyboard Shortcut: Ctrl + K (or Cmd + K) focuses search input
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setSearchFocused(true);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user dropdown and search popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.role === 'customer' && pathname.startsWith('/dashboard') && pathname !== '/dashboard/book-event') {
      router.push('/my-bookings');
    }
  }, [user, pathname, router]);

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

  const isCustomer = user?.role === 'customer';

  const NAV_ITEMS = isCustomer
    ? [
        {
          label: 'My Event Bookings',
          href: '/dashboard/my-bookings',
          icon: Calendar,
        },
        /*
        {
          label: 'Event Customizer',
          href: '/dashboard/book-event',
          icon: HeartHandshake,
        },
        */
      ]
    : [
        {
          label: 'Home',
          href: '/dashboard/home',
          icon: Home,
          permission: null,
        },
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          permission: PERMISSIONS.REPORT_VIEW,
        },
        /*
        {
          label: 'Event Customizer',
          href: '/dashboard/book-event',
          icon: HeartHandshake,
          permission: PERMISSIONS.BOOKING_CREATE,
        },
        */
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

  const isOwner = user?.role === 'owner';
  const visibleNavItems = isOwner || isCustomer
    ? NAV_ITEMS
    : NAV_ITEMS.filter(
        (item) => !item.permission || permissions.includes(item.permission)
      );

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-[#111827] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E7EB] z-40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#FAF5F7] text-[#AA336A]">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-serif-title font-extrabold text-base text-[#AA336A]">Shaadi</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Unified Desktop Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Branding */}
          <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-2xl bg-[#FAF5F7] text-[#AA336A] border border-[#F0D5E2] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif-title font-extrabold text-lg text-[#AA336A] block leading-tight">
                  Shaadi
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#705562] block">
                  Management Suite
                </span>
              </div>
            </Link>
          </div>

          {/* User Badge */}
          <div className="p-4 bg-gray-50 border-b border-[#E5E7EB] flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#AA336A] text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#AA336A]/10 text-[#AA336A]">
                {user.role || 'Super Admin'}
              </span>
            </div>
          </div>

          {/* Dynamic Navigation Menu */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              Navigation Menu
            </div>
            <nav className="space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#AA336A] text-white shadow-md shadow-[#AA336A]/20'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar Workspace Header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between gap-4 flex-shrink-0 z-30">
          {/* Workspace Title & Live Search Bar */}
          <div className="flex items-center gap-4 flex-1 max-w-lg" ref={searchBoxRef}>
            <form onSubmit={handleDashboardSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={headerSearch}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setHeaderSearch(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Search pages, tools, settings..."
                className="w-full pl-9 pr-14 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#AA336A]/40"
              />
              {headerSearch ? (
                <button
                  type="button"
                  onClick={() => setHeaderSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                  Ctrl K
                </span>
              )}

              {/* Live Search Results Popover Dropdown */}
              {searchFocused && headerSearch.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 p-2 space-y-1 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pt-1 block">
                    Matching Pages & Services ({filteredDashboardItems.length}):
                  </span>
                  {filteredDashboardItems.length > 0 ? (
                    filteredDashboardItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          setHeaderSearch('');
                          setSearchFocused(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF5F7] border border-transparent hover:border-[#F0D5E2] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-[#AA336A]/10 text-[#AA336A]">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-900 group-hover:text-[#AA336A]">
                              {item.title}
                            </span>
                            <span className="block text-[10px] text-gray-500 font-medium">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          {item.category}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500 font-medium">
                      Press <strong className="text-[#AA336A]">Enter</strong> to search categories for "{headerSearch}".
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right Header Area: Notifications & User Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Notification Bell with Badge & Interactive Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.is_read) && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white animate-pulse">
                    {notifications.filter((n) => !n.is_read).length}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#AA336A]" />
                      Booking Notifications
                    </span>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[10px] font-bold text-[#AA336A] hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.link || '/dashboard/bookings'}
                          onClick={() => setNotifOpen(false)}
                          className={`block p-2.5 rounded-xl border text-xs transition-colors ${
                            !n.is_read
                              ? 'bg-[#FAF5F7] border-[#F0D5E2] font-bold'
                              : 'bg-white border-gray-100 font-medium text-gray-600'
                          }`}
                        >
                          <span className="block text-xs font-bold text-gray-900 mb-0.5">
                            {n.title}
                          </span>
                          <span className="block text-[11px] text-gray-600 leading-snug">
                            {n.message}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-400">
                        No notifications yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Badge Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-[#111827] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#AA336A] text-white flex items-center justify-center font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block text-xs font-extrabold text-[#111827] leading-none mb-0.5">
                    {user.name}
                  </span>
                  <span className="block text-[10px] font-semibold text-gray-500 leading-none">
                    {user.role || 'Administrator'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    userDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Dropdown Menu Popover */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Top User Card Section */}
                  <div className="px-3.5 py-3 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-xs font-extrabold text-[#111827] truncate">{user.name}</p>
                    <p className="text-[11px] font-semibold text-[#AA336A] truncate">
                      {user.email || user.username || user.phone || 'Authorized User'}
                    </p>
                  </div>

                  <div className="my-1 border-t border-gray-100" />

                  {/* Menu Options */}
                  <Link
                    href="/dashboard/home"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#AA336A] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#AA336A]" />
                    <span>Profile & Account</span>
                  </Link>

                  <Link
                    href="/dashboard/settings/groups"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#AA336A] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#AA336A]" />
                    <span>Settings & Security</span>
                  </Link>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Workspace Content (Independent Scroll) */}
        <main className="flex-1 h-full overflow-y-auto p-6 md:p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
