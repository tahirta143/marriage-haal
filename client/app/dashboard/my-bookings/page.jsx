'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import {
  Calendar,
  Sparkles,
  PlusCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  FileText,
  DollarSign,
  Building2,
  Users,
  Tag,
  AlertCircle
} from 'lucide-react';

export default function MyBookingsCustomerPage() {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

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
    <div className="space-y-6">
      {/* Customer Header Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#AA336A] via-[#8E2656] to-[#601A3E] text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Customer Event Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-title tracking-tight">
              Welcome back, {user?.name || 'Valued Client'}!
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 font-medium max-w-xl">
              Track your wedding venue reservations, event customized packages, invoice estimates, and payment statuses.
            </p>
          </div>

          <Link
            href="/dashboard/book-event"
            className="px-5 py-3 rounded-2xl bg-white text-[#AA336A] font-extrabold text-xs uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-[#AA336A]" />
            Customize New Event
          </Link>
        </div>
      </div>

      {/* Bookings Overview Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#22131A] font-serif-title flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#AA336A]" />
          My Reserved Events ({myBookings.length})
        </h2>
        <span className="text-xs text-[#705562] font-semibold">
          Real-time Event Status & Ledger
        </span>
      </div>

      {/* Bookings List Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-[#705562] bg-white rounded-2xl border border-[#F0D5E2]">
          Loading your event reservations...
        </div>
      ) : myBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-[#F0D5E2] p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative group"
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

              <div className="space-y-2.5 text-xs text-[#604453]">
                <div className="flex items-center justify-between">
                  <span className="text-[#705562] font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#AA336A]" />
                    Venue Hall:
                  </span>
                  <span className="font-bold text-[#22131A]">{b.hall_name || 'ShaadiPro Main Hall'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#705562] font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#AA336A]" />
                    Event Date:
                  </span>
                  <span className="font-bold text-[#22131A]">
                    {b.event_date ? String(b.event_date).split('T')[0] : '2026-10-24'} ({b.slot || 'Night'} Slot)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#705562] font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#AA336A]" />
                    Estimated Capacity:
                  </span>
                  <span className="font-bold text-[#22131A]">{b.guest_count_estimated || 300} Guests</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#FAF5F7]">
                  <span className="text-[#705562] font-medium flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#AA336A]" />
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
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FAF5F7] hover:bg-[#AA336A] hover:text-white border border-[#F0D5E2] text-[#AA336A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Printable Invoice
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#F0D5E2] p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF5F7] text-[#AA336A] mx-auto flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#22131A] font-serif-title">
              No Event Reservations Found
            </h3>
            <p className="text-xs text-[#705562] mt-1 font-medium">
              You haven't submitted any event booking inquiries yet. Start customizing your event package now!
            </p>
          </div>
          <Link
            href="/dashboard/book-event"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs uppercase tracking-wider shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Customize Your Event Package
          </Link>
        </div>
      )}
    </div>
  );
}
