'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import MarketplaceHeader from '../../../components/MarketplaceHeader';
import OtpAuthModal from '../../../components/OtpAuthModal';
import {
  Sparkles,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Zap,
  X,
  Building2,
  Camera,
  Sparkle,
  Paintbrush,
  Utensils,
  Heart,
  Crown,
  Flame,
  Award,
  Music,
} from 'lucide-react';

const EVENT_GUIDE_INFO = {
  'barat-planning': {
    title: 'Baraat Planning Guide & Traditional Wedding Celebration Ideas',
    subtitle: 'One of the most significant aspects of a Pakistani wedding is the planning of the Baraat. Tailored venue selection, decorative styling, catering, and event management.',
    eventShort: 'Barat',
  },
  'mehndi-mayo': {
    title: 'Mehndi & Mayo Planning Guide & Colorful Dholki Ideas',
    subtitle: 'The Mehndi & Mayo ceremony is the most vibrant and high-energy celebration of Pakistani weddings. Filled with traditional dholki beats, organic henna application, colorful floral decor, and live street food counters.',
    eventShort: 'Mehndi & Mayo',
  },
  'walima-reception': {
    title: 'Walima Reception Guide & Elegant Banquet Ideas',
    subtitle: 'The Walima is the grand sunnah reception hosted by the groom family. It calls for sophisticated ballroom settings, lavish mutton buffet spreads, refined floral stage design, and memorable photography.',
    eventShort: 'Walima',
  },
  'nikkah': {
    title: 'Nikkah Ceremony Guide & Sacred Sacred Moments',
    subtitle: 'The solemn and sacred Nikkah ritual marks the official Islamic marriage contract. Intimate floral backdrops, qabool hai mirrors, elegant rooftop venues, and traditional sweet distributions make this day magical.',
    eventShort: 'Nikkah',
  },
  'bridal-shower': {
    title: 'Bridal Shower & Bachelorette Planning Guide',
    subtitle: 'Celebrate the bride-to-be with private lounge decor, customized themed cakes, glam makeover sessions, and aesthetic photography shoots with her closest friends.',
    eventShort: 'Bridal Shower',
  },
  'qawali-night': {
    title: 'Qawali Night Guide & Sufi Musical Evening Ideas',
    subtitle: 'Immerse your guests in soulful live Qawali performances, cozy floor bolster seating, warm ambient lanterns, and traditional hot chai & jalebi stalls.',
    eventShort: 'Qawali Night',
  },
  'engagement': {
    title: 'Engagement Ceremony Guide & Ring Exchange Ideas',
    subtitle: 'Mark the beginning of your wedding journey with an intimate ring exchange event, fresh flower backdrop arches, and refined catering menus.',
    eventShort: 'Engagement',
  },
};

const CITIES = ['Lahore', 'Islamabad', 'Rawalpindi', 'Karachi'];

// Map event slugs to preferred venue types for filtering
const EVENT_VENUE_TYPES = {
  'barat-planning': 'Ballroom',
  'mehndi-mayo': 'Lawn',
  'walima-reception': 'Marquee',
  'nikkah': 'Courtyard',
  'bridal-shower': 'Suite',
  'qawali-night': 'Haveli',
  'engagement': 'Lawn',
};

