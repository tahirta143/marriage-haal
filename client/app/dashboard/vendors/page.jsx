'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Can, PERMISSIONS } from '../../../lib/permissions';
import {
  Users,
  Plus,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Percent,
  Building2,
  Check,
  X,
  Award,
  Tag,
  AlertCircle,
  Upload,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Add Modal State
  const [showModal, setShowModal] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [commission, setCommission] = useState('10');
  const [startingPrice, setStartingPrice] = useState('25000');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editCommission, setEditCommission] = useState('10');
  const [editStartingPrice, setEditStartingPrice] = useState('25000');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editGalleryImages, setEditGalleryImages] = useState([]);
  const [editStatus, setEditStatus] = useState('approved');
  const [editUploading, setEditUploading] = useState(false);

  // Delete Confirm State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingVendor, setDeletingVendor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, cRes] = await Promise.all([
        api.get('/vendors'),
        api.get('/categories'),
      ]);

      if (vRes.data.success) setVendors(vRes.data.vendors);
      if (cRes.data.success) {
        setCategories(cRes.data.categories);
        if (cRes.data.categories.length > 0) {
          setCategoryId(cRes.data.categories[0].id.toString());
        }
      }
    } catch (err) {
      if (err.response?.status === 403) {
        showError("Access Denied: You don't have 'vendor.manage' permission to view vendors.");
      } else {
        console.error('Failed to load vendors:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, setUrl, setUploading_) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading_(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setUrl(`http://localhost:5000${res.data.imageUrl}`);
      }
    } catch (err) {
      showError('Failed to upload image');
    } finally {
      setUploading_(false);
    }
  };

  const handleMultiFileUpload = async (e, setImages, setUploading_) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setUploading_(true);
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          uploadedUrls.push(`http://localhost:5000${res.data.imageUrl}`);
        }
      }
      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      showError('Failed to upload gallery images');
    } finally {
      setUploading_(false);
    }
  };

  // ── CREATE ──────────────────────────────────────────────────────────
  const handleRegisterVendor = async (e) => {
    e.preventDefault();
    if (!businessName || !categoryId) return;

    try {
      setErrorMessage('');
      setFeedback('');

      const res = await api.post('/vendors', {
        business_name: businessName,
        category_id: categoryId,
        commission_percent: parseFloat(commission),
        starting_price: parseFloat(startingPrice || 25000),
        image_url: imageUrl,
        gallery: galleryImages,
      });

      if (res.data.success) {
        showFeedback(`Vendor partner '${businessName}' registered successfully.`);
        setShowModal(false);
        setBusinessName('');
        setCommission('10');
        setStartingPrice('25000');
        setImageUrl('');
        setGalleryImages([]);
        fetchData();
      }
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? "Permission denied: 'vendor.manage' is required to add vendors."
          : err.response?.data?.message || err.message || 'Failed to register vendor partner';
      showError(msg);
    }
  };

  // ── OPEN EDIT MODAL ─────────────────────────────────────────────────
  const openEditModal = (vendor) => {
    setEditingVendor(vendor);
    setEditBusinessName(vendor.business_name);
    setEditCategoryId(vendor.category_id?.toString() || '');
    setEditCommission(vendor.commission_percent?.toString() || '10');
    setEditStartingPrice(vendor.starting_price?.toString() || '25000');
    setEditImageUrl(vendor.image_url || '');

    let parsedGallery = [];
    if (vendor.gallery) {
      try {
        parsedGallery = typeof vendor.gallery === 'string' ? JSON.parse(vendor.gallery) : vendor.gallery;
      } catch (e) {
        parsedGallery = [];
      }
    }
    setEditGalleryImages(Array.isArray(parsedGallery) ? parsedGallery : []);
    setEditStatus(vendor.status || 'approved');
    setShowEditModal(true);
  };

  // ── UPDATE ──────────────────────────────────────────────────────────
  const handleUpdateVendor = async (e) => {
    e.preventDefault();
    if (!editingVendor || !editBusinessName || !editCategoryId) return;

    try {
      setErrorMessage('');
      const res = await api.put(`/vendors/${editingVendor.id}`, {
        business_name: editBusinessName,
        category_id: editCategoryId,
        commission_percent: parseFloat(editCommission),
        starting_price: parseFloat(editStartingPrice || 25000),
        image_url: editImageUrl,
        gallery: editGalleryImages,
        status: editStatus,
      });

      if (res.data.success) {
        showFeedback(`Vendor '${editBusinessName}' updated successfully.`);
        setShowEditModal(false);
        setEditingVendor(null);
        fetchData();
      }
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? "Permission denied: 'vendor.manage' is required to edit vendors."
          : err.response?.data?.message || err.message || 'Failed to update vendor';
      showError(msg);
    }
  };

  // ── DELETE ──────────────────────────────────────────────────────────
  const openDeleteConfirm = (vendor) => {
    setDeletingVendor(vendor);
    setShowDeleteConfirm(true);
  };

  const handleDeleteVendor = async () => {
    if (!deletingVendor) return;

    try {
      setErrorMessage('');
      const res = await api.delete(`/vendors/${deletingVendor.id}`);
      if (res.data.success) {
        showFeedback(`Vendor '${deletingVendor.business_name}' removed successfully.`);
        setShowDeleteConfirm(false);
        setDeletingVendor(null);
        fetchData();
      }
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? "Permission denied: 'vendor.manage' is required to delete vendors."
          : err.response?.data?.message || err.message || 'Failed to delete vendor';
      showError(msg);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Can
      permission={PERMISSIONS.VENDOR_MANAGE}
      fallback={
        <div className="p-8 text-center text-rose-600 font-bold flex items-center justify-center gap-2 bg-white border border-[#F0D5E2] rounded-2xl shadow-sm">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing &apos;vendor.manage&apos; permission.
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#F0D5E2] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Partner Network &amp; Commissions
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
              External Vendor Partners
            </h1>
            <p className="text-[#705562] text-xs mt-1 font-medium">
              Manage partnered providers (Decor, Makeup, DJ, Photography) and track commission rates.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] active:bg-[#77234A] text-white font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Vendor Partner
          </button>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Vendors Grid */}
        {loading ? (
          <div className="text-center py-12 text-[#705562] text-sm font-semibold">
            Loading vendor partners...
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16 text-[#705562] text-sm font-semibold border border-dashed border-[#F0D5E2] rounded-2xl">
            No vendor partners found. Click &quot;Add Vendor Partner&quot; to register one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((v) => {
              const fallbackImg =
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
              const statusColors = {
                approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                pending: 'bg-amber-100 text-amber-800 border-amber-300',
                unverified: 'bg-gray-100 text-gray-600 border-gray-300',
              };
              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#F0D5E2] shadow-sm hover:border-[#AA336A]/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Vendor Cover Image */}
                    <div className="h-44 w-full overflow-hidden bg-[#FAF5F7] relative">
                      <img
                        src={v.image_url || fallbackImg}
                        alt={v.business_name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border backdrop-blur-md ${statusColors[v.status] || statusColors.approved}`}
                      >
                        {v.status}
                      </span>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-[#22131A]">{v.business_name}</h3>
                        <div className="text-xs text-[#AA336A] font-bold flex items-center gap-1 mt-0.5">
                          <Tag className="w-3.5 h-3.5" />
                          {v.category_name || 'Vendor Partner'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#705562] font-semibold">Partner Commission</span>
                          <span className="font-mono font-extrabold text-[#AA336A] text-sm">
                            {v.commission_percent}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-[#F0D5E2] pt-1.5">
                          <span className="text-[#705562] font-semibold">Starting Price</span>
                          <span className="font-bold text-[#22131A]">
                            PKR {Number(v.starting_price || 25000).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-[#705562]">
                        Account Email:{' '}
                        <span className="text-[#22131A] font-mono font-semibold">
                          {v.vendor_email || 'vendor@shaadipro.com'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pb-5 flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(v)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#705562] hover:bg-[#AA336A]/10 hover:text-[#AA336A] hover:border-[#AA336A]/40 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(v)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-100 hover:border-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MODAL: Register Vendor ── */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#F0D5E2] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-[#22131A]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
                <h3 className="text-base font-bold text-[#22131A] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#AA336A]" />
                  Register Partner Vendor
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-[#705562] hover:text-[#22131A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterVendor} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Royal Stage Decorators"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Service Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      placeholder="10.0"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Starting Price (PKR)</label>
                    <input
                      type="number"
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      placeholder="25000"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Vendor Business Cover Image</label>
                  <div className="space-y-2">
                    <label className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#604453] hover:border-[#AA336A] cursor-pointer flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-4 h-4 text-[#AA336A]" />
                      <span>{uploading ? 'Uploading Cover...' : 'Upload Cover Image'}</span>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, setImageUrl, setUploading)}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#22131A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Portfolio Gallery Photos (Upload Multiple)</label>
                  <div className="space-y-2">
                    <label className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#604453] hover:border-[#AA336A] cursor-pointer flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-4 h-4 text-[#AA336A]" />
                      <span>{uploading ? 'Uploading Gallery Files...' : '+ Add Multi-Image Photos'}</span>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleMultiFileUpload(e, setGalleryImages, setUploading)}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>

                    {galleryImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {galleryImages.map((img, i) => (
                          <div key={i} className="relative h-16 rounded-lg overflow-hidden border border-[#F0D5E2]">
                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                              className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-rose-600 text-white hover:bg-rose-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0D5E2]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#705562] hover:text-[#22131A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#AA336A] text-white font-bold text-xs hover:bg-[#8E2656] shadow-md"
                  >
                    Register Vendor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: Edit Vendor ── */}
        {showEditModal && editingVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#F0D5E2] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-[#22131A]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
                <h3 className="text-base font-bold text-[#22131A] flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#AA336A]" />
                  Edit Vendor Partner
                </h3>
                <button
                  onClick={() => { setShowEditModal(false); setEditingVendor(null); }}
                  className="p-1 rounded-lg text-[#705562] hover:text-[#22131A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateVendor} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Business Name</label>
                  <input
                    type="text"
                    value={editBusinessName}
                    onChange={(e) => setEditBusinessName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Service Category</label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editCommission}
                      onChange={(e) => setEditCommission(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Starting Price (PKR)</label>
                    <input
                      type="number"
                      value={editStartingPrice}
                      onChange={(e) => setEditStartingPrice(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Cover Image</label>
                  <div className="space-y-2">
                    <label className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#604453] hover:border-[#AA336A] cursor-pointer flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-4 h-4 text-[#AA336A]" />
                      <span>{editUploading ? 'Uploading...' : 'Replace Cover Image'}</span>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, setEditImageUrl, setEditUploading)}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#22131A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Portfolio Gallery Photos (Upload Multiple)</label>
                  <div className="space-y-2">
                    <label className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#604453] hover:border-[#AA336A] cursor-pointer flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-4 h-4 text-[#AA336A]" />
                      <span>{editUploading ? 'Uploading Gallery Files...' : '+ Add Multi-Image Photos'}</span>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleMultiFileUpload(e, setEditGalleryImages, setEditUploading)}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>

                    {editGalleryImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {editGalleryImages.map((img, i) => (
                          <div key={i} className="relative h-16 rounded-lg overflow-hidden border border-[#F0D5E2]">
                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditGalleryImages(editGalleryImages.filter((_, idx) => idx !== i))}
                              className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-rose-600 text-white hover:bg-rose-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0D5E2]">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingVendor(null); }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#705562] hover:text-[#22131A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#AA336A] text-white font-bold text-xs hover:bg-[#8E2656] shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: Delete Confirm ── */}
        {showDeleteConfirm && deletingVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
            <div className="w-full max-w-sm bg-white rounded-2xl p-6 border border-rose-200 shadow-xl text-[#22131A]">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#22131A] mb-1">Remove Vendor Partner?</h3>
                  <p className="text-xs text-[#705562]">
                    This will permanently delete{' '}
                    <span className="font-bold text-[#22131A]">{deletingVendor.business_name}</span>{' '}
                    from your partner network. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletingVendor(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#705562] hover:text-[#22131A] border border-[#F0D5E2] hover:border-[#AA336A]/30"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVendor}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Can>
  );
}
