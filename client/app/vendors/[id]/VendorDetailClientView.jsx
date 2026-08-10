'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MarketplaceHeader from '../../../components/MarketplaceHeader';
import OtpAuthModal from '../../../components/OtpAuthModal';
import { useAuth } from '../../../lib/auth';
import api from '../../../lib/api';
import {
  Star,
  MapPin,
  CheckCircle2,
  Calendar as CalendarIcon,
  Zap,
  X,
  Phone,
  Mail,
  Building2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
  ShieldCheck,
  Clock,
  UserCheck,
  Share2,
  Utensils,
  Car,
  Users,
  Award
} from 'lucide-react';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function VendorDetailClientView({ vendorId }) {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [vendor, setVendor] = useState(null);
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Selected Service / Package State
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDay, setSelectedDay] = useState(29);
  const [currentMonthYear, setCurrentMonthYear] = useState('July 2026');

  // Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [eventFunction, setEventFunction] = useState('Barat Planning');
  const [eventDate, setEventDate] = useState('2026-10-24');
  const [guestCount, setGuestCount] = useState(200);
  const [eventSlot, setEventSlot] = useState('Evening Slot');
  const [selectedHallId, setSelectedHallId] = useState('');
  const [halls, setHalls] = useState([]);
  const [custPhone, setCustPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [inquiryError, setInquiryError] = useState('');

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const res = await api.get('/halls');
      if (res.data.success) {
        setHalls(res.data.halls || []);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetail();
    }
  }, [vendorId]);

  const [vendorPackages, setVendorPackages] = useState([]);

  const fetchVendorDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/vendors/${vendorId}`);
      if (res.data.success && res.data.vendor) {
        setVendor(res.data.vendor);
        const services = res.data.subServices || [];
        const pkgs = res.data.packages || [];
        setSubServices(services);
        setVendorPackages(pkgs);
        if (pkgs.length > 0) {
          setSelectedService(pkgs[0]);
        } else if (services.length > 0) {
          setSelectedService(services[0]);
        }
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Direct vendor fetch failed, trying list fallback:', err);
    }

    // Resilient Fallback: search vendor list if direct endpoint missed
    try {
      const listRes = await api.get('/vendors');
      if (listRes.data.success && listRes.data.vendors?.length > 0) {
        const match = listRes.data.vendors.find((v) => String(v.id) === String(vendorId)) || listRes.data.vendors[0];
        const formatted = {
          ...match,
          business_name: match.business_name || match.name,
          category_name: match.category_name || 'Wedding Vendor',
          city: match.city || selectedCity,
          address: match.address || `${match.city || selectedCity}, Pakistan`,
          starting_price: match.starting_price || 25000,
          rating: match.rating || 4.8,
          reviews: match.reviews || 120,
        };
        setVendor(formatted);

        if (match.category_id) {
          try {
            const ssRes = await api.get(`/categories/${match.category_id}/sub-services`);
            if (ssRes.data.success) {
              const services = ssRes.data.subServices || [];
              setSubServices(services);
              if (services.length > 0) setSelectedService(services[0]);
            }
          } catch (_) {}
        }
        setLoading(false);
        return;
      }
    } catch (fallbackErr) {
      console.error('Fallback vendor fetch failed:', fallbackErr);
    }

    setError('Vendor not found.');
    setLoading(false);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    const targetId = tabName.toLowerCase();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      setFeedback('');
      setInquiryError('');

      const selectedDateFormatted = eventDate || `2026-07-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`;
      const phoneNum = custPhone || user.phone || '+92 300 1234567';

      // 1. Submit to Vendor Portal Inbox
      if (vendor?.id) {
        try {
          await api.post(`/vendors/${vendor.id}/inquiry`, {
            customer_name: user.name,
            customer_phone: phoneNum,
            customer_email: user.email,
            event_function: eventFunction,
            event_date: selectedDateFormatted,
            guest_count: parseInt(guestCount) || 100,
            message: `Interested in ${selectedService?.name || vendor.business_name} package for ${eventFunction}.`
          });
        } catch (_) {}
      }

      // 2. Submit to central bookings desk
      const payload = {
        hall_id: selectedHallId ? parseInt(selectedHallId) : null,
        is_vendor_quote: !selectedHallId,
        event_type: eventFunction,
        event_date: selectedDateFormatted,
        slot: eventSlot,
        guest_count: parseInt(guestCount) || 200,
        customer_phone: phoneNum,
        customer_name: user.name,
        customer_email: user.email,
        total_amount: selectedService?.price ? Number(selectedService.price) : undefined,
        selected_services: selectedService ? [{
          id: selectedService.id,
          name: selectedService.name,
          price: selectedService.price,
          category_id: vendor?.category_id || 1,
          package_id: selectedService.id
        }] : [],
      };

      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        setFeedback(
          `✅ Availability inquiry submitted for ${vendor?.business_name || 'Vendor'}! The vendor will review your requested date and call you at ${phoneNum}.`
        );
        setTimeout(() => setQuoteModalOpen(false), 3000);
      } else {
        setInquiryError(res.data.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit inquiry.';
      setInquiryError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F9] text-[#111827]">
        <MarketplaceHeader selectedCity={selectedCity} onSelectCity={setSelectedCity} />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-[#705562]">
          <div className="w-10 h-10 border-4 border-[#AA336A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-sm">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-[#FAF7F9] text-[#111827]">
        <MarketplaceHeader selectedCity={selectedCity} onSelectCity={setSelectedCity} />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-extrabold text-[#22131A] mb-2">{error || 'Vendor Not Found'}</h2>
          <p className="text-xs text-[#705562] mb-6">The requested vendor details could not be loaded.</p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#AA336A] text-white text-xs font-bold hover:bg-[#8E2656] transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Browse Service Categories
          </Link>
        </div>
      </div>
    );
  }

  const vendorName = vendor.business_name || vendor.name || 'Vendor Service';
  const vendorCity = vendor.city || selectedCity;
  const vendorAddress = vendor.address || `${vendorCity}, Pakistan`;
  const vendorCategory = vendor.category_name || 'Vendor Service';
  const rating = parseFloat(vendor.rating) || 4.8;
  const reviewsCount = vendor.reviews || 120;
  const startingPrice = parseFloat(vendor.starting_price) || 25000;
  const coverImage = vendor.image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';

  const galleryImages = Array.from(
    new Set(
      [
        coverImage,
        ...(vendor?.gallery ? (typeof vendor.gallery === 'string' ? JSON.parse(vendor.gallery) : vendor.gallery) : []),
        ...subServices.map((s) => s.image_url).filter(Boolean),
      ].filter(Boolean)
    )
  );

  const calculateTotal = (selectedService?.price || startingPrice) * (vendor.category_name?.toLowerCase().includes('catering') ? guestCount : 1);

  return (
    <div className="min-h-screen bg-[#FDFBFB] text-[#111827]">
      <MarketplaceHeader selectedCity={selectedCity} onSelectCity={setSelectedCity} />

      {/* Sticky Sub-Header Nav Tabs */}
      <div className="bg-white border-b border-[#F0D5E2] sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-8 text-xs font-extrabold text-[#604453]">
            {['Details', 'Packages', 'Location', 'Reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`py-3.5 border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-[#AA336A] text-[#AA336A] font-bold'
                    : 'border-transparent text-gray-500 hover:text-[#AA336A]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-gray-500">Starting from</span>
            <span className="text-sm font-extrabold text-[#AA336A] font-mono">
              PKR {startingPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* SECTION: Details */}
        <div id="details" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-28">
          {/* Left Summary */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#22131A] text-white flex items-center justify-center text-xs font-bold shadow-md">
                  ✓
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-[#22131A]">
                  {vendorName}
                </h1>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#705562] font-semibold">
                <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{rating}</span>
                </div>
                <span>({reviewsCount} reviews)</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#604453]">
                  <MapPin className="w-3.5 h-3.5 text-[#AA336A]" /> {vendorAddress}
                </span>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="space-y-4 pt-4 border-t border-[#F0D5E2]">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#22131A]">
                SERVICE SPECIFICATIONS
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-extrabold uppercase text-[#604453] text-[11px] flex items-center gap-1 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-[#AA336A]" /> SERVICE CATEGORY
                  </div>
                  <div className="text-[#22131A] font-semibold">{vendorCategory}</div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[#604453] text-[11px] flex items-center gap-1 mb-1">
                    <Users className="w-3.5 h-3.5 text-[#AA336A]" /> EVENT CAPACITY
                  </div>
                  <div className="text-[#22131A] font-semibold">100 to 1500 Guests</div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[#604453] text-[11px] flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#AA336A]" /> SERVICE COVERAGE
                  </div>
                  <div className="text-[#22131A] font-semibold">Full Event Coverage & Setup</div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[#604453] text-[11px] flex items-center gap-1 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#AA336A]" /> BOOKING DEPOSIT
                  </div>
                  <div className="text-[#22131A] font-semibold">25% Advance to Lock Date</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-4 border-t border-[#F0D5E2]">
              <h3 className="text-xs font-extrabold uppercase text-[#604453]">DESCRIPTION</h3>
              <p className="text-xs text-[#705562] leading-relaxed font-normal">
                {vendorName} in {vendorCity} provides high-end {vendorCategory.toLowerCase()} services tailored for Pakistani weddings. Celebrating traditional elegance with modern quality standards, offering customized packages for Baraat, Mehndi, Walima, Nikkah, and Qawali Night functions.
              </p>
            </div>

            {/* Included Amenities */}
            <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-[#AA336A] tracking-wider block">
                INCLUDED FEATURES & GUARANTEES
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {['Verified Partner', 'On-Time Service', 'Professional Staff', 'Custom Packages', 'Clean Setup'].map((am, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-[#F0D5E2] text-[#22131A] font-bold text-[11px]">
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Photo Gallery Collage */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-end">
              <button className="text-xs font-bold text-[#AA336A] flex items-center gap-1 hover:underline">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            <div className="rounded-3xl overflow-hidden border border-[#F0D5E2] shadow-lg p-2 bg-white space-y-2">
              <div 
                onClick={() => setLightboxOpen(true)}
                className="h-80 w-full rounded-2xl overflow-hidden relative cursor-pointer group"
              >
                <img 
                  src={galleryImages[selectedImageIndex] || galleryImages[0] || coverImage} 
                  alt={vendorName} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-extrabold text-xs">
                  Click to View Fullscreen
                </div>
              </div>

              {galleryImages.length > 1 && (
                <div className={`grid gap-2 ${galleryImages.length === 2 ? 'grid-cols-2' : galleryImages.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  {galleryImages.slice(0, 4).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`h-24 rounded-xl overflow-hidden relative transition-all border-2 text-left ${
                        selectedImageIndex === i
                          ? 'border-[#AA336A] ring-2 ring-[#AA336A]/30 scale-[0.98]'
                          : 'border-transparent hover:opacity-90'
                      }`}
                    >
                      <img src={img} alt={`${vendorName} ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 3 && galleryImages.length > 4 && (
                        <div 
                          onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-extrabold text-xs hover:bg-black/70"
                        >
                          +{galleryImages.length - 4} Photos
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right pt-2">
              <span className="text-xs text-[#705562] font-semibold block">Package Pricing Starts From</span>
              <span className="text-2xl font-extrabold text-[#AA336A] font-mono">
                PKR {startingPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: Packages & Menu Selection */}
        <div id="packages" className="space-y-6 pt-6 border-t border-[#F0D5E2] scroll-mt-28">
          <h2 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
            Package Options & Availability Calendar
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Packages List */}
            <div className="lg:col-span-3 space-y-2">
              {subServices.length > 0 ? (
                subServices.map((ss) => (
                  <button
                    key={ss.id}
                    onClick={() => setSelectedService(ss)}
                    className={`w-full p-3.5 rounded-2xl text-left border text-xs font-extrabold transition-all flex items-center justify-between ${
                      selectedService?.id === ss.id
                        ? 'bg-[#E33B70] text-white border-[#E33B70] shadow-md'
                        : 'bg-gray-50 border-[#F0D5E2] text-[#604453] hover:bg-[#FAF5F7]'
                    }`}
                  >
                    <div>
                      <div>{ss.name}</div>
                      <div className={selectedService?.id === ss.id ? 'text-amber-200 font-mono' : 'text-[#AA336A] font-mono'}>
                        PKR {Number(ss.price).toLocaleString()}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-75" />
                  </button>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-gray-50 border border-[#F0D5E2] text-xs font-bold text-[#705562]">
                  Standard Package: PKR {startingPrice.toLocaleString()}
                </div>
              )}
            </div>

            {/* Middle Selected Package Breakdown */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#F0D5E2] space-y-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F0D5E2] pb-3">
                  <h3 className="text-base font-extrabold text-[#22131A]">
                    {selectedService?.name || `${vendorCategory} Package`}
                  </h3>
                  <span className="text-sm font-extrabold text-[#AA336A] font-mono">
                    PKR {Number(selectedService?.price || startingPrice).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-[#705562] leading-relaxed">
                  {selectedService?.description || `${vendorName} full signature service setup, professional execution, and event coordination.`}
                </p>

                {vendorCategory.toLowerCase().includes('catering') && (
                  <div className="pt-4 border-t border-[#F0D5E2] space-y-2">
                    <label className="block text-xs font-bold text-[#604453] uppercase">
                      Select Guest Count:
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                    >
                      <option value={100}>100 Guests</option>
                      <option value={200}>200 Guests</option>
                      <option value={300}>300 Guests</option>
                      <option value={500}>500 Guests</option>
                      <option value={800}>800 Guests</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#F0D5E2] flex items-center justify-between">
                <span className="text-xs text-[#705562] font-semibold">Total Estimated Amount</span>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#AA336A] font-mono block">
                    PKR {calculateTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Interactive Date Picker */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#F0D5E2] space-y-4 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase text-[#22131A] tracking-wider">
                Select Your Event Date
              </h3>

              <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#22131A]">
                  <button className="p-1 hover:text-[#AA336A]">‹</button>
                  <span>{currentMonthYear}</span>
                  <button className="p-1 hover:text-[#AA336A]">›</button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-500">
                  {DAYS_OF_WEEK.map((d) => <span key={d}>{d}</span>)}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#22131A]">
                  {[29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDay(day)}
                      className={`p-1.5 rounded-lg transition-all ${
                        selectedDay === day
                          ? 'bg-[#E33B70] text-white shadow-xs font-extrabold'
                          : 'hover:bg-[#F0D5E2]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setQuoteModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-[#E33B70] hover:bg-[#AA336A] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Check Availability & Quote</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION: Location */}
        <div id="location" className="space-y-4 pt-6 border-t border-[#F0D5E2] scroll-mt-28">
          <h2 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
            Location & Map
          </h2>

          <div className="bg-white rounded-3xl p-6 border border-[#F0D5E2] space-y-4 shadow-xs">
            <span className="text-xs font-extrabold text-[#604453] uppercase block">
              Main Studio / Office Address
            </span>
            <div className="h-56 rounded-2xl bg-[#22131A] relative overflow-hidden flex items-center justify-center text-white p-6">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
                alt="Map View"
                className="w-full h-full object-cover opacity-40 absolute inset-0"
              />
              <div className="relative z-10 text-center space-y-2">
                <MapPin className="w-8 h-8 text-[#AA336A] mx-auto animate-bounce" />
                <p className="text-sm font-extrabold">{vendorAddress}</p>
                <p className="text-xs text-gray-300">Verified Service Area: {vendorCity} & Surrounding Cities</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Reviews */}
        <div id="reviews" className="space-y-4 pt-6 border-t border-[#F0D5E2] scroll-mt-28">
          <h2 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
            Reviews & Customer Feedback
          </h2>

          <div className="bg-white rounded-3xl p-6 border border-[#F0D5E2] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{rating} by Verified Client</span>
            </div>
            <p className="text-xs text-[#705562] leading-relaxed">
              "The team at {vendorName} was exceptionally professional! Everything was delivered right on time with flawless execution for our wedding event."
            </p>
          </div>
        </div>
      </main>

      {/* Quote / Availability Modal */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5E2] shadow-2xl space-y-5">
            <button
              onClick={() => {
                setQuoteModalOpen(false);
                setInquiryError('');
                setFeedback('');
              }}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#AA336A] uppercase tracking-wider">
                Vendor Quote Request
              </span>
              <h3 className="text-xl font-bold font-serif-title text-[#22131A]">
                {vendorName}
              </h3>
              <p className="text-xs text-[#705562]">
                Service: <span className="font-bold text-[#22131A]">{selectedService?.name || vendorCategory}</span>
              </p>
            </div>

            {feedback && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {inquiryError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <X className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{inquiryError}</span>
              </div>
            )}

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Event Function
                  </label>
                  <select
                    value={eventFunction}
                    onChange={(e) => setEventFunction(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold uppercase text-[#22131A]"
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
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Function Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Schedule Slot
                  </label>
                  <select
                    value={eventSlot}
                    onChange={(e) => setEventSlot(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                  >
                    <option value="Evening Slot">Evening Slot</option>
                    <option value="Night Slot">Night Slot</option>
                    <option value="Day Slot">Day Slot</option>
                    <option value="Afternoon Slot">Afternoon Slot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Estimated Guests
                  </label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    min="10"
                    placeholder="e.g. 200"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                  Venue / Hall Selection
                </label>
                <select
                  value={selectedHallId}
                  onChange={(e) => setSelectedHallId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                >
                  <option value="">Vendor Service Quote Only (No Venue Rental Fee)</option>
                  {halls.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                  Contact Phone Number (+92)
                </label>
                <input
                  type="tel"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-[#E33B70] hover:bg-[#AA336A] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Send Quote Request to {vendorName}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <OtpAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />

      {/* Fullscreen Gallery Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
            className="absolute left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="max-w-4xl max-h-[85vh] p-2 flex flex-col items-center space-y-4">
            <img
              src={galleryImages[selectedImageIndex] || coverImage}
              alt={vendorName}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
            <div className="text-white text-xs font-bold font-mono bg-white/10 px-4 py-1.5 rounded-full">
              Photo {selectedImageIndex + 1} of {galleryImages.length}
            </div>
          </div>

          <button
            onClick={() => setSelectedImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
}