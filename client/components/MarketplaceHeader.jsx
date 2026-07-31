'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import OtpAuthModal from './OtpAuthModal';
import {
  Sparkles,
  MapPin,
  User,
  LogOut,
  Building2,
  Calendar,
  Grid,
  ChevronDown,
  Search,
  Phone,
  ShieldCheck,
  X,
  ArrowRight,
  Bell,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
];

const ALL_SEARCHABLE_ITEMS = [
  { title: 'Bridal Makeup Artists', category: 'Category', href: '/categories/bridal-makeup', tags: ['makeup', 'bridal', 'glam', 'airbrush', 'hair', 'artist', 'salon'] },
  { title: 'Photographers & Videographers', category: 'Category', href: '/categories/photographers', tags: ['photo', 'photographer', 'camera', 'video', 'dslr', 'drone', 'shoot'] },
  { title: 'Food & Catering Services', category: 'Category', href: '/categories/catering', tags: ['food', 'catering', 'karahi', 'biryani', 'bbq', 'buffet', 'chef', 'mutton'] },
  { title: 'Stage & Theme Decorators', category: 'Category', href: '/categories/decor', tags: ['decor', 'stage', 'floral', 'flower', 'lighting', 'canopy', 'mughal'] },
  { title: 'Henna & Mehndi Artists', category: 'Category', href: '/categories/henna-artists', tags: ['henna', 'mehndi', 'dholki', 'mayo', 'organic', 'hand'] },
  { title: 'Luxury Wedding Car Rental', category: 'Category', href: '/categories/car-rental', tags: ['car', 'rental', 'mercedes', 'vintage', 'limousine', 'chauffeur'] },
  { title: 'Invitation Cards & Stationery', category: 'Category', href: '/categories/stationery', tags: ['cards', 'invitation', 'stationery', 'foil', 'acrylic', 'whatsapp'] },
  { title: 'DJ & Concert Sound Systems', category: 'Category', href: '/categories/dj-sound-system', tags: ['dj', 'sound', 'music', 'lights', 'qawali', 'speakers'] },
  { title: 'Grand Ballrooms & Wedding Halls', category: 'Venue', href: '/venues/ballroom', tags: ['venue', 'hall', 'ballroom', 'indoor'] },
  { title: 'Royal Wedding Marquees', category: 'Venue', href: '/venues/marquee', tags: ['venue', 'marquee', 'outdoor', 'carpeted'] },
  { title: 'Open Wedding Lawns & Gardens', category: 'Venue', href: '/venues/lawn', tags: ['lawn', 'garden', 'outdoor', 'fairy lights'] },
  { title: 'Luxury Estate Farmhouses', category: 'Venue', href: '/venues/farmhouse', tags: ['farmhouse', 'pool', 'estate', 'private'] },
];

