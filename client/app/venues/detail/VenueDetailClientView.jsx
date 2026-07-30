'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MarketplaceHeader from '../../../components/MarketplaceHeader';
import OtpAuthModal from '../../../components/OtpAuthModal';
import { useAuth } from '../../../lib/auth';
import api from '../../../lib/api';
import {
  Star,
  MapPin,
  Share2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Building2,
  Users,
  Utensils,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  X,
  Phone,
  Clock,
  Car,
  Wifi,
  Sparkles,
  HelpCircle,
  Award,
} from 'lucide-react';

const MENU_OPTIONS = [
  { id: 1, name: 'Menu 1 (Tax Exclusive)', pricePerHead: 2200 },
  { id: 2, name: 'Menu 2 (Tax Exclusive)', pricePerHead: 2299 },
  { id: 3, name: 'Menu 3 (Tax Exclusive)', pricePerHead: 2499 },
  { id: 4, name: 'Menu 4 (Tax Exclusive)', pricePerHead: 2499 },
  { id: 5, name: 'Menu 5 (Tax Exclusive)', pricePerHead: 2545 },
  { id: 6, name: 'Menu 6 (Tax Exclusive)', pricePerHead: 3445 },
  { id: 7, name: 'Menu 7 (Tax Exclusive)', pricePerHead: 3550 },
  { id: 8, name: 'Menu 8 (Tax Exclusive)', pricePerHead: 3599 },
  { id: 9, name: 'Menu 9 (Tax Exclusive)', pricePerHead: 3999 },
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function VenueDetailClientView() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const nameFromUrl = searchParams.get('name');

  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [activeTab, setActiveTab] = useState('Details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Dynamic Hall State
  const [hallData, setHallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subVenues, setSubVenues] = useState([]);
  const [selectedSubVenue, setSelectedSubVenue] = useState(null);

  // Menu & Pricing State
  const [selectedMenu, setSelectedMenu] = useState(MENU_OPTIONS[4]);
  const [guestCount, setGuestCount] = useState(200);

  // Calendar State
  const [selectedDay, setSelectedDay] = useState(29);
  const [currentMonthYear, setCurrentMonthYear] = useState('July 2026');
  const [pricingAccordionOpen, setPricingAccordionOpen] = useState(true);

  // Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchVenueDetails();
  }, [idFromUrl, nameFromUrl]);

  const fetchVenueDetails = async () => {
    try {
      setLoading(true);
      if (idFromUrl) {
        const res = await api.get(`/halls/${idFromUrl}`);
        if (res.data.success && res.data.hall) {
          setHallData(res.data.hall);
          setLoading(false);
          // Fetch sub-venues for this hall
          try {
            const svRes = await api.get(`/halls/${idFromUrl}/sub-venues`);
            if (svRes.data.success && svRes.data.subVenues.length > 0) {
              setSubVenues(svRes.data.subVenues);
            }
          } catch (svErr) { }
          return;
        }
      }

      // Fallback query by name or list
      const listRes = await api.get('/halls');
      if (listRes.data.success && listRes.data.halls.length > 0) {
        let match = listRes.data.halls.find(
          (h) => h.name.toLowerCase() === (nameFromUrl || '').toLowerCase()
        );
        setHallData(match || listRes.data.halls[0]);
      }
    } catch (err) {
      console.error('Failed to fetch venue detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const venueName = hallData?.name || nameFromUrl || 'Heritage Haveli & Banquet';
  const venueCity = hallData?.city || 'Lahore';
  const venueAddress = hallData?.address || `${venueCity}, Pakistan`;
  const venueType = hallData?.venue_type || 'Haveli, Ballroom, Outdoor Lawn';
  const capMin = hallData?.capacity_min || 100;
  const capMax = hallData?.capacity_max || 1000;
  const coverImage = hallData?.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80';

  const galleryImages = Array.from(
    new Set(
      [
        coverImage,
        ...(hallData?.gallery ? (typeof hallData.gallery === 'string' ? JSON.parse(hallData.gallery) : hallData.gallery) : []),
        ...subVenues.map((sv) => sv.image_url).filter(Boolean),
      ].filter(Boolean)
    )
  );

  let amenitiesList = ['Generator Backup', 'Bridal Room', 'DJ & Sound System', 'Valet Parking', 'Air Conditioning'];
  if (hallData?.amenities) {
    try {
      const parsed = typeof hallData.amenities === 'string' ? JSON.parse(hallData.amenities) : hallData.amenities;
      if (Array.isArray(parsed) && parsed.length > 0) amenitiesList = parsed;
    } catch (e) { }
  }

  const totalCalculatedPrice = selectedMenu.pricePerHead * guestCount;
  const selectedDateFormatted = `2026-07-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`;

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    const targetId = tabName.toLowerCase();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookingInquiry = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      setFeedback('');

      const payload = {
        hall_id: hallData?.id || 1,
        event_type: 'Event Planning',
        event_date: selectedDateFormatted,
        guest_count: guestCount,
        customer_phone: user.phone || '+92 300 1234567',
        customer_name: user.name,
        customer_email: user.email,
        total_amount: totalCalculatedPrice,
      };

      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        setFeedback(`Reservation Inquiry #${res.data.bookingId} submitted for ${venueName}! Total: PKR ${totalCalculatedPrice.toLocaleString()}. Our venue manager will contact you at ${payload.customer_phone}.`);
      }
    } catch (err) {
      alert('Failed to submit venue reservation inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBFB] text-[#111827]">
      <MarketplaceHeader selectedCity={selectedCity} onSelectCity={setSelectedCity} />

      {/* Sticky Sub-Header Nav Tabs */}
      <div className="bg-white border-b border-[#F0D5E2] sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8 text-xs font-extrabold text-[#604453]">
          {['Details', 'Pricing', 'Location', 'Reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`py-3.5 border-b-2 transition-all ${activeTab === tab
                  ? 'border-[#AA336A] text-[#AA336A] font-bold'
                  : 'border-transparent text-gray-500 hover:text-[#AA336A]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* SUB-VENUES: Show child sub-venue cards if available from MySQL */}
        {subVenues.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#22131A]">Available Spaces at {venueName}</h2>
              <p className="text-xs text-[#705562] mt-1">Select a specific space to see its details and pricing</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subVenues.map((sv) => (
                <div
                  key={sv.id}
                  onClick={() => setSelectedSubVenue(selectedSubVenue?.id === sv.id ? null : sv)}
                  className={`rounded-2xl border cursor-pointer overflow-hidden transition-all hover:shadow-lg ${selectedSubVenue?.id === sv.id
                      ? 'border-[#AA336A] ring-2 ring-[#AA336A] shadow-md'
                      : 'border-[#F0D5E2] hover:border-[#E8C4D8]'
                    }`}
                >
                  {sv.image_url && (
                    <img src={sv.image_url} alt={sv.name} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-3 bg-white space-y-1">
                    <h3 className="text-sm font-bold text-[#22131A]">{sv.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-[#705562]">
                      <Users className="w-3 h-3" />
                      <span>{sv.capacity_min}–{sv.capacity_max} guests</span>
                    </div>
                    <div className="text-xs font-extrabold text-[#AA336A]">
                      PKR {Number(sv.price_per_event || 0).toLocaleString()}
                    </div>
                    <span className="inline-block text-[10px] font-bold bg-[#F5E3EC] text-[#AA336A] px-2 py-0.5 rounded-full">
                      {sv.venue_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {selectedSubVenue && (
              <div className="bg-[#FFF7FB] border border-[#E8C4D8] rounded-2xl px-5 py-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#AA336A] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#22131A]">Selected: {selectedSubVenue.name}</p>
                  <p className="text-xs text-[#705562] mt-0.5">
                    Capacity: {selectedSubVenue.capacity_min}–{selectedSubVenue.capacity_max} guests · PKR {Number(selectedSubVenue.price_per_event).toLocaleString()} per event
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION: Details */}
        <div id="details" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-28">
          {/* Left Details Summary */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#11223A] text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-[#22131A]">
                  {venueName}
                </h1>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#705562] font-semibold">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.8</span>
                </div>
                <span>(42 reviews)</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#604453]">
                  <MapPin className="w-3.5 h-3.5 text-[#AA336A]" /> {venueAddress}
                </span>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="space-y-4 pt-4 border-t border-[#F0D5E2]">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#22131A]">
                Venue Specifications
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-extrabold uppercase text-[#604453] text-[11px] flex items-center gap-1 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-[#AA336A]" /> VENUE TYPE
                  </div>
                  <div className="text-[#22131A] font-semibold">{venueType}</div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[#604453] text-[11px] flex items-center gap-1 mb-1">
                    <Users className="w-3.5 h-3.5 text-[#AA336A]" /> CAPACITY
                  </div>
                  <div className="text-[#22131A] font-semibold">{capMin} to {capMax} Guests</div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[#604453] text-[11px] flex items-center gap-1 mb-1">
                    <Car className="w-3.5 h-3.5 text-[#AA336A]" /> PARKING SPACE
                  </div>
                  <div className="text-[#22131A] font-semibold">250+ Vehicles (Valet)</div>
                </div>

                <div>
                  <div className="font-extrabold uppercase text-[#604453] text-[11px] flex items-center gap-1 mb-1">
                    <Utensils className="w-3.5 h-3.5 text-[#AA336A]" /> CATERING
                  </div>
                  <div className="text-[#22131A] font-semibold">External & In-house</div>
                </div>

                <div className="col-span-2">
                  <div className="font-extrabold uppercase text-[#604453] text-[11px] flex items-center gap-1 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#AA336A]" /> CANCELLATION POLICY
                  </div>
                  <div className="text-[#22131A] font-semibold">Flexible / Partially Refundable</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-4 border-t border-[#F0D5E2]">
              <h3 className="text-xs font-extrabold uppercase text-[#604453]">DESCRIPTION</h3>
              <p className="text-xs text-[#705562] leading-relaxed font-normal">
                {venueName} in {venueCity} is a premier wedding venue beautifully merging traditional Pakistani heritage with modern luxury. Featuring spacious indoor halls, lush open lawns, and custom stage design, this venue creates unforgettable moments for Baraat, Mehndi, Walima, Nikkah, and Qawali Night celebrations.
              </p>
            </div>

            {/* Amenities Banner */}
            <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-[#AA336A] tracking-wider block">
                INCLUDED AMENITIES
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {amenitiesList.map((am, i) => (
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
                  alt={venueName} 
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
                      <img src={img} alt={`${venueName} ${i + 1}`} className="w-full h-full object-cover" />
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
              <span className="text-xs text-[#705562] font-semibold block">Pricing Packages</span>
              <span className="text-2xl font-extrabold text-[#AA336A] font-mono">
                PKR 2,200 – PKR 3,999
              </span>
              <span className="text-xs text-gray-500 block">/ guest</span>
            </div>
          </div>
        </div>

        {/* SECTION: Pricing */}
        <div id="pricing" className="space-y-4 pt-6 border-t border-[#F0D5E2] scroll-mt-28">
          <h2 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
            Venue Pricing & Rental Options
          </h2>

          <div className="rounded-2xl border border-[#F0D5E2] bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setPricingAccordionOpen(!pricingAccordionOpen)}
              className="w-full p-4 flex items-center justify-between bg-[#FAF5F7] border-b border-[#F0D5E2] text-xs font-extrabold text-[#22131A] uppercase tracking-wider"
            >
              <span>HALL & HAVELI RENTAL (TAX EXCLUSIVE)</span>
              <div className="flex items-center gap-3">
                <span className="text-[#AA336A] font-mono">Starting From PKR 180,000</span>
                {pricingAccordionOpen ? <ChevronUp className="w-4 h-4 text-[#AA336A]" /> : <ChevronDown className="w-4 h-4 text-[#AA336A]" />}
              </div>
            </button>

            {pricingAccordionOpen && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs bg-white">
                <div className="space-y-1">
                  <div className="font-extrabold uppercase text-[#604453] text-[11px]">AIR CONDITIONING & HEATING</div>
                  <div className="font-mono font-bold text-[#22131A] text-sm">PKR 120,000</div>
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold uppercase text-[#604453] text-[11px]">LIGHTING & STAGE BACKDROP</div>
                  <div className="font-mono font-bold text-[#22131A] text-sm">PKR 60,000</div>
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold uppercase text-[#604453] text-[11px]">BASE VENUE RENT</div>
                  <div className="font-mono font-bold text-[#AA336A] text-sm">PKR 180,000</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: Menu Pricing & Interactive Calendar */}
        <div className="space-y-6 pt-6 border-t border-[#F0D5E2]">
          <h2 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
            Menu Selection & Availability Calendar
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-3 space-y-2">
              {MENU_OPTIONS.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => setSelectedMenu(menu)}
                  className={`w-full p-3.5 rounded-2xl text-left border text-xs font-extrabold transition-all flex items-center justify-between ${selectedMenu.id === menu.id
                      ? 'bg-[#E33B70] text-white border-[#E33B70] shadow-md'
                      : 'bg-gray-50 border-[#F0D5E2] text-[#604453] hover:bg-[#FAF5F7]'
                    }`}
                >
                  <div>
                    <div>{menu.name}</div>
                    <div className={selectedMenu.id === menu.id ? 'text-amber-200 font-mono' : 'text-[#AA336A] font-mono'}>
                      PKR {menu.pricePerHead.toLocaleString()}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-75" />
                </button>
              ))}
            </div>

            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#F0D5E2] shadow-sm space-y-6">
              <div className="space-y-4 text-xs border-b border-[#F0D5E2] pb-6">
                <div>
                  <span className="font-extrabold text-[#604453] uppercase block mb-1">🍲 STARTERS</span>
                  <p className="text-[#705562] font-semibold">Salad Choice: Fresh Green Salad / Russian Salad / Apple Cabbage.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#604453] uppercase block mb-1">🍗 MAIN COURSE</span>
                  <p className="text-[#705562] font-semibold">Chicken Kashmiri Qorma, Mutton Biryani, Tandoori Naan, Raita & Pickle.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#604453] uppercase block mb-1">🥤 DRINKS</span>
                  <p className="text-[#705562] font-semibold">Chilled Soft Drinks & Mineral Water.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#604453] uppercase block mb-1">🍨 DESSERTS</span>
                  <p className="text-[#705562] font-semibold">Shahee Kheer, Hot Gulaab Jaman & Badami Firni.</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase text-[#604453] block">Guests</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                  >
                    <option value={100}>100 Guests</option>
                    <option value={200}>200 Guests</option>
                    <option value={300}>300 Guests</option>
                    <option value={500}>500 Guests</option>
                    <option value={800}>800 Guests</option>
                  </select>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-[#AA336A] font-mono">
                    PKR {totalCalculatedPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    PKR {selectedMenu.pricePerHead.toLocaleString()} / person
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#F0D5E2] shadow-sm space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-[#22131A] text-center sm:text-left">
                  Select your event date
                </h3>

                <div className="rounded-2xl border border-[#F0D5E2] p-4 bg-[#FFFFFF] space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#22131A] border-b border-[#F0D5E2] pb-3">
                    <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold">{currentMonthYear}</span>
                    <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#22131A]">
                    <div className="text-gray-300 py-1.5">29</div>
                    <div className="text-gray-300 py-1.5">30</div>
                    {[...Array(31)].map((_, index) => {
                      const dayNum = index + 1;
                      const todayDay = 29;
                      const isPast = dayNum < todayDay;
                      const isSelected = selectedDay === dayNum;

                      return (
                        <button
                          key={dayNum}
                          disabled={isPast}
                          onClick={() => !isPast && setSelectedDay(dayNum)}
                          className={`py-1.5 rounded-full text-xs transition-all flex items-center justify-center font-semibold ${isSelected
                              ? 'bg-[#E33B70] text-white font-extrabold shadow-md'
                              : isPast
                                ? 'text-gray-300 cursor-not-allowed bg-gray-50/50 line-through opacity-50'
                                : 'hover:bg-rose-50 text-[#22131A]'
                            }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {feedback && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              <button
                onClick={handleBookingInquiry}
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-[#E33B70] hover:bg-[#AA336A] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#E33B70]/30 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Check Availability</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION: Location Map */}
        <div id="location" className="space-y-6 pt-6 border-t border-[#F0D5E2] scroll-mt-28">
          <h2 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
            Location & Map
          </h2>

          <div className="rounded-3xl overflow-hidden border border-[#F0D5E2] bg-white p-4 space-y-3 shadow-sm">
            <h3 className="text-sm font-extrabold text-[#22131A]">Main Branch Address</h3>

            <div className="h-64 w-full rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] relative overflow-hidden flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80"
                alt="Map location"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white text-xs font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                {venueAddress}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Reviews */}
        <div id="reviews" className="space-y-4 pt-6 border-t border-[#F0D5E2] scroll-mt-28">
          <h2 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
            Reviews & Customer Feedback
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-[#F0D5E2] space-y-1">
              <div className="flex items-center gap-1 text-amber-500 font-bold mb-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>5.0</span>
                <span className="text-gray-400 font-normal ml-2">by Hamza Khan</span>
              </div>
              <p className="text-[#705562]">The venue space was exceptionally well-maintained, lush green lawns, and decor execution for our Qawali event was top notch!</p>
            </div>
          </div>
        </div>
      </main>

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
              alt={venueName}
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
