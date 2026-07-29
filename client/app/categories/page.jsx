'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import MarketplaceHeader from '../../components/MarketplaceHeader';
import {
  Sparkles,
  Utensils,
  Paintbrush,
  Sparkle,
  Music,
  Camera,
  ArrowRight,
  Grid,
  Car,
  FileText,
  Building2,
} from 'lucide-react';

const CATEGORY_SLUGS = {
  'Catering': 'catering',
  'Food & Catering': 'catering',
  'Decor': 'decor',
  'Decor & Stage Setup': 'decor',
  'Bridal Makeup': 'bridal-makeup',
  'Henna Artists': 'henna-artists',
  'Mehndi Artist': 'henna-artists',
  'DJ & Sound System': 'dj-sound-system',
  'Photographers': 'photographers',
  'Photography & Videography': 'photographers',
  'Car Rental': 'car-rental',
  'Wedding Stationery': 'stationery',
};

const CATEGORY_ICONS = {
  'catering': Utensils,
  'decor': Paintbrush,
  'bridal-makeup': Sparkle,
  'henna-artists': Sparkle,
  'dj-sound-system': Music,
  'photographers': Camera,
  'car-rental': Car,
  'stationery': FileText,
};

const CATEGORY_FALLBACK_IMAGES = {
  'catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
  'decor': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
  'bridal-makeup': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
  'henna-artists': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'dj-sound-system': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  'photographers': 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
  'car-rental': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  'stationery': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
};

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Lahore');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F9] text-[#111827]">
      <MarketplaceHeader selectedCity={selectedCity} onSelectCity={setSelectedCity} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-[#F0D5E2] pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AA336A] uppercase tracking-wider">
            <Grid className="w-4 h-4" />
            Vendor Directory
          </div>
          <h1 className="text-3xl font-extrabold font-serif-title text-[#22131A]">
            All Wedding Service Categories
          </h1>
          <p className="text-xs text-[#705562]">
            Select a service category to view specialized vendors, compare package rates, and request quotes in {selectedCity}.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#705562] font-semibold text-sm">
            <div className="w-8 h-8 border-3 border-[#AA336A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading wedding service categories...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const slug = CATEGORY_SLUGS[cat.name] || 'catering';
              const Icon = CATEGORY_ICONS[slug] || Sparkles;
              const coverImg = cat.image_url || CATEGORY_FALLBACK_IMAGES[slug] || CATEGORY_FALLBACK_IMAGES['decor'];

              return (
                <Link
                  key={cat.id}
                  href={`/categories/${slug}`}
                  className="group relative rounded-3xl bg-white border border-[#F0D5E2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#AA336A]/50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                    <img
                      src={coverImg}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/90 text-[#22131A] shadow-sm flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-[#AA336A]" />
                      {(cat.packages || []).length} Packages
                    </div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="text-lg font-bold font-serif-title">{cat.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 bg-white flex items-center justify-between text-xs font-bold text-[#AA336A] group-hover:text-[#8E2656]">
                    <span>Explore {cat.name} Vendors</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
