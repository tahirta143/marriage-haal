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
  Edit2,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

export default function HallsPage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingHallId, setEditingHallId] = useState(null);
  const [name, setName] = useState('');
  const [venueType, setVenueType] = useState('Ballroom');
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

  const openCreateModal = () => {
    setEditingHallId(null);
    setName('');
    setVenueType('Ballroom');
    setCapacityMin('200');
    setCapacityMax('800');
    setAddress('');
    setAmenitiesInput('AC, VIP Parking, Sound System, Backup Generator');
    setImageUrl('');
    setShowModal(true);
  };

  const openEditModal = (hall) => {
    setEditingHallId(hall.id);
    setName(hall.name);
    setVenueType(hall.venue_type || 'Ballroom');
    setCapacityMin(hall.capacity_min);
    setCapacityMax(hall.capacity_max);
    setAddress(hall.address || '');
    const amenitiesArr = Array.isArray(hall.amenities)
      ? hall.amenities
      : typeof hall.amenities === 'string'
      ? JSON.parse(hall.amenities)
      : [];
    setAmenitiesInput(amenitiesArr.join(', '));
    setImageUrl(hall.image_url || '');
    setShowModal(true);
  };

  const handleSaveHall = async (e) => {
    e.preventDefault();
    if (!name || !capacityMin || !capacityMax) return;

    try {
      setErrorMessage('');
      setFeedback('');

      const amenitiesArr = amenitiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name,
        venue_type: venueType,
        capacity_min: parseInt(capacityMin),
        capacity_max: parseInt(capacityMax),
        address,
        amenities: amenitiesArr,
        image_url: imageUrl,
      };

      if (editingHallId) {
        // Update hall in MySQL
        const res = await api.put(`/halls/${editingHallId}`, payload);
        if (res.data.success) {
          setFeedback(`Venue Hall '${name}' updated successfully in database.`);
        }
      } else {
        // Create hall in MySQL
        const res = await api.post('/halls', payload);
        if (res.data.success) {
          setFeedback(`Venue Hall '${name}' created successfully in database.`);
        }
      }

      setShowModal(false);
      fetchHalls();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save venue hall';
      setErrorMessage(msg);
    }
  };

  const handleDeleteHall = async (hallId) => {
    if (!confirm('Are you sure you want to delete this venue hall?')) return;
    try {
      const res = await api.delete(`/halls/${hallId}`);
      if (res.data.success) {
        setFeedback('Venue hall deleted from database.');
        fetchHalls();
      }
    } catch (err) {
      alert('Failed to delete venue hall');
    }
  };

  return (
    <Can
      permission={PERMISSIONS.HALL_MANAGE}
      fallback={
        <div className="p-8 text-center text-rose-600 font-bold flex items-center justify-center gap-2 bg-white border border-[#F0D5E2] rounded-2xl shadow-sm">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'hall.manage' permission.
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#F0D5E2] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Venue Hall & Slot Roster
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
              Venues Management (Add, Edit, Update, Delete)
            </h1>
            <p className="text-[#705562] text-xs mt-1 font-medium">
              Manage venue halls, seating capacities, addresses, amenities, and image cover URLs in MySQL database.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] active:bg-[#77234A] text-white font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg glow-brand"
          >
            <Plus className="w-4 h-4" />
            Add New Venue Hall
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

        {/* Halls Grid with Images & Action Buttons */}
        {loading ? (
          <div className="text-center py-12 text-[#705562] text-sm font-semibold">
            Loading database venue halls...
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
                <div key={hall.id} className="bg-white rounded-2xl overflow-hidden border border-[#F0D5E2] shadow-sm hover:border-[#AA336A]/50 transition-colors flex flex-col justify-between">
                  <div>
                    {/* Hall Image */}
                    <div className="h-48 w-full overflow-hidden relative bg-[#FAF5F7]">
                      <img
                        src={hall.image_url || fallbackImg}
                        alt={hall.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/90 backdrop-blur-md text-[#AA336A] border border-[#F0D5E2] shadow-sm">
                        {hall.venue_type || hall.status}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-[#22131A]">{hall.name}</h3>
                          <div className="text-xs text-[#705562] flex items-center gap-1 mt-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#AA336A] flex-shrink-0" />
                            {hall.address || 'Lahore, Pakistan'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(hall)}
                            className="p-1.5 rounded-lg text-[#705562] hover:text-[#AA336A] hover:bg-[#FAF5F7] transition-colors"
                            title="Edit Venue Hall"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHall(hall.id)}
                            className="p-1.5 rounded-lg text-[#9E7D8C] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Venue Hall"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] flex items-center justify-between text-xs">
                        <span className="text-[#705562] font-semibold">Guest Capacity</span>
                        <span className="font-mono font-bold text-[#AA336A]">
                          {hall.capacity_min} - {hall.capacity_max} Guests
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-[#705562] uppercase tracking-wider">
                          Included Amenities:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {amenities.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-[#FAF5F7] border border-[#F0D5E2] text-[10px] text-[#22131A] font-semibold">
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

        {/* Modal: Create / Edit Hall */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#F0D5E2] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
                <h3 className="text-base font-bold text-[#22131A] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#AA336A]" />
                  {editingHallId ? 'Edit Venue Hall' : 'Add New Venue Hall'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-[#705562] hover:text-[#22131A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveHall} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Crystal Grand Ballroom"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Venue Type
                  </label>
                  <select
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                  >
                    <option value="Ballroom">Ballroom</option>
                    <option value="Marquee">Marquee</option>
                    <option value="Lawn">Lawn & Garden</option>
                    <option value="Farmhouse">Farmhouse</option>
                    <option value="Rooftop">Rooftop</option>
                    <option value="Banquet">Banquet Hall</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                      Min Capacity
                    </label>
                    <input
                      type="number"
                      value={capacityMin}
                      onChange={(e) => setCapacityMin(e.target.value)}
                      placeholder="200"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      value={capacityMax}
                      onChange={(e) => setCapacityMax(e.target.value)}
                      placeholder="800"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Address / Location
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Gulberg III, Lahore"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Amenities (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={amenitiesInput}
                    onChange={(e) => setAmenitiesInput(e.target.value)}
                    placeholder="AC, VIP Parking, Chandelier Lighting"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                  />
                </div>

                {/* Multer Image Upload Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Hall Cover Image (Upload or Paste URL)
                  </label>
                  <div className="space-y-2">
                    <label className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#604453] hover:border-[#AA336A] cursor-pointer flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-4 h-4 text-[#AA336A]" />
                      <span>{uploading ? 'Uploading...' : 'Choose Image File (Multer)'}</span>
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
                    {editingHallId ? 'Update Venue Hall' : 'Create Venue Hall'}
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
