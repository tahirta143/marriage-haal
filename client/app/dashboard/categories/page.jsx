'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Can, PERMISSIONS } from '../../../lib/permissions';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Utensils,
  Paintbrush,
  Sparkle,
  Music,
  Camera,
  Tag,
  ShieldAlert,
  CheckCircle2,
  Upload,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food & Catering': Utensils,
  'Decor & Stage Setup': Paintbrush,
  'Bridal Makeup': Sparkle,
  'Mehndi Artist': Sparkle,
  'DJ & Sound System': Music,
  'Photography & Videography': Camera,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Modal State for New Package
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgDetails, setPkgDetails] = useState('');
  const [pkgImageUrl, setPkgImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setPkgImageUrl(`http://localhost:5000${res.data.imageUrl}`);
      }
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (!selectedCatId || !pkgName || !pkgPrice) return;

    try {
      const detailsArray = pkgDetails
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post(`/categories/${selectedCatId}/packages`, {
        name: pkgName,
        price: parseFloat(pkgPrice),
        details: detailsArray,
        image_url: pkgImageUrl,
      });

      if (res.data.success) {
        setFeedback(`Package '${pkgName}' added successfully.`);
        setShowPkgModal(false);
        setPkgName('');
        setPkgPrice('');
        setPkgDetails('');
        setPkgImageUrl('');
        fetchCategories();
      }
    } catch (err) {
      alert('Failed to add package');
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      const res = await api.delete(`/categories/packages/${packageId}`);
      if (res.data.success) {
        setFeedback('Package deleted.');
        fetchCategories();
      }
    } catch (err) {
      alert('Failed to delete package');
    }
  };

  return (
    <Can
      permission={PERMISSIONS.CATEGORY_MANAGE}
      fallback={
        <div className="p-8 text-center text-red-400 font-bold flex items-center justify-center gap-2 glass-card rounded-2xl">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'category.manage' permission.
        </div>
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Service Catalog & Pricing Structure
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-white">
              Categories & Package Management
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Manage Food & Catering, Stage Decor, Photography, Makeup, and DJ sound system pricing.
            </p>
          </div>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Loading catalog packages...
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const IconComponent = CATEGORY_ICONS[category.name] || Package;
              return (
                <div
                  key={category.id}
                  className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-amber-500/30"
                        />
                      ) : (
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <IconComponent className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-white">{category.name}</h2>
                        <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                          Pricing Model: {category.pricing_type}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCatId(category.id);
                        setShowPkgModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Add Package
                    </button>
                  </div>

                  {/* Package Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {(category.packages || []).map((pkg) => (
                      <div
                        key={pkg.id}
                        className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-colors"
                      >
                        {/* Package Thumbnail */}
                        {pkg.image_url && (
                          <div className="h-36 w-full overflow-hidden bg-slate-950 relative">
                            <img
                              src={pkg.image_url}
                              alt={pkg.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-white">{pkg.name}</h3>
                            <button
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-lg font-extrabold font-mono text-amber-400">
                            PKR {Number(pkg.price).toLocaleString()}
                            <span className="text-xs text-slate-400 font-normal ml-1">
                              {category.pricing_type === 'per_head' ? '/ guest' : 'flat'}
                            </span>
                          </div>

                          {/* Inclusion Chips */}
                          <div className="space-y-1 pt-2 border-t border-slate-800/80">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Included Items:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(pkg.details || []).map((detail, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-300 border border-slate-800"
                                >
                                  ✓ {detail}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add Package */}
        {showPkgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  Add New Service Package
                </h3>
                <button
                  onClick={() => setShowPkgModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePackage} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Package Name
                  </label>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    placeholder="e.g. Royal Diamond Buffet"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Package Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(e.target.value)}
                    placeholder="2500"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Inclusions (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={pkgDetails}
                    onChange={(e) => setPkgDetails(e.target.value)}
                    placeholder="Mutton Qorma, Biryani, Naan, Dessert Bar"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Multer Image Upload Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Package Image Cover (Upload or URL)
                  </label>
                  <div className="space-y-2">
                    <label className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:border-amber-500 cursor-pointer flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>{uploading ? 'Uploading...' : 'Upload Image File (Multer)'}</span>
                      <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={pkgImageUrl}
                      onChange={(e) => setPkgImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPkgModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600"
                  >
                    Add Package
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Can>
  );
}