export default function EventClientView({ slug }) {
  const { user } = useAuth();

  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [cityTabBySection, setCityTabBySection] = useState({
    venues: 'Lahore',
    photographers: 'Lahore',
    makeup: 'Lahore',
    decor: 'Lahore',
    catering: 'Lahore',
    henna: 'Lahore',
  });

  // Modal State
  const [quoteModalTarget, setQuoteModalTarget] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [eventDate, setEventDate] = useState('2026-10-24');
  const [guestCount, setGuestCount] = useState(300);
  const [custPhone, setCustPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const guide = EVENT_GUIDE_INFO[slug] || EVENT_GUIDE_INFO['barat-planning'];

  const [dbHalls, setDbHalls] = useState([]);
  const [dbPhotographers, setDbPhotographers] = useState([]);
  const [dbMakeup, setDbMakeup] = useState([]);
  const [dbDecor, setDbDecor] = useState([]);
  const [dbCatering, setDbCatering] = useState([]);
  const [dbHenna, setDbHenna] = useState([]);
  const [dbSubEvents, setDbSubEvents] = useState([]);
  const [selectedSubEvent, setSelectedSubEvent] = useState(null);

  // Map event slugs to their event IDs in MySQL
  const EVENT_SLUG_TO_ID = {
    'barat-planning': 1,
    'mehndi-mayo': 2,
    'walima-reception': 3,
    'nikkah': 4,
    'bridal-shower': 5,
    'qawali-night': 6,
    'engagement': 7,
  };

  React.useEffect(() => {
    fetchSectionData();
    fetchSubEvents();
  }, [
    slug,
    cityTabBySection.venues,
    cityTabBySection.photographers,
    cityTabBySection.makeup,
    cityTabBySection.decor,
    cityTabBySection.catering,
    cityTabBySection.henna,
  ]);

  const fetchSubEvents = async () => {
    try {
      const eventId = EVENT_SLUG_TO_ID[slug];
      if (!eventId) return;
      const res = await api.get(`/events/${eventId}/sub-events`);
      if (res.data.success && res.data.subEvents.length > 0) {
        setDbSubEvents(res.data.subEvents);
      }
    } catch (err) {
      console.error('Failed to fetch sub-events:', err);
    }
  };

  const fetchSectionData = async () => {
    try {
      // 1. Fetch Halls matching event venue type and city from MySQL
      const vType = EVENT_VENUE_TYPES[slug];
      let hallUrl = `/halls?city=${encodeURIComponent(cityTabBySection.venues)}`;
      if (vType) {
        hallUrl += `&venue_type=${encodeURIComponent(vType)}`;
      }
      const hRes = await api.get(hallUrl);
      if (hRes.data.success && hRes.data.halls.length > 0) {
        setDbHalls(hRes.data.halls);
      } else {
        setDbHalls([]);
      }

      // 2. Fetch Photographers from MySQL
      const pRes = await api.get(`/vendors?category=Photographers&city=${encodeURIComponent(cityTabBySection.photographers)}`);
      if (pRes.data.success && pRes.data.vendors.length > 0) {
        setDbPhotographers(pRes.data.vendors);
      } else {
        setDbPhotographers([]);
      }

      // 3. Fetch Bridal Makeup from MySQL
      const mRes = await api.get(`/vendors?category=Bridal Makeup&city=${encodeURIComponent(cityTabBySection.makeup)}`);
      if (mRes.data.success && mRes.data.vendors.length > 0) {
        setDbMakeup(mRes.data.vendors);
      } else {
        setDbMakeup([]);
      }

      // 4. Fetch Decor from MySQL
      const dRes = await api.get(`/vendors?category=Decor&city=${encodeURIComponent(cityTabBySection.decor)}`);
      if (dRes.data.success && dRes.data.vendors.length > 0) {
        setDbDecor(dRes.data.vendors);
      } else {
        setDbDecor([]);
      }

      // 5. Fetch Catering from MySQL
      const cRes = await api.get(`/vendors?category=Catering&city=${encodeURIComponent(cityTabBySection.catering)}`);
      if (cRes.data.success && cRes.data.vendors.length > 0) {
        setDbCatering(cRes.data.vendors);
      } else {
        setDbCatering([]);
      }

      // 6. Fetch Henna Artists from MySQL
      const hnRes = await api.get(`/vendors?category=Henna Artists&city=${encodeURIComponent(cityTabBySection.henna)}`);
      if (hnRes.data.success && hnRes.data.vendors.length > 0) {
        setDbHenna(hnRes.data.vendors);
      } else {
        setDbHenna([]);
      }
    } catch (err) {
      console.error('Failed to fetch section data from MySQL:', err);
    }
  };

  const setCityForSection = (sectionKey, city) => {
    setCityTabBySection({ ...cityTabBySection, [sectionKey]: city });
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

      const payload = {
        hall_id: 1,
        event_type: guide.eventShort,
        event_date: eventDate,
        guest_count: guestCount,
        customer_phone: custPhone || user.phone || '+92 300 1234567',
        customer_name: user.name,
        customer_email: user.email,
        selected_services: quoteModalTarget ? [quoteModalTarget] : [],
      };

      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        setFeedback(`Inquiry #${res.data.bookingId} submitted! ${quoteModalTarget?.name} will contact you shortly.`);
        setTimeout(() => setQuoteModalTarget(null), 3000);
      }
    } catch (err) {
      alert('Failed to submit event inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBFB] text-[#111827]">
      <MarketplaceHeader selectedCity={selectedCity} onSelectCity={setSelectedCity} />

      {/* TOP HEADER: Event Planning Guide Banner (Matching Shadiyana Image 1) */}
      <div className="bg-white border-b border-[#F0D5E2] py-10 px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="max-w-7xl mx-auto space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif-title text-[#22131A] tracking-tight">
            {guide.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#705562] max-w-5xl leading-relaxed font-normal">
            {guide.subtitle}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

        {/* SUB-EVENTS HIERARCHY: Show clickable sub-event chips if available from MySQL */}
        {dbSubEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#22131A]">
                {guide.eventShort} Sub-Functions
              </h2>
              <span className="text-xs text-[#705562]">Select a specific function to filter vendors</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedSubEvent(null)}
                className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${selectedSubEvent === null
                    ? 'bg-[#AA336A] text-white border-[#AA336A]'
                    : 'bg-white text-[#AA336A] border-[#AA336A] hover:bg-[#FFF0F6]'
                  }`}
              >
                All Functions
              </button>
              {dbSubEvents.map((se) => (
                <button
                  key={se.id}
                  onClick={() => setSelectedSubEvent(se)}
                  className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${selectedSubEvent?.id === se.id
                      ? 'bg-[#AA336A] text-white border-[#AA336A]'
                      : 'bg-white text-[#705562] border-[#E8C4D8] hover:bg-[#FFF0F6] hover:border-[#AA336A]'
                    }`}
                >
                  {se.name}
                </button>
              ))}
            </div>
            {selectedSubEvent && (
              <div className="bg-[#FFF7FB] border border-[#E8C4D8] rounded-2xl px-5 py-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#AA336A] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#22131A]">{selectedSubEvent.name}</p>
                  <p className="text-xs text-[#705562] mt-1">{selectedSubEvent.description}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 1: Wedding Venues for [Event] (Light Background - Matching Image 1) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-title text-[#22131A]">
              Wedding Venues for {guide.eventShort}
            </h2>
            <Link href="/venues" className="text-xs font-bold text-[#AA336A] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* City Underline Tabs */}
          <div className="flex border-b border-gray-200 text-xs font-extrabold text-[#604453] gap-6">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCityForSection('venues', c)}
                className={`pb-2 transition-all ${cityTabBySection.venues === c
                    ? 'text-[#AA336A] border-b-2 border-[#AA336A]'
                    : 'text-gray-500 hover:text-[#AA336A]'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Vendor Cards Carousel Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(dbHalls.length > 0
              ? dbHalls.map((h) => ({
                id: h.id,
                name: h.name,
                rating: 4.4,
                reviews: 24,
                image: h.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
              }))
              : []
            ).map((v) => (
              <Link
                key={v.id}
                href={`/venues/detail?id=${v.id}&name=${encodeURIComponent(v.name)}`}
                className="group bg-white rounded-2xl border border-[#F0D5E2] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="h-36 w-full bg-gray-100 relative overflow-hidden">
                  <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="text-xs font-bold text-[#22131A] truncate">{v.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-[#705562] font-semibold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{v.rating} ({v.reviews})</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SECTION 2: Photographers for [Event] (DARK NAVY BACKGROUND - Matching Image 2) */}
        <div className="bg-[#11223A] rounded-3xl p-8 text-white space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-title">
              Photographers for {guide.eventShort}
            </h2>
            <Link href="/categories/photographers" className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex border-b border-gray-700 text-xs font-extrabold text-gray-300 gap-6">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCityForSection('photographers', c)}
                className={`pb-2 transition-all ${cityTabBySection.photographers === c
                    ? 'text-amber-300 border-b-2 border-amber-300 font-extrabold'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {dbPhotographers.length > 0 ? (
              dbPhotographers.map((p) => ({
                id: p.id,
                name: p.business_name,
                rating: parseFloat(p.rating) || 4.9,
                reviews: p.reviews || 120,
                image: p.image_url || 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
              })).map((v) => (
                <Link
                  key={v.id}
                  href={`/vendors/${v.id}`}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden shadow-xs hover:border-amber-300/60 transition-all duration-200 cursor-pointer flex flex-col justify-between text-white"
                >
                  <div className="h-36 w-full bg-gray-800 relative overflow-hidden">
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-xs font-bold truncate">{v.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-amber-300 font-semibold">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{v.rating} ({v.reviews})</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-gray-300 font-medium">
                No photographers listed in {cityTabBySection.photographers} yet.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: Bridal Makeup Artists for [Event] (LIGHT BACKGROUND - Matching Image 3) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-title text-[#22131A]">
              Bridal Makeup Artists for {guide.eventShort}
            </h2>
            <Link href="/categories/bridal-makeup" className="text-xs font-bold text-[#AA336A] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex border-b border-gray-200 text-xs font-extrabold text-[#604453] gap-6">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCityForSection('makeup', c)}
                className={`pb-2 transition-all ${cityTabBySection.makeup === c
                    ? 'text-[#AA336A] border-b-2 border-[#AA336A]'
                    : 'text-gray-500 hover:text-[#AA336A]'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {dbMakeup.length > 0 ? (
              dbMakeup.map((m) => ({
                id: m.id,
                name: m.business_name,
                rating: parseFloat(m.rating) || 4.8,
                reviews: m.reviews || 95,
                image: m.image_url || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
              })).map((v) => (
                <Link
                  key={v.id}
                  href={`/vendors/${v.id}`}
                  className="group bg-white rounded-2xl border border-[#F0D5E2] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-36 w-full bg-gray-100 relative overflow-hidden">
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-xs font-bold text-[#22131A] truncate">{v.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-[#705562] font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{v.rating} ({v.reviews})</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full p-6 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-center text-xs text-[#705562] font-medium">
                No bridal makeup artists listed in {cityTabBySection.makeup} yet.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Decor for [Event] (DARK NAVY BACKGROUND - Matching Image 4) */}
        <div className="bg-[#11223A] rounded-3xl p-8 text-white space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-title">
              Decor & Stage Setup for {guide.eventShort}
            </h2>
            <Link href="/categories/decor" className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex border-b border-gray-700 text-xs font-extrabold text-gray-300 gap-6">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCityForSection('decor', c)}
                className={`pb-2 transition-all ${cityTabBySection.decor === c
                    ? 'text-amber-300 border-b-2 border-amber-300 font-extrabold'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {dbDecor.length > 0 ? (
              dbDecor.map((d) => ({
                id: d.id,
                name: d.business_name,
                rating: parseFloat(d.rating) || 5.0,
                reviews: d.reviews || 140,
                image: d.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
              })).map((v) => (
                <Link
                  key={v.id}
                  href={`/vendors/${v.id}`}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden shadow-xs hover:border-amber-300/60 transition-all duration-200 cursor-pointer flex flex-col justify-between text-white"
                >
                  <div className="h-36 w-full bg-gray-800 relative overflow-hidden">
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-xs font-bold truncate">{v.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-amber-300 font-semibold">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{v.rating} ({v.reviews})</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-gray-300 font-medium">
                No decor vendors listed in {cityTabBySection.decor} yet.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: Food & Catering for [Event] (LIGHT BACKGROUND - Matching Image 5) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-title text-[#22131A]">
              Food & Catering Services for {guide.eventShort}
            </h2>
            <Link href="/categories/catering" className="text-xs font-bold text-[#AA336A] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex border-b border-gray-200 text-xs font-extrabold text-[#604453] gap-6">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCityForSection('catering', c)}
                className={`pb-2 transition-all ${cityTabBySection.catering === c
                    ? 'text-[#AA336A] border-b-2 border-[#AA336A]'
                    : 'text-gray-500 hover:text-[#AA336A]'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {dbCatering.length > 0 ? (
              dbCatering.map((c) => ({
                id: c.id,
                name: c.business_name,
                rating: parseFloat(c.rating) || 4.6,
                reviews: c.reviews || 210,
                image: c.image_url || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80',
              })).map((v) => (
                <Link
                  key={v.id}
                  href={`/vendors/${v.id}`}
                  className="group bg-white rounded-2xl border border-[#F0D5E2] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-36 w-full bg-gray-100 relative overflow-hidden">
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-xs font-bold text-[#22131A] truncate">{v.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-[#705562] font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{v.rating} ({v.reviews})</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full p-6 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-center text-xs text-[#705562] font-medium">
                No catering vendors listed in {cityTabBySection.catering} yet.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: Henna Artists for [Event] (LIGHT BACKGROUND) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-title text-[#22131A]">
              Henna & Mehndi Artists for {guide.eventShort}
            </h2>
            <Link href="/categories/henna-artists" className="text-xs font-bold text-[#AA336A] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex border-b border-gray-200 text-xs font-extrabold text-[#604453] gap-6">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCityForSection('henna', c)}
                className={`pb-2 transition-all ${cityTabBySection.henna === c
                    ? 'text-[#AA336A] border-b-2 border-[#AA336A]'
                    : 'text-gray-500 hover:text-[#AA336A]'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {dbHenna.length > 0 ? (
              dbHenna.map((hn) => ({
                id: hn.id,
                name: hn.business_name,
                rating: parseFloat(hn.rating) || 4.9,
                reviews: hn.reviews || 310,
                image: hn.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
              })).map((v) => (
                <Link
                  key={v.id}
                  href={`/vendors/${v.id}`}
                  className="group bg-white rounded-2xl border border-[#F0D5E2] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-36 w-full bg-gray-100 relative overflow-hidden">
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-xs font-bold text-[#22131A] truncate">{v.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-[#705562] font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{v.rating} ({v.reviews})</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full p-6 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-center text-xs text-[#705562] font-medium">
                No henna artists listed in {cityTabBySection.henna} yet.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal: Availability / Price Quote Inquiry */}
      {quoteModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#F0D5E2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#AA336A] tracking-wider">
                  Check Availability & Pricing
                </span>
                <h3 className="text-lg font-bold text-[#22131A]">{quoteModalTarget.name}</h3>
              </div>
              <button
                onClick={() => setQuoteModalTarget(null)}
                className="p-1 rounded-lg text-[#705562] hover:text-[#22131A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{feedback}</span>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Expected Guests
                  </label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="300"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Phone Number (WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0D5E2]">
                  <button
                    type="button"
                    onClick={() => setQuoteModalTarget(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#705562]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#AA336A] text-white font-bold text-xs hover:bg-[#8E2656] shadow-md"
                  >
                    {submitting ? 'Submitting...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {authModalOpen && <OtpAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}
