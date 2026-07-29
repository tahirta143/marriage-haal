'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

export default function MarketplaceHeader({ selectedCity, onSelectCity }) {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
                <span className="text-2xl font-extrabold font-serif-title tracking-tight text-[#22131A]">
                  Shaadi<span className="text-[#AA336A]">Pro</span>
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

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-[#604453]">
            <Link href="/categories" className="hover:text-[#AA336A] transition-colors">
              Vendor Categories
            </Link>
            <Link href="/venues" className="hover:text-[#AA336A] transition-colors">
              Wedding Venues
            </Link>
            <Link href="/events/barat-planning" className="hover:text-[#AA336A] transition-colors">
              Event Functions
            </Link>
            <Link
              href="/dashboard/book-event"
              className="text-[#AA336A] flex items-center gap-1 font-extrabold"
            >
              <Calendar className="w-3.5 h-3.5" />
              Event Customizer
            </Link>
          </nav>

          {/* Auth State & Trigger */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/home"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A] hover:border-[#AA336A] transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#AA336A] text-white flex items-center justify-center font-mono text-xs uppercase">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:text-rose-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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

      {/* OTP Login Modal */}
      <OtpAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </>
  );
}
