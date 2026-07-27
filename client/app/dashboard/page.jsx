'use client';

import React from 'react';
import { useAuth } from '../../lib/auth';
import { Can, PERMISSIONS } from '../../lib/permissions';
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
} from 'lucide-react';

export default function UnifiedDashboardPage() {
  const { user, permissions = [] } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Dynamic RBAC Active • {permissions.length} Atomic Permissions Assigned
          </div>
          <h1 className="text-3xl font-extrabold font-serif-title text-white">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Your workspace layout and capabilities are dynamically controlled via DB group permissions.
          </p>
        </div>

        {/* Declarative Action Button Guard */}
        <Can permission={PERMISSIONS.BOOKING_CREATE}>
          <button className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg glow-accent">
            <Plus className="w-4 h-4" />
            New Reservation Inquiry
          </button>
        </Can>
      </div>

      {/* 1. Executive Analytics Widget Guard (Protected by 'report.view') */}
      <Can permission={PERMISSIONS.REPORT_VIEW}>
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            Executive Revenue & Hall Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase">Monthly Revenue</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><DollarSign className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-extrabold text-white">PKR 4,850,000</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last month
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase">Active Venues</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Building2 className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-extrabold text-white">3 Grand Halls</div>
              <div className="text-xs text-slate-400 mt-2">Max Capacity: 2,600 Guests</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase">Confirmed Events</span>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Calendar className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-extrabold text-white">24 Bookings</div>
              <div className="text-xs text-blue-400 mt-2">Scheduled for next 30 days</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase">Pending Receivables</span>
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Users className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-extrabold text-amber-400">PKR 620,000</div>
              <div className="text-xs text-slate-400 mt-2">Installment tokens due</div>
            </div>
          </div>
        </div>
      </Can>

      {/* 2. Bookings Ledger Section Guard (Protected by 'booking.view') */}
      <Can permission={PERMISSIONS.BOOKING_VIEW}>
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Recent Event Bookings
            </h2>
            <button className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1">
              View All Bookings <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-mono text-amber-400 font-bold">#BK-1082</td>
                  <td className="p-3 font-medium text-white">Usman Tariq</td>
                  <td className="p-3">Crystal Grand Ballroom</td>
                  <td className="p-3 uppercase text-purple-400 font-semibold">Baraat</td>
                  <td className="p-3">Oct 14, 2026 (Night)</td>
                  <td className="p-3">450 Guests</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Confirmed
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Can permission={PERMISSIONS.BOOKING_EDIT}>
                      <button className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium">
                        Manage
                      </button>
                    </Can>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-mono text-amber-400 font-bold">#BK-1083</td>
                  <td className="p-3 font-medium text-white">Ayesha Khan</td>
                  <td className="p-3">Emerald Marquee</td>
                  <td className="p-3 uppercase text-amber-400 font-semibold">Mehndi</td>
                  <td className="p-3">Oct 18, 2026 (Night)</td>
                  <td className="p-3">300 Guests</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Tentative
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Can permission={PERMISSIONS.BOOKING_EDIT}>
                      <button className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium">
                        Manage
                      </button>
                    </Can>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Can>

      {/* 3. Task Assignments Guard (Protected by 'staff.view_own_jobs') */}
      <Can permission={PERMISSIONS.STAFF_VIEW_OWN}>
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            Assigned Service Execution Tasks
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Stage Floral Decor Setup</div>
                <div className="text-xs text-slate-400">Crystal Grand Ballroom • Event #BK-1082</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                In Progress
              </span>
            </div>
          </div>
        </div>
      </Can>

      {/* 4. RBAC Quick Admin Management Banner (Protected by 'rbac.manage') */}
      <Can permission={PERMISSIONS.RBAC_MANAGE}>
        <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Security Group & Permissions Administration</div>
              <div className="text-xs text-slate-400">Create security groups, tick permission checkboxes by module, and assign users.</div>
            </div>
          </div>
          <a
            href="/dashboard/settings/groups"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
          >
            Manage RBAC Groups
          </a>
        </div>
      </Can>

      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Enterprise RBAC Engine: Active JWT permission set [{permissions.join(', ')}]
        </span>
      </div>
    </div>
  );
}
