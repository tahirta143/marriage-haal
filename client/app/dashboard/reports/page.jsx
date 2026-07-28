'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Can, PERMISSIONS } from '../../../lib/permissions';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Printer,
  Sparkles,
  ShieldAlert,
  PieChart,
  Calendar,
  Building2,
  Users,
} from 'lucide-react';

export default function ExecutiveReportsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/analytics');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-[#705562] text-sm font-semibold">
        Generating executive financial reports...
      </div>
    );
  }

  const categoryBreakdown = analytics?.category_breakdown || [];
  const monthlyTrends = analytics?.monthly_trends || [];

  return (
    <Can
      permission={PERMISSIONS.REPORT_VIEW}
      fallback={
        <div className="p-8 text-center text-rose-600 font-bold flex items-center justify-center gap-2 bg-white border border-[#F0D5E2] rounded-2xl shadow-sm">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'report.view' permission.
        </div>
      }
    >
      <div className="space-y-6 print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#F0D5E2] shadow-sm print:bg-white print:text-black print:border-none">
          <div>
            <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1 print:text-[#AA336A]">
              <Sparkles className="w-4 h-4" />
              Executive Financial Suite
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-[#22131A] print:text-black">
              Executive Revenue & Category Sales Report
            </h1>
            <p className="text-[#705562] text-xs mt-1 font-medium print:text-gray-600">
              Operational revenue distribution across Catering, Stage Decor, Photography, Makeup, and DJ services.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs flex items-center gap-2 shadow-md print:hidden"
          >
            <Printer className="w-4 h-4" />
            Print Financial Summary
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-[#F0D5E2] shadow-sm print:bg-gray-100 print:border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#705562] uppercase print:text-gray-600">Total Gross Revenue</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700"><DollarSign className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-[#22131A] print:text-black">
              PKR {Number(analytics?.total_revenue || 0).toLocaleString()}
            </div>
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% Year-over-Year
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#F0D5E2] shadow-sm print:bg-gray-100 print:border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#705562] uppercase print:text-gray-600">Confirmed Events</span>
              <div className="p-2 rounded-lg bg-[#AA336A]/10 text-[#AA336A]"><Calendar className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-[#AA336A] print:text-[#AA336A]">
              {analytics?.confirmed_bookings} Bookings
            </div>
            <div className="text-xs text-[#705562] font-medium mt-2">Across 3 Hall Venues</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#F0D5E2] shadow-sm print:bg-gray-100 print:border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#705562] uppercase print:text-gray-600">Pending Receivables</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-700"><Users className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-[#22131A] print:text-black">
              PKR {Number(analytics?.pending_receivables || 0).toLocaleString()}
            </div>
            <div className="text-xs text-[#705562] font-medium mt-2">Installments & Token balances</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#F0D5E2] shadow-sm print:bg-gray-100 print:border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#705562] uppercase print:text-gray-600">Average Booking Ticket</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-700"><Building2 className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-[#22131A] print:text-black">
              PKR {Math.round((analytics?.total_revenue || 0) / (analytics?.confirmed_bookings || 1)).toLocaleString()}
            </div>
            <div className="text-xs text-blue-700 font-semibold mt-2">Average order value</div>
          </div>
        </div>

        {/* Category Sales Breakdown Progress Bar Grid */}
        <div className="bg-white rounded-2xl p-6 border border-[#F0D5E2] space-y-6 shadow-sm print:bg-white print:border-gray-300">
          <div className="flex items-center justify-between border-b border-[#F0D5E2] pb-3 print:border-gray-300">
            <h2 className="text-base font-bold text-[#22131A] print:text-black flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#AA336A]" />
              Category Revenue Share Distribution
            </h2>
            <span className="text-xs text-[#705562] print:text-gray-600 font-mono font-medium">
              Cumulative Line-Item Sales
            </span>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#22131A] print:text-black">{cat.category_name}</span>
                  <span className="font-mono text-[#AA336A] print:text-[#AA336A] font-bold">
                    PKR {Number(cat.total_sales).toLocaleString()} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#FAF5F7] print:bg-gray-200 overflow-hidden border border-[#F0D5E2]">
                  <div
                    className="h-full bg-gradient-to-r from-[#AA336A] to-rose-400 rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue Trend Table */}
        <div className="bg-white rounded-2xl border border-[#F0D5E2] shadow-sm overflow-hidden print:bg-white print:border-gray-300">
          <div className="p-4 border-b border-[#F0D5E2] print:border-gray-300 font-bold text-sm flex items-center gap-2 text-[#22131A] print:text-black">
            <BarChart3 className="w-4 h-4 text-[#AA336A]" />
            Monthly Financial Revenue Progression
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5F7] print:bg-gray-100 text-[#604453] print:text-gray-700 uppercase font-bold border-b border-[#F0D5E2] print:border-gray-300">
                <tr>
                  <th className="p-3.5">Month & Year</th>
                  <th className="p-3.5 text-center">Confirmed Events</th>
                  <th className="p-3.5 text-right">Gross Monthly Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0D5E2] print:divide-gray-200 text-[#22131A] print:text-gray-800">
                {monthlyTrends.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF5F7]">
                    <td className="p-3.5 font-bold text-[#22131A] print:text-black">{row.month}</td>
                    <td className="p-3.5 text-center font-bold text-[#22131A] print:text-black">{row.bookings} Events</td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#AA336A] print:text-[#AA336A] text-sm">
                      PKR {Number(row.revenue).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Can>
  );
}
