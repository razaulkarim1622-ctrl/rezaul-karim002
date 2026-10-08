import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  Trash2, 
  TrendingUp, 
  Receipt, 
  Layers, 
  Mail, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Lock,
  ArrowDownLeft,
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import { formatTaka, toBengaliNumber, formatBengaliDate } from '../utils/bengali';

interface AdminPanelViewProps {
  useBengaliDigits?: boolean;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  useBengaliDigits = true
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset PIN modal state
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [newPin, setNewPin] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Delete user state
  const [deletingUser, setDeletingUser] = useState<any | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'এডমিন তথ্য লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPin || newPin.length < 4) {
      alert('কমপক্ষে ৪ ডিজিটের নতুন PIN দিন');
      return;
    }

    setIsResetting(true);
    try {
      const res = await api.resetUserPin(resetModalUser.id, newPin);
      setSuccessMsg(res.message);
      setResetModalUser(null);
      setNewPin('');
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadOverview();
    } catch (err: any) {
      alert(err.message || 'PIN রিসেট ব্যর্থ');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const res = await api.deleteUser(deletingUser.id);
      setSuccessMsg(res.message);
      setDeletingUser(null);
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadOverview();
    } catch (err: any) {
      alert(err.message || 'ইউজার মুছতে ব্যর্থ');
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-blue-300 font-medium">এডমিন ডেটা লোড হচ্ছে...</span>
      </div>
    );
  }

  const systemTotals = data?.systemTotals || {
    totalUsers: 0,
    totalEntries: 0,
    systemSale: 0,
    systemDeposit: 0,
    systemReturn: 0,
    systemExpense: 0,
    systemNetCash: 0
  };

  const users = data?.users || [];
  const notifications = data?.notifications || [];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-[#0b132b] to-[#070b14] border-2 border-blue-600/40 p-6 lg:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/40">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white uppercase tracking-wider">
                SUPER ADMIN
              </span>
              <span className="text-xs text-blue-300 font-mono">
                এডমিন পিন: <strong>111111</strong>
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              এডমিন কন্ট্রোল প্যানেল (MRT Admin)
            </h2>
            <p className="text-xs text-slate-400">
              সকল দোকান, ব্যবসার হিসাব এবং সিস্টেম অডিট পরিচালনার কেন্দ্রীয় ব্যবস্থাপনা
            </p>
          </div>
        </div>

        <button
          onClick={loadOverview}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          <span>রিফ্রেশ করুন</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-600/60 text-blue-200 text-xs font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs font-medium flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* System Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b101f] border border-blue-950/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">মোট নিবন্ধিত ইউজার</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {useBengaliDigits ? toBengaliNumber(systemTotals.totalUsers) : systemTotals.totalUsers} জন
          </div>
          <div className="text-[11px] text-slate-500 mt-1">দোকান ও ব্যবসা একাউন্ট</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b101f] border border-blue-950/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">সর্বমোট হিসাব এন্ট্রি</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {useBengaliDigits ? toBengaliNumber(systemTotals.totalEntries) : systemTotals.totalEntries} টি
          </div>
          <div className="text-[11px] text-slate-500 mt-1">ডাটাবেজে সংরক্ষিত</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b101f] border border-blue-950/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">সম্মিলিত বিক্রয়</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatTaka(systemTotals.systemSale, useBengaliDigits)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">সকল ব্যবহারকারীর মোট</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b101f] border border-blue-950/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">সম্মিলিত জমা / ক্যাশ</span>
            <ArrowDownLeft className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatTaka(systemTotals.systemDeposit, useBengaliDigits)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">মোট নগদ আদায়</div>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="bg-[#0b101f] border border-blue-950/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              ব্যবহারকারী ও দোকান তালিকা ({users.length} টি)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              যেকোনো ইউজারের PIN রিসেট বা তথ্য পর্যালোচনা করুন
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-slate-400 font-semibold uppercase">
                <th className="py-3 px-3">দোকান / ইউজারের নাম</th>
                <th className="py-3 px-3">ফোন নম্বর</th>
                <th className="py-3 px-3">রোল</th>
                <th className="py-3 px-3 text-center">মোট এন্ট্রি</th>
                <th className="py-3 px-3 text-right">মোট বিক্রয়</th>
                <th className="py-3 px-3 text-right">মোট জমা</th>
                <th className="py-3 px-3 text-right">মোট খরচ</th>
                <th className="py-3 px-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 font-medium">
              {users.map((u: any) => {
                const isAdmin = u.role === 'admin';
                return (
                  <tr key={u.id} className="hover:bg-blue-950/20 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        খোলা হয়েছে: {formatBengaliDate(u.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-blue-300">
                      {u.phone}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isAdmin 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-neutral-800 text-slate-300'
                      }`}>
                        {isAdmin ? 'ADMIN' : 'SHOP'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {useBengaliDigits ? toBengaliNumber(u.entryCount) : u.entryCount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                      {formatTaka(u.totalSale, useBengaliDigits)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                      {formatTaka(u.totalDeposit, useBengaliDigits)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-red-400">
                      {formatTaka(u.totalExpense, useBengaliDigits)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setResetModalUser(u);
                            setNewPin('');
                          }}
                          title="PIN রিসেট করুন"
                          className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Key className="w-3 h-3" />
                          <span>PIN রিসেট</span>
                        </button>

                        {!isAdmin && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            title="একাউন্ট মুছুন"
                            className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications Audit Log to razaulkarim1622@gmail.com */}
      <div className="bg-[#0b101f] border border-blue-950/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              নোটিফিকেশন অডিট ট্রেইল (Email Logs)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              নতুন একাউন্ট সৃষ্টির সময় <strong className="text-blue-300 font-mono">razaulkarim1622@gmail.com</strong>-এ প্রেরিত অ্যালার্টসমূহ
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-950 border border-blue-800/40 text-blue-300 font-mono">
            {notifications.length} টি রেকর্ড
          </span>
        </div>

        <div className="space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">কোনো নোটিফিকেশন নেই</div>
          ) : (
            notifications.map((n: any) => (
              <div
                key={n.id}
                className="p-3 rounded-xl bg-black/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{n.subject}</span>
                    <span className="text-[10px] text-blue-400 font-mono">({n.status})</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    ব্যবহারকারী: <strong className="text-slate-200">{n.userName}</strong> ({n.userPhone}) · প্রাপক: <span className="font-mono text-blue-300">{n.to}</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reset PIN Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101f] border border-blue-600/50 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                PIN রিসেট করুন
              </h4>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              দোকান: <strong className="text-white">{resetModalUser.name}</strong> ({resetModalUser.phone})
            </p>

            <form onSubmit={handleResetPin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  নতুন গোপন PIN (৪-৮ ডিজিট)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={8}
                  autoFocus
                  placeholder="যেমন: 1234"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full h-11 px-3 bg-black/60 border border-neutral-800 focus:border-blue-500 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isResetting || !newPin || newPin.length < 4}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isResetting ? 'সেভ হচ্ছে...' : 'PIN পরিবর্তন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101f] border border-red-800/60 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">ইউজার একাউন্ট মুছবেন?</h4>
            <p className="text-xs text-slate-400 mb-6">
              "{deletingUser.name}" এবং তার সকল হিসাব এন্ট্রি স্থায়ীভাবে মুছে যাবে।
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
