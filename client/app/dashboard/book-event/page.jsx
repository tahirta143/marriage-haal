'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import {
  Sparkles,
  Building2,
  Calendar as CalendarIcon,
  Users,
  Utensils,
  Paintbrush,
  Sparkle,
  Music,
  Camera,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  DollarSign,
  Clock,
  Heart,
  ChevronRight,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food & Catering': Utensils,
  'Decor & Stage Setup': Paintbrush,
  'Bridal Makeup': Sparkle,
  'Mehndi Artist': Sparkle,
  'DJ & Sound System': Music,
  'Photography & Videography': Camera,
};

export default function BookEventPage() {
  const { user } = useAuth();
  const [halls, setHalls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Step Tracker
  const [currentStep, setCurrentStep] = useState(1);

  // Selection States
  const [selectedHall, setSelectedHall] = useState(null);
  const [eventType, setEventType] = useState('baraat');
  const [eventDate, setEventDate] = useState('2026-10-24');
  const [eventSlot, setEventSlot] = useState('night');
  const [guestCount, setGuestCount] = useState(350);

  // Selected Packages per category: { category_id: package_object }
  const [selectedPackages, setSelectedPackages] = useState({});

  // Customer Contact Info
  const [custName, setCustName] = useState(user?.name || '');
  const [custEmail, setCustEmail] = useState(user?.email || '');
  const [custPhone, setCustPhone] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [hRes, cRes] = await Promise.all([
        api.get('/halls'),
        api.get('/categories'),
      ]);

      if (hRes.data.success && hRes.data.halls.length > 0) {
        setHalls(hRes.data.halls);
        setSelectedHall(hRes.data.halls[0]);
      }
      if (cRes.data.success) {
        setCategories(cRes.data.categories);
      }
    } catch (err) {
      console.error('Failed to load event builder data:', err);
    } font-normal
    finally {
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

  // Compute Live Running Total
  const calculateTotals = () => {
    let subtotal = 0;
    const items = Object.values(selectedPackages).map((pkg) => {
      let lineTotal = Number(pkg.price);
      if (pkg.pricing_type === 'per_head') {
        lineTotal = Number(pkg.price) * Number(guestCount || 0);
      } else if (pkg.pricing_type === 'per_hour') {
        lineTotal = Number(pkg.price) * 4; // 4 hours standard
      }
      subtotal += lineTotal;
      return { ...pkg, lineTotal };
    });

    const tax = Math.round(subtotal * 0.05); // 5% service tax
    const grandTotal = subtotal + tax;

    return { subtotal, tax, grandTotal, items };
  };

  const { subtotal, tax, grandTotal, items: selectedItemsList } = calculateTotals();

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    if (!selectedHall || !custName) return;

    try {
      setSubmitting(true);
      setFeedback('');
      setErrorMessage('');

      const payload = {
        customer_name: custName,
        customer_email: custEmail,
        customer_phone: custPhone || '+92 300 0000000',
        hall_id: selectedHall.id,
        event_type: eventType,
        event_date: eventDate,
        slot: eventSlot,
        guest_count: guestCount,
        selected_services: selectedItemsList,
      };

      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        setFeedback(`Reservation Inquiry #${res.data.bookingId} created successfully! Our team will contact you shortly.`);
        setCurrentStep(3);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit reservation inquiry';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Luxury Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10 border border-amber-500/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Client Self-Service Event Customizer
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif-title tracking-tight text-white">
            Plan Your <span className="text-amber-400">Dream Wedding</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Customize your hall venue, guest count, catering menus, stage decor themes, photography, and bridal styling with real-time running price calculations.
          </p>
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-slate-800 text-center">
          <button
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-2xl border transition-all text-xs font-bold flex items-center justify-center gap-2 ${
              currentStep === 1
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-950/30 flex items-center justify-center font-mono">1</span>
            <span className="hidden sm:inline">Venue & Guests</span>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`p-3 rounded-2xl border transition-all text-xs font-bold flex items-center justify-center gap-2 ${
              currentStep === 2
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-950/30 flex items-center justify-center font-mono">2</span>
            <span className="hidden sm:inline">Services & Menu</span>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`p-3 rounded-2xl border transition-all text-xs font-bold flex items-center justify-center gap-2 ${
              currentStep === 3
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-950/30 flex items-center justify-center font-mono">3</span>
            <span className="hidden sm:inline">Instant Invoice</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Loading venue halls and service catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* STEP 1: Venue & Guests */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif-title text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  Select Hall Venue & Event Schedule
                </h2>

                {/* Hall Cards Grid with Cover Images */}
                <div className="space-y-4">
                  {halls.map((hall) => {
                    const isSelected = selectedHall?.id === hall.id;
                    const amenitiesList = Array.isArray(hall.amenities)
                      ? hall.amenities
                      : typeof hall.amenities === 'string'
                      ? JSON.parse(hall.amenities)
                      : ['AC', 'VIP Parking', 'Sound System'];

                    const fallbackImg = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';

                    return (
                      <div
                        key={hall.id}
                        onClick={() => setSelectedHall(hall)}
                        className={`rounded-3xl glass-card border cursor-pointer transition-all duration-200 overflow-hidden ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/40 shadow-xl'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Hall Cover Image */}
                          <div className="sm:w-56 h-48 sm:h-auto overflow-hidden bg-slate-900 flex-shrink-0 relative">
                            <img
                              src={hall.image_url || fallbackImg}
                              alt={hall.name}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-slate-950 flex items-center gap-1 shadow-lg">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Selected Venue
                              </div>
                            )}
                          </div>

                          <div className="p-6 flex-1 space-y-3 flex flex-col justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-white">{hall.name}</h3>
                              <p className="text-xs text-slate-400 mt-1">{hall.address}</p>

                              <div className="mt-2 text-xs font-bold text-amber-400">
                                Capacity: {hall.capacity_min} - {hall.capacity_max} Guests
                              </div>
                            </div>

                            {/* Amenities Chips */}
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {amenitiesList.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 font-medium"
                                >
                                  ✓ {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Schedule & Guest Specs Form */}
                <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                    Event Specs & Guest Count
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                        Event Function
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 font-bold uppercase focus:outline-none focus:border-amber-500"
                      >
                        <option value="baraat">Baraat Ceremony</option>
                        <option value="walima">Walima Reception</option>
                        <option value="mehndi">Mehndi Night</option>
                        <option value="engagement">Engagement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                        Timing Slot
                      </label>
                      <select
                        value={eventSlot}
                        onChange={(e) => setEventSlot(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500 uppercase"
                      >
                        <option value="night">Night (07:00 PM - 11:30 PM)</option>
                        <option value="day">Day (01:00 PM - 04:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Interactive Guest Counter Slider */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 uppercase">
                        Guest Count (Multiplies Catering Pricing)
                      </span>
                      <span className="text-lg font-extrabold text-amber-400 font-mono">
                        {guestCount} Guests
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.max(50, guestCount - 25))}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="range"
                        min="50"
                        max="1500"
                        step="25"
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setGuestCount(guestCount + 25)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg glow-accent flex items-center gap-2"
                  >
                    <span>Customize Service Packages</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Service Packages Selector */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif-title text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Select Service Packages & Inclusions
                </h2>

                <div className="space-y-6">
                  {categories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.name] || Sparkles;
                    return (
                      <div key={cat.id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            {cat.image_url ? (
                              <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="w-10 h-10 rounded-xl object-cover border border-amber-500/30"
                              />
                            ) : (
                              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                <Icon className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-base font-bold text-white">{cat.name}</h3>
                              <p className="text-xs text-slate-400">
                                Pricing: {cat.pricing_type === 'per_head' ? 'Per Guest' : cat.pricing_type}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                className={`rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-amber-500/10 border-amber-400 text-white ring-1 ring-amber-400/30 shadow-lg'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                                }`}
                              >
                                {pkg.image_url && (
                                  <div className="h-32 w-full overflow-hidden bg-slate-950 relative">
                                    <img
                                      src={pkg.image_url}
                                      alt={pkg.name}
                                      className="w-full h-full object-cover"
                                    />
                                    {isSelected && (
                                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                                        <CheckCircle2 className="w-3 h-3" /> Selected
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="p-5 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                      {isSelected ? (
                                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                                      ) : (
                                        <span className="w-4 h-4 rounded-full border border-slate-600" />
                                      )}
                                      {pkg.name}
                                    </div>
                                  </div>

                                  <div className="text-lg font-extrabold text-amber-400">
                                    PKR {Number(pkg.price).toLocaleString()}
                                    <span className="text-xs text-slate-400 font-normal ml-1">
                                      {cat.pricing_type === 'per_head' ? '/ guest' : 'flat'}
                                    </span>
                                  </div>

                                  {cat.pricing_type === 'per_head' && (
                                    <div className="text-xs font-bold text-emerald-400">
                                      = PKR {computedPrice.toLocaleString()} ({guestCount} guests)
                                    </div>
                                  )}

                                  {/* Details */}
                                  <ul className="mt-3 space-y-1 border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
                                    {(pkg.details || []).slice(0, 4).map((item, i) => (
                                      <li key={i} className="flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-amber-400" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300"
                  >
                    Back to Venue Specs
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg glow-accent flex items-center gap-2"
                  >
                    <span>View Instant Invoice</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Instant Invoice & Contact Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif-title text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Review Final Reservation & Submit Inquiry
                </h2>

                <form onSubmit={handleSubmitReservation} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                    Contact Details for Reservation Receipt
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Usman Tariq"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="usman@gmail.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
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
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300"
                    >
                      Back to Services
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg glow-accent flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Submit Event Reservation Inquiry
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sticky Sidebar: Live Running Invoice Calculator (Right 1 col) */}
          <div className="space-y-6">
            <div className="sticky top-6 glass-panel rounded-3xl p-6 border border-amber-500/30 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Live Running Calculator
                  </div>
                  <h3 className="text-base font-bold text-white">Invoice Summary</h3>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {/* Event Specs Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Venue:</span>
                  <span className="font-bold text-white truncate max-w-[140px]">
                    {selectedHall?.name || 'Not Selected'}
                  </span>
                </div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Function:</span>
                  <span className="font-bold text-amber-400 uppercase">{eventType}</span>
                </div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Schedule:</span>
                  <span className="font-bold text-white">{eventDate} ({eventSlot})</span>
                </div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Guest Count:</span>
                  <span className="font-bold text-emerald-400">{guestCount} Guests</span>
                </div>
              </div>

              {/* Selected Packages List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Selected Packages ({selectedItemsList.length}):
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-800/60 text-xs">
                  {selectedItemsList.length === 0 ? (
                    <div className="text-slate-500 text-center py-3">No packages selected yet.</div>
                  ) : (
                    selectedItemsList.map((item) => (
                      <div key={item.id} className="pt-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {item.category_name} {item.pricing_type === 'per_head' ? `(${guestCount} guests)` : ''}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-amber-400">
                          PKR {item.lineTotal.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Price Math Breakdown */}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Services Subtotal:</span>
                  <span className="font-mono text-white">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Est. Service Tax (5%):</span>
                  <span className="font-mono text-slate-400">PKR {tax.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-white">Grand Total</span>
                  <span className="text-xl font-extrabold text-amber-400 font-mono">
                    PKR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center pt-2">
                * Prices calculated dynamically with real-time per-head multiplier.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
