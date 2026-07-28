'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { Can, PERMISSIONS } from '../../../../lib/permissions';
import {
  FileText,
  Printer,
  Calendar,
  Building2,
  Users,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Phone,
  Mail,
  User,
  Clock,
  Check,
} from 'lucide-react';

export default function BookingInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/${id}`);
      if (res.data.success) {
        setBooking(res.data.booking);
      }
    } catch (err) {
      console.error('Failed to load booking details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-[#705562] text-sm font-semibold">
        Generating invoice breakdown...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-[#705562] bg-white border border-[#F0D5E2] rounded-2xl">
        Booking not found.
      </div>
    );
  }

  const services = booking.services || [];
  const grandTotal = Number(booking.total_amount || 0);

  return (
    <Can
      permission={PERMISSIONS.BOOKING_VIEW}
      fallback={
        <div className="p-8 text-center text-rose-600 font-bold bg-white border border-[#F0D5E2] rounded-2xl shadow-sm">
          Access Denied: Missing 'booking.view' permission.
        </div>
      }
    >
      <div className="space-y-6 max-w-4xl mx-auto print:max-w-none print:p-0">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={() => router.push('/dashboard/bookings')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#F0D5E2] text-xs font-bold text-[#604453] hover:text-[#AA336A]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bookings Desk
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs shadow-md"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
        </div>

        {/* Printable Invoice Card */}
        <div className="bg-white rounded-2xl p-8 border border-[#F0D5E2] shadow-sm space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0D5E2] pb-6 print:border-gray-200">
            <div>
              <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                ShaadiPro Operational Invoice
              </div>
              <h1 className="text-3xl font-extrabold font-serif-title text-[#22131A] print:text-black">
                Reservation #{booking.id}
              </h1>
              <p className="text-xs text-[#705562] print:text-gray-600 mt-1 font-medium">
                Issued: {new Date(booking.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border bg-emerald-50 text-emerald-800 border-emerald-300 print:border-emerald-600 print:text-emerald-700">
                Status: {booking.status}
              </span>
            </div>
          </div>

          {/* Customer & Event Info Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-xl bg-[#FAF5F7] print:bg-gray-50 border border-[#F0D5E2] print:border-gray-200">
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#AA336A] uppercase tracking-wider">
                Customer Info
              </div>
              <div className="text-sm font-bold text-[#22131A] print:text-black flex items-center gap-2">
                <User className="w-4 h-4 text-[#705562]" />
                {booking.customer_name}
              </div>
              <div className="text-xs text-[#604453] print:text-gray-700 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#705562]" />
                {booking.customer_email}
              </div>
              <div className="text-xs text-[#604453] print:text-gray-700 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#705562]" />
                {booking.customer_phone}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#AA336A] uppercase tracking-wider">
                Venue & Event Details
              </div>
              <div className="text-sm font-bold text-[#22131A] print:text-black flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#705562]" />
                {booking.hall_name}
              </div>
              <div className="text-xs text-[#604453] print:text-gray-700 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#705562]" />
                {booking.event_date} ({booking.slot} slot) • <span className="uppercase font-bold text-[#AA336A]">{booking.event_type}</span>
              </div>
              <div className="text-xs text-[#604453] print:text-gray-700 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#705562]" />
                Estimated Guest Count: <span className="font-bold text-[#22131A] print:text-black">{booking.guest_count_estimated} Guests</span>
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#604453] print:text-gray-800">
              Itemized Service Packages
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF5F7] print:bg-gray-100 text-[#604453] print:text-gray-700 uppercase font-bold border-b border-[#F0D5E2] print:border-gray-300">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Package Name</th>
                    <th className="p-3">Pricing Model</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-center">Qty / Guests</th>
                    <th className="p-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0D5E2] print:divide-gray-200 text-[#22131A] print:text-gray-800">
                  {services.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold">{item.category_name}</td>
                      <td className="p-3 font-bold text-[#22131A] print:text-black">{item.package_name}</td>
                      <td className="p-3 font-mono text-[11px] uppercase text-[#705562] print:text-gray-600">
                        {item.pricing_type}
                      </td>
                      <td className="p-3 text-right font-mono font-medium">
                        PKR {Number(item.unit_price || item.price).toLocaleString()}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {item.qty || (item.pricing_type === 'per_head' ? booking.guest_count_estimated : 1)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#AA336A] print:text-[#AA336A] text-sm">
                        PKR {Number(item.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary & Grand Total */}
          <div className="pt-6 border-t border-[#F0D5E2] print:border-gray-300 flex flex-col sm:flex-row items-end justify-between gap-4">
            <div className="text-xs text-[#705562] print:text-gray-600 max-w-sm font-medium">
              * Payment terms: Token advance required upon booking confirmation. Balance payable 7 days prior to event date.
            </div>

            <div className="w-full sm:w-72 space-y-2 p-4 rounded-xl bg-[#FAF5F7] print:bg-gray-100 border border-[#F0D5E2] print:border-gray-200">
              <div className="flex justify-between text-xs text-[#705562] print:text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono text-[#22131A]">PKR {grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-[#705562] print:text-gray-600">
                <span>Taxes & Service Fees</span>
                <span className="font-mono text-[#705562]">PKR 0.00</span>
              </div>
              <div className="pt-2 border-t border-[#F0D5E2] print:border-gray-300 flex justify-between text-base font-extrabold text-[#22131A] print:text-black">
                <span>Grand Total</span>
                <span className="font-mono text-[#AA336A] print:text-[#AA336A]">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Can>
  );
}
