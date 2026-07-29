'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import {
  X,
  Phone,
  Mail,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  User,
} from 'lucide-react';

export default function OtpAuthModal({ isOpen, onClose, onSuccess }) {
  const { sendOTP, verifyOTP } = useAuth();

  const [authMode, setAuthMode] = useState('phone'); // 'phone' | 'email'
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [target, setTarget] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!target) {
      setErrorMsg(`Please enter a valid ${authMode === 'phone' ? 'Phone Number (+92...)' : 'Email Address'}.`);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const data = await sendOTP(target, authMode);
      setInfoMsg(`Verification code sent! Demo OTP: 123456`);
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await verifyOTP(target, otpCode, fullName);
      if (onSuccess) onSuccess(loggedUser);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setTarget('');
    setFullName('');
    setOtpCode('');
    setErrorMsg('');
    setInfoMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5E2] shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={resetModal}
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#AA336A]/10 border border-[#AA336A]/30 text-[#AA336A] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Instant Client Verification
          </div>
          <h2 className="text-2xl font-extrabold font-serif-title text-[#22131A]">
            {step === 1 ? 'Sign In / Register' : 'Enter 6-Digit OTP'}
          </h2>
          <p className="text-xs text-[#705562] font-medium">
            {step === 1
              ? 'Log in or create your account using Mobile Phone or Email'
              : `We sent a 6-digit OTP code to ${target}`}
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Step 1: Input Target */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Dual Mode Switch */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#FAF5F7] border border-[#F0D5E2]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('phone');
                  setTarget('');
                }}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  authMode === 'phone'
                    ? 'bg-[#AA336A] text-white shadow-sm'
                    : 'text-[#705562] hover:text-[#AA336A]'
                }`}
              >
                <Phone className="w-3.5 h-3.5" /> Phone (+92)
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setTarget('');
                }}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  authMode === 'email'
                    ? 'bg-[#AA336A] text-white shadow-sm'
                    : 'text-[#705562] hover:text-[#AA336A]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email Address
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                Full Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Usman Tariq"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#604453] uppercase mb-1">
                {authMode === 'phone' ? 'Mobile Phone Number' : 'Email Address'}
              </label>
              <div className="relative">
                {authMode === 'phone' ? (
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                ) : (
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                )}
                <input
                  type={authMode === 'phone' ? 'tel' : 'email'}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder={authMode === 'phone' ? '+92 300 1234567' : 'client@gmail.com'}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-xs font-bold text-[#22131A] focus:outline-none focus:border-[#AA336A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#AA336A]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send 6-Digit OTP Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Input 6-Digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#604453] uppercase mb-1 text-center">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#FAF5F7] border border-[#F0D5E2] text-center text-lg font-mono font-bold tracking-widest text-[#AA336A] focus:outline-none focus:border-[#AA336A]"
                />
              </div>
              <p className="text-[11px] text-gray-400 text-center mt-1">
                Demo code: <span className="font-mono font-bold text-[#AA336A]">123456</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-2xl bg-white border border-[#F0D5E2] text-xs font-bold text-[#705562] hover:bg-[#FAF5F7]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-[#AA336A] hover:bg-[#8E2656] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#AA336A]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
