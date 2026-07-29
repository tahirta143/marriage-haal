'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Building2,
  Utensils,
  Paintbrush,
  Sparkle,
  Music,
  Camera,
  ArrowRight,
  Search,
  Grid,
  Calendar,
  Car,
  FileText,
  Crown,
  Flame,
  Gem,
  Award,
  Heart,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const VENDOR_MODULES = [
  {
    title: 'Photographers & Videographers',
    slug: 'photographers',
    icon: Camera,
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
    count: '24+ Photographers',
    startingPrice: 'PKR 45,000',
    desc: 'Cinematic wedding films, DSLR photo albums, drone aerial coverage & portrait shoots.',
  },
  {
    title: 'Bridal Makeup Artists',
    slug: 'bridal-makeup',
    icon: Sparkle,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    count: '18+ Artists',
    startingPrice: 'PKR 25,000',
    desc: 'HD airbrush bridal glam, baraat makeover, hair styling & jewelry setting.',
  },
  {
    title: 'Food & Catering Services',
    slug: 'catering',
    icon: Utensils,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    count: '32+ Master Chefs',
    startingPrice: 'PKR 1,500 / guest',
    desc: 'Mutton karahi, biryani, live tandoor, dessert bars & live BBQ setups.',
  },
  {
    title: 'Stage & Theme Decor',
    slug: 'decor',
    icon: Paintbrush,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    count: '15+ Designers',
    startingPrice: 'PKR 120,000',
    desc: 'Royal Mughal stage setups, fresh exotic flower canopy, LED cans & entrance gates.',
  },
  {
    title: 'Henna & Mehndi Artists',
    slug: 'henna-artists',
    icon: Sparkle,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    count: '12+ Specialists',
    startingPrice: 'PKR 18,000',
    desc: 'Heavy organic bridal henna, arm motif designs & family mehndi artist packages.',
  },
  {
    title: 'Luxury Wedding Car Rental',
    slug: 'car-rental',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    count: '20+ Cars',
    startingPrice: 'PKR 35,000',
    desc: 'Decorated vintage Mercedes, Rolls Royce & Limousines with uniformed chauffeurs.',
  },
  {
    title: 'Invitation Cards & Stationery',
    slug: 'stationery',
    icon: FileText,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    count: '14+ Printers',
    startingPrice: 'PKR 22,000',
    desc: 'Acrylic foil-stamped invitation suites, wax seal envelopes & digital WhatsApp cards.',
  },
  {
    title: 'DJ & Concert Sound Systems',
    slug: 'dj-sound-system',
    icon: Music,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    count: '10+ Crews',
    startingPrice: 'PKR 15,000 / hr',
    desc: 'JBL concert sound towers, intelligent moving heads, smoke fountains & DJ night.',
  },
];

const VENUE_MODULES = [
  {
    title: 'Grand Ballrooms',
    type: 'ballroom',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    capacity: '300 - 1500 Guests',
    desc: 'Fully air-conditioned luxury indoor halls with chandelier lighting & stage.',
  },
  {
    title: 'Royal Marquees',
    type: 'marquee',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    capacity: '200 - 1000 Guests',
    desc: 'High-ceiling carpeted marquees with segregated guest seating & valet.',
  },
  {
    title: 'Open Lawns & Gardens',
    type: 'lawn',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    capacity: '150 - 800 Guests',
    desc: 'Open air lush green wedding lawns for night events with fairy lights.',
  },
  {
    title: 'Luxury Farmhouses',
    type: 'farmhouse',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    capacity: '100 - 500 Guests',
    desc: 'Private estate farmhouses with pool decks, lawns & VIP suites.',
  },
  {
    title: 'Rooftop & Outdoor Spaces',
    type: 'rooftop',
    image: 'https://images.unsplash.com/photo-1545232979-fbfd42e20068?auto=format&fit=crop&w=800&q=80',
    capacity: '80 - 300 Guests',
    desc: 'Skyline rooftop venues offering panoramic city views for intimate events.',
  },
  {
    title: 'Banquet Halls & Restaurants',
    type: 'banquet',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    capacity: '50 - 300 Guests',
    desc: 'Air-conditioned banquet dining halls ideal for Nikkah & Engagement functions.',
  },
];

const EVENT_MODULES = [
  {
    title: 'Barat Planning',
    slug: 'barat-planning',
    icon: Crown,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    desc: 'Royal hall venues, bridal stage decor, 5-course dinner menus & photography.',
  },
  {
    title: 'Mehndi & Mayo',
    slug: 'mehndi-mayo',
    icon: Flame,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    desc: 'Colorful dholki setups, organic henna artists, DJ sound towers & live food stalls.',
  },
  {
    title: 'Walima Reception',
    slug: 'walima-reception',
    icon: Gem,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    desc: 'Sophisticated ballroom receptions, mutton buffet spreads & floral walkways.',
  },
  {
    title: 'Bridal Shower',
    slug: 'bridal-shower',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    desc: 'Private lounge decor, customized theme cakes, photography & glam styling.',
  },
  {
    title: 'Engagement',
    slug: 'engagement',
    icon: Gem,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    desc: 'Intimate rings ceremony, floral backdrops, lounge seating & photography.',
  },
  {
    title: 'Nikkah Ceremony',
    slug: 'nikkah',
    icon: Award,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    desc: 'Intimate rooftop & banquet setups, qabool hai backdrop mirror & sweet distribution.',
  },
  {
    title: 'Qawali Night',
    slug: 'qawali-night',
    icon: Music,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    desc: 'Traditional gaddi seating setups, floor bolsters, warm ambient lanterns & sound setup.',
  },
];

