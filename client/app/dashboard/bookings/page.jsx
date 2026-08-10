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

  const calculateRunningTotal = () => {
    let subtotal = 0;
    const selectedHall = halls.find((h) => h.id === parseInt(hallId));
    if (selectedHall) {
      const pEvt = Number(selectedHall.price_per_event || 150000);
      const pHd = Number(selectedHall.price_per_head || 1200) * Number(guestCount || 0);
      subtotal += pEvt + pHd;
    } else {
      subtotal += 150000 + (1200 * Number(guestCount || 0));
    }

    const items = Object.values(selectedPackages).map((pkg) => {
      let lineTotal = Number(pkg.price);
      if (pkg.pricing_type === 'per_head') {
        lineTotal = Number(pkg.price) * Number(guestCount || 0);
      }
      subtotal += lineTotal;
      return {
        category_id: pkg.category_id,
        package_id: pkg.id,
        package_name: pkg.name,
        category_name: pkg.category_name,
        pricing_type: pkg.pricing_type,
        price: pkg.price,
        lineTotal,
      };
    });
    return { subtotal, items };
  };

  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    const { subtotal, items } = calculateRunningTotal();

    try {
      const payload = {
        customer_name: custName,
        customer_email: custEmail,
        customer_phone: custPhone,
        hall_id: parseInt(hallId),
        event_type: eventType,
        event_date: eventDate,
        slot: eventSlot,
        guest_count: guestCount,
        total_amount: subtotal,
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
      const msg = err.response?.data?.message || err.message || 'Failed to create booking inquiry';
      alert(`Booking Inquiry Failed: ${msg}`);
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#F0D5E2] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Event Operations & Desk
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
              Hall Reservations & Invoices
            </h1>
            <p className="text-[#705562] text-xs mt-1 font-medium">
              Manage hall slots, guest counts, itemized service packages, and invoice running totals.
            </p>
          </div>

          <Can permission={PERMISSIONS.BOOKING_CREATE}>
            <button
              onClick={() => {
                setShowWizard(true);
                setStep(1);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] active:bg-[#77234A] text-white font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg glow-brand"
            >
              <Plus className="w-4 h-4" />
              New Reservation Wizard
            </button>
          </Can>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
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
                    ? 'bg-[#AA336A] text-white shadow-md'
                    : 'bg-white border border-[#F0D5E2] text-[#604453] hover:text-[#AA336A]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#9E7D8C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, customer, hall..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#F0D5E2] text-xs text-[#22131A] focus:outline-none focus:border-[#AA336A]"
            />
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="text-center py-12 text-[#705562] text-sm font-semibold">
            Loading reservations desk...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#F0D5E2] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#F0D5E2] font-bold text-sm flex items-center justify-between text-[#22131A]">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#AA336A]" />
                Active Event Reservations ({filteredBookings.length})
              </span>
              <span className="text-xs text-[#705562] font-normal">Click any record for printable invoice</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF5F7] text-[#604453] uppercase font-bold border-b border-[#F0D5E2]">
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
                <tbody className="divide-y divide-[#F0D5E2] text-[#22131A]">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-[#FAF5F7] transition-colors">
                      <td className="p-3.5 font-mono text-[#AA336A] font-bold">
                        <Link href={`/dashboard/bookings/${booking.id}`} className="hover:underline flex items-center gap-1">
                          #{booking.id}
                          <FileText className="w-3 h-3 text-[#9E7D8C]" />
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#22131A]">{booking.customer_name}</div>
                        <div className="text-[11px] text-[#705562] font-medium">{booking.customer_phone}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-[#22131A]">{booking.hall_name || 'ShaadiPro Main Hall'}</td>
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-[#FAF5F7] text-[#AA336A] font-extrabold text-[10px] uppercase border border-[#F0D5E2]">
                          {booking.event_type || 'Wedding Event'}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-[#22131A]">
                          {booking.event_date ? String(booking.event_date).split('T')[0] : '2026-10-24'}
                        </div>
                        <div className="text-[10px] text-[#705562] uppercase font-semibold">
                          {booking.slot ? `${booking.slot} Slot` : 'Evening Slot'}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-[#22131A]">
                        {booking.guest_count_estimated || 300} Guests
                      </td>
                      <td className="p-3.5 font-mono text-[#AA336A] font-extrabold text-sm">
                        <div>PKR {Number(booking.total_amount || 0).toLocaleString()}</div>
                        <div className="text-[10px] text-[#705562] font-normal font-sans tracking-tight">
                          Venue: PKR {Number(booking.hall_rental_cost || 0).toLocaleString()}
                          {Number(booking.services_cost || 0) > 0 && ` + Services: PKR ${Number(booking.services_cost).toLocaleString()}`}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize bg-white cursor-pointer ${getStatusBadge(
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
                          className="px-3 py-1.5 rounded-lg bg-[#FAF5F7] hover:bg-[#F3E8EE] border border-[#F0D5E2] text-[#604453] text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          Invoice <ChevronRight className="w-3 h-3 text-[#AA336A]" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-4xl bg-white rounded-2xl p-6 sm:p-8 border border-[#F0D5E2] shadow-xl space-y-6 my-8 text-[#22131A]">
              {/* Wizard Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F0D5E2]">
                <div>
                  <div className="text-xs font-bold text-[#AA336A] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    New Event Booking Wizard • Step {step} of 3
                  </div>
                  <h3 className="text-xl font-bold text-[#22131A]">
                    {step === 1 && 'Step 1: Event & Venue Details'}
                    {step === 2 && 'Step 2: Service Packages Selection'}
                    {step === 3 && 'Step 3: Live Running Total & Confirmation'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowWizard(false)}
                  className="p-2 rounded-xl bg-[#FAF5F7] text-[#705562] hover:text-[#22131A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Event Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="e.g. Usman Tariq"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                        Customer Email
                      </label>
                      <input
                        type="email"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="usman@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                        Select Hall
                      </label>
                      <select
                        value={hallId}
                        onChange={(e) => setHallId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                      >
                        {halls.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                        Event Type
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A] uppercase font-bold"
                      >
                        <option value="baraat">Baraat</option>
                        <option value="walima">Walima</option>
                        <option value="mehndi">Mehndi</option>
                        <option value="engagement">Engagement</option>
                        <option value="other">Other Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                        Time Slot
                      </label>
                      <select
                        value={eventSlot}
                        onChange={(e) => setEventSlot(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A] uppercase font-semibold"
                      >
                        <option value="night">Night Slot (07:00 PM - 11:30 PM)</option>
                        <option value="day">Day Slot (01:00 PM - 04:30 PM)</option>
                        <option value="full_day">Full Day Reservation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                      Estimated Guest Count: <span className="text-[#AA336A] font-mono text-sm">{guestCount} Guests</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      step="25"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                      className="w-full accent-[#AA336A] cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-3 rounded-xl bg-[#AA336A] text-white font-bold text-xs hover:bg-[#8E2656] flex items-center gap-2 shadow-md"
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
                  <p className="text-xs text-[#705562] font-medium">
                    Select service packages for this event. Catering prices automatically compute based on your guest count ({guestCount} guests).
                  </p>

                  <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="space-y-3">
                        <div className="text-xs font-bold text-[#AA336A] uppercase tracking-wider flex items-center justify-between border-b border-[#F0D5E2] pb-1">
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-[#705562] font-mono">
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
                                    ? 'bg-[#F7E4EE] border-[#AA336A] text-[#22131A] ring-1 ring-[#AA336A]/30'
                                    : 'bg-[#FAF5F7] border-[#F0D5E2] text-[#604453] hover:bg-[#F3E8EE]'
                                }`}
                              >
                                <div>
                                  <div className="text-sm font-bold text-[#22131A] flex items-center gap-2">
                                    {isSelected && <Check className="w-4 h-4 text-[#AA336A]" />}
                                    {pkg.name}
                                  </div>
                                  <div className="text-xs text-[#705562] mt-1 font-semibold">
                                    PKR {Number(pkg.price).toLocaleString()}{' '}
                                    <span className="text-[10px] font-mono text-[#9E7D8C]">
                                      {cat.pricing_type === 'per_head' ? '/guest' : 'flat'}
                                    </span>
                                  </div>
                                  {cat.pricing_type === 'per_head' && (
                                    <div className="text-[11px] font-bold text-[#AA336A] mt-1">
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

                  <div className="flex items-center justify-between pt-4 border-t border-[#F0D5E2]">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#604453]"
                    >
                      Back to Step 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3 rounded-xl bg-[#AA336A] text-white font-bold text-xs hover:bg-[#8E2656] flex items-center gap-2 shadow-md"
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
                  <div className="bg-[#FAF5F7] rounded-2xl p-6 border border-[#F0D5E2] space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
                      <div className="text-sm font-bold text-[#22131A] uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#AA336A]" />
                        Itemized Cost Breakdown
                      </div>
                      <div className="text-xs text-[#705562] font-mono">
                        Event: <span className="text-[#AA336A] uppercase font-bold">{eventType}</span> • {guestCount} Guests
                      </div>
                    </div>

                    <div className="space-y-3 divide-y divide-[#F0D5E2] text-xs">
                      {runningItems.length === 0 ? (
                        <div className="text-[#9E7D8C] text-center py-4">No additional service packages selected.</div>
                      ) : (
                        runningItems.map((item, idx) => (
                          <div key={idx} className="pt-2 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-[#22131A]">{item.package_name}</div>
                              <div className="text-[11px] text-[#705562]">
                                {item.category_name} • PKR {Number(item.price).toLocaleString()} {item.pricing_type === 'per_head' ? `x ${guestCount} guests` : ''}
                              </div>
                            </div>
                            <div className="font-mono font-bold text-[#AA336A] text-sm">
                              PKR {item.lineTotal.toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Total Summary */}
                    <div className="pt-4 border-t border-[#F0D5E2] flex items-center justify-between">
                      <div className="text-base font-extrabold text-[#22131A]">Estimated Running Total</div>
                      <div className="text-2xl font-extrabold text-[#AA336A] font-mono">
                        PKR {runningSubtotal.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCreateBookingSubmit} className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#604453]"
                    >
                      Back to Services
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg glow-brand flex items-center gap-2"
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
