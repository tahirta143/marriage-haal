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
  Car,
  FileText,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food & Catering': Utensils,
  'Catering': Utensils,
  'Decor & Stage Setup': Paintbrush,
  'Decor': Paintbrush,
  'Bridal Makeup': Sparkle,
  'Mehndi Artist': Sparkle,
  'Henna Artists': Sparkle,
  'DJ & Sound System': Music,
  'Photography & Videography': Camera,
  'Photographers': Camera,
  'Car Rental': Car,
  'Wedding Stationery': FileText,
  'Wedding Venues': Building2,
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
  const [selectedVenueTypeFilter, setSelectedVenueTypeFilter] = useState('ALL');
  const [eventType, setEventType] = useState('Barat Planning');
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

  // Compute Live Running Total
  const calculateTotals = () => {
    let subtotal = 0;

    // Include Venue Hall Rental Price if selected
    if (selectedHall) {
      const flatPrice = Number(selectedHall.price_per_event || 150000);
      const perHeadPrice = Number(selectedHall.price_per_head || 1200) * Number(guestCount || 0);
      subtotal += flatPrice + perHeadPrice;
    }

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

    const tax = Math.round(subtotal * 0.05); // 5% Service tax
    const grandTotal = subtotal + tax;

    return { subtotal, tax, grandTotal, selectedItemsList: items };
  };

  const { subtotal, tax, grandTotal, selectedItemsList } = calculateTotals();

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    if (!selectedHall) {
      setErrorMessage('Please select a hall venue.');
      return;
    }
    if (!custPhone) {
      setErrorMessage('Please enter a contact phone number.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      setFeedback('');

      const payload = {
        hall_id: selectedHall.id,
        event_type: eventType,
        event_date: eventDate,
        event_slot: eventSlot,
        guest_count: guestCount,
        customer_name: custName,
        customer_email: custEmail,
        customer_phone: custPhone,
        total_amount: grandTotal,
        selected_packages: selectedItemsList,
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
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 sm:p-10 border border-[#F0D5E2] shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-[#AA336A]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#AA336A]/10 border border-[#AA336A]/30 text-[#AA336A] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Client Self-Service Event Customizer
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif-title tracking-tight text-[#22131A]">
            Plan Your <span className="text-[#AA336A]">Dream Wedding</span>
          </h1>
          <p className="text-[#705562] text-sm leading-relaxed font-medium">
            Customize your hall venue, guest count, catering menus, stage decor themes, photography, and bridal styling with real-time running price calculations.
          </p>
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-[#F0D5E2] text-center">
          <button
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-2xl border transition-all text-xs font-bold flex items-center justify-center gap-2 ${
              currentStep === 1
                ? 'bg-[#AA336A] text-white border-[#AA336A] shadow-md shadow-[#AA336A]/25'
                : 'bg-[#FAF5F7] border-[#F0D5E2] text-[#705562] hover:text-[#AA336A]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center font-mono text-[10px]">1</span>
            <span className="hidden sm:inline">Venue & Guests</span>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`p-3 rounded-2xl border transition-all text-xs font-bold flex items-center justify-center gap-2 ${
              currentStep === 2
                ? 'bg-[#AA336A] text-white border-[#AA336A] shadow-md shadow-[#AA336A]/25'
                : 'bg-[#FAF5F7] border-[#F0D5E2] text-[#705562] hover:text-[#AA336A]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center font-mono text-[10px]">2</span>
            <span className="hidden sm:inline">Services & Menu</span>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`p-3 rounded-2xl border transition-all text-xs font-bold flex items-center justify-center gap-2 ${
              currentStep === 3
                ? 'bg-[#AA336A] text-white border-[#AA336A] shadow-md shadow-[#AA336A]/25'
                : 'bg-[#FAF5F7] border-[#F0D5E2] text-[#705562] hover:text-[#AA336A]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center font-mono text-[10px]">3</span>
            <span className="hidden sm:inline">Instant Invoice</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-[#705562] text-sm font-semibold">
          Loading venue halls and service catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* STEP 1: Venue & Guests */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif-title text-[#22131A] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#AA336A]" />
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
                        className={`rounded-3xl bg-white border cursor-pointer transition-all duration-200 overflow-hidden ${
                          isSelected
                            ? 'border-[#AA336A] bg-[#F7E4EE]/40 ring-2 ring-[#AA336A]/40 shadow-md'
                            : 'border-[#F0D5E2] hover:border-[#AA336A]/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Hall Cover Image */}
                          <div className="sm:w-56 h-48 sm:h-auto overflow-hidden bg-[#FAF5F7] flex-shrink-0 relative">
                            <img
                              src={hall.image_url || fallbackImg}
                              alt={hall.name}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#AA336A] text-white flex items-center gap-1 shadow-md">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Selected Venue
                              </div>
                            )}
                          </div>

                          <div className="p-6 flex-1 space-y-3 flex flex-col justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-[#22131A]">{hall.name}</h3>
                              <p className="text-xs text-[#705562] mt-1 font-medium">{hall.address}</p>

                              <div className="mt-2 text-xs font-bold text-[#AA336A]">
                                Capacity: {hall.capacity_min} - {hall.capacity_max} Guests
                              </div>
                            </div>

                            {/* Amenities Chips */}
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {amenitiesList.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-[#FAF5F7] border border-[#F0D5E2] text-[11px] text-[#22131A] font-semibold"
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
                <div className="bg-white rounded-3xl p-6 border border-[#F0D5E2] space-y-5 shadow-sm">
                  <h3 className="text-sm font-bold text-[#604453] uppercase tracking-wider">
                    Event Specs & Guest Count
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1.5">
                        Event Function
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] font-bold uppercase focus:outline-none focus:border-[#AA336A]"
                      >
                        <option value="Barat Planning">Barat Planning</option>
                        <option value="Mehndi & Mayo">Mehndi & Mayo</option>
                        <option value="Walima Reception">Walima Reception</option>
                        <option value="Bridal Shower">Bridal Shower</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Nikkah">Nikkah</option>
                        <option value="Qawali Night">Qawali Night</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1.5">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1.5">
                        Timing Slot
                      </label>
                      <select
                        value={eventSlot}
                        onChange={(e) => setEventSlot(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A] uppercase font-semibold"
                      >
                        <option value="night">Night (07:00 PM - 11:30 PM)</option>
                        <option value="day">Day (01:00 PM - 04:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Interactive Guest Counter Slider */}
                  <div className="p-5 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#604453] uppercase">
                        Guest Count (Multiplies Catering Pricing)
                      </span>
                      <span className="text-lg font-extrabold text-[#AA336A] font-mono">
                        {guestCount} Guests
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.max(50, guestCount - 25))}
                        className="p-2 rounded-xl bg-white border border-[#F0D5E2] text-[#604453] hover:text-[#AA336A]"
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
                        className="flex-1 accent-[#AA336A] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setGuestCount(guestCount + 25)}
                        className="p-2 rounded-xl bg-white border border-[#F0D5E2] text-[#604453] hover:text-[#AA336A]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-3.5 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg glow-brand flex items-center gap-2"
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
                <h2 className="text-xl font-bold font-serif-title text-[#22131A] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#AA336A]" />
                  Select Service Packages & Inclusions
                </h2>

                <div className="space-y-6">
                  {categories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.name] || Sparkles;
                    return (
                      <div key={cat.id} className="bg-white rounded-3xl p-6 border border-[#F0D5E2] space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#F0D5E2] pb-3">
                          <div className="flex items-center gap-3">
                            {cat.image_url ? (
                              <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="w-10 h-10 rounded-xl object-cover border border-[#F0D5E2]"
                              />
                            ) : (
                              <div className="p-2.5 rounded-xl bg-[#AA336A]/10 border border-[#AA336A]/30 text-[#AA336A]">
                                <Icon className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-base font-bold text-[#22131A]">{cat.name}</h3>
                              <p className="text-xs text-[#705562] font-medium">
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
                                    ? 'bg-[#F7E4EE] border-[#AA336A] text-[#22131A] ring-1 ring-[#AA336A]/30 shadow-md'
                                    : 'bg-[#FAF5F7] border-[#F0D5E2] text-[#604453] hover:bg-[#F3E8EE]'
                                }`}
                              >
                                {pkg.image_url && (
                                  <div className="h-32 w-full overflow-hidden bg-[#FAF5F7] relative">
                                    <img
                                      src={pkg.image_url}
                                      alt={pkg.name}
                                      className="w-full h-full object-cover"
                                    />
                                    {isSelected && (
                                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#AA336A] text-white flex items-center gap-1 shadow-md">
                                        <CheckCircle2 className="w-3 h-3" /> Selected
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="p-5 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-bold text-[#22131A] flex items-center gap-2">
                                      {isSelected ? (
                                        <CheckCircle2 className="w-4 h-4 text-[#AA336A]" />
                                      ) : (
                                        <span className="w-4 h-4 rounded-full border border-[#D5B0C2]" />
                                      )}
                                      {pkg.name}
                                    </div>
                                  </div>

                                  <div className="text-lg font-extrabold text-[#AA336A]">
                                    PKR {Number(pkg.price).toLocaleString()}
                                    <span className="text-xs text-[#705562] font-normal ml-1">
                                      {cat.pricing_type === 'per_head' ? '/ guest' : 'flat'}
                                    </span>
                                  </div>

                                  {cat.pricing_type === 'per_head' && (
                                    <div className="text-xs font-bold text-emerald-700">
                                      = PKR {computedPrice.toLocaleString()} ({guestCount} guests)
                                    </div>
                                  )}

                                  {/* Details */}
                                  <ul className="mt-3 space-y-1 border-t border-[#F0D5E2] pt-2 text-[11px] text-[#705562]">
                                    {(pkg.details || []).slice(0, 4).map((item, i) => (
                                      <li key={i} className="flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-[#AA336A]" />
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
                    className="px-6 py-3 rounded-2xl bg-white border border-[#F0D5E2] text-xs font-bold text-[#604453]"
                  >
                    Back to Venue Specs
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-8 py-3.5 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg glow-brand flex items-center gap-2"
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
                <h2 className="text-xl font-bold font-serif-title text-[#22131A] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Review Final Reservation & Submit Inquiry
                </h2>

                <form onSubmit={handleSubmitReservation} className="bg-white rounded-3xl p-6 border border-[#F0D5E2] space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-[#604453] uppercase tracking-wider">
                    Contact Details for Reservation Receipt
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Usman Tariq"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="usman@gmail.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
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
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 rounded-2xl bg-white border border-[#F0D5E2] text-xs font-bold text-[#604453]"
                    >
                      Back to Services
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3.5 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg glow-brand flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            <div className="sticky top-6 bg-white rounded-3xl p-6 border border-[#F0D5E2] space-y-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
                <div>
                  <div className="text-xs font-bold text-[#AA336A] uppercase tracking-wider">
                    Live Running Calculator
                  </div>
                  <h3 className="text-base font-bold text-[#22131A]">Invoice Summary</h3>
                </div>
                <div className="p-2 rounded-xl bg-[#AA336A]/10 text-[#AA336A]">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {/* Event Specs Summary */}
              <div className="p-3.5 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] space-y-1 text-xs">
                <div className="text-[#705562] flex items-center justify-between font-medium">
                  <span>Venue:</span>
                  <span className="font-bold text-[#22131A] truncate max-w-[140px]">
                    {selectedHall?.name || 'Not Selected'}
                  </span>
                </div>
                <div className="text-[#705562] flex items-center justify-between font-medium">
                  <span>Function:</span>
                  <span className="font-bold text-[#AA336A] uppercase">{eventType}</span>
                </div>
                <div className="text-[#705562] flex items-center justify-between font-medium">
                  <span>Schedule:</span>
                  <span className="font-bold text-[#22131A]">{eventDate} ({eventSlot})</span>
                </div>
                <div className="text-[#705562] flex items-center justify-between font-medium">
                  <span>Guest Count:</span>
                  <span className="font-bold text-emerald-700">{guestCount} Guests</span>
                </div>
              </div>

              {/* Selected Packages & Venue Rental List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#604453]">
                  Selected Venue & Services:
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 divide-y divide-[#F0D5E2] text-xs">
                  {selectedHall && (
                    <div className="pt-2 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#22131A]">{selectedHall.name}</div>
                        <div className="text-[10px] text-[#705562]">
                          Venue Rental ({guestCount} guests)
                        </div>
                      </div>
                      <div className="font-mono font-bold text-[#AA336A]">
                        PKR {(Number(selectedHall.price_per_event || 150000) + Number(selectedHall.price_per_head || 1200) * Number(guestCount || 0)).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {selectedItemsList.map((item) => (
                    <div key={item.id} className="pt-2 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#22131A]">{item.name}</div>
                        <div className="text-[10px] text-[#705562]">
                          {item.category_name} {item.pricing_type === 'per_head' ? `(${guestCount} guests)` : ''}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-[#AA336A]">
                        PKR {item.lineTotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Math Breakdown */}
              <div className="pt-4 border-t border-[#F0D5E2] space-y-2 text-xs">
                <div className="flex justify-between text-[#705562] font-medium">
                  <span>Services Subtotal:</span>
                  <span className="font-mono text-[#22131A]">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#705562] font-medium">
                  <span>Est. Service Tax (5%):</span>
                  <span className="font-mono text-[#705562]">PKR {tax.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t border-[#F0D5E2] flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#22131A]">Grand Total</span>
                  <span className="text-xl font-extrabold text-[#AA336A] font-mono">
                    PKR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-[#9E7D8C] text-center pt-2 font-medium">
                * Prices calculated dynamically with real-time per-head multiplier.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