export default function DashboardHomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#22131A] via-[#3B1C2B] to-[#541E38] p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-[#AA336A]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F4C0D5] text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
            ShaadiPro Modular Event Portal
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-serif-title tracking-tight leading-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4C0D5] via-amber-200 to-white">Wedding Modules</span> & Packages
          </h1>

          <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-normal max-w-2xl">
            Select a service, venue property, or event function module below to view specialized vendors, rates, and direct booking options.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search makeup artists, photographers, marquees, catering..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AA336A] focus:bg-white/20 transition-all"
              />
            </div>
            <Link
              href="/dashboard/book-event"
              className="px-7 py-3.5 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#AA336A]/40 flex items-center justify-center gap-2 transition-all flex-shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Event Customizer</span>
            </Link>
          </div>
        </div>
      </div>

      {/* MODULE SECTION 1: Vendor Service Modules */}
      <div id="categories" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F0D5E2] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AA336A] uppercase tracking-wider">
              <Grid className="w-4 h-4" />
              Vendor Service Modules
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-title text-[#22131A]">
              Explore Services by Category
            </h2>
          </div>
          <p className="text-xs text-[#705562] max-w-md">
            Click any service module card below to view specialized vendors, package rates, photo galleries, and contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VENDOR_MODULES.filter(
            (mod) =>
              searchQuery === '' ||
              mod.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.slug}
                href={`/dashboard/categories/${mod.slug}`}
                className="group relative rounded-3xl bg-white border border-[#F0D5E2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#AA336A]/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                  <img
                    src={mod.image}
                    alt={mod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/90 text-[#22131A] shadow-sm flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#AA336A]" />
                    {mod.count}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-bold font-serif-title leading-snug drop-shadow-md">
                      {mod.title}
                    </h3>
                    <span className="text-[11px] text-amber-200 font-bold font-mono">
                      From {mod.startingPrice}
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-white space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#705562] font-medium leading-relaxed">
                    {mod.desc}
                  </p>

                  <div className="pt-3 border-t border-[#F0D5E2] flex items-center justify-between text-xs font-bold text-[#AA336A] group-hover:text-[#8E2656]">
                    <span>View {mod.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* MODULE SECTION 2: Venue Property Modules */}
      <div id="venues" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F0D5E2] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AA336A] uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              Venue Property Modules
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-title text-[#22131A]">
              Wedding Halls, Marquees & Lawns
            </h2>
          </div>
          <Link
            href="/venues"
            className="text-xs font-bold text-[#AA336A] hover:underline flex items-center gap-1"
          >
            <span>View All Venues</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VENUE_MODULES.map((vMod) => (
            <Link
              key={vMod.type}
              href={`/dashboard/venues/${vMod.type}`}
              className="group relative rounded-3xl bg-white border border-[#F0D5E2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#AA336A]/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                <img
                  src={vMod.image}
                  alt={vMod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#AA336A] text-white shadow-md">
                  {vMod.capacity}
                </div>

                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-xl font-bold font-serif-title drop-shadow-md">
                    {vMod.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 bg-white space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-[#705562] font-medium leading-relaxed">
                  {vMod.desc}
                </p>

                <div className="pt-3 border-t border-[#F0D5E2] flex items-center justify-between text-xs font-bold text-[#AA336A] group-hover:text-[#8E2656]">
                  <span>Explore {vMod.title}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* MODULE SECTION 3: Event Function Modules */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F0D5E2] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AA336A] uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              Event Function Modules
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-title text-[#22131A]">
              Curated Packages by Event Type
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENT_MODULES.map((eMod) => {
            const Icon = eMod.icon;
            return (
              <Link
                key={eMod.slug}
                href={`/dashboard/events/${eMod.slug}`}
                className="group relative rounded-3xl bg-white border border-[#F0D5E2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#AA336A]/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                  <img
                    src={eMod.image}
                    alt={eMod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 p-2 rounded-full bg-white/90 text-[#AA336A] shadow-md">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-xl font-bold font-serif-title drop-shadow-md">
                      {eMod.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 bg-white space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#705562] font-medium leading-relaxed">
                    {eMod.desc}
                  </p>

                  <div className="pt-3 border-t border-[#F0D5E2] flex items-center justify-between text-xs font-bold text-[#AA336A] group-hover:text-[#8E2656]">
                    <span>Browse {eMod.title} Packages</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quality Assurance Banner */}
      <div className="rounded-3xl bg-[#FAF5F7] border border-[#F0D5E2] p-8 sm:p-10 text-center space-y-4 shadow-sm">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#AA336A]/10 text-[#AA336A]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold font-serif-title text-[#22131A]">
          Direct Vendor Contact & Transparent Quotes
        </h3>
        <p className="text-xs sm:text-sm text-[#705562] max-w-2xl mx-auto leading-relaxed">
          Clicking any service module allows you to view specialized vendors, compare per-head & flat package rates, view real photo galleries, and send direct availability quote requests instantly.
        </p>
      </div>
    </div>
  );
}
