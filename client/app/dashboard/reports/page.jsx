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
      <div className="text-center py-12 text-slate-400 text-sm">
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
        <div className="p-8 text-center text-red-400 font-bold flex items-center justify-center gap-2 glass-card rounded-2xl">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'report.view' permission.
        </div>
      }
    >
      <div className="space-y-6 print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800 print:bg-white print:text-black print:border-none">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1 print:text-amber-700">
              <Sparkles className="w-4 h-4" />
              Executive Financial Suite
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-white print:text-black">
              Executive Revenue & Category Sales Report
            </h1>
            <p className="text-slate-400 text-xs mt-1 print:text-gray-600">
              Operational revenue distribution across Catering, Stage Decor, Photography, Makeup, and DJ services.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg print:hidden"
          >
            <Printer className="w-4 h-4" />
            Print Financial Summary
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card rounded-2xl p-5 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase print:text-gray-600">Total Gross Revenue</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><DollarSign className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-white print:text-black">
              PKR {Number(analytics?.total_revenue || 0).toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% Year-over-Year
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase print:text-gray-600">Confirmed Events</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Calendar className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-amber-400 print:text-amber-700">
              {analytics?.confirmed_bookings} Bookings
            </div>
            <div className="text-xs text-slate-400 mt-2">Across 3 Hall Venues</div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase print:text-gray-600">Pending Receivables</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Users className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-white print:text-black">
              PKR {Number(analytics?.pending_receivables || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-2">Installments & Token balances</div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase print:text-gray-600">Average Booking Ticket</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Building2 className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-extrabold text-white print:text-black">
              PKR {Math.round((analytics?.total_revenue || 0) / (analytics?.confirmed_bookings || 1)).toLocaleString()}
            </div>
            <div className="text-xs text-blue-400 mt-2">Average order value</div>
          </div>
        </div>

        {/* Category Sales Breakdown Progress Bar Grid */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6 print:bg-white print:border-gray-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:border-gray-300">
            <h2 className="text-base font-bold text-white print:text-black flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              Category Revenue Share Distribution
            </h2>
            <span className="text-xs text-slate-400 print:text-gray-600 font-mono">
              Cumulative Line-Item Sales
            </span>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200 print:text-black">{cat.category_name}</span>
                  <span className="font-mono text-amber-400 print:text-amber-700">
                    PKR {Number(cat.total_sales).toLocaleString()} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 print:bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue Trend Table */}
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden print:bg-white print:border-gray-300">
          <div className="p-4 border-b border-slate-800 print:border-gray-300 font-semibold text-sm flex items-center gap-2 text-white print:text-black">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Monthly Financial Revenue Progression
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 print:bg-gray-100 text-slate-400 print:text-gray-700 uppercase font-semibold border-b border-slate-800 print:border-gray-300">
                <tr>
                  <th className="p-3.5">Month & Year</th>
                  <th className="p-3.5 text-center">Confirmed Events</th>
                  <th className="p-3.5 text-right">Gross Monthly Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-gray-200 text-slate-300 print:text-gray-800">
                {monthlyTrends.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-bold text-white print:text-black">{row.month}</td>
                    <td className="p-3.5 text-center font-bold text-slate-300 print:text-black">{row.bookings} Events</td>
                    <td className="p-3.5 text-right font-mono font-bold text-amber-400 print:text-amber-700 text-sm">
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
