import React, { useEffect, useState } from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Mail, 
  Download, 
  Database, 
  Lock, 
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Cloud
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../services/api';
import { formatBengaliDate, toBengaliNumber } from '../utils/bengali';

interface AccountViewProps {
  currentUser: UserProfile;
  onExportCSV: () => void;
  onOpenGoogleDrive?: () => void;
  useBengaliDigits?: boolean;
}

export const AccountView: React.FC<AccountViewProps> = ({
  currentUser,
  onExportCSV,
  onOpenGoogleDrive,
  useBengaliDigits = true
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    loadNotifAudit();
  }, []);

  const loadNotifAudit = async () => {
    setLoadingNotifs(true);
    try {
      const data = await api.getNotificationAudit();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleDownloadJsonBackup = () => {
    window.open('/api/backup/export', '_blank');
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Profile Overview */}
      <div className="bg-[#0b101f] border border-blue-950/40 rounded-2xl p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-2xl font-mono">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                ব্যবসা / স্বত্বাধিকারী একাউন্ট
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                {currentUser.name}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  {currentUser.phone}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  খোলা হয়েছে: {formatBengaliDate(currentUser.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              সক্রিয় ভেরিফাইড ইউজার
            </span>
          </div>
        </div>

        {/* Security & Isolation disclosure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-black/60 border border-neutral-800 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-white mb-0.5">গোপন PIN নিরাপত্তা ও এনক্রিপশন</div>
              <p className="text-slate-400 leading-relaxed">
                আপনার PIN ডাটাবেজে ক্রিপ্টোগ্রাফিক সল্ট (Salt) এবং Scrypt হ্যাশিং দ্বারা সুরক্ষিত। কোনো অবস্থাতেই প্লেইন টেক্সট হিসেবে সংরক্ষণ বা শেয়ার করা হয় না।
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-neutral-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-white mb-0.5">ডাটা আইসোলেশন ও গোপনীয়তা</div>
              <p className="text-slate-400 leading-relaxed">
                প্রতিটি ইউজারের দৈনন্দিন হিসাবের খাতা সম্পূর্ণ আলাদা সুরক্ষিত সেশনে সংরক্ষিত। এক ইউজার কখনোই অন্য ইউজারের হিসাব দেখতে পারেন না।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mandatory Email Notification Dispatch Audit to razaulkarim1622@gmail.com */}
      <div className="bg-[#0b101f] border border-blue-950/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              অ্যাকাউন্ট সৃষ্টি নোটিফিকেশন অডিট
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              নোটিফিকেশন প্রাপক: <strong className="font-mono text-blue-300">razaulkarim1622@gmail.com</strong> (নিরাপত্তার খাতিরে পিন ব্যতিরেকে)
            </p>
          </div>

          <button
            onClick={loadNotifAudit}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingNotifs ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              কোনো নোটিফিকেশন রেকর্ড পাওয়া যায়নি
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-black/50 border border-neutral-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{n.subject}</span>
                    <span className="font-mono text-[11px] text-blue-400">({n.status})</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    ব্যবহারকারী: <strong className="text-slate-200">{n.userName}</strong> ({n.userPhone}) · প্রাপক: <span className="font-mono text-blue-300">{n.to}</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 shrink-0">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 20. Backup & Export Management */}
      <div className="bg-[#0b101f] border border-blue-950/40 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <Database className="w-5 h-5 text-blue-400" />
          হিসাব ব্যাকআপ ও এক্সপোর্ট (Backup & Export)
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          আপনার ব্যবসার হিসাব যে কোনো সময় এক্সেল শিট বা ব্যাকআপ ফাইল হিসেবে ডাউনলোড করুন
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-black/60 border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Excel / CSV এক্সপোর্ট</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                দৈনন্দিন হিসাবসমূহ সরাসরি Microsoft Excel অথবা Google Sheets-এ খোলার উপযোগী CSV ফরম্যাটে সেভ করুন।
              </p>
            </div>

            <button
              onClick={onExportCSV}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>CSV এক্সেল ফরম্যাটে ডাউনলোড</span>
            </button>
          </div>

          <div className="p-5 rounded-xl bg-black/60 border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                <Database className="w-4 h-4 text-blue-400" />
                <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ (JSON)</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                ভবিষ্যতে অন্য কোনো ডিভাইসে রিস্টোর বা নিরাপদে সংরক্ষণের জন্য সম্পূর্ণ ডাটাবেজ ব্যাকআপ ফাইল ডাউনলোড করুন।
              </p>
            </div>

            <button
              onClick={handleDownloadJsonBackup}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>JSON ব্যাকআপ ফাইল ডাউনলোড</span>
            </button>
          </div>

          {onOpenGoogleDrive && (
            <div className="p-5 rounded-xl bg-gradient-to-b from-blue-950/40 to-black/80 border border-blue-900/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  <span>Google Drive ক্লাউড ব্যাকআপ</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  আপনার গুগল ড্রাইভ অ্যাকাউন্টে সরাসরি হিসাব আপলোড, ক্লাউড সিঙ্ক এবং ফাইল ম্যানেজ করুন।
                </p>
              </div>

              <button
                onClick={onOpenGoogleDrive}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                <span>Google Drive ব্যাকআপ খুলুন</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
