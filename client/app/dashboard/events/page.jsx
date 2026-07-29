'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  Upload,
  Crown,
  Flame,
  Gem,
  Award,
  Heart,
  Music,
  X,
} from 'lucide-react';

export default function EventsManagementPage() {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.data.success) {
        setEventsList(res.data.events || []);
      }
    } catch (err) {
      console.error('Failed to fetch events from MySQL:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setEventName('');
    setEventSlug('');
    setEventDesc('');
    setEventImage('');
    setShowModal(true);
  };

  const openEditModal = (evt) => {
    setEditingId(evt.id);
    setEventName(evt.name);
    setEventSlug(evt.slug);
    setEventDesc(evt.description || evt.desc || '');
    setEventImage(evt.image_url || evt.image || '');
    setShowModal(true);
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
        setEventImage(`http://localhost:5000${res.data.imageUrl}`);
      }
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventName || !eventDesc) return;

    const slug = eventSlug || eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const img = eventImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';

    try {
      if (editingId) {
        // Update in MySQL database
        const res = await api.put(`/events/${editingId}`, {
          name: eventName,
          slug,
          description: eventDesc,
          image_url: img,
        });
        if (res.data.success) {
          setFeedback(`Event Function '${eventName}' updated in MySQL database.`);
        }
      } else {
        // Create in MySQL database
        const res = await api.post('/events', {
          name: eventName,
          slug,
          description: eventDesc,
          image_url: img,
        });
        if (res.data.success) {
          setFeedback(`New Event Function '${eventName}' created in MySQL database.`);
        }
      }

      setShowModal(false);
      fetchEvents();
    } catch (err) {
      alert('Failed to save event function in database');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event function from MySQL database?')) return;
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data.success) {
        setFeedback('Event function removed from MySQL database.');
        fetchEvents();
      }
    } catch (err) {
      alert('Failed to delete event function');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#F0D5E2] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            MySQL Event Functions & Packages Table
          </div>
          <h1 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
            Event Functions Management (Add, Edit, Update, Delete)
          </h1>
          <p className="text-[#705562] text-xs mt-1 font-medium">
            Directly connected to XAMPP MySQL 'events' table for Barat, Mehndi, Walima, Nikkah, Bridal Shower, Qawali Night, and Engagement.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Event Function
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Events Grid with Image Covers */}
      {loading ? (
        <div className="text-center py-12 text-[#705562] text-sm font-semibold">
          Loading MySQL events table...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsList.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl border border-[#F0D5E2] overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#AA336A]/50 transition-all duration-300"
            >
              <div>
                {/* Event Cover Photo */}
                <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                  <img
                    src={evt.image_url || evt.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'}
                    alt={evt.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#AA336A] text-white shadow-md">
                    {evt.slug}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full p-1 border border-[#F0D5E2] shadow-sm">
                    <button
                      onClick={() => openEditModal(evt)}
                      className="p-1.5 rounded-full text-[#705562] hover:text-[#AA336A] transition-colors"
                      title="Edit Event"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-1.5 rounded-full text-[#9E7D8C] hover:text-rose-600 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold font-serif-title text-[#22131A]">{evt.name}</h3>
                  <p className="text-xs text-[#705562] leading-relaxed font-normal">
                    {evt.description || evt.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Event */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#F0D5E2] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
              <h3 className="text-base font-bold text-[#22131A] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#AA336A]" />
                {editingId ? 'Edit Event Function' : 'Add New Event Function'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-[#705562] hover:text-[#22131A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                  Event Function Name
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Sangeet & Musical Night"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={eventSlug}
                  onChange={(e) => setEventSlug(e.target.value)}
                  placeholder="sangeet-musical-night"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                  Description / Inclusions
                </label>
                <textarea
                  rows="3"
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Details about stage setup, catering choices, and music."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A]"
                />
              </div>

              {/* Multer Image Upload Picker */}
              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                  Event Cover Photo (Upload or URL)
                </label>
                <div className="space-y-2">
                  <label className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#604453] hover:border-[#AA336A] cursor-pointer flex items-center justify-center gap-2 font-semibold">
                    <Upload className="w-4 h-4 text-[#AA336A]" />
                    <span>{uploading ? 'Uploading...' : 'Choose Image File (Multer)'}</span>
                    <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                  </label>
                  <input
                    type="text"
                    value={eventImage}
                    onChange={(e) => setEventImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs text-[#22131A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0D5E2]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-[#705562]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#AA336A] text-[#FFFFFF] font-bold text-xs shadow-md">
                  {editingId ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
