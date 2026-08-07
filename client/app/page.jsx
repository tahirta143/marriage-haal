'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '../lib/api';
import MarketplaceHeader from '../components/MarketplaceHeader';
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
  MapPin,
  Calendar,
  Car,
  FileText,
  Heart,
  Crown,
  Flame,
  Gem,
  Award,
  ShieldCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  CheckCircle2,
  Star,
} from 'lucide-react';

const HERO_VIDEOS = [
  {
    id: 'wedding',
    title: 'ShaadiPro Featured Film',
    label: '🎥 Featured Video',
    url: '/video.mp4',
    poster: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
    tagline: 'ShaadiPro Luxury Wedding & Catering Coverage',
  },
  {
    id: 'catering',
    title: 'Gourmet Catering Feast',
    label: '🍲 Live Catering',
    url: '/video.mp4',
    poster: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    tagline: 'Mutton Karahi, Biryani & Live Tandoor',
  },
  {
    id: 'decor',
    title: 'Royal Stage & Marquee Decor',
    label: '✨ Stage & Lighting',
    url: '/video.mp4',
    poster: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    tagline: 'Mughal Canopy & Ambient Lighting',
  },
];

const CATEGORY_SLUGS = {
  'Food & Catering': 'catering',
  'Catering': 'catering',
  'Stage & Theme Decor': 'decor',
  'Decor & Stage Setup': 'decor',
  'Decor': 'decor',
  'Bridal Makeup Artists': 'bridal-makeup',
  'Bridal Makeup': 'bridal-makeup',
  'Henna & Mehndi Artists': 'henna-artists',
  'Mehndi Artist': 'henna-artists',
  'DJ & Concert Sound Systems': 'dj-sound-system',
  'DJ & Sound System': 'dj-sound-system',
  'Photographers & Videographers': 'photographers',
  'Photography & Videography': 'photographers',
  'Luxury Wedding Car Rental': 'car-rental',
  'Car Rental': 'car-rental',
  'Invitation Cards & Stationery': 'stationery',
  'Wedding Stationery': 'stationery',
};

const ICON_MAP = {
  'photographers': Camera,
  'bridal-makeup': Sparkle,
  'catering': Utensils,
  'decor': Paintbrush,
  'henna-artists': Sparkle,
  'car-rental': Car,
  'stationery': FileText,
  'dj-sound-system': Music,
  'barat-planning': Crown,
  'mehndi-mayo': Flame,
  'walima-reception': Gem,
  'bridal-shower': Heart,
  'engagement': Gem,
  'nikkah': Award,
  'qawali-night': Music,
};

