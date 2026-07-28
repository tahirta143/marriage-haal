'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Can, PERMISSIONS } from '../../../lib/permissions';
import {
  CreditCard,
  Plus,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Printer,
  FileText,
  X,
  Building2,
  Calendar,
} from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [methodFilter, setMethodFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Record Payment Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payType, setPayType] = useState('token');
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [refNo, setRefNo] = useState('');
  const [bookingBalanceInfo, setBookingBalanceInfo] = useState(null);

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      const [pRes, bRes] = await Promise.all([
        api.get('/payments'),
        api.get('/bookings'),
      ]);

      if (pRes.data.success) setPayments(pRes.data.payments);
      if (bRes.data.success) {
        setBookings(bRes.data.bookings);
        if (bRes.data.bookings.length > 0 && !selectedBookingId) {
          setSelectedBookingId(bRes.data.bookings[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // When selected booking changes in modal, load balance details
  useEffect(() => {
    if (selectedBookingId) {
      fetchBookingBalance(selectedBookingId);
    }
  }, [selectedBookingId]);

  const fetchBookingBalance = async (bId) => {
    try {
      const res = await api.get(`/payments/booking/${bId}`);
      if (res.data.success) {
        setBookingBalanceInfo(res.data);
      }
    } catch (err) {}
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedBookingId || !payAmount) return;

    try {
      const res = await api.post('/payments', {
        booking_id: selectedBookingId,
        amount: parseFloat(payAmount),
        type: payType,
        method: payMethod,
        reference_no: refNo || `TRX-${Date.now().toString().slice(-6)}`,
      });

      if (res.data.success) {
        setFeedback(res.data.message || 'Payment transaction recorded successfully.');
        setShowModal(false);
        setPayAmount('');
        setRefNo('');
        fetchPaymentsData();
      }
    } catch (err) {
      alert('Failed to record payment transaction');
    }
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesSearch =
      p.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.booking_id?.toString().includes(searchQuery) ||
      p.reference_no?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMethod && matchesType && matchesSearch;
  });

  // Summary Metrics
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const tokenCollected = payments.filter((p) => p.type === 'token').reduce((sum, p) => sum + Number(p.amount), 0);
  const bankTransferTotal = payments.filter((p) => p.method === 'bank_transfer').reduce((sum, p) => sum + Number(p.amount), 0);
  const digitalMobileTotal = payments.filter((p) => p.method === 'jazzcash' || p.method === 'easypaisa').reduce((sum, p) => sum + Number(p.amount), 0);

  const getMethodBadge = (m) => {
    switch (m) {
      case 'jazzcash':
        return 'bg-[#AA336A]/10 text-[#AA336A] border-[#AA336A]/30';
      case 'easypaisa':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'bank_transfer':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <Can
      permission={PERMISSIONS.PAYMENT_VIEW}
      fallback={
        <div className="p-8 text-center text-rose-600 font-bold bg-white border border-[#F0D5E2] rounded-2xl shadow-sm">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'payment.view' permission.
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#F0D5E2] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Financial Ledger & Receivables
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
              Payments Ledger & Receipts
            </h1>
            <p className="text-[#705562] text-xs mt-1 font-medium">
              Track token advances, installment payments, final settlements, and payment method channels.
            </p>
          </div>

          <Can permission={PERMISSIONS.PAYMENT_CREATE}>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] active:bg-[#77234A] text-white font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg glow-brand"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          </Can>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-[#F0D5E2] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#705562] uppercase">Total Collected</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700"><DollarSign className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-[#22131A]">PKR {totalCollected.toLocaleString()}</div>
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> All payment receipts
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#F0D5E2] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#705562] uppercase">Token Advances</span>
              <div className="p-2 rounded-lg bg-[#AA336A]/10 text-[#AA336A]"><CreditCard className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-[#AA336A]">PKR {tokenCollected.toLocaleString()}</div>
            <div className="text-xs text-[#705562] font-medium mt-2">Initial booking deposits</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#F0D5E2] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#705562] uppercase">Bank Wire Transfers</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-700"><Building2 className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-[#22131A]">PKR {bankTransferTotal.toLocaleString()}</div>
            <div className="text-xs text-blue-700 font-semibold mt-2">Direct bank settlements</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#F0D5E2] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#705562] uppercase">JazzCash / EasyPaisa</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-700"><CreditCard className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-[#22131A]">PKR {digitalMobileTotal.toLocaleString()}</div>
            <div className="text-xs text-[#705562] font-medium mt-2">Mobile wallet payments</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-[#705562] uppercase mr-1">Method:</span>
              {['all', 'cash', 'bank_transfer', 'jazzcash', 'easypaisa'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all ${
                    methodFilter === m
                      ? 'bg-[#AA336A] text-white shadow-md'
                      : 'bg-white border border-[#F0D5E2] text-[#604453] hover:text-[#AA336A]'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#9E7D8C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ref no, customer..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#F0D5E2] text-xs text-[#22131A] focus:outline-none focus:border-[#AA336A]"
            />
          </div>
        </div>

        {/* Ledger Table */}
        {loading ? (
          <div className="text-center py-12 text-[#705562] text-sm font-semibold">
            Loading payments ledger...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#F0D5E2] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#F0D5E2] font-bold text-sm flex items-center justify-between text-[#22131A]">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#AA336A]" />
                Payment Transactions ({filteredPayments.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF5F7] text-[#604453] uppercase font-bold border-b border-[#F0D5E2]">
                  <tr>
                    <th className="p-3.5">Ref / TRX No.</th>
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Payment Type</th>
                    <th className="p-3.5">Channel / Method</th>
                    <th className="p-3.5">Date Paid</th>
                    <th className="p-3.5 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0D5E2] text-[#22131A]">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF5F7] transition-colors">
                      <td className="p-3.5 font-mono text-[#AA336A] font-bold">{p.reference_no}</td>
                      <td className="p-3.5 font-mono text-[#22131A] font-bold">#{p.booking_id}</td>
                      <td className="p-3.5 font-bold text-[#22131A]">{p.customer_name}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#FAF5F7] text-[#22131A] border border-[#F0D5E2]">
                          {p.type}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getMethodBadge(p.method)}`}>
                          {p.method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#705562] font-medium whitespace-nowrap">
                        {new Date(p.paid_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                        PKR {Number(p.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Record Payment */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22131A]/40 backdrop-blur-md">
            <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-[#F0D5E2] shadow-xl space-y-4 text-[#22131A]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0D5E2]">
                <h3 className="text-base font-bold text-[#22131A] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#AA336A]" />
                  Record New Payment Transaction
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-[#705562] hover:text-[#22131A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                    Select Target Booking
                  </label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                  >
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        #{b.id} — {b.customer_name} ({b.event_type.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Balance Preview Card */}
                {bookingBalanceInfo && (
                  <div className="p-3.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] space-y-1 text-xs font-medium">
                    <div className="flex justify-between text-[#705562]">
                      <span>Booking Total:</span>
                      <span className="font-mono text-[#22131A] font-bold">
                        PKR {Number(bookingBalanceInfo.bookingTotal).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#705562]">
                      <span>Already Paid:</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        PKR {Number(bookingBalanceInfo.totalPaid).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#22131A] pt-1 border-t border-[#F0D5E2] font-bold">
                      <span>Remaining Balance Due:</span>
                      <span className="font-mono text-[#AA336A] font-extrabold">
                        PKR {Number(bookingBalanceInfo.remainingBalance).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                      Payment Type
                    </label>
                    <select
                      value={payType}
                      onChange={(e) => setPayType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                    >
                      <option value="token">Token Advance</option>
                      <option value="installment">Installment Payment</option>
                      <option value="final">Final Settlement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                      Payment Channel
                    </label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                    >
                      <option value="bank_transfer">Bank Transfer (Wire)</option>
                      <option value="jazzcash">JazzCash Mobile</option>
                      <option value="easypaisa">EasyPaisa Mobile</option>
                      <option value="cash">Cash in Hand</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                      Amount Received (PKR)
                    </label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="e.g. 250000"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                      Reference / TRX ID
                    </label>
                    <input
                      type="text"
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                      placeholder="e.g. TRX-884920"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-sm text-[#22131A] focus:outline-none focus:border-[#AA336A]"
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
                    Record Payment
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
