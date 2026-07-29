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
  X,
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

  // Modal State for Package Add / Edit
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState(null);
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

  const openCreateModal = (catId) => {
    setEditingPkgId(null);
    setSelectedCatId(catId);
    setPkgName('');
    setPkgPrice('');
    setPkgDetails('');
    setPkgImageUrl('');
    setShowPkgModal(true);
  };

  const openEditModal = (catId, pkg) => {
    setEditingPkgId(pkg.id);
    setSelectedCatId(catId);
    setPkgName(pkg.name);
    setPkgPrice(pkg.price);
    const detailsStr = Array.isArray(pkg.details) ? pkg.details.join(', ') : (pkg.details || '');
    setPkgDetails(detailsStr);
    setPkgImageUrl(pkg.image_url || '');
    setShowPkgModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!selectedCatId || !pkgName || !pkgPrice) return;

    try {
      const detailsArray = pkgDetails
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingPkgId) {
        // Update package in MySQL
        const res = await api.put(`/categories/packages/${editingPkgId}`, {
          name: pkgName,
          price: parseFloat(pkgPrice),
          details: detailsArray,
          image_url: pkgImageUrl,
        });

        if (res.data.success) {
          setFeedback(`Package '${pkgName}' updated successfully.`);
        }
      } else {
        // Create package in MySQL
        const res = await api.post(`/categories/${selectedCatId}/packages`, {
          name: pkgName,
          price: parseFloat(pkgPrice),
          details: detailsArray,
          image_url: pkgImageUrl,
        });

        if (res.data.success) {
          setFeedback(`Package '${pkgName}' created successfully.`);
        }
      }

      setShowPkgModal(false);
      fetchCategories();
    } catch (err) {
      alert('Failed to save package');
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      const res = await api.delete(`/categories/packages/${packageId}`);
      if (res.data.success) {
        setFeedback('Package deleted from database.');
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
        <div className="p-8 text-center text-rose-600 font-bold flex items-center justify-center gap-2 bg-white border border-[#F0D5E2] rounded-2xl shadow-sm">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'category.manage' permission.
        </div>
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#F0D5E2] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Service Catalog & Pricing Structure
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
              Services & Package Management (Add, Edit, Update, Delete)
            </h1>
            <p className="text-[#705562] text-xs mt-1 font-medium">
              Direct MySQL database integration to manage Food & Catering, Stage Decor, Photography, Makeup, and DJ packages.
            </p>
          </div>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12 text-[#705562] text-sm font-semibold">
            Loading database service packages...
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const IconComponent = CATEGORY_ICONS[category.name] || Package;
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-3xl p-6 border border-[#F0D5E2] space-y-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0D5E2] pb-4">
                    <div className="flex items-center gap-3">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#F0D5E2]"
                        />
                      ) : (
                        <div className="p-3 rounded-2xl bg-[#AA336A]/10 border border-[#AA336A]/30 text-[#AA336A]">
                          <IconComponent className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-[#22131A]">{category.name}</h2>
                        <span className="text-xs text-[#AA336A] font-bold uppercase tracking-wider">
                          Pricing Model: {category.pricing_type}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openCreateModal(category.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-md"
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
                        className="rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] overflow-hidden flex flex-col justify-between hover:border-[#AA336A]/40 transition-colors"
                      >
                        {/* Package Thumbnail */}
                        {pkg.image_url && (
                          <div className="h-36 w-full overflow-hidden bg-white relative">
                            <img
                              src={pkg.image_url}
                              alt={pkg.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-[#22131A]">{pkg.name}</h3>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(category.id, pkg)}
                                className="p-1 rounded-lg text-[#705562] hover:text-[#AA336A] transition-colors"
                                title="Edit Package"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="p-1 rounded-lg text-[#9E7D8C] hover:text-rose-600 transition-colors"
                                title="Delete Package"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="text-lg font-extrabold font-mono text-[#AA336A]">
                            PKR {Number(pkg.price).toLocaleString()}
                            <span className="text-xs text-[#705562] font-normal ml-1">
                              {category.pricing_type === 'per_head' ? '/ guest' : 'flat'}
                            </span>
                          </div>

                          {/* Inclusion Chips */}
                          <div className="space-y-1 pt-2 border-t border-[#F0D5E2]">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#705562]">
                              Included Items:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(pkg.details || []).map((detail, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-white text-[10px] text-[#22131A] font-medium border border-[#F0D5E2]"
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

        {/* Modal: Add or Edit Package */}
        {showPkgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#F0D5E2] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
                <h3 className="text-base font-bold text-[#22131A] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#AA336A]" />
                  {editingPkgId ? 'Edit Package' : 'Add New Service Package'}
                </h3>
                <button
                  onClick={() => setShowPkgModal(false)}
                  className="p-1 rounded-lg text-[#705562] hover:text-[#22131A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Package Name
                  </label>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    placeholder="e.g. Royal Diamond Buffet"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Package Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(e.target.value)}
                    placeholder="2500"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Inclusions (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={pkgDetails}
                    onChange={(e) => setPkgDetails(e.target.value)}
                    placeholder="Mutton Qorma, Biryani, Naan, Dessert Bar"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                {/* Multer Image Upload Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Package Image Cover (Upload or URL)
                  </label>
                  <div className="space-y-2">
                    <label className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#604453] hover:border-[#AA336A] cursor-pointer flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-4 h-4 text-[#AA336A]" />
                      <span>{uploading ? 'Uploading...' : 'Upload Image File (Multer)'}</span>
                      <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={pkgImageUrl}
                      onChange={(e) => setPkgImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#22131A]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0D5E2]">
                  <button
                    type="button"
                    onClick={() => setShowPkgModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#705562] hover:text-[#22131A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#AA336A] text-white font-bold text-xs hover:bg-[#8E2656] shadow-md"
                  >
                    {editingPkgId ? 'Update Package' : 'Add Package'}
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
