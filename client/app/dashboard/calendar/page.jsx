'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { Can, PERMISSIONS } from '../../../lib/permissions';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  ShieldAlert,
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  User,
} from 'lucide-react';

export default function CalendarGridPage() {
  const [halls, setHalls] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState('all');
  const [currentMonth, setCurrentMonth] = useState('2026-10');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, [selectedHallId, currentMonth]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const [hRes, cRes] = await Promise.all([
        api.get('/halls'),
        api.get(`/reports/calendar?month=${currentMonth}&hall_id=${selectedHallId}`),
      ]);

      if (hRes.data.success) setHalls(hRes.data.halls);
      if (cRes.data.success) setSlots(cRes.data.slots);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate 31 days grid for October 2026
  const daysInMonth = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${currentMonth}-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    const dayEvents = slots.filter((s) => s.date === dateStr);
    return { dayNum, dateStr, dayEvents };
  });

  return (
    <Can
      permission={PERMISSIONS.BOOKING_VIEW}
      fallback={
        <div className="p-8 text-center text-red-400 font-bold flex items-center justify-center gap-2 glass-card rounded-2xl">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'booking.view' permission.
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Venue Slot & Reservation Grid
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-white">
              Interactive Hall Booking Calendar
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              View day and night slot availability across all hall venues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedHallId}
              onChange={(e) => setSelectedHallId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Hall Venues</option>
              {halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>

            <Link
              href="/dashboard/bookings"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg glow-accent"
            >
              <Plus className="w-4 h-4" />
              New Booking Inquiry
            </Link>
          </div>
        </div>

        {/* Month Control & Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl glass-card border border-slate-800">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-base font-bold text-white font-serif-title">
              October 2026
            </span>
            <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-300">Tentative</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-300">Booked Event</span>
            </div>
          </div>
        </div>

        {/* 31-Day Calendar Matrix Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Loading monthly slot matrix...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {daysInMonth.map(({ dayNum, dateStr, dayEvents }) => (
              <div
                key={dayNum}
                className="glass-card rounded-2xl p-3 border border-slate-800 min-h-[120px] flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 mb-2">
                  <span className="text-xs font-bold font-mono text-slate-400">
                    Oct {dayNum}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">2026</span>
                </div>

                {dayEvents.length === 0 ? (
                  <Link
                    href="/dashboard/bookings"
                    className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/40 hover:bg-emerald-500/10 border border-dashed border-slate-800/80 hover:border-emerald-500/30 group transition-all"
                  >
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider group-hover:underline flex items-center gap-1">
                      + Available
                    </span>
                  </Link>
                ) : (
                  <div className="space-y-1.5 flex-1">
                    {dayEvents.map((evt, idx) => (
                      <Link
                        key={idx}
                        href={`/dashboard/bookings/${evt.booking_id}`}
                        className={`block p-2 rounded-xl border text-[11px] transition-all hover:scale-[1.02] ${
                          evt.status === 'booked'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <div className="font-bold uppercase tracking-wide truncate">
                          {evt.event_type} ({evt.slot})
                        </div>
                        <div className="text-[10px] text-slate-300 truncate">
                          {evt.customer_name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Can>
  );
}
