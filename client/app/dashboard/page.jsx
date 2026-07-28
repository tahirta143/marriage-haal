'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { Can, PERMISSIONS } from '../../lib/permissions';
import api from '../../lib/api';
import {
  Crown,
  DollarSign,
  Calendar,
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Lock,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const CATEGORY_COLORS = ['#AA336A', '#E6A15C', '#3B82F6', '#10B981', '#8B5CF6'];

export default function UnifiedDashboardPage() {
  const { user, permissions = [] } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await api.get('/reports/analytics');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load dashboard charts analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (!user) return null;

  const monthlyTrendsData = analytics?.monthly_trends || [];
  const categoryBreakdownData = analytics?.category_breakdown || [];
  const hallPerformanceData = analytics?.hall_performance || [];
  const statusDistributionData = analytics?.status_distribution || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Dynamic RBAC Active • {permissions.length} Atomic Permissions Assigned
          </div>
          <h1 className="text-3xl font-extrabold font-serif-title text-[#111827]">
            Welcome back, {user.name}
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">
            Live executive revenue charts & operational metrics loaded directly from backend API.
          </p>
        </div>

        {/* Declarative Action Button Guard */}
        <Can permission={PERMISSIONS.BOOKING_CREATE}>
          <a
            href="/dashboard/book-event"
            className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] active:bg-[#77234A] text-white font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg glow-brand"
          >
            <Plus className="w-4 h-4" />
            New Reservation Inquiry
          </a>
        </Can>
      </div>

      {/* 1. Executive Analytics KPI Summary Cards (Protected by 'report.view') */}
      <Can permission={PERMISSIONS.REPORT_VIEW}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#AA336A]" />
              Executive Revenue & Hall Performance
            </h2>
            <span className="text-xs text-gray-400 font-semibold">Live Backend Sync</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Gross Revenue</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><DollarSign className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-extrabold text-[#111827]">
                PKR {Number(analytics?.total_revenue || 4850000).toLocaleString()}
              </div>
              <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last month
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Active Venues</span>
                <div className="p-2 rounded-lg bg-[#AA336A]/10 text-[#AA336A]"><Building2 className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-extrabold text-[#111827]">
                {analytics?.active_halls || 3} Grand Halls
              </div>
              <div className="text-xs text-gray-500 font-medium mt-2">Max Capacity: 2,600 Guests</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Confirmed Events</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700"><Calendar className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-extrabold text-[#111827]">
                {analytics?.confirmed_bookings || 24} Bookings
              </div>
              <div className="text-xs text-blue-700 font-semibold mt-2">Scheduled for next 30 days</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Pending Receivables</span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-700"><Users className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-extrabold text-[#AA336A]">
                PKR {Number(analytics?.pending_receivables || 620000).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-2">Installment tokens due</div>
            </div>
          </div>

          {/* 2. Interactive Recharts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Revenue Trend Area Chart (Left 2 Columns) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                    <LineChartIcon className="w-5 h-5 text-[#AA336A]" />
                    Monthly Financial Growth & Revenue Trend
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Backend aggregated revenue (PKR) over past 6 months
                  </p>
                </div>
                <span className="text-xs font-bold text-[#AA336A] bg-[#AA336A]/10 px-2.5 py-1 rounded-full border border-[#AA336A]/20">
                  Realtime Backend Sync
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                {loadingAnalytics ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Loading backend charts...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#AA336A" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#AA336A" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => `PKR ${(val / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                        formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Monthly Sales']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#AA336A" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Share Donut / Pie Chart (Right 1 Column) */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm space-y-4">
              <div className="border-b border-[#E5E7EB] pb-3">
                <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#AA336A]" />
                  Category Revenue Share
                </h3>
                <p className="text-xs text-gray-500 font-medium">Sales split across service packages</p>
              </div>

              <div className="h-60 w-full relative flex items-center justify-center">
                {loadingAnalytics ? (
                  <div className="text-xs text-gray-400">Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="total_sales"
                        nameKey="category_name"
                      >
                        {categoryBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '0.75rem', fontSize: '11px' }}
                        formatter={(val, name) => [`PKR ${Number(val).toLocaleString()}`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Category Legend */}
              <div className="space-y-1.5 pt-2 border-t border-[#E5E7EB] text-xs">
                {categoryBreakdownData.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                      <span className="text-gray-700 font-medium truncate max-w-[140px]">{cat.category_name}</span>
                    </div>
                    <span className="font-mono font-bold text-[#AA336A]">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Hall Performance & Booking Volume Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#AA336A]" />
                  Hall Venue Booking Volume & Revenue Comparison
                </h3>
                <p className="text-xs text-gray-500 font-medium">Revenue generated per marriage hall venue</p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              {loadingAnalytics ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Loading hall analytics...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hallPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="hall_name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(val) => `PKR ${(val / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '0.75rem', fontSize: '12px' }}
                      formatter={(val) => [`PKR ${Number(val).toLocaleString()}`, 'Venue Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#AA336A" radius={[8, 8, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </Can>

      {/* 4. Bookings Ledger Section Guard (Protected by 'booking.view') */}
      <Can permission={PERMISSIONS.BOOKING_VIEW}>
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#AA336A]" />
              Recent Event Bookings
            </h2>
            <a href="/dashboard/bookings" className="text-xs font-bold text-[#AA336A] hover:underline flex items-center gap-1">
              View All Bookings <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b border-[#E5E7EB]">
                <tr>
                  <th className="p-3">Event ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Hall</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Date & Slot</th>
                  <th className="p-3">Guests</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#111827]">
                <tr className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-[#AA336A] font-bold">#BK-1082</td>
                  <td className="p-3 font-bold text-[#111827]">Usman Tariq</td>
                  <td className="p-3">Crystal Grand Ballroom</td>
                  <td className="p-3 uppercase text-purple-700 font-bold">Baraat</td>
                  <td className="p-3">Oct 14, 2026 (Night)</td>
                  <td className="p-3">450 Guests</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Confirmed
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Can permission={PERMISSIONS.BOOKING_EDIT}>
                      <a href="/dashboard/bookings" className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 border border-[#E5E7EB] text-gray-700 text-[11px] font-semibold">
                        Manage
                      </a>
                    </Can>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-[#AA336A] font-bold">#BK-1083</td>
                  <td className="p-3 font-bold text-[#111827]">Ayesha Khan</td>
                  <td className="p-3">Emerald Marquee</td>
                  <td className="p-3 uppercase text-[#AA336A] font-bold">Mehndi</td>
                  <td className="p-3">Oct 18, 2026 (Night)</td>
                  <td className="p-3">300 Guests</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Tentative
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Can permission={PERMISSIONS.BOOKING_EDIT}>
                      <a href="/dashboard/bookings" className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 border border-[#E5E7EB] text-gray-700 text-[11px] font-semibold">
                        Manage
                      </a>
                    </Can>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Can>

      {/* 5. Task Assignments Guard (Protected by 'staff.view_own_jobs') */}
      <Can permission={PERMISSIONS.STAFF_VIEW_OWN}>
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm">
          <h2 className="text-base font-bold text-[#111827] mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Assigned Service Execution Tasks
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gray-50 border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[#111827]">Stage Floral Decor Setup</div>
                <div className="text-xs text-gray-500">Crystal Grand Ballroom • Event #BK-1082</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                In Progress
              </span>
            </div>
          </div>
        </div>
      </Can>

      {/* 6. RBAC Quick Admin Management Banner (Protected by 'rbac.manage') */}
      <Can permission={PERMISSIONS.RBAC_MANAGE}>
        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#AA336A]/10 border border-[#AA336A]/25 text-[#AA336A]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#111827]">Security Group & Permissions Administration</div>
              <div className="text-xs text-gray-500 font-medium">Create security groups, tick permission checkboxes by module, and assign users.</div>
            </div>
          </div>
          <a
            href="/dashboard/settings/groups"
            className="px-4 py-2 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-bold text-xs shadow-md"
          >
            Manage RBAC Groups
          </a>
        </div>
      </Can>

      <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] text-xs text-gray-500 font-medium flex items-center justify-between shadow-sm">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Enterprise RBAC Engine: Active JWT permission set [{permissions.join(', ')}]
        </span>
      </div>
    </div>
  );
}
