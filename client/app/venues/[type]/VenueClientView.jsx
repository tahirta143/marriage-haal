'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import MarketplaceHeader from '../../../components/MarketplaceHeader';
import OtpAuthModal from '../../../components/OtpAuthModal';
import VenueDetailClientView from '../detail/VenueDetailClientView';
import {
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Zap,
  X,
} from 'lucide-react';

export default function VenueClientView({ type }) {
  if (type === 'detail') {
    return (
      <React.Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-500">Loading venue details...</div>}>
        <VenueDetailClientView />
      </React.Suspense>
    );
  }

  const { user } = useAuth();

  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Lahore');

  const [quoteModalTarget, setQuoteModalTarget] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [eventFunction, setEventFunction] = useState('Barat Planning');
  const [eventDate, setEventDate] = useState('2026-10-24');
  const [guestCount, setGuestCount] = useState(300);
  const [custPhone, setCustPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const venueTypeName = (type || 'ballroom').toUpperCase();

  useEffect(() => {
    fetchHalls();
  }, [type, selectedCity]);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/halls?city=${encodeURIComponent(selectedCity)}&venue_type=${encodeURIComponent(type || 'all')}`);
      if (res.data.success) {
        setHalls(res.data.halls || []);
      }
    } catch (err) {
      console.error('Failed to load halls from MySQL:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      setFeedback('');

      const payload = {
        hall_id: quoteModalTarget?.id || 1,
        event_type: eventFunction,
        event_date: eventDate,
        guest_count: guestCount,
        customer_phone: custPhone || user.phone || '+92 300 1234567',
        customer_name: user.name,
        customer_email: user.email,
      };

      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        setFeedback(`Inquiry #${res.data.bookingId} submitted! The venue team will contact you shortly.`);
        setTimeout(() => setQuoteModalTarget(null), 3000);
      }
    } catch (err) {
      alert('Failed to submit venue inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHalls = halls.filter(
    (h) =>
      (h.venue_type || '').toLowerCase() === (type || '').toLowerCase() ||
      h.name.toLowerCase().includes((type || '').toLowerCase())
  );

  const displayHalls = filteredHalls.length > 0 ? filteredHalls : halls;

  return (
    <div className="min-h-screen bg-[#FAF7F9] text-[#111827]">
      <MarketplaceHeader selectedCity={selectedCity} onSelectCity={setSelectedCity} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-[#F0D5E2] pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AA336A] uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            Property Type: {venueTypeName}
          </div>
          <h1 className="text-3xl font-extrabold font-serif-title text-[#22131A]">
            {venueTypeName} Venues in {selectedCity}
          </h1>
          <p className="text-xs text-[#705562]">
            Browse all verified {venueTypeName} property listings, guest capacities, and check slot availability.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#705562] font-semibold text-sm">
            <div className="w-8 h-8 border-3 border-[#AA336A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading {venueTypeName} venues...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayHalls.map((hall) => {
              const fallbackImg = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';
              const amenitiesList = Array.isArray(hall.amenities)
                ? hall.amenities
                : typeof hall.amenities === 'string'
                ? JSON.parse(hall.amenities)
                : ['AC', 'VIP Parking', 'Sound System'];

              return (
                <div
                  key={hall.id}
                  className="rounded-3xl bg-white border border-[#F0D5E2] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                    <img
                      src={hall.image_url || fallbackImg}
                      alt={hall.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#AA336A] text-white shadow-md">
                      {hall.venue_type || venueTypeName}
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[#22131A]">{hall.name}</h3>
                      <p className="text-xs text-[#705562] font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#AA336A]" /> {hall.address}
                      </p>

                      <div className="p-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#AA336A] flex items-center justify-between">
                        <span>Capacity:</span>
                        <span>{hall.capacity_min} - {hall.capacity_max} Guests</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {amenitiesList.map((item, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-gray-50 border border-[#E5E7EB] text-[11px] font-semibold text-[#22131A]"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#F0D5E2]">
                      <button
                        onClick={() => setQuoteModalTarget(hall)}
                        className="w-full py-3 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#AA336A]/20"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Check Availability & Quote</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {quoteModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5E2] shadow-2xl space-y-5">
            <button
              onClick={() => setQuoteModalTarget(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#AA336A] uppercase tracking-wider">
                Venue Inquiry
              </span>
              <h3 className="text-xl font-bold font-serif-title text-[#22131A]">
                {quoteModalTarget.name}
              </h3>
            </div>

            {feedback && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Event Function
                  </label>
                  <select
                    value={eventFunction}
                    onChange={(e) => setEventFunction(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold uppercase text-[#22131A]"
                  >
                    <option value="Barat Planning">Barat Planning</option>
                    <option value="Mehndi & Mayo">Mehndi & Mayo</option>
                    <option value="Walima Reception">Walima Reception</option>
                    <option value="Bridal Shower">Bridal Shower</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Nikkah">Nikkah</option>
                    <option value="Qawali Night">Qawali Night</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Function Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                  Contact Phone Number (+92)
                </label>
                <input
                  type="tel"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Send Venue Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <OtpAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
