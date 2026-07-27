'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Can, PERMISSIONS } from '../../../lib/permissions';
import {
  Building2,
  Plus,
  Users,
  ShieldAlert,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

export default function HallsPage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [capacityMin, setCapacityMin] = useState('200');
  const [capacityMax, setCapacityMax] = useState('800');
  const [address, setAddress] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState('AC, VIP Parking, Sound System, Backup Generator');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const res = await api.get('/halls');
      if (res.data.success) {
        setHalls(res.data.halls);
      }
    } catch (err) {
      console.error('Failed to fetch halls:', err);
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

  const handleCreateHall = async (e) => {
    e.preventDefault();
    if (!name || !capacityMin || !capacityMax) return;

    try {
      setErrorMessage('');
      setFeedback('');

      const amenitiesArr = amenitiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post('/halls', {
        name,
        capacity_min: parseInt(capacityMin),
        capacity_max: parseInt(capacityMax),
        address,
        amenities: amenitiesArr,
        image_url: imageUrl,
      });

      if (res.data.success) {
        setFeedback(`Hall Venue '${name}' created successfully.`);
        setShowModal(false);
        setName('');
        setAddress('');
        setImageUrl('');
        fetchHalls();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create hall venue';
      setErrorMessage(msg);
    }
  };

  return (
    <Can
      permission={PERMISSIONS.HALL_MANAGE}
      fallback={
        <div className="p-8 text-center text-red-400 font-bold flex items-center justify-center gap-2 glass-card rounded-2xl">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'hall.manage' permission.
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Venue Hall & Slot Roster
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-white">
              Marriage Halls & Capacity Management
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Manage venue halls, seating capacities, addresses, and slot operational rules.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg glow-accent"
          >
            <Plus className="w-4 h-4" />
            Add New Hall Venue
          </button>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Halls Grid with Images */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Loading hall venues...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {halls.map((hall) => {
              const amenities = Array.isArray(hall.amenities)
                ? hall.amenities
                : typeof hall.amenities === 'string'
                ? JSON.parse(hall.amenities)
                : ['AC', 'Parking', 'Sound System'];

              const fallbackImg = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';

              return (
                <div key={hall.id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between">
                  <div>
                    {/* Hall Image */}
                    <div className="h-48 w-full overflow-hidden relative bg-slate-900">
                      <img
                        src={hall.image_url || fallbackImg}
                        alt={hall.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                        {hall.status}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{hall.name}</h3>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          {hall.address || 'Lahore, Pakistan'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Guest Capacity</span>
                        <span className="font-mono font-bold text-amber-400">
                          {hall.capacity_min} - {hall.capacity_max} Guests
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Included Amenities:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {amenities.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 font-medium">
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create New Hall */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Add New Hall Venue
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateHall} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Hall Venue Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Crystal Grand Ballroom"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Min Capacity
                    </label>
                    <input
                      type="number"
                      value={capacityMin}
                      onChange={(e) => setCapacityMin(e.target.value)}
                      placeholder="200"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      value={capacityMax}
                      onChange={(e) => setCapacityMax(e.target.value)}
                      placeholder="800"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Address / Location
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Gulberg III, Lahore"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Amenities (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={amenitiesInput}
                    onChange={(e) => setAmenitiesInput(e.target.value)}
                    placeholder="AC, VIP Parking, Chandelier Lighting"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Multer Image Upload Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Hall Cover Image (Upload or Paste URL)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:border-amber-500 cursor-pointer flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>{uploading ? 'Uploading...' : 'Choose Image File (Multer)'}</span>
                        <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600"
                  >
                    Create Hall Venue
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
