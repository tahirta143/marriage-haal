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
} from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [commission, setCommission] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
      console.error('Failed to load vendors:', err);
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
        setImageUrl(`http://localhost:5000${res.data.imageUrl}`);
      }
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

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
        image_url: imageUrl,
      });

      if (res.data.success) {
        setFeedback(`Vendor partner '${businessName}' registered successfully.`);
        setShowModal(false);
        setBusinessName('');
        setCommission('10');
        setImageUrl('');
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to register vendor partner';
      setErrorMessage(msg);
    }
  };

  return (
    <Can
      permission={PERMISSIONS.VENDOR_MANAGE}
      fallback={
        <div className="p-8 text-center text-rose-600 font-bold flex items-center justify-center gap-2 bg-white border border-[#F0D5E2] rounded-2xl shadow-sm">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'vendor.manage' permission.
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#F0D5E2] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Partner Network & Commissions
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
            className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] active:bg-[#77234A] text-white font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg glow-brand"
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((v) => {
              const fallbackImg = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
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
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 backdrop-blur-md">
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

                      <div className="p-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] flex items-center justify-between text-xs">
                        <span className="text-[#705562] font-semibold">Partner Commission</span>
                        <span className="font-mono font-extrabold text-[#AA336A] text-sm">
                          {v.commission_percent}%
                        </span>
                      </div>

                      <div className="text-xs text-[#705562]">
                        Account Email: <span className="text-[#22131A] font-mono font-semibold">{v.vendor_email || 'vendor@shaadipro.com'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Register Vendor */}
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
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Business Name
                  </label>
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
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Service Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Commission Rate (%)
                  </label>
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

                {/* Multer Image Upload Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Vendor Business Cover Image
                  </label>
                  <div className="space-y-2">
                    <label className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#604453] hover:border-[#AA336A] cursor-pointer flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-4 h-4 text-[#AA336A]" />
                      <span>{uploading ? 'Uploading...' : 'Upload Image File (Multer)'}</span>
                      <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
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
      </div>
    </Can>
  );
}
