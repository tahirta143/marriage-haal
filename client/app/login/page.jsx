'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Crown, Building2, Calendar, Briefcase, UserCheck, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'owner', label: 'Hall Owner', email: 'owner@shaadipro.com', pass: 'password123', icon: Crown, color: 'border-[#AA336A]/30 bg-[#AA336A]/10 text-[#AA336A] hover:bg-[#AA336A]/20' },
  { role: 'booking_manager', label: 'Booking Manager', email: 'manager@shaadipro.com', pass: 'password123', icon: Building2, color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20' },
  { role: 'staff', label: 'In-House Staff', email: 'staff@shaadipro.com', pass: 'password123', icon: Briefcase, color: 'border-blue-500/30 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20' },
  { role: 'vendor', label: 'Vendor Partner', email: 'vendor@shaadipro.com', pass: 'password123', icon: UserCheck, color: 'border-purple-500/30 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20' },
  { role: 'customer', label: 'Customer', email: 'customer@shaadipro.com', pass: 'password123', icon: Calendar, color: 'border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setActiveRole(acc.role);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-white text-[#111827]">
      {/* Soft Ambient Radial Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#AA336A]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-rose-400/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#AA336A] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            ShaadiPro Management Suite
          </div>
          <h1 className="text-4xl font-extrabold font-serif-title tracking-tight text-[#111827] mb-2">
            Shaadi<span className="text-[#AA336A]">Pro</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Unified Permission-Based Portal
          </p>
        </div>

        {/* Demo Role Selector */}
        <div className="mb-6 bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm">
          <div className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#AA336A]" />
            Quick Demo Login (Select Account):
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const IconComponent = acc.icon;
              const isSelected = activeRole === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoSelect(acc)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 text-left ${acc.color} ${
                    isSelected ? 'ring-2 ring-[#AA336A] border-[#AA336A] bg-[#FDF2F7]' : ''
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{acc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-[#E5E7EB]">
          <h2 className="text-xl font-bold text-[#111827] mb-6 flex items-center justify-between">
            Sign In
            <span className="text-xs text-gray-400 font-normal">JWT Auth</span>
          </h2>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@shaadipro.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#E5E7EB] text-[#111827] text-sm focus:outline-none focus:bg-white focus:border-[#AA336A] focus:ring-1 focus:ring-[#AA336A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#E5E7EB] text-[#111827] text-sm focus:outline-none focus:bg-white focus:border-[#AA336A] focus:ring-1 focus:ring-[#AA336A] transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] active:bg-[#77234A] text-white font-bold text-sm tracking-wide shadow-lg glow-brand flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Unified Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 font-medium">
          ShaadiPro System &copy; 2026 • Solid White `#AA336A` Edition
        </div>
      </div>
    </div>
  );
}
