import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserProfile } from '../types';
import { Lock, UserCheck, ArrowRight, ShieldCheck, KeyRound, UserPlus, AlertCircle, Phone, User, CheckCircle2 } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<{ name: string; phone: string; maskedPhone: string }[]>([]);
  const [selectedUserPhone, setSelectedUserPhone] = useState<string>('');
  const [ambiguousAccounts, setAmbiguousAccounts] = useState<{ phone: string; name: string }[] | null>(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadRecentUsers();
  }, []);

  const loadRecentUsers = async () => {
    try {
      const users = await api.getRecentUsers();
      setRecentUsers(users);
      if (users.length > 0) {
        setSelectedUserPhone(users[0].phone);
      }
    } catch {
      // ignore
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('অনুগ্রহ করে আপনার PIN লিখুন');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const phoneToSend = selectedUserPhone || (ambiguousAccounts ? ambiguousAccounts[0]?.phone : undefined);
      const res = await api.login(pin, phoneToSend);
      onLoginSuccess(res.user);
    } catch (err: any) {
      if (err.ambiguous && err.accounts) {
        setAmbiguousAccounts(err.accounts);
        setError('একই PIN একাধিক একাউন্টে আছে। অনুগ্রহ করে আপনার নম্বরটি নির্বাচন করুন:');
      } else {
        setError(err.message || 'ভুল PIN প্রদান করেছেন! আবার চেষ্টা করুন।');
        setPin('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('অনুগ্রহ করে আপনার বা দোকানের নাম লিখুন');
      return;
    }
    if (!phone.trim() || phone.trim().length < 6) {
      setError('অনুগ্রহ করে সঠিক ফোন নম্বর দিন');
      return;
    }
    if (!pin || pin.length < 4) {
      setError('কমপক্ষে ৪ ডিজিটের গোপন PIN সেট করুন');
      return;
    }
    if (pin !== confirmPin) {
      setError('দুইবারের PIN মিলছে না! আবার দিন।');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.register(name, phone, pin);
      setRegSuccessMsg('একাউন্ট তৈরি সফল! Notification sent to razaulkarim1622@gmail.com');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050811] text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background radial blue glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Main card */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 mb-4 shadow-lg shadow-blue-950/50">
            <KeyRound className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">
            MRT REGULAR KHATA
          </h1>
          <p className="text-sm text-blue-200/70 font-medium mt-1">
            দৈনন্দিন হিসাবের ডিজিটাল টালি খাতা · Professional Business Accounting
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-[#0b101f] border border-blue-900/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {regSuccessMsg && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-blue-950/50 border border-blue-600/50 text-blue-200 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-blue-400" />
              <div className="flex-1 font-medium">{regSuccessMsg}</div>
            </div>
          )}

          {!isRegistering ? (
            /* PIN LOGIN SCREEN */
            <div>
              {/* Account selector if multiple known */}
              {recentUsers.length > 0 && !ambiguousAccounts && (
                <div className="mb-5">
                  <div className="text-xs font-semibold text-blue-300/80 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>সংরক্ষিত একাউন্ট</span>
                    <span className="text-[11px] text-slate-400">নিরাপদ PC সেশন</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {recentUsers.map((u) => {
                      const isSel = selectedUserPhone === u.phone;
                      return (
                        <button
                          key={u.phone}
                          type="button"
                          onClick={() => {
                            setSelectedUserPhone(u.phone);
                            setError(null);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left whitespace-nowrap ${
                            isSel
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
                              : 'bg-black/40 text-slate-300 border-neutral-800 hover:border-blue-900/60 hover:text-white'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5 shrink-0" />
                          <div className="truncate max-w-[120px] font-semibold">{u.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ambiguous account selector */}
              {ambiguousAccounts && (
                <div className="mb-5 p-3 bg-blue-950/40 border border-blue-700/50 rounded-xl">
                  <div className="text-xs text-blue-300 font-semibold mb-2">আপনার একাউন্ট নির্বাচন করুন:</div>
                  <div className="space-y-1.5">
                    {ambiguousAccounts.map((acc) => (
                      <button
                        key={acc.phone}
                        type="button"
                        onClick={() => {
                          setSelectedUserPhone(acc.phone);
                          setAmbiguousAccounts(null);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-black/60 hover:bg-blue-600 text-white text-xs font-medium flex justify-between items-center transition-colors"
                      >
                        <span>{acc.name}</span>
                        <span className="font-mono text-blue-300">{acc.phone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold tracking-wide text-blue-100 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-400" />
                      PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPin('111111');
                        setError(null);
                      }}
                      title="এডমিন পিন স্বয়ংক্রিয় পূরণ করতে ক্লিক করুন"
                      className="text-[11px] text-blue-400 hover:text-blue-200 font-semibold transition-colors flex items-center gap-1 cursor-pointer bg-blue-950/40 hover:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-800/40"
                    >
                      <span>এডমিন পিন:</span>
                      <span className="font-mono font-bold text-white">111111</span>
                    </button>
                  </div>

                  {/* PIN Display Field */}
                  <div className="relative">
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={8}
                      autoFocus
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setPin(val);
                        setError(null);
                      }}
                      className="w-full h-14 bg-black/70 border border-blue-900/40 focus:border-blue-500 rounded-xl text-center text-3xl font-mono tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all placeholder:tracking-normal placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* PC / On-Screen Keypad for Fast Desktop Entry */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handlePinDigit(digit)}
                      className="h-12 rounded-xl bg-white/5 hover:bg-blue-600 active:scale-95 text-white font-mono text-xl font-medium border border-white/5 hover:border-blue-500 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClear}
                    className="h-12 rounded-xl bg-white/5 hover:bg-red-950/40 text-slate-300 hover:text-red-300 text-xs font-semibold border border-white/5 transition-all flex items-center justify-center cursor-pointer"
                  >
                    মুছুন
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePinDigit('0')}
                    className="h-12 rounded-xl bg-white/5 hover:bg-blue-600 active:scale-95 text-white font-mono text-xl font-medium border border-white/5 hover:border-blue-500 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="h-12 rounded-xl bg-white/5 hover:bg-neutral-800 text-slate-300 text-xs font-semibold border border-white/5 transition-all flex items-center justify-center cursor-pointer"
                  >
                    ← কাটুন
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading || !pin}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      যাচাই হচ্ছে...
                    </span>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Create Account Link */}
              <div className="mt-6 pt-5 border-t border-neutral-800/80 text-center">
                <p className="text-xs text-slate-400 mb-3">নতুন ব্যবসাইক একাউন্ট খুলতে চান?</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setError(null);
                    setPin('');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-blue-900/60 bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 hover:text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  Create New Account
                </button>
              </div>
            </div>
          ) : (
            /* CREATE NEW ACCOUNT SCREEN */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="mb-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  নতুন একাউন্ট তৈরি করুন
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">দোকান বা ব্যক্তিগত ব্যবসার জন্য রেজিস্ট্রেশন</p>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  নাম (দোকান বা স্বত্বাধিকারীর নাম) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="যেমন: এমআরটি ট্রেডার্স / রহিম করিম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 bg-black/60 border border-neutral-800 focus:border-blue-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ফোন নম্বর *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 01712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 bg-black/60 border border-neutral-800 focus:border-blue-500 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* PIN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    গোপন PIN (৪-৮ ডিজিট) *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    maxLength={8}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full h-11 px-3 bg-black/60 border border-neutral-800 focus:border-blue-500 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    PIN নিশ্চিত করুন *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    maxLength={8}
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full h-11 px-3 bg-black/60 border border-neutral-800 focus:border-blue-500 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Security note regarding email notification */}
              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl text-[11px] text-blue-200/80 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  নতুন একাউন্ট সৃষ্টির নোটিফিকেশন স্বয়ংক্রিয়ভাবে অ্যাডমিন ইমেইল 
                  <span className="font-mono text-blue-300 font-semibold"> razaulkarim1622@gmail.com</span>-এ প্রেরিত হবে। 
                  PIN ডাটাবেজে ক্রিপ্টোগ্রাফিক সল্ট হ্যাশ দ্বারা সংরক্ষিত থাকে, কখনোই প্লেইন টেক্সট হিসেবে পাঠানো বা দেখা যাবে না।
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    সংরক্ষণ হচ্ছে...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>একাউন্ট তৈরি সম্পন্ন করুন</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError(null);
                  setPin('');
                }}
                className="w-full py-2 text-xs text-slate-400 hover:text-white font-medium transition-colors"
              >
                ← পূর্বের লগইন স্ক্রিনে ফিরে যান
              </button>
            </form>
          )}
        </div>

        {/* Desktop Browser hint */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-2">
          <span>Google Chrome ও Microsoft Edge-এর জন্য সম্পূর্ণ অপ্টিমাইজড</span>
          <span>·</span>
          <span>MRT Regular Khata v1.0</span>
        </div>
      </div>
    </div>
  );
};
