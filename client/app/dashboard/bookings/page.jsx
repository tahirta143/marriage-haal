'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { Can, PERMISSIONS } from '../../../lib/permissions';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  ChevronRight,
  DollarSign,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Printer,
  FileText,
  Tag,
  Check,
} from 'lucide-react';

export default function BookingsDeskPage() {
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // New Booking Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1 Form Data
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [hallId, setHallId] = useState('1');
  const [eventType, setEventType] = useState('baraat');
  const [eventDate, setEventDate] = useState('2026-10-24');
  const [eventSlot, setEventSlot] = useState('night');
  const [guestCount, setGuestCount] = useState(400);

  // Step 2 Selected Services Map: { category_id: package_object }
  const [selectedPackages, setSelectedPackages] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [bRes, hRes, cRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/halls'),
        api.get('/categories'),
      ]);

      if (bRes.data.success) setBookings(bRes.data.bookings);
      if (hRes.data.success) setHalls(hRes.data.halls);
      if (cRes.data.success) setCategories(cRes.data.categories);
    } catch (err) {
      console.error('Failed to load bookings desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePackageSelection = (category, pkg) => {
    setSelectedPackages((prev) => {
      const updated = { ...prev };
      if (updated[category.id]?.id === pkg.id) {
        delete updated[category.id];
      } else {
        updated[category.id] = {
          ...pkg,
          category_id: category.id,
          category_name: category.name,
          pricing_type: category.pricing_type,
        };
      }
      return updated;
    });
  };

  // Calculate Running Total live
  const calculateRunningTotal = () => {
    let subtotal = 0;
    const items = Object.values(selectedPackages).map((pkg) => {
      let lineTotal = Number(pkg.price);
      if (pkg.pricing_type === 'per_head') {
        lineTotal = Number(pkg.price) * Number(guestCount || 0);
      } else if (pkg.pricing_type === 'per_hour') {
        lineTotal = Number(pkg.price) * 4; // default 4 hours
      }
      subtotal += lineTotal;
      return { ...pkg, lineTotal };
    });
    return { subtotal, items };
  };

  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const { items } = calculateRunningTotal();
      const payload = {
        customer_name: custName,
        customer_email: custEmail,
        customer_phone: custPhone,
        hall_id: hallId,
        event_type: eventType,
        event_date: eventDate,
        slot: eventSlot,
        guest_count: guestCount,
        selected_services: items,
      };

      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        setFeedback('New event booking inquiry created successfully!');
        setShowWizard(false);
        setStep(1);
        setSelectedPackages({});
        fetchInitialData();
      }
    } catch (err) {
      alert('Failed to create booking inquiry');
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data.success) {
        setFeedback(`Booking #${bookingId} status changed to '${newStatus}'.`);
        fetchInitialData();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch =
      b.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.hall_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toString().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const { subtotal: runningSubtotal, items: runningItems } = calculateRunningTotal();

  const getStatusBadge = (st) => {
    switch (st) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'tentative':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'inquiry':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

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
              Event Operations & Desk
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-white">
              Hall Reservations & Invoices
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Manage hall slots, guest counts, itemized service packages, and invoice running totals.
            </p>
          </div>

          <Can permission={PERMISSIONS.BOOKING_CREATE}>
            <button
              onClick={() => {
                setShowWizard(true);
                setStep(1);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg glow-accent"
            >
              <Plus className="w-4 h-4" />
              New Reservation Wizard
            </button>
          </Can>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'inquiry', 'tentative', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, customer, hall..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Loading reservations desk...
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Active Event Reservations ({filteredBookings.length})
              </span>
              <span className="text-xs text-slate-500 font-normal">Click any record for printable invoice</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Hall Venue</th>
                    <th className="p-3.5">Event Details</th>
                    <th className="p-3.5">Date & Slot</th>
                    <th className="p-3.5">Guests</th>
                    <th className="p-3.5">Running Total</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 font-mono text-amber-400 font-bold">
                        <Link href={`/dashboard/bookings/${booking.id}`} className="hover:underline flex items-center gap-1">
                          #{booking.id}
                          <FileText className="w-3 h-3 text-slate-500" />
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{booking.customer_name}</div>
                        <div className="text-[11px] text-slate-500">{booking.customer_phone}</div>
                      </td>
                      <td className="p-3.5 font-medium">{booking.hall_name}</td>
                      <td className="p-3.5 uppercase text-amber-400 font-bold text-[11px]">
                        {booking.event_type}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div>{booking.event_date}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{booking.slot} Slot</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-200">
                        {booking.guest_count_estimated} Guests
                      </td>
                      <td className="p-3.5 font-mono text-amber-400 font-bold text-sm">
                        PKR {Number(booking.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize bg-slate-950 cursor-pointer ${getStatusBadge(
                            booking.status
                          )}`}
                        >
                          <option value="inquiry">Inquiry</option>
                          <option value="tentative">Tentative</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          Invoice <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Interactive Multi-Step New Booking Wizard */}
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-4xl glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 my-8">
              {/* Wizard Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    New Event Booking Wizard • Step {step} of 3
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {step === 1 && 'Step 1: Event & Venue Details'}
                    {step === 2 && 'Step 2: Service Packages Selection'}
                    {step === 3 && 'Step 3: Live Running Total & Confirmation'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowWizard(false)}
                  className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Event Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="e.g. Usman Tariq"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Customer Email
                      </label>
                      <input
                        type="email"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="usman@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Select Hall
                      </label>
                      <select
                        value={hallId}
                        onChange={(e) => setHallId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        {halls.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Event Type
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500 uppercase font-semibold"
                      >
                        <option value="baraat">Baraat</option>
                        <option value="walima">Walima</option>
                        <option value="mehndi">Mehndi</option>
                        <option value="engagement">Engagement</option>
                        <option value="other">Other Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Time Slot
                      </label>
                      <select
                        value={eventSlot}
                        onChange={(e) => setEventSlot(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500 uppercase"
                      >
                        <option value="night">Night Slot (07:00 PM - 11:30 PM)</option>
                        <option value="day">Day Slot (01:00 PM - 04:30 PM)</option>
                        <option value="full_day">Full Day Reservation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Estimated Guest Count: <span className="text-amber-400 font-bold text-sm">{guestCount} Guests</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      step="25"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600 flex items-center gap-2"
                    >
                      <span>Proceed to Service Packages</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Service Packages Picker */}
              {step === 2 && (
                <div className="space-y-6">
                  <p className="text-xs text-slate-400">
                    Select service packages for this event. Catering prices automatically compute based on your guest count ({guestCount} guests).
                  </p>

                  <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="space-y-3">
                        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Pricing Type: {cat.pricing_type}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(cat.packages || []).map((pkg) => {
                            const isSelected = selectedPackages[cat.id]?.id === pkg.id;
                            const computedPrice =
                              cat.pricing_type === 'per_head'
                                ? Number(pkg.price) * guestCount
                                : Number(pkg.price);

                            return (
                              <div
                                key={pkg.id}
                                onClick={() => togglePackageSelection(cat, pkg)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex items-start justify-between ${
                                  isSelected
                                    ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/30'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                                }`}
                              >
                                <div>
                                  <div className="text-sm font-bold text-white flex items-center gap-2">
                                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                                    {pkg.name}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-1">
                                    PKR {Number(pkg.price).toLocaleString()}{' '}
                                    <span className="text-[10px] font-mono text-slate-500">
                                      {cat.pricing_type === 'per_head' ? '/guest' : 'flat'}
                                    </span>
                                  </div>
                                  {cat.pricing_type === 'per_head' && (
                                    <div className="text-[11px] font-semibold text-amber-400 mt-1">
                                      Subtotal: PKR {computedPrice.toLocaleString()} ({guestCount} guests)
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300"
                    >
                      Back to Step 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600 flex items-center gap-2"
                    >
                      <span>Review Running Total</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Running Total & Confirmation */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Itemized Running Total Breakdown Card */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        Itemized Cost Breakdown
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Event: <span className="text-amber-400 uppercase font-bold">{eventType}</span> • {guestCount} Guests
                      </div>
                    </div>

                    <div className="space-y-3 divide-y divide-slate-800/60 text-xs">
                      {runningItems.length === 0 ? (
                        <div className="text-slate-500 text-center py-4">No additional service packages selected.</div>
                      ) : (
                        runningItems.map((item, idx) => (
                          <div key={idx} className="pt-2 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-white">{item.package_name}</div>
                              <div className="text-[11px] text-slate-400">
                                {item.category_name} • PKR {Number(item.price).toLocaleString()} {item.pricing_type === 'per_head' ? `x ${guestCount} guests` : ''}
                              </div>
                            </div>
                            <div className="font-mono font-bold text-amber-400 text-sm">
                              PKR {item.lineTotal.toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Total Summary */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="text-base font-extrabold text-white">Estimated Running Total</div>
                      <div className="text-2xl font-extrabold text-amber-400 font-mono">
                        PKR {runningSubtotal.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCreateBookingSubmit} className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300"
                    >
                      Back to Services
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg glow-accent flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm & Create Reservation
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Can>
  );
}
