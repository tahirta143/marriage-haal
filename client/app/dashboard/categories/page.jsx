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
  PlusCircle,
  FolderPlus
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

  // Category Modal State (Add / Edit)
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catPricingType, setCatPricingType] = useState('fixed');
  const [catImageUrl, setCatImageUrl] = useState('');

  // Package Modal State (Add / Edit)
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgDetails, setPkgDetails] = useState('');
  const [pkgImageUrl, setPkgImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Sub-Service Modal State (Add / Edit)
  const [showSubModal, setShowSubModal] = useState(false);
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState('');
  const [subDesc, setSubDesc] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const showSuccess = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

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

  const handleFileUpload = async (e, setUrl) => {
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
        setUrl(`http://localhost:5000${res.data.imageUrl}`);
      }
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // CATEGORY HANDLERS
  const openNewCategoryModal = () => {
    setEditingCatId(null);
    setCatName('');
    setCatPricingType('fixed');
    setCatImageUrl('');
    setShowCatModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatPricingType(cat.pricing_type || 'fixed');
    setCatImageUrl(cat.image_url || '');
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName) return;

    try {
      if (editingCatId) {
        const res = await api.put(`/categories/${editingCatId}`, {
          name: catName,
          pricing_type: catPricingType,
          image_url: catImageUrl,
        });
        if (res.data.success) showSuccess(`Category '${catName}' updated.`);
      } else {
        const res = await api.post('/categories', {
          name: catName,
          pricing_type: catPricingType,
          image_url: catImageUrl,
        });
        if (res.data.success) showSuccess(`Category '${catName}' created.`);
      }
      setShowCatModal(false);
      fetchCategories();
    } catch (err) {
      alert('Failed to save category');
    }
  };

  const handleDeleteCategory = async (catId, name) => {
    if (!confirm(`Are you sure you want to delete category '${name}'? This will also remove associated packages.`)) return;
    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.data.success) {
        showSuccess(`Category '${name}' deleted.`);
        fetchCategories();
      }
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  // SUB-SERVICES HANDLERS
  const openNewSubServiceModal = (catId) => {
    setSelectedCatId(catId);
    setSubName('');
    setSubPrice('');
    setSubDesc('');
    setShowSubModal(true);
  };

  const handleSaveSubService = async (e) => {
    e.preventDefault();
    if (!selectedCatId || !subName) return;

    try {
      const res = await api.post(`/categories/${selectedCatId}/sub-services`, {
        name: subName,
        price: parseFloat(subPrice || 15000),
        description: subDesc,
      });
      if (res.data.success) {
        showSuccess(`Sub-service '${subName}' added.`);
        setShowSubModal(false);
        fetchCategories();
      }
    } catch (err) {
      alert('Failed to add sub-service');
    }
  };

  const handleDeleteSubService = async (subId) => {
    if (!confirm('Are you sure you want to delete this sub-service tag?')) return;
    try {
      const res = await api.delete(`/categories/sub-services/${subId}`);
      if (res.data.success) {
        showSuccess('Sub-service tag deleted.');
        fetchCategories();
      }
    } catch (err) {
      alert('Failed to delete sub-service');
    }
  };

  // PACKAGE HANDLERS
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
        const res = await api.put(`/categories/packages/${editingPkgId}`, {
          name: pkgName,
          price: parseFloat(pkgPrice),
          details: detailsArray,
          image_url: pkgImageUrl,
        });

        if (res.data.success) showSuccess(`Package '${pkgName}' updated.`);
      } else {
        const res = await api.post(`/categories/${selectedCatId}/packages`, {
          name: pkgName,
          price: parseFloat(pkgPrice),
          details: detailsArray,
          image_url: pkgImageUrl,
        });

        if (res.data.success) showSuccess(`Package '${pkgName}' created.`);
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
        showSuccess('Package deleted from database.');
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
          Access Denied: Missing &apos;category.manage&apos; permission.
        </div>
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#F0D5E2] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Service Catalog &amp; Pricing Structure
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
              Service Categories &amp; Package Management
            </h1>
            <p className="text-[#705562] text-xs mt-1 font-medium">
              Create and manage Service Categories, Sub-service offering tags, and Base Pricing Packages.
            </p>
          </div>

          <button
            onClick={openNewCategoryModal}
            className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto"
          >
            <FolderPlus className="w-4 h-4" />
            + Add New Category
          </button>
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
            Loading database service categories...
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
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-[#22131A]">{category.name}</h2>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditCategoryModal(category)}
                              className="p-1 text-gray-400 hover:text-[#AA336A]"
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              className="p-1 text-gray-400 hover:text-rose-600"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <span className="text-xs text-[#AA336A] font-bold uppercase tracking-wider">
                          Pricing Model: {category.pricing_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openNewSubServiceModal(category.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-[#AA336A] font-bold text-xs hover:bg-[#AA336A] hover:text-white transition-colors"
                      >
                        + Add Sub-Service Tag
                      </button>
                      <button
                        onClick={() => openCreateModal(category.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        Add Package
                      </button>
                    </div>
                  </div>

                  {/* Sub-Services Tags */}
                  {category.subServices && category.subServices.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-[#604453] tracking-wider block">
                        Category Sub-Services / Offering Tags:
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {category.subServices.map((sub) => (
                          <span
                            key={sub.id}
                            className="px-3 py-1 rounded-xl bg-white border border-[#F0D5E2] text-[#22131A] font-extrabold text-xs flex items-center gap-1.5"
                          >
                            <Tag className="w-3 h-3 text-[#AA336A]" />
                            <span>{sub.name}</span>
                            <button
                              onClick={() => handleDeleteSubService(sub.id)}
                              className="text-gray-400 hover:text-rose-600 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Package Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {(category.packages || []).map((pkg) => (
                      <div
                        key={pkg.id}
                        className="rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] overflow-hidden flex flex-col justify-between hover:border-[#AA336A]/40 transition-colors"
                      >
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

        {/* Modal: Add/Edit Category */}
        {showCatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#F0D5E2] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
                <h3 className="text-base font-bold text-[#22131A]">
                  {editingCatId ? 'Edit Service Category' : 'Add New Service Category'}
                </h3>
                <button onClick={() => setShowCatModal(false)} className="p-1 rounded-lg text-[#705562]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-[#22131A]">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Category Name</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Vintage Car Rental"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Pricing Model</label>
                  <select
                    value={catPricingType}
                    onChange={(e) => setCatPricingType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="per_head">Per Head / Per Plate</option>
                    <option value="per_hour">Per Hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Cover Image</label>
                  <div className="space-y-2">
                    <label className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#604453] cursor-pointer flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-4 h-4 text-[#AA336A]" />
                      <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                      <input type="file" onChange={(e) => handleFileUpload(e, setCatImageUrl)} accept="image/*" className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={catImageUrl}
                      onChange={(e) => setCatImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#22131A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase"
                >
                  {editingCatId ? 'Update Category' : 'Create Category'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Sub-Service Tag */}
        {showSubModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#F0D5E2] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
                <h3 className="text-base font-bold text-[#22131A]">Add Sub-Service Tag</h3>
                <button onClick={() => setShowSubModal(false)} className="p-1 rounded-lg text-[#705562]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSubService} className="space-y-4 text-[#22131A]">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Sub-Service Tag Name</label>
                  <input
                    type="text"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="e.g. Mutton Karahi, 4K Drone Shoot, Airbrush Makeup"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Estimated Price (PKR)</label>
                  <input
                    type="number"
                    value={subPrice}
                    onChange={(e) => setSubPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase"
                >
                  Create Sub-Service Tag
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add or Edit Package */}
        {showPkgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#F0D5E2] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-[#22131A]">
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

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Package Image Cover (Upload or URL)
                  </label>
                  <div className="space-y-2">
                    <label className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#604453] hover:border-[#AA336A] cursor-pointer flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-4 h-4 text-[#AA336A]" />
                      <span>{uploading ? 'Uploading...' : 'Upload Image File (Multer)'}</span>
                      <input type="file" onChange={(e) => handleFileUpload(e, setPkgImageUrl)} accept="image/*" className="hidden" />
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
