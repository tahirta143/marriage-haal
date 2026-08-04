'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { Can, PERMISSIONS } from '../../../../lib/permissions';
import {
  FileText,
  Printer,
  Calendar,
  Building2,
  Users,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Check
} from 'lucide-react';

export default function BookingInvoiceClientView({ id }) {
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
        <div className="w-8 h-8 border-2 border-[#AA336A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Generating operational invoice breakdown...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-[#705562] bg-white border border-[#F0D5E2] rounded-2xl max-w-md mx-auto my-12">
        Booking invoice not found.
      </div>
    );
  }

  const services = booking.services || [];
  const grandTotal = Number(booking.total_amount || 0);

  // Clean date formatting
  let formattedEventDate = 'TBD';
  if (booking.event_date) {
    try {
      const dStr = typeof booking.event_date === 'string' ? booking.event_date.split('T')[0] : booking.event_date;
      const dateObj = new Date(dStr);
      if (!isNaN(dateObj.getTime())) {
        formattedEventDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } else {
        formattedEventDate = dStr;
      }
    } catch (_) {
      formattedEventDate = String(booking.event_date);
    }
  }

  const issuedDate = new Date(booking.created_at || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const slotLabel = booking.slot ? (booking.slot.toLowerCase().includes('slot') ? booking.slot : `${booking.slot} Slot`) : 'Evening Slot';

  return (
    <Can
      permission={PERMISSIONS.BOOKING_VIEW}
      fallback={
        <div className="p-8 text-center text-rose-600 font-bold bg-white border border-[#F0D5E2] rounded-2xl shadow-sm">
          <ShieldAlert className="w-6 h-6 mx-auto mb-2 text-rose-500" />
          Access Denied: Missing &apos;booking.view&apos; permission.
        </div>
      }
    >
      <div className="space-y-6 max-w-4xl mx-auto print:max-w-none print:w-full print:p-0 print:m-0">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={() => router.push('/dashboard/bookings')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#F0D5E2] text-xs font-extrabold text-[#604453] hover:text-[#AA336A] hover:border-[#AA336A] transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bookings Desk</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Invoice</span>
          </button>
        </div>

        {/* PRINTABLE INVOICE CARD */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#F0D5E2] shadow-md space-y-8 print:p-0 print:border-none print:shadow-none print:rounded-none">
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#F0D5E2] pb-6 print:border-gray-300">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] text-[#AA336A] print:border-gray-300">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold font-serif-title text-[#AA336A] print:text-black tracking-wide">
                  SHAADI PRO
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#705562] block print:text-gray-600">
                  Marriage Hall &amp; Event Management System
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-xs font-extrabold text-[#AA336A] uppercase tracking-wider print:text-black">
                Reservation Invoice #{booking.id}
              </div>
              <div className="text-xs text-[#705562] font-semibold print:text-gray-600">
                Date Issued: <span className="text-[#22131A] font-bold print:text-black">{issuedDate}</span>
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 print:bg-gray-100 print:text-black' :
                  booking.status === 'completed' ? 'bg-blue-50 text-blue-800 border-blue-300 print:bg-gray-100 print:text-black' :
                  booking.status === 'tentative' ? 'bg-amber-50 text-amber-800 border-amber-300 print:bg-gray-100 print:text-black' :
                  'bg-purple-50 text-purple-800 border-purple-300 print:bg-gray-100 print:text-black'
                }`}>
                  Status: {booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* Details Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] print:bg-gray-50 print:border-gray-300">
            {/* Customer Column */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#AA336A] block print:text-gray-700">
                CLIENT / CUSTOMER INFORMATION
              </span>
              <div className="text-sm font-extrabold text-[#22131A] print:text-black flex items-center gap-2">
                <User className="w-4 h-4 text-[#AA336A] print:text-black" />
                <span>{booking.customer_name || 'Guest Customer'}</span>
              </div>
              <div className="text-xs text-[#604453] font-semibold print:text-gray-700 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#AA336A] print:text-black" />
                <span>{booking.customer_phone || 'N/A'}</span>
              </div>
              {booking.customer_email && (
                <div className="text-xs text-[#604453] font-semibold print:text-gray-700 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#AA336A] print:text-black" />
                  <span>{booking.customer_email}</span>
                </div>
              )}
            </div>

            {/* Event Column */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#AA336A] block print:text-gray-700">
                VENUE &amp; FUNCTION SPECIFICATIONS
              </span>
              <div className="text-sm font-extrabold text-[#22131A] print:text-black flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#AA336A] print:text-black" />
                <span>{booking.hall_name || 'ShaadiPro Main Venue'}</span>
              </div>
              <div className="text-xs text-[#604453] font-semibold print:text-gray-700 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#AA336A] print:text-black" />
                <span>{formattedEventDate} • <strong className="uppercase text-[#AA336A] print:text-black">{booking.event_type}</strong></span>
              </div>
              <div className="text-xs text-[#604453] font-semibold print:text-gray-700 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#AA336A] print:text-black" />
                <span>Timing: <strong>{slotLabel}</strong> • Capacity: <strong>{booking.guest_count_estimated} Guests</strong></span>
              </div>
            </div>
          </div>

          {/* Itemized Services & Charges Table */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#604453] block print:text-gray-800">
              ITEMIZED SERVICES &amp; PRICING BREAKDOWN
            </span>

            <div className="overflow-hidden rounded-2xl border border-[#F0D5E2] print:border-gray-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF5F7] text-[#604453] font-extrabold uppercase border-b border-[#F0D5E2] print:bg-gray-100 print:text-black print:border-gray-300">
                  <tr>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Service Category</th>
                    <th className="p-3.5">Package Title</th>
                    <th className="p-3.5">Pricing Model</th>
                    <th className="p-3.5 text-right">Unit Rate</th>
                    <th className="p-3.5 text-center">Qty / Guests</th>
                    <th className="p-3.5 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0D5E2] text-[#22131A] font-medium print:divide-gray-200 print:text-black">
                  {services.length > 0 ? (
                    services.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF5F7]/50 print:hover:bg-transparent">
                        <td className="p-3.5 font-bold text-[#705562]">{idx + 1}</td>
                        <td className="p-3.5 font-bold">{item.category_name}</td>
                        <td className="p-3.5 font-extrabold text-[#AA336A] print:text-black">{item.package_name}</td>
                        <td className="p-3.5 font-mono text-[10px] uppercase text-[#705562]">
                          {item.pricing_type === 'per_head' ? 'Per Head' : 'Fixed Flat'}
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          PKR {Number(item.unit_price || item.price).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center font-extrabold">
                          {item.qty || (item.pricing_type === 'per_head' ? booking.guest_count_estimated : 1)}
                        </td>
                        <td className="p-3.5 text-right font-mono font-extrabold text-[#AA336A] print:text-black text-sm">
                          PKR {Number(item.price).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3.5 font-bold text-[#705562]">1</td>
                      <td className="p-3.5 font-bold">Venue &amp; Hall Reservation</td>
                      <td className="p-3.5 font-extrabold text-[#AA336A] print:text-black">{booking.hall_name} ({booking.event_type?.toUpperCase()})</td>
                      <td className="p-3.5 font-mono text-[10px] uppercase text-[#705562]">Package Event</td>
                      <td className="p-3.5 text-right font-mono">PKR {grandTotal.toLocaleString()}</td>
                      <td className="p-3.5 text-center font-extrabold">1</td>
                      <td className="p-3.5 text-right font-mono font-extrabold text-[#AA336A] print:text-black text-sm">
                        PKR {grandTotal.toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Totals & Terms */}
          <div className="pt-6 border-t border-[#F0D5E2] print:border-gray-300 flex flex-col sm:flex-row items-stretch justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] print:bg-gray-50 print:border-gray-300 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#AA336A] block print:text-black">
                  TERMS &amp; PAYMENT POLICY
                </span>
                <p className="text-[11px] text-[#705562] print:text-gray-700 leading-relaxed font-medium">
                  • 25% token advance required upon booking to lock dates.<br />
                  • Balance payable 7 days prior to event function.<br />
                  • Cancellations subject to ShaadiPro token refund terms.
                </p>
              </div>

              {/* Signatures block for printing */}
              <div className="hidden print:flex items-center justify-between pt-8 text-xs font-bold text-black">
                <div className="text-center w-40 border-t border-black pt-1">
                  Customer Signature
                </div>
                <div className="text-center w-40 border-t border-black pt-1">
                  Authorized Signatory
                </div>
              </div>
            </div>

            <div className="w-full sm:w-80 space-y-2 p-5 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2] print:bg-gray-100 print:border-gray-300">
              <div className="flex justify-between text-xs text-[#705562] font-semibold print:text-gray-700">
                <span>Services Subtotal:</span>
                <span className="font-mono font-bold text-[#22131A] print:text-black">PKR {grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-[#705562] font-semibold print:text-gray-700">
                <span>Taxes &amp; Service Fees (0%):</span>
                <span className="font-mono text-[#705562] print:text-gray-600">PKR 0.00</span>
              </div>
              <div className="pt-3 border-t border-[#F0D5E2] print:border-gray-300 flex justify-between text-lg font-extrabold text-[#22131A] print:text-black">
                <span>Grand Total:</span>
                <span className="font-mono text-[#AA336A] print:text-black">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Printed Footer Note */}
          <div className="text-center pt-4 text-[10px] text-[#705562] font-semibold print:text-gray-600 border-t border-dashed border-[#F0D5E2] print:border-gray-300">
            Thank you for choosing ShaadiPro! For support, call +92 300 1234567 or email info@shaadipro.com
          </div>
        </div>
      </div>
    </Can>
  );
}