export default function MarketplaceHeader({ selectedCity, onSelectCity }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const liveResults = searchQuery.trim()
    ? ALL_SEARCHABLE_ITEMS.filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.includes(q))
        );
      })
    : [];

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

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  // Global Keyboard Shortcut: Ctrl + K (or Cmd + K) toggles search popup
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleTagClick = (tag) => {
    router.push(`/categories?search=${encodeURIComponent(tag)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F0D5E2] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & City Picker */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-[#AA336A]/10 border border-[#AA336A]/30 text-[#AA336A] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold font-serif-title tracking-tight text-[#AA336A]">
                  Shaadi
                </span>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-[#705562]">
                  Wedding Marketplace
                </span>
              </div>
            </Link>

            {/* City Dropdown Selector */}
            <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]">
              <MapPin className="w-3.5 h-3.5 text-[#AA336A]" />
              <select
                value={selectedCity || 'Lahore'}
                onChange={(e) => onSelectCity && onSelectCity(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#22131A] focus:outline-none cursor-pointer"
              >
                {PAKISTAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links (Single Row Whitespace Nowrap) */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-[#604453] whitespace-nowrap flex-shrink-0">
            <Link href="/categories" className="hover:text-[#AA336A] transition-colors whitespace-nowrap">
              Categories
            </Link>
            <Link href="/venues" className="hover:text-[#AA336A] transition-colors whitespace-nowrap">
              Venues
            </Link>
            <Link href="/events/barat-planning" className="hover:text-[#AA336A] transition-colors whitespace-nowrap">
              Event Functions
            </Link>
            <Link
              href="/dashboard/book-event"
              className="text-[#AA336A] flex items-center gap-1 font-extrabold whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Event Customizer</span>
            </Link>
          </nav>

          {/* Right Action Area: Search Icon, Notifications & User Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Search Icon Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl bg-[#FAF5F7] hover:bg-[#AA336A]/10 border border-[#F0D5E2] text-[#22131A] hover:text-[#AA336A] transition-colors flex items-center gap-2 group"
              title="Search Services & Venues (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-[#AA336A]" />
              <span className="hidden sm:inline text-xs font-bold text-[#604453] group-hover:text-[#AA336A]">
                Search
              </span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-[#F0D5E2] rounded text-gray-500 shadow-2xs">
                Ctrl K
              </kbd>
            </button>

            {user ? (
              <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                {/* Notification Bell with Badge & Interactive Popover */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2.5 rounded-xl bg-[#FAF5F7] hover:bg-[#AA336A]/10 border border-[#F0D5E2] text-[#604453] hover:text-[#AA336A] transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.some((n) => !n.is_read) && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#AA336A] text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white animate-pulse">
                        {notifications.filter((n) => !n.is_read).length}
                      </span>
                    )}
                  </button>

                  {/* Notification Drawer Popover */}
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-[#F0D5E2] shadow-2xl z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between border-b border-[#F0D5E2] pb-2">
                        <span className="text-xs font-extrabold text-[#22131A] uppercase tracking-wider flex items-center gap-1.5">
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
                                  ? 'bg-[#FAF5F7] border-[#AA336A]/30 font-bold'
                                  : 'bg-white border-gray-100 font-medium text-gray-600'
                              }`}
                            >
                              <span className="block text-xs font-bold text-[#22131A] mb-0.5">
                                {n.title}
                              </span>
                              <span className="block text-[11px] text-[#705562] leading-snug">
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

                {/* User Badge Trigger with Dropdown Arrow */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#FAF5F7] hover:bg-[#FAF0F4] border border-[#F0D5E2] text-xs font-bold text-[#22131A] transition-all hover:border-[#AA336A]/40"
                >
                  <div className="w-8 h-8 rounded-full bg-[#AA336A] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-xs font-extrabold text-[#22131A] leading-none mb-0.5">
                      {user.name}
                    </span>
                    <span className="block text-[10px] font-semibold text-[#705562] leading-none">
                      {user.role || 'Member'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#705562] transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown Menu Popover */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-[#F0D5E2] shadow-2xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Top Header Section */}
                    <div className="px-3.5 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2]/80">
                      <p className="text-xs font-extrabold text-[#22131A] truncate">{user.name}</p>
                      <p className="text-[11px] font-semibold text-[#AA336A] truncate">
                        {user.phone || user.email || 'Verified Account'}
                      </p>
                    </div>

                    <div className="my-1 border-t border-[#F0D5E2]" />

                    {/* Menu Options */}
                    {user.role !== 'customer' && (
                      <Link
                        href="/dashboard/home"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#22131A] hover:bg-[#FAF5F7] hover:text-[#AA336A] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#AA336A]" />
                        <span>Admin Suite Dashboard</span>
                      </Link>
                    )}

                    <Link
                      href="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#22131A] hover:bg-[#FAF5F7] hover:text-[#AA336A] transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-[#AA336A]" />
                      <span>My Event Reservations</span>
                    </Link>

                    <Link
                      href="/dashboard/book-event"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#22131A] hover:bg-[#FAF5F7] hover:text-[#AA336A] transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-[#AA336A]" />
                      <span>Event Customizer</span>
                    </Link>

                    {user.role !== 'customer' && (
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#22131A] hover:bg-[#FAF5F7] hover:text-[#AA336A] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#AA336A]" />
                        <span>Management Desk</span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-[#F0D5E2]" />

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
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#AA336A]/20 flex items-center gap-2 transition-all"
              >
                <User className="w-4 h-4" />
                <span>Login / Sign Up (OTP)</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Popup Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#F0D5E2] overflow-hidden">
            {/* Search Header */}
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-[#F0D5E2] flex items-center gap-3 bg-[#FAF5F7]">
              <Search className="w-5 h-5 text-[#AA336A] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search makeup artists, photographers, marquees, catering..."
                className="w-full bg-transparent text-sm font-semibold text-[#22131A] placeholder-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            {/* Live Instant Search Results */}
            {searchQuery.trim() ? (
              <div className="p-4 max-h-96 overflow-y-auto space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#705562] block px-2">
                  Matching Results ({liveResults.length}):
                </span>
                {liveResults.length > 0 ? (
                  <div className="space-y-1">
                    {liveResults.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF5F7] hover:bg-[#FAF0F4] border border-[#F0D5E2] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#AA336A]/10 text-[#AA336A]">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-[#22131A] group-hover:text-[#AA336A]">
                              {item.title}
                            </span>
                            <span className="block text-[10px] font-semibold text-[#705562]">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#AA336A] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#705562]">
                    No instant category match for "{searchQuery}". Click <strong>Search</strong> button to query all vendors.
                  </div>
                )}
              </div>
            ) : (
              /* Popular Search Suggestions */
              <div className="p-5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#705562]">
                  Popular Searches:
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Photographers', 'Bridal Makeup', 'Catering', 'Royal Marquee', 'Car Rental', 'Stage Decor'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF5F7] hover:bg-[#AA336A] text-[#22131A] hover:text-white border border-[#F0D5E2] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OTP Login Modal */}
      <OtpAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </>
  );
}
