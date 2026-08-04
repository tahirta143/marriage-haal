'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import {
  Award,
  Sparkles,
  Package,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Save,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  FileText,
  Tag,
  Check,
  X
} from 'lucide-react';

export default function VendorSelfPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'packages' | 'inquiries'

  // Loading & Feedback
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Vendor Data State
  const [vendor, setVendor] = useState(null);
  const [packages, setPackages] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  // Profile Form State
  const [businessName, setBusinessName] = useState('');
  const [startingPrice, setStartingPrice] = useState('25000');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Package Modal State
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgType, setPkgType] = useState('fixed'); // 'fixed' | 'per_head' | 'per_hour'
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgImage, setPkgImage] = useState('');

  useEffect(() => {
    fetchVendorProfile();
    fetchInquiries();
  }, []);

  const showSuccess = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors/me');
      if (res.data.success && res.data.vendor) {
        const v = res.data.vendor;
        setVendor(v);
        setBusinessName(v.business_name || '');
        setStartingPrice(v.starting_price?.toString() || '25000');
        setCity(v.city || 'Lahore');
        setAddress(v.address || '');
        setPhone(v.phone || '');
        setDescription(v.description || '');
        setImageUrl(v.image_url || '');

        let parsedG = [];
        if (v.gallery) {
          try {
            parsedG = typeof v.gallery === 'string' ? JSON.parse(v.gallery) : v.gallery;
          } catch (_) {}
        }
        setGalleryImages(Array.isArray(parsedG) ? parsedG : []);
        setPackages(res.data.packages || []);
      }
    } catch (err) {
      console.warn('Failed to load vendor self profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await api.get('/vendors/me/inquiries');
      if (res.data.success) {
        setInquiries(res.data.inquiries || []);
      }
    } catch (err) {
      console.warn('Failed to load vendor inquiries:', err);
    }
  };

  // Image Upload Handlers
  const handleCoverUpload = async (e) => {
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
      showError('Failed to upload cover image');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      setUploading(true);
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
        setGalleryImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      showError('Failed to upload gallery images');
    } finally {
      setUploading(false);
    }
  };

  // Save Vendor Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMessage('');
      setFeedback('');

      const res = await api.put('/vendors/me', {
        business_name: businessName,
        starting_price: parseFloat(startingPrice || 0),
        city,
        address,
        phone,
        description,
        image_url: imageUrl,
        gallery: galleryImages,
      });

      if (res.data.success) {
        showSuccess('Vendor profile & package settings updated successfully!');
        fetchVendorProfile();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Package Management Handlers
  const openNewPackageModal = () => {
    setEditingPkg(null);
    setPkgName('');
    setPkgPrice('');
    setPkgType('fixed');
    setPkgDesc('');
    setPkgImage('');
    setShowPkgModal(true);
  };

  const openEditPackageModal = (pkg) => {
    setEditingPkg(pkg);
    setPkgName(pkg.name);
    setPkgPrice(pkg.price?.toString() || '0');
    setPkgType(pkg.pricing_type || 'fixed');
    setPkgDesc(pkg.description || '');
    setPkgImage(pkg.image_url || '');
    setShowPkgModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!pkgName || !pkgPrice) return;

    try {
      setSaving(true);
      if (editingPkg) {
        const res = await api.put(`/vendors/packages/${editingPkg.id}`, {
          name: pkgName,
          price: parseFloat(pkgPrice),
          pricing_type: pkgType,
          description: pkgDesc,
          image_url: pkgImage,
        });
        if (res.data.success) {
          showSuccess('Package updated successfully');
          setShowPkgModal(false);
          fetchVendorProfile();
        }
      } else {
        const res = await api.post('/vendors/packages', {
          vendor_id: vendor?.id,
          name: pkgName,
          price: parseFloat(pkgPrice),
          pricing_type: pkgType,
          description: pkgDesc,
          image_url: pkgImage,
        });
        if (res.data.success) {
          showSuccess('New service package added');
          setShowPkgModal(false);
          fetchVendorProfile();
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePackage = async (pkgId) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      const res = await api.delete(`/vendors/packages/${pkgId}`);
      if (res.data.success) {
        showSuccess('Package deleted');
        fetchVendorProfile();
      }
    } catch (err) {
      showError('Failed to delete package');
    }
  };

  // Inquiry Status Handler
  const handleInquiryStatusChange = async (inquiryId, status) => {
    try {
      const res = await api.put(`/vendors/me/inquiries/${inquiryId}`, { status });
      if (res.data.success) {
        showSuccess(`Inquiry marked as ${status}`);
        fetchInquiries();
      }
    } catch (err) {
      showError('Failed to update inquiry status');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#705562] font-semibold text-sm">
        <div className="w-8 h-8 border-2 border-[#AA336A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading vendor self-management workspace...
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-8 text-center bg-white border border-[#F0D5E2] rounded-3xl max-w-lg mx-auto my-12 shadow-sm space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold font-serif-title text-[#22131A]">No Vendor Profile Found</h2>
        <p className="text-xs text-[#705562]">
          Your account ({user?.email}) is not currently linked to an active Vendor profile. Please contact system admin to complete vendor account assignment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#F0D5E2] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] overflow-hidden flex-shrink-0">
            <img
              src={vendor.image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
              alt={vendor.business_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#AA336A] uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Vendor Self-Management Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-title text-[#22131A]">
              {vendor.business_name}
            </h1>
            <p className="text-xs text-[#705562] font-semibold mt-0.5">
              Category: <span className="text-[#22131A]">{vendor.category_name || 'Service Vendor'}</span> • City: <span className="text-[#22131A]">{vendor.city}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 bg-[#FAF5F7] p-1.5 rounded-2xl border border-[#F0D5E2] self-start md:self-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#AA336A] text-white shadow-md'
                : 'text-[#705562] hover:text-[#22131A]'
            }`}
          >
            Profile &amp; Details
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'packages'
                ? 'bg-[#AA336A] text-white shadow-md'
                : 'text-[#705562] hover:text-[#22131A]'
            }`}
          >
            Packages ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all relative ${
              activeTab === 'inquiries'
                ? 'bg-[#AA336A] text-white shadow-md'
                : 'text-[#705562] hover:text-[#22131A]'
            }`}
          >
            Inquiries ({inquiries.length})
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: PROFILE & BRANDING DETAILS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5E2] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0D5E2]">
            <h3 className="text-lg font-bold font-serif-title text-[#22131A] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#AA336A]" />
              Business Profile &amp; Pricing Setup
            </h3>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] font-bold focus:outline-none focus:border-[#AA336A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Starting Price (PKR)</label>
              <input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] font-bold focus:outline-none focus:border-[#AA336A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#604453] uppercase mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] font-bold focus:outline-none focus:border-[#AA336A]"
              >
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Karachi">Karachi</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Multan">Multan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Contact Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] font-bold focus:outline-none focus:border-[#AA336A]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Office / Studio Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. MM Alam Road, Gulberg III, Lahore"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] font-medium focus:outline-none focus:border-[#AA336A]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#604453] uppercase mb-1">About &amp; Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your specialization, years of experience, equipment, and services provided..."
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] font-medium focus:outline-none focus:border-[#AA336A]"
              />
            </div>

            {/* Images Setup */}
            <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#F0D5E2]">
              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-2">Main Cover Photo</label>
                <div className="flex items-center gap-4">
                  {imageUrl && (
                    <img src={imageUrl} alt="Cover" className="w-24 h-16 rounded-xl object-cover border border-[#F0D5E2]" />
                  )}
                  <label className="px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-extrabold text-[#AA336A] hover:bg-[#AA336A] hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload Cover Image'}</span>
                    <input type="file" onChange={handleCoverUpload} accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-2">Photo Portfolio Gallery</label>
                <div className="space-y-3">
                  <label className="px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-extrabold text-[#AA336A] hover:bg-[#AA336A] hover:text-white cursor-pointer transition-colors inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading Files...' : '+ Add Portfolio Gallery Images'}</span>
                    <input type="file" multiple onChange={handleGalleryUpload} accept="image/*" className="hidden" />
                  </label>

                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden h-24 border border-[#F0D5E2]">
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: PACKAGES & PRICE LIST */}
      {activeTab === 'packages' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5E2] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0D5E2]">
            <div>
              <h3 className="text-lg font-bold font-serif-title text-[#22131A] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#AA336A]" />
                Service Packages &amp; Price List
              </h3>
              <p className="text-xs text-[#705562] font-medium mt-0.5">
                Create structured packages (Per Plate rate, Standard 4K Shoot, Airbrush Makeup Deals).
              </p>
            </div>
            <button
              onClick={openNewPackageModal}
              className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Package</span>
            </button>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#F0D5E2] rounded-2xl">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#22131A]">No Custom Packages Created Yet</h4>
              <p className="text-xs text-[#705562] mt-1 max-w-xs mx-auto">
                Add your packages so clients browsing your profile can view exact pricing options.
              </p>
              <button
                onClick={openNewPackageModal}
                className="mt-4 px-4 py-2 rounded-xl bg-[#AA336A] text-white text-xs font-bold"
              >
                + Create First Package
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-[#FAF5F7] rounded-2xl border border-[#F0D5E2] p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#AA336A]/10 text-[#AA336A]">
                        {pkg.pricing_type === 'per_head' ? 'Per Head Rate' : pkg.pricing_type === 'per_hour' ? 'Per Hour Rate' : 'Fixed Package'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditPackageModal(pkg)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#AA336A] hover:bg-white"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-[#22131A]">{pkg.name}</h4>
                    <p className="text-xs text-[#705562] leading-relaxed font-medium">
                      {pkg.description || 'Complete package inclusions and service details.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0D5E2] flex items-center justify-between">
                    <span className="text-xs text-[#705562] font-semibold">Rate:</span>
                    <span className="text-lg font-extrabold text-[#22131A] font-mono">
                      PKR {parseFloat(pkg.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INQUIRIES INBOX */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5E2] shadow-sm space-y-6">
          <div className="pb-4 border-b border-[#F0D5E2]">
            <h3 className="text-lg font-bold font-serif-title text-[#22131A] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#AA336A]" />
              Customer Inquiries &amp; Availability Requests
            </h3>
            <p className="text-xs text-[#705562] font-medium mt-0.5">
              Quotes and availability checks submitted directly by customers on ShaadiPro.
            </p>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#F0D5E2] rounded-2xl">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#22131A]">No Inquiries Received Yet</h4>
              <p className="text-xs text-[#705562] mt-1">
                New customer inquiries will appear here when users check your availability on the marketplace.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-5 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#22131A]">{inq.customer_name}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        inq.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        inq.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        inq.status === 'contacted' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {inq.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#705562] font-semibold">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#AA336A]" />{inq.customer_phone}</span>
                      {inq.customer_email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#AA336A]" />{inq.customer_email}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#AA336A]" />Date: {inq.event_date ? new Date(inq.event_date).toLocaleDateString() : 'TBD'}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#AA336A]" />Guests: {inq.guest_count}</span>
                    </div>

                    {inq.message && (
                      <p className="text-xs text-[#604453] mt-2 italic bg-white p-2.5 rounded-xl border border-[#F0D5E2]">
                        &quot;{inq.message}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleInquiryStatusChange(inq.id, 'accepted')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => handleInquiryStatusChange(inq.id, 'rejected')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PACKAGE ADD/EDIT MODAL */}
      {showPkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#F0D5E2] shadow-2xl space-y-4 text-[#22131A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
              <h3 className="text-base font-bold text-[#22131A]">
                {editingPkg ? 'Edit Package' : 'Add New Custom Package'}
              </h3>
              <button onClick={() => setShowPkgModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Package Title</label>
                <input
                  type="text"
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  placeholder="e.g. Premium Mutton & Biryani Spread"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(e.target.value)}
                    placeholder="1800"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Pricing Model</label>
                  <select
                    value={pkgType}
                    onChange={(e) => setPkgType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="per_head">Per Head / Per Plate</option>
                    <option value="per_hour">Per Hour</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-1">Package Inclusions &amp; Details</label>
                <textarea
                  rows={3}
                  value={pkgDesc}
                  onChange={(e) => setPkgDesc(e.target.value)}
                  placeholder="List items, dishes, or equipment included in this package..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-md"
              >
                {saving ? 'Saving Package...' : editingPkg ? 'Update Package' : 'Create Package'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
