'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MarketplaceHeader from '../../components/MarketplaceHeader';
import OtpAuthModal from '../../components/OtpAuthModal';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import {
  Calendar,
  Sparkles,
  PlusCircle,
  Clock,
  Building2,
  Users,
  DollarSign,
  FileText,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function StandaloneCustomerMyBookingsPage() {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      if (res.data.success) {
        setMyBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load customer bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'tentative':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'inquiry':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F7] text-[#22131A] flex flex-col font-sans">
      <MarketplaceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Customer Welcome Header */}
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#AA336A] via-[#8E2656] to-[#601A3E] text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Customer Account & Reservations
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-serif-title tracking-tight">
                {user ? `Welcome back, ${user.name}!` : 'My Event Reservations'}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm mt-2 font-medium max-w-xl">
                View your active venue inquiries, guest capacity estimates, custom catering packages, and status updates.
              </p>
            </div>

            <Link
              href="/dashboard/book-event"
              className="px-6 py-3.5 rounded-2xl bg-white text-[#AA336A] font-extrabold text-xs uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4 text-[#AA336A]" />
              Build Custom Package
            </Link>
          </div>
        </div>

        {/* Guest vs Logged In View */}
        {!user ? (
          <div className="bg-white rounded-3xl border border-[#F0D5E2] p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF5F7] text-[#AA336A] mx-auto flex items-center justify-center">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#22131A] font-serif-title">
                Sign In to View Your Bookings
              </h3>
              <p className="text-xs text-[#705562] mt-1 font-medium max-w-md mx-auto">
                Please log in using your registered phone number or email address to access your event reservations and invoices.
              </p>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs uppercase tracking-wider shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              Log In with OTP / Password
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#22131A] font-serif-title flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#AA336A]" />
                My Event Reservations ({myBookings.length})
              </h2>
              <span className="text-xs text-[#705562] font-semibold">
                Updated Real-Time
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-[#705562] bg-white rounded-3xl border border-[#F0D5E2]">
                Loading your reserved events...
              </div>
            ) : myBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl border border-[#F0D5E2] p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-[#FAF5F7] text-[#AA336A] font-mono font-extrabold text-xs border border-[#F0D5E2]">
                          #{b.id}
                        </span>
                        <span className="font-serif-title font-bold text-base text-[#22131A] capitalize">
                          {b.event_type || 'Wedding Event'}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs text-[#604453]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#705562] font-medium flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#AA336A]" />
                          Venue Location:
                        </span>
                        <span className="font-bold text-[#22131A]">{b.hall_name || 'ShaadiPro Main Hall'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#705562] font-medium flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#AA336A]" />
                          Reservation Date:
                        </span>
                        <span className="font-bold text-[#22131A]">
                          {b.event_date ? String(b.event_date).split('T')[0] : '2026-10-24'} ({b.slot || 'Night'} Slot)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#705562] font-medium flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#AA336A]" />
                          Guest Capacity:
                        </span>
                        <span className="font-bold text-[#22131A]">{b.guest_count_estimated || 300} Guests</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#FAF5F7]">
                        <span className="text-[#705562] font-medium flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-[#AA336A]" />
                          Package Total:
                        </span>
                        <span className="font-mono font-extrabold text-sm text-[#AA336A]">
                          PKR {Number(b.total_amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/dashboard/bookings/${b.id}`}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FAF5F7] hover:bg-[#AA336A] hover:text-white border border-[#F0D5E2] text-[#AA336A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Printable Invoice & Ledger
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#F0D5E2] p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF5F7] text-[#AA336A] mx-auto flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#22131A] font-serif-title">
                    No Reservations Yet
                  </h3>
                  <p className="text-xs text-[#705562] mt-1 font-medium max-w-sm mx-auto">
                    You don't have any event reservations currently. Use our Event Customizer to create your first package inquiry!
                  </p>
                </div>
                <Link
                  href="/dashboard/book-event"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  Customize Event Package
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      <OtpAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <footer className="py-8 bg-white border-t border-[#F0D5E2] text-center text-xs text-[#705562] font-medium">
        Shaadi &copy; 2026 • Unified Event & Venue Operations Suite
      </footer>
    </div>
  );
}
