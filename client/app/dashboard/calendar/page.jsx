'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { Can, PERMISSIONS } from '../../../lib/permissions';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  ArrowRight,
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarGridPage() {
  const [halls, setHalls] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState('all');

  // Initialize with current real date
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth()); // 0-indexed (0 = Jan, 11 = Dec)
  const [selectedDateStr, setSelectedDateStr] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );
  const [loading, setLoading] = useState(true);

  // Month string for API queries: YYYY-MM
  const monthQueryStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;

  useEffect(() => {
    fetchHalls();
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [selectedHallId, monthQueryStr]);

  const fetchHalls = async () => {
    try {
      const res = await api.get('/halls');
      if (res.data.success) setHalls(res.data.halls);
    } catch (err) {
      console.error('Failed to load halls:', err);
    }
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/calendar?month=${monthQueryStr}&hall_id=${selectedHallId}`);
      if (res.data.success) {
        setSlots(res.data.slots || []);
      }
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Month Navigation
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonthIndex((prev) => prev + 1);
    }
  };

  const handleMonthSelect = (mIndex) => {
    setCurrentMonthIndex(parseInt(mIndex, 10));
  };

  const handleYearSelect = (year) => {
    setCurrentYear(parseInt(year, 10));
  };

  const handleTodayClick = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonthIndex(now.getMonth());
    setSelectedDateStr(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    );
  };

  // Generate Calendar Grid (Monday-start)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);

    // Monday-based day of week: 0 = Mon, 6 = Sun
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonthCount = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonthIndex, 0).getDate();

    const days = [];

    // 1. Trailing days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonthIndex === 0 ? 12 : currentMonthIndex;
      const prevYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        isPrevMonth: true,
      });
    }

    // 2. Days of current month
    for (let dayNum = 1; dayNum <= daysInMonthCount; dayNum++) {
      const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayEvents = slots.filter((s) => s.date === dateStr);
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: true,
        dayEvents,
      });
    }

    // 3. Leading days of next month to complete the grid (multiples of 7)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingDays; dayNum++) {
      const nextMonth = currentMonthIndex === 11 ? 1 : currentMonthIndex + 2;
      const nextYear = currentMonthIndex === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        isNextMonth: true,
      });
    }

    return days;
  }, [currentYear, currentMonthIndex, slots]);

  // Selected date events
  const selectedDayEvents = useMemo(() => {
    return slots.filter((s) => s.date === selectedDateStr);
  }, [slots, selectedDateStr]);

  // Years for selector (currentYear - 3 to currentYear + 5)
  const yearOptions = Array.from({ length: 9 }, (_, i) => currentYear - 3 + i);

  return (
    <Can
      permission={PERMISSIONS.BOOKING_VIEW}
      fallback={
        <div className="p-8 text-center text-rose-600 font-bold flex items-center justify-center gap-2 bg-white border border-[#F0D5E2] rounded-2xl shadow-sm">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'booking.view' permission.
        </div>
      }
    >
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#F0D5E2] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Venue Slot & Reservation Grid
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
              Select your event date
            </h1>
            <p className="text-[#705562] text-xs mt-1 font-medium">
              View availability, switch months, and check slot reservations across all hall venues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTodayClick}
              className="px-3.5 py-2 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#AA336A] hover:bg-[#F7E4EE] transition-all"
            >
              Today
            </button>

            <select
              value={selectedHallId}
              onChange={(e) => setSelectedHallId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#22131A] focus:outline-none focus:border-[#AA336A]"
            >
              <option value="all">All Hall Venues</option>
              {halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>

            <Link
              href={`/dashboard/bookings?date=${selectedDateStr}`}
              className="px-4 py-2 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs flex items-center gap-2 shadow-lg glow-brand"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </Link>
          </div>
        </div>

        {/* Calendar Card (Exact Style Match to Reference) */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0D5E2] shadow-sm">
          {/* Calendar Top Navigation Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#F0D5E2]/80">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-2 rounded-xl text-[#705562] hover:text-[#AA336A] hover:bg-[#FAF5F7] transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Month & Year Title with Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={currentMonthIndex}
                onChange={(e) => handleMonthSelect(e.target.value)}
                className="font-serif-title font-bold text-lg text-[#22131A] bg-transparent hover:bg-[#FAF5F7] px-2.5 py-1 rounded-lg border-none focus:outline-none cursor-pointer text-center"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => handleYearSelect(e.target.value)}
                className="font-serif-title font-bold text-lg text-[#22131A] bg-transparent hover:bg-[#FAF5F7] px-2.5 py-1 rounded-lg border-none focus:outline-none cursor-pointer text-center"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-2 rounded-xl text-[#705562] hover:text-[#AA336A] hover:bg-[#FAF5F7] transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center pt-5 pb-3 text-xs font-semibold text-[#8C7A83]">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          {loading ? (
            <div className="text-center py-16 text-[#705562] text-sm font-semibold flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-[#AA336A] border-t-transparent rounded-full animate-spin" />
              Loading month data...
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-y-2.5 sm:gap-y-3">
              {calendarDays.map((item, index) => {
                const isSelected = item.dateStr === selectedDateStr;
                const hasEvents = item.dayEvents && item.dayEvents.length > 0;

                if (!item.isCurrentMonth) {
                  return (
                    <div
                      key={`other-${index}`}
                      onClick={() => {
                        setSelectedDateStr(item.dateStr);
                        if (item.isPrevMonth) handlePrevMonth();
                        if (item.isNextMonth) handleNextMonth();
                      }}
                      className="flex items-center justify-center p-2 cursor-pointer group"
                    >
                      <span className="text-sm font-medium text-gray-300 group-hover:text-gray-400 transition-colors">
                        {item.dayNum}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={`curr-${item.dayNum}`}
                    className="flex flex-col items-center justify-center p-1 relative"
                  >
                    <button
                      onClick={() => setSelectedDateStr(item.dateStr)}
                      className={`relative w-12 h-10 sm:w-16 sm:h-11 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#D82C6A] text-white font-bold shadow-md shadow-[#D82C6A]/30 scale-105'
                          : 'text-[#22131A] font-semibold hover:bg-[#FAF5F7]'
                      }`}
                    >
                      <span className="text-sm">{item.dayNum}</span>

                      {/* Event Indicator Dots */}
                      {hasEvents && (
                        <div className="flex items-center gap-1 mt-0.5">
                          {item.dayEvents.slice(0, 3).map((evt, idx) => (
                            <span
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected
                                  ? 'bg-white'
                                  : evt.status === 'booked'
                                  ? 'bg-[#AA336A]'
                                  : 'bg-amber-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Date Details Panel */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0D5E2] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0D5E2] pb-4">
            <div>
              <div className="text-xs font-bold text-[#AA336A] uppercase tracking-wider">
                Selected Date Schedule
              </div>
              <h2 className="text-lg font-bold font-serif-title text-[#22131A]">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Legend */}
              <div className="flex items-center gap-4 text-xs font-medium text-[#705562]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#AA336A]" />
                  <span>Booked Event</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Tentative</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings / Slots for this selected date */}
          {selectedDayEvents.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-[#FAF5F7] border border-dashed border-[#F0D5E2] gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#22131A]">All Venue Slots Are Available</h3>
                  <p className="text-xs text-[#705562]">
                    No bookings scheduled for this date. Both day and night slots are open.
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/bookings?date=${selectedDateStr}`}
                className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Book This Date
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDayEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-[#F0D5E2] bg-[#FAF5F7] hover:border-[#AA336A]/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            evt.status === 'booked'
                              ? 'bg-[#F7E4EE] text-[#AA336A]'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {evt.status}
                        </span>
                        <span className="text-xs font-bold text-[#22131A]">
                          {evt.event_type || 'Event'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#705562] mt-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{evt.hall_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#F0D5E2] text-xs font-bold text-[#AA336A]">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="uppercase">{evt.slot}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#F0D5E2]/80 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#22131A]">
                      <User className="w-3.5 h-3.5 text-[#705562]" />
                      <span>{evt.customer_name}</span>
                    </div>

                    <Link
                      href={`/dashboard/bookings/${evt.booking_id}`}
                      className="text-xs font-bold text-[#AA336A] hover:underline flex items-center gap-1"
                    >
                      View Booking
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Can>
  );
}