const INITIAL_VENDOR_MODULES = [
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

const INITIAL_EVENT_MODULES = [
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

const VENUE_TYPE_TITLES = {
  ballroom: 'Grand Ballrooms',
  marquee: 'Royal Marquees',
  lawn: 'Open Lawns & Gardens',
  farmhouse: 'Luxury Farmhouses',
  rooftop: 'Rooftop & Outdoor Spaces',
  banquet: 'Banquet Halls & Restaurants',
  hall: 'Wedding Halls & Banquets',
};

const VENUE_FALLBACK_IMAGES = {
  ballroom: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
  marquee: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
  lawn: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  farmhouse: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
  rooftop: 'https://images.unsplash.com/photo-1545232979-fbfd42e20068?auto=format&fit=crop&w=800&q=80',
  banquet: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
};

const INITIAL_VENUE_MODULES = [
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

export default function ModularHomePage() {
  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(HERO_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [vendorModules, setVendorModules] = useState(INITIAL_VENDOR_MODULES);
  const [venueModules, setVenueModules] = useState(INITIAL_VENUE_MODULES);
  const [eventModules, setEventModules] = useState(INITIAL_EVENT_MODULES);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchDynamicData();
  }, []);

  const fetchDynamicData = async () => {
    try {
      const [catRes, evtRes, hallRes] = await Promise.all([
        api.get('/categories').catch(() => null),
        api.get('/events').catch(() => null),
        api.get('/halls').catch(() => null),
      ]);

      if (catRes?.data?.success && Array.isArray(catRes.data.categories) && catRes.data.categories.length > 0) {
        const mappedCats = catRes.data.categories.map((cat) => {
          const slug = cat.slug || CATEGORY_SLUGS[cat.name] || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const Icon = ICON_MAP[slug] || Sparkles;
          const subCount = cat.subServices ? cat.subServices.length : 0;
          const pkgCount = cat.packages ? cat.packages.length : 0;

          let countStr = `${pkgCount} Packages`;
          if (subCount > 0) {
            countStr = `${subCount} Sub-Services • ${pkgCount} Packages`;
          } else if (pkgCount === 0) {
            countStr = 'Verified Vendors';
          }

          let startingPrice = 'Custom Rates';
          if (cat.pricing_type === 'per_head') startingPrice = 'PKR 1,500 / guest';
          else if (cat.pricing_type === 'per_hour') startingPrice = 'PKR 15,000 / hr';
          else if (cat.pricing_type === 'fixed') startingPrice = 'PKR 25,000';

          return {
            id: cat.id,
            title: cat.name,
            slug,
            icon: Icon,
            image: cat.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
            count: countStr,
            startingPrice,
            desc: cat.description || `Explore verified ${cat.name} vendors, package rates, and photo galleries.`,
            subServices: cat.subServices || [],
          };
        });
        setVendorModules(mappedCats);
      }

      if (evtRes?.data?.success && Array.isArray(evtRes.data.events) && evtRes.data.events.length > 0) {
        const mappedEvts = evtRes.data.events.map((evt) => {
          const slug = evt.slug || evt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const Icon = ICON_MAP[slug] || Calendar;
          return {
            id: evt.id,
            title: evt.name,
            slug,
            icon: Icon,
            image: evt.image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
            desc: evt.description || `Curated wedding packages and vendor setups for ${evt.name}.`,
            subEvents: evt.subEvents || [],
          };
        });
        setEventModules(mappedEvts);
      }

      if (hallRes?.data?.success && Array.isArray(hallRes.data.halls) && hallRes.data.halls.length > 0) {
        const halls = hallRes.data.halls;
        const grouped = {};
        halls.forEach((h) => {
          const vType = (h.venue_type || 'ballroom').toLowerCase();
          if (!grouped[vType]) grouped[vType] = [];
          grouped[vType].push(h);
        });

        const mappedVenues = Object.keys(grouped).map((vType) => {
          const list = grouped[vType];
          const first = list[0];
          const minCap = Math.min(...list.map((h) => h.capacity_min || 100));
          const maxCap = Math.max(...list.map((h) => h.capacity_max || 1000));
          const names = list.map((h) => h.name).slice(0, 2).join(', ');

          return {
            title: VENUE_TYPE_TITLES[vType] || `${vType.toUpperCase()} Venues`,
            type: vType,
            image: first.image_url || VENUE_FALLBACK_IMAGES[vType] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
            capacity: `${minCap} - ${maxCap} Guests`,
            desc: `${list.length} Verified ${list.length === 1 ? 'Venue' : 'Venues'} (${names}${list.length > 2 ? ' + more' : ''}) available.`,
          };
        });

        setVenueModules(mappedVenues);
      }
    } catch (err) {
      console.warn('Could not load dynamic home modules:', err);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSelectVideo = (video) => {
    setActiveVideo(video);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.src = video.url;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F9] text-[#111827]">
      {/* Marketplace Header */}
      <MarketplaceHeader selectedCity={selectedCity} onSelectCity={setSelectedCity} />

      {/* Hero Section with Bright HD Background Video & Solid Colors (NO GRADIENTS) */}
      <div className="relative overflow-hidden min-h-[560px] lg:min-h-[640px] flex items-center justify-center text-white py-16 px-4 sm:px-6 lg:px-8 bg-[#22131A]">
        
        {/* Background Video Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            src={activeVideo.url}
            poster={activeVideo.poster}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover brightness-105 contrast-105"
          />

          {/* Reduced Dark Overlay for Vivid & Clear Video Visibility */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Floating Top Control Toolbar (Audio & Video Status) */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#22131A]/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider">{activeVideo.tagline}</span>
          </div>

          <button
            onClick={toggleMute}
            className="p-2.5 rounded-full bg-[#22131A]/80 hover:bg-[#AA336A] border border-white/20 text-white transition-all shadow-md hover:scale-105"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
          </button>

          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-[#22131A]/80 hover:bg-[#AA336A] border border-white/20 text-white transition-all shadow-md hover:scale-105"
            title={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-amber-300 fill-amber-300" />}
          </button>
        </div>

        {/* Main Hero Content */}
        <div className="max-w-5xl mx-auto space-y-8 text-center relative z-10 my-auto">
          
          {/* Solid Top Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#22131A]/80 backdrop-blur-md border border-white/20 text-white shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#F4C0D5]">
              Pakistan's Premier Modular Wedding & Catering Marketplace
            </span>
          </div>

          {/* Main Title with Solid Text Colors (NO GRADIENT) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-serif-title tracking-tight leading-[1.15] text-white drop-shadow-lg">
            Book Top Wedding Vendors & Venues in{' '}
            <span className="text-[#F4C0D5]">
              {selectedCity}
            </span>
          </h1>

          <p className="text-white text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Explore verified photographers, bridal makeup artists, royal marquees, and live mutton karahi & BBQ catering spreads with instant availability check.
          </p>

          <div className="pt-2">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-20">
        
        {/* MODULE SECTION 1: Vendor Service Modules */}
        <div id="categories" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F0D5E2] pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AA336A]/10 border border-[#AA336A]/20 text-xs font-bold text-[#AA336A] uppercase tracking-wider mb-2">
                <Grid className="w-3.5 h-3.5" />
                Vendor Service Modules
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-[#22131A]">
                Explore Services by Category
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#705562] max-w-md leading-relaxed">
              Click any service module card below to view specialized vendors, package rates, photo galleries, and contact details.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendorModules.filter(
              (mod) =>
                searchQuery === '' ||
                mod.title.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.id || mod.slug}
                  href={`/categories/${mod.slug}`}
                  className="group relative rounded-3xl bg-white border border-[#F0D5E2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#AA336A] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                    <img
                      src={mod.image}
                      alt={mod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white text-[#22131A] shadow-md flex items-center gap-1.5">
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

                  <div className="p-5 bg-white space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs text-[#705562] font-medium leading-relaxed">
                        {mod.desc}
                      </p>
                      {mod.subServices && mod.subServices.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {mod.subServices.slice(0, 3).map((sub) => (
                            <span key={sub.id} className="px-2 py-0.5 rounded-md bg-[#AA336A]/10 text-[10px] font-bold text-[#AA336A]">
                              {sub.name}
                            </span>
                          ))}
                          {mod.subServices.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500">
                              +{mod.subServices.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

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
        <div id="venues" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F0D5E2] pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AA336A]/10 border border-[#AA336A]/20 text-xs font-bold text-[#AA336A] uppercase tracking-wider mb-2">
                <Building2 className="w-3.5 h-3.5" />
                Venue Property Modules
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-[#22131A]">
                Wedding Halls, Marquees & Lawns in {selectedCity}
              </h2>
            </div>
            <Link
              href="/venues"
              className="text-xs font-extrabold text-[#AA336A] hover:underline flex items-center gap-1.5 group"
            >
              <span>View All Venues</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venueModules.map((vMod) => (
              <Link
                key={vMod.type}
                href={`/venues/${vMod.type}`}
                className="group relative rounded-3xl bg-white border border-[#F0D5E2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#AA336A] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="h-52 w-full bg-gray-100 relative overflow-hidden">
                  <img
                    src={vMod.image}
                    alt={vMod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase bg-[#AA336A] text-white shadow-md">
                    {vMod.capacity}
                  </div>

                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-xl font-bold font-serif-title drop-shadow-md">
                      {vMod.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 bg-white space-y-4 flex-1 flex flex-col justify-between">
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
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F0D5E2] pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AA336A]/10 border border-[#AA336A]/20 text-xs font-bold text-[#AA336A] uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5" />
                Event Function Modules
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-[#22131A]">
                Curated Packages by Event Type
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventModules.map((eMod) => {
              const Icon = eMod.icon;
              return (
                <Link
                  key={eMod.id || eMod.slug}
                  href={`/events/${eMod.slug}`}
                  className="group relative rounded-3xl bg-white border border-[#F0D5E2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#AA336A] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                    <img
                      src={eMod.image}
                      alt={eMod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    
                    <div className="absolute top-3 left-3 p-2 rounded-full bg-[#AA336A] text-white shadow-md">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="text-xl font-bold font-serif-title drop-shadow-md">
                        {eMod.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 bg-white space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs text-[#705562] font-medium leading-relaxed">
                        {eMod.desc}
                      </p>
                      {eMod.subEvents && eMod.subEvents.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {eMod.subEvents.slice(0, 3).map((sub) => (
                            <span key={sub.id} className="px-2 py-0.5 rounded-md bg-[#AA336A]/10 text-[10px] font-bold text-[#AA336A]">
                              {sub.name}
                            </span>
                          ))}
                          {eMod.subEvents.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500">
                              +{eMod.subEvents.length - 3} sub-events
                            </span>
                          )}
                        </div>
                      )}
                    </div>

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

        {/* Quality Assurance Banner with Solid Color (NO GRADIENT) */}
        <div className="relative overflow-hidden rounded-3xl bg-[#22131A] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl border border-[#3D0F24]">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 shadow-lg relative z-10">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-serif-title text-[#F4C0D5]">
              Direct Vendor Contact & Transparent Quotes
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
              Clicking any service module allows you to view specialized vendors, compare per-head & flat package rates, view real photo galleries, and send direct availability quote requests instantly with phone verification.
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              <span>Explore All Modules</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
