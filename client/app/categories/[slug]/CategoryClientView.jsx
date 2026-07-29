'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import MarketplaceHeader from '../../../components/MarketplaceHeader';
import OtpAuthModal from '../../../components/OtpAuthModal';
import {
  ArrowRight,
  Sparkles,
  Utensils,
  Paintbrush,
  Sparkle,
  Music,
  Camera,
  Check,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  CheckCircle2,
  X,
  Car,
  FileText,
  Building2,
  PhoneCall,
  Star,
  CheckSquare,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const CATEGORY_TITLES = {
  'bridal-makeup': 'Top Bridal Makeup Artists In Pakistan',
  'photographers': 'Top Wedding Photographers & Videographers In Pakistan',
  'catering': 'Top Food & Catering Services In Pakistan',
  'decor': 'Top Stage & Floral Wedding Decorators In Pakistan',
  'henna-artists': 'Top Henna & Mehndi Artists In Pakistan',
  'car-rental': 'Top Luxury & Vintage Wedding Car Rentals In Pakistan',
  'stationery': 'Top Wedding Cards & Invitation Printers In Pakistan',
  'dj-sound-system': 'Top DJ & Concert Sound Systems In Pakistan',
};

const CATEGORY_SUBTITLES = {
  'bridal-makeup': 'Level up with the best bridal artists in Rawalpindi, Islamabad, Karachi, and Lahore within your budget on ShaadiPro. Get complete details of salon makeup artist, hair stylist, their prices and much more.',
  'photographers': 'Capture your precious moments with cinematic wedding films, portrait photo albums, and drone coverage by Pakistan top-rated photographers.',
  'catering': 'Authentic Pakistani cuisine, mutton karahi, live BBQ stalls, biryani, and dessert counters served by certified master chefs.',
  'decor': 'Royal Mughal stage setups, fresh imported floral arrangements, lighting canopies, and luxury entrance gateways.',
  'henna-artists': 'Intricate bridal mehndi designs, heavy organic henna, and dedicated family artist packages for your dholki & mayo.',
  'car-rental': 'Arrive in style with decorated luxury Mercedes, vintage Rolls Royce, Audi, and Limousines with uniformed chauffeurs.',
  'stationery': 'Custom acrylic invitation boxes, gold foil-stamped suites, wax seal envelopes, and animated WhatsApp cards.',
  'dj-sound-system': 'High-power JBL sound towers, intelligent moving heads, smoke fountains, and DJ beats for your Qawali & sangeet night.',
};

// Rich VENDOR LISTING DATA items matched by category slug
const MOCK_VENDORS_BY_SLUG = {
  'bridal-makeup': [
    {
      id: 101,
      name: 'Hifsa Khan Salon',
      verified: true,
      badge: 'Top Pick',
      rating: 4.8,
      reviewsCount: 208,
      address: 'Sherpao Bridge, Abid Majeed Road, Lahore',
      city: 'Lahore',
      type: 'Salon',
      startingPrice: 10000,
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      description: "Hifsa Khan Salon's makeup artists are celebrated for their expertise in enhancing your natural beauty. With a passion for cosmetics and a commitment to personalized service, Hifsa Khan Salon makeup artists ensure you look and feel your absolute best.",
      travelsHome: true,
      servicesFor: 'Female',
    },
    {
      id: 102,
      name: 'Mehwish Almas Salon',
      verified: true,
      badge: 'Top Pick',
      rating: 4.9,
      reviewsCount: 191,
      address: '35 Z, DHA Phase 3, Lahore',
      city: 'Lahore',
      type: 'Salon',
      startingPrice: 5500,
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      description: 'Mehwish Almas Bridal Salon is a favorite choice among brides who want a soft, elegant and professionally done bridal look. The salon offers complete bridal makeup, party makeup and hairstyling with special attention to skin prep.',
      travelsHome: true,
      servicesFor: 'Female',
    },
    {
      id: 103,
      name: 'AFM Salon & Studio',
      verified: true,
      badge: 'Popular',
      rating: 4.7,
      reviewsCount: 145,
      address: 'Block 4, Gulshan-e-Iqbal, Karachi',
      city: 'Karachi',
      type: 'Salon',
      startingPrice: 6000,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      description: 'AFM Salon specializes in women salon and bridal makeup services in Karachi. The salon ethos centers on offering the perfect blend of beauty and relaxation, catering exclusively to female clients with a flexible cancellation policy.',
      travelsHome: false,
      servicesFor: 'Female',
    },
    {
      id: 104,
      name: 'Nabila Signature Salon',
      verified: true,
      badge: 'Luxury',
      rating: 4.9,
      reviewsCount: 312,
      address: 'F-7 Markaz, Islamabad',
      city: 'Islamabad',
      type: 'Salon',
      startingPrice: 25000,
      image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
      description: 'High-end luxury bridal makeover by senior master artists using premium international cosmetic brands. Includes hair extensions, jewelry setting, skin hydration glow treatments, and trial session.',
      travelsHome: true,
      servicesFor: 'Female',
    },
  ],
  'photographers': [
    {
      id: 201,
      name: 'Maha Wajahat Khan Photography',
      verified: true,
      badge: 'Top Pick',
      rating: 4.9,
      reviewsCount: 340,
      address: 'Main Boulevard, Gulberg III, Lahore',
      city: 'Lahore',
      type: 'Studio',
      startingPrice: 65000,
      image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
      description: 'Pakistan premier luxury wedding photography team. Specializing in emotional candid captures, 4K 60fps cinematic teasers, drone aerial coverage, and handcrafted leather photo albums.',
      travelsHome: true,
      servicesFor: 'All',
    },
    {
      id: 202,
      name: 'Irfan Ahson Fine Art Films',
      verified: true,
      badge: 'Celebrity Choice',
      rating: 5.0,
      reviewsCount: 420,
      address: 'DHA Phase 5, Lahore',
      city: 'Lahore',
      type: 'Studio',
      startingPrice: 120000,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      description: 'Royalty & celebrity wedding photography studio. Iconic portraiture, high-definition lighting, multi-cam live streaming, and full event videography team.',
      travelsHome: true,
      servicesFor: 'All',
    },
    {
      id: 203,
      name: 'Studio 360 Visuals',
      verified: true,
      badge: 'Budget Friendly',
      rating: 4.7,
      reviewsCount: 110,
      address: 'Blue Area, Islamabad',
      city: 'Islamabad',
      type: 'Freelance',
      startingPrice: 35000,
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      description: 'Creative youth photography squad offering affordable DSLR coverage, outdoor couple portrait shoot, short Instagram reels, and customized digital drive deliverables.',
      travelsHome: true,
      servicesFor: 'All',
    },
  ],
  'catering': [
    {
      id: 301,
      name: 'Royal Mughal Caterers & Chefs',
      verified: true,
      badge: 'Top Pick',
      rating: 4.9,
      reviewsCount: 290,
      address: 'MM Alam Road, Lahore',
      city: 'Lahore',
      type: 'Master Chef',
      startingPrice: 1650,
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      description: 'Exquisite Pakistani culinary experience. Specializing in mutton desi ghee karahi, chicken zafrani biryani, live reshmi kabab BBQ, live tandoor naans, and hot shahi kheer.',
      travelsHome: true,
      servicesFor: 'All',
    },
    {
      id: 302,
      name: 'Hanif Rajput Catering Services',
      verified: true,
      badge: 'Heritage',
      rating: 4.8,
      reviewsCount: 512,
      address: 'Clifton Block 5, Karachi',
      city: 'Karachi',
      type: 'Master Chef',
      startingPrice: 1800,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      description: 'Decades of authentic royal catering tradition. Full-scale banquet setup, waiter uniform staff, premium bone china crockery, and live dessert cooking counters.',
      travelsHome: true,
      servicesFor: 'All',
    },
  ],
  'decor': [
    {
      id: 401,
      name: 'Qasim Yar Tiwana (QYT) Events & Decor',
      verified: true,
      badge: 'Top Pick',
      rating: 5.0,
      reviewsCount: 380,
      address: 'Gulberg II, Lahore',
      city: 'Lahore',
      type: 'Designer',
      startingPrice: 150000,
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
      description: 'Bespoke grand wedding decor. Majestic flower chandeliers, Mughal entrance gateways, velvet sofa seating, fairy light tunnels, and customized couple stage setups.',
      travelsHome: true,
      servicesFor: 'All',
    },
  ],
};

const BUDGET_OPTIONS = [
  { label: '0 - 8,000', min: 0, max: 8000 },
  { label: '8,001 - 20,000', min: 8001, max: 20000 },
  { label: '20,001 - 35,000', min: 20001, max: 35000 },
  { label: '35,001 - 60,000', min: 35001, max: 60000 },
  { label: '60,001 - 100,000', min: 60001, max: 100000 },
  { label: '100,000+', min: 100001, max: 9999999 },
];

export default function CategoryClientView({ slug }) {
  const { user } = useAuth();

  // Filters State
  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [vendorType, setVendorType] = useState('ALL');
  const [servicesFor, setServicesFor] = useState('ALL');
  const [staffGender, setStaffGender] = useState('ALL');
  const [travelsHomeOnly, setTravelsHomeOnly] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Modals & Inquiries
  const [quoteModalTarget, setQuoteModalTarget] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [eventFunction, setEventFunction] = useState('Barat Planning');
  const [eventDate, setEventDate] = useState('2026-10-24');
  const [guestCount, setGuestCount] = useState(300);
  const [custPhone, setCustPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [dbVendors, setDbVendors] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbSubServices, setDbSubServices] = useState([]);
  const [selectedSubService, setSelectedSubService] = useState(null);

  // Map category slugs to category IDs in MySQL
  const CATEGORY_SLUG_TO_ID = {
    'catering': 1, 'decor': 2, 'bridal-makeup': 3,
    'henna-artists': 4, 'dj-sound-system': 5, 'photographers': 6,
    'car-rental': 7, 'wedding-stationery': 8,
  };

  useEffect(() => {
    fetchDbVendors();
    fetchSubServices();
  }, [slug, selectedCity]);

  const fetchSubServices = async () => {
    try {
      const catId = CATEGORY_SLUG_TO_ID[slug];
      if (!catId) return;
      const res = await api.get(`/categories/${catId}/sub-services`);
      if (res.data.success && res.data.subServices.length > 0) {
        setDbSubServices(res.data.subServices);
      }
    } catch (err) {
      console.error('Failed to load sub-services:', err);
    }
  };

  const fetchDbVendors = async () => {
    try {
      setLoadingDb(true);
      const res = await api.get('/vendors');
      if (res.data.success && res.data.vendors.length > 0) {
        const formatted = res.data.vendors.map((v) => ({
          id: v.id,
          name: v.business_name,
          verified: v.status === 'approved',
          badge: 'Top Pick',
          rating: 4.8,
          reviewsCount: 150,
          address: v.address || 'Lahore, Pakistan',
          city: v.city || 'Lahore',
          type: v.category_name || 'Vendor',
          startingPrice: 15000,
          image: v.image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
          description: `${v.business_name} provides professional services in ${selectedCity} with top ratings and high customer satisfaction.`,
          travelsHome: true,
          servicesFor: 'All',
        }));
        setDbVendors(formatted);
      }
    } catch (err) {
      console.error('Failed to load vendors from MySQL:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  const pageTitle = CATEGORY_TITLES[slug] || `Top Vendors in ${slug}`;
  const pageSubtitle = CATEGORY_SUBTITLES[slug] || 'Browse top rated vendors, compare pricing, and send direct availability inquiries.';
  const rawVendors = dbVendors.length > 0 ? dbVendors : (MOCK_VENDORS_BY_SLUG[slug] || MOCK_VENDORS_BY_SLUG['bridal-makeup']);

  // Toggle Budget Filter Checkboxes
  const handleBudgetToggle = (label) => {
    if (selectedBudgets.includes(label)) {
      setSelectedBudgets(selectedBudgets.filter((b) => b !== label));
    } else {
      setSelectedBudgets([...selectedBudgets, label]);
    }
  };

  // Filter vendors logic
  const filteredVendors = rawVendors.filter((vendor) => {
    // City match (soft or exact)
    const matchesCity = !selectedCity || vendor.city.toLowerCase() === selectedCity.toLowerCase();

    // Budget match
    let matchesBudget = true;
    if (selectedBudgets.length > 0) {
      matchesBudget = selectedBudgets.some((bLabel) => {
        const option = BUDGET_OPTIONS.find((o) => o.label === bLabel);
        if (!option) return false;
        return vendor.startingPrice >= option.min && vendor.startingPrice <= option.max;
      });
    }

    // Type match
    const matchesType = vendorType === 'ALL' || vendor.type.toLowerCase() === vendorType.toLowerCase();

    // Travels to Home
    const matchesTravels = !travelsHomeOnly || vendor.travelsHome;

    return matchesCity && matchesBudget && matchesType && matchesTravels;
  });

  const displayVendors = filteredVendors.length > 0 ? filteredVendors : rawVendors;

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
        event_type: eventFunction,
        event_date: eventDate,
        guest_count: guestCount,
        customer_phone: custPhone || user.phone || '+92 300 1234567',
        customer_name: user.name,
        customer_email: user.email,
        selected_services: quoteModalTarget ? [quoteModalTarget] : [],
      };

      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        setFeedback(`Inquiry #${res.data.bookingId} submitted successfully! ${quoteModalTarget?.name} team will contact you at ${payload.customer_phone}.`);
        setTimeout(() => setQuoteModalTarget(null), 3000);
      }
    } catch (err) {
      alert('Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBFB] text-[#111827]">
      <MarketplaceHeader selectedCity={selectedCity} onSelectCity={setSelectedCity} />

      {/* Header Banner Title Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 space-y-2 border-b border-[#F0D5E2]">
        <h1 className="text-2xl sm:text-4xl font-extrabold font-serif-title text-[#22131A] tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#705562] max-w-4xl leading-relaxed font-medium">
          {pageSubtitle}
        </p>
      </div>

      {/* Main Container: Left Filters Sidebar + Right Horizontal Vendor Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* SUB-SERVICES: Show add-on service chips if available from MySQL */}
        {dbSubServices.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#22131A]">Popular Add-On Services</h2>
              <span className="text-xs text-[#705562]">Select an add-on to filter vendors that offer it</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubService(null)}
                className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                  selectedSubService === null
                    ? 'bg-[#AA336A] text-white border-[#AA336A]'
                    : 'bg-white text-[#AA336A] border-[#AA336A] hover:bg-[#FFF0F6]'
                }`}
              >
                All Services
              </button>
              {dbSubServices.map((ss) => (
                <button
                  key={ss.id}
                  onClick={() => setSelectedSubService(selectedSubService?.id === ss.id ? null : ss)}
                  className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                    selectedSubService?.id === ss.id
                      ? 'bg-[#AA336A] text-white border-[#AA336A]'
                      : 'bg-white text-[#705562] border-[#E8C4D8] hover:bg-[#FFF0F6] hover:border-[#AA336A]'
                  }`}
                >
                  {ss.name} · PKR {Number(ss.price).toLocaleString()}
                </button>
              ))}
            </div>
            {selectedSubService && (
              <div className="bg-[#FFF7FB] border border-[#E8C4D8] rounded-2xl px-5 py-4 flex items-start gap-3">
                <span className="text-[#AA336A] text-lg mt-0.5">✦</span>
                <div>
                  <p className="text-sm font-bold text-[#22131A]">{selectedSubService.name}</p>
                  <p className="text-xs text-[#705562] mt-0.5">{selectedSubService.description}</p>
                  <p className="text-xs font-extrabold text-[#AA336A] mt-1">PKR {Number(selectedSubService.price).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT SIDEBAR FILTERS CARD (Shadiyana Exact Design) */}
          <div className="w-full lg:w-72 bg-white rounded-3xl p-6 border border-[#F0D5E2] shadow-sm space-y-6 flex-shrink-0">
            <div className="flex items-center justify-between border-b border-[#F0D5E2] pb-3">
              <span className="text-xs font-extrabold uppercase text-[#22131A] tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#AA336A]" />
                Filter Vendors
              </span>
              <button
                onClick={() => {
                  setSelectedBudgets([]);
                  setVendorType('ALL');
                  setServicesFor('ALL');
                  setStaffGender('ALL');
                  setTravelsHomeOnly(false);
                }}
                className="text-[11px] font-bold text-[#AA336A] hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* City Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#604453] uppercase block">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A] focus:outline-none"
              >
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Karachi">Karachi</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Multan">Multan</option>
              </select>
            </div>

            {/* Budget (per event) */}
            <div className="space-y-3 pt-3 border-t border-[#F0D5E2]">
              <label className="text-xs font-extrabold text-[#604453] uppercase block">
                Budget (per event)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 text-xs">
                {BUDGET_OPTIONS.map((opt) => (
                  <label key={opt.label} className="flex items-center gap-2 text-[#705562] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBudgets.includes(opt.label)}
                      onChange={() => handleBudgetToggle(opt.label)}
                      className="w-4 h-4 rounded text-[#AA336A] focus:ring-[#AA336A] border-[#F0D5E2]"
                    />
                    <span>PKR {opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-3 pt-3 border-t border-[#F0D5E2]">
              <label className="text-xs font-extrabold text-[#604453] uppercase block">
                Vendor Type
              </label>
              <div className="flex gap-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer text-[#705562]">
                  <input
                    type="radio"
                    name="vType"
                    checked={vendorType === 'Salon' || vendorType === 'Studio'}
                    onChange={() => setVendorType('Salon')}
                    className="w-4 h-4 text-[#AA336A] border-[#F0D5E2]"
                  />
                  <span>Salon / Studio</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#705562]">
                  <input
                    type="radio"
                    name="vType"
                    checked={vendorType === 'Freelance'}
                    onChange={() => setVendorType('Freelance')}
                    className="w-4 h-4 text-[#AA336A] border-[#F0D5E2]"
                  />
                  <span>Freelance</span>
                </label>
              </div>
            </div>

            {/* Services for */}
            <div className="space-y-3 pt-3 border-t border-[#F0D5E2]">
              <label className="text-xs font-extrabold text-[#604453] uppercase block">
                Services for
              </label>
              <div className="flex gap-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer text-[#705562]">
                  <input
                    type="radio"
                    name="sFor"
                    checked={servicesFor === 'Female'}
                    onChange={() => setServicesFor('Female')}
                    className="w-4 h-4 text-[#AA336A] border-[#F0D5E2]"
                  />
                  <span>Female</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#705562]">
                  <input
                    type="radio"
                    name="sFor"
                    checked={servicesFor === 'Male'}
                    onChange={() => setServicesFor('Male')}
                    className="w-4 h-4 text-[#AA336A] border-[#F0D5E2]"
                  />
                  <span>Male</span>
                </label>
              </div>
            </div>

            {/* Staff Gender */}
            <div className="space-y-3 pt-3 border-t border-[#F0D5E2]">
              <label className="text-xs font-extrabold text-[#604453] uppercase block">
                Staff
              </label>
              <div className="flex gap-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer text-[#705562]">
                  <input
                    type="radio"
                    name="stGender"
                    checked={staffGender === 'Female'}
                    onChange={() => setStaffGender('Female')}
                    className="w-4 h-4 text-[#AA336A] border-[#F0D5E2]"
                  />
                  <span>Female</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#705562]">
                  <input
                    type="radio"
                    name="stGender"
                    checked={staffGender === 'Male'}
                    onChange={() => setStaffGender('Male')}
                    className="w-4 h-4 text-[#AA336A] border-[#F0D5E2]"
                  />
                  <span>Male</span>
                </label>
              </div>
            </div>

            {/* Travels to Client's Home Toggle */}
            <div className="pt-3 border-t border-[#F0D5E2] flex items-center justify-between text-xs font-extrabold text-[#604453]">
              <span>Travels to Client's Home</span>
              <button
                type="button"
                onClick={() => setTravelsHomeOnly(!travelsHomeOnly)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  travelsHomeOnly ? 'bg-[#AA336A]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    travelsHomeOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Cancellation Policy Accordion */}
            <div className="pt-3 border-t border-[#F0D5E2] text-xs font-extrabold text-[#604453] space-y-2">
              <div className="flex items-center justify-between cursor-pointer">
                <span>Cancellation Policy</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-[11px] text-[#705562] font-normal">
                Flexible token refund up to 7 days prior to function date.
              </p>
            </div>
          </div>

          {/* RIGHT MAIN LISTING CONTAINER */}
          <div className="flex-1 space-y-6 w-full">
            {/* Top Bar: Results Count */}
            <div className="flex items-center justify-between text-xs text-[#705562] font-bold border-b border-[#F0D5E2] pb-3">
              <span className="uppercase tracking-wider">
                {displayVendors.length} OF {displayVendors.length} RESULTS
              </span>

              <div className="flex items-center gap-1">
                <span className="text-gray-400 uppercase text-[10px]">SORT BY:</span>
                <span className="text-[#22131A] uppercase font-bold">RELEVANCE</span>
              </div>
            </div>

            {/* HORIZONTAL VENDOR CARDS LISTING (Shadiyana Exact Design) */}
            <div className="space-y-6">
              {displayVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-3xl border border-[#F0D5E2] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-stretch"
                >
                  {/* Left Widescreen Image Thumbnail */}
                  <div className="w-full md:w-80 h-56 md:h-auto bg-gray-100 relative overflow-hidden flex-shrink-0">
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#22131A] text-white shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      {vendor.badge || 'Verified'}
                    </div>
                  </div>

                  {/* Right Card Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Link href="/venues/detail" className="text-xl font-bold font-serif-title text-[#22131A] hover:text-[#AA336A]">
                          {vendor.name}
                        </Link>
                        <CheckCircle2 className="w-4 h-4 text-[#AA336A] flex-shrink-0" />
                      </div>

                      {/* Rating & Address */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#705562]">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{vendor.rating}</span>
                        </div>
                        <span>({vendor.reviewsCount} reviews)</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#604453] truncate max-w-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#AA336A]" />
                          {vendor.address}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#705562] font-medium leading-relaxed line-clamp-3">
                        {vendor.description}
                      </p>
                    </div>

                    {/* Bottom Price & Action Buttons */}
                    <div className="pt-4 border-t border-[#F0D5E2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] text-[#705562] block font-medium">Starting from</span>
                        <span className="text-xl font-extrabold text-[#22131A] font-mono">
                          PKR {vendor.startingPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href="/venues/detail"
                          className="px-5 py-3 rounded-2xl bg-[#E33B70] hover:bg-[#AA336A] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#E33B70]/20 transition-all flex items-center gap-1.5"
                        >
                          <span>Check Availability & Pricing</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Availability & Pricing Modal */}
      {quoteModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5E2] shadow-2xl space-y-5">
            <button
              onClick={() => setQuoteModalTarget(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#AA336A] uppercase tracking-wider">
                Vendor Quote Request
              </span>
              <h3 className="text-xl font-bold font-serif-title text-[#22131A]">
                {quoteModalTarget.name}
              </h3>
              <p className="text-xs text-[#705562]">
                Location: <span className="font-bold text-[#22131A]">{quoteModalTarget.address}</span>
              </p>
            </div>

            {feedback && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{feedback}</span>
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
                    <span>Send Quote Request to Vendor</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP Auth Modal */}
      <OtpAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
