import React from 'react';
import { 
  BookOpen, 
  ArrowUpRight, 
  TrendingUp, 
  BadgePercent, 
  Wallet, 
  Receipt, 
  ArrowDownLeft, 
  Undo2, 
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DashboardStats, KhataEntry, UserProfile } from '../types';
import { formatTaka, toBengaliNumber, getBengaliDayName, formatBengaliDate } from '../utils/bengali';

interface DashboardViewProps {
  stats: DashboardStats | null;
  recentEntries: KhataEntry[];
  currentUser: UserProfile;
  onOpenKhata: () => void;
  onNewEntry: () => void;
  onViewHistory: () => void;
  useBengaliDigits?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentEntries,
  currentUser,
  onOpenKhata,
  onNewEntry,
  onViewHistory,
  useBengaliDigits = true
}) => {
  const today = new Date();
  const todayDayName = getBengaliDayName(today);
  const todayFormattedDate = formatBengaliDate(today);

  const todayStats = stats?.today || {
    sale: 0,
    deposit: 0,
    returnAmount: 0,
    expense: 0,
    netCash: 0,
    entryCount: 0
  };

  const statCards = [
    {
      title: 'আজকের বিক্রয়',
      sub: 'Today Total Sales',
      value: formatTaka(todayStats.sale, useBengaliDigits),
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
      badge: 'বিক্রয় খতিয়ান',
      borderClass: 'border-blue-900/30'
    },
    {
      title: 'আজকের জমা',
      sub: 'Cash Received / In',
      value: formatTaka(todayStats.deposit, useBengaliDigits),
      icon: <ArrowDownLeft className="w-5 h-5 text-emerald-400" />,
      badge: 'নগদ আদায়',
      borderClass: 'border-emerald-950/50'
    },
    {
      title: 'আজকের খরচ',
      sub: 'Today Expenses',
      value: formatTaka(todayStats.expense, useBengaliDigits),
      icon: <Receipt className="w-5 h-5 text-red-400" />,
      badge: 'দোকান ব্যয়',
      borderClass: 'border-red-950/50'
    },
    {
      title: 'আজকের মোট Entry',
      sub: 'Transactions Count',
      value: useBengaliDigits ? toBengaliNumber(todayStats.entryCount) + ' টি' : `${todayStats.entryCount} টি`,
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      badge: 'দৈনিক এন্ট্রি',
      borderClass: 'border-blue-900/30'
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 5. Main Feature: Big Beautiful MRT Regular Khata Card */}
      <div 
        onClick={onOpenKhata}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b1329] via-[#0d1838] to-[#070b14] border border-blue-600/40 p-7 lg:p-9 shadow-2xl shadow-blue-950/50 hover:border-blue-400 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/20 transition-all duration-500" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>প্রধান হিসাবের খাতা · ক্লিক করে চালু করুন</span>
            </div>

            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight uppercase">
                MRT Regular Khata
              </h2>
              <p className="text-base text-blue-200/80 font-medium mt-1">
                Daily Business Accounting · ঐতিহ্যবাহী টালি খাতার আধুনিক ডিজিটাল রূপ
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span>আজকের দিন: <strong className="text-white">{todayDayName}</strong></span>
              <span>·</span>
              <span>তারিখ: <strong className="text-white">{todayFormattedDate}</strong></span>
              <span>·</span>
              <span>মোট এন্ট্রি: <strong className="text-blue-300">{useBengaliDigits ? toBengaliNumber(todayStats.entryCount) : todayStats.entryCount}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-xs text-blue-300/70 uppercase tracking-wider font-semibold">আজকের নীট ক্যাশ</span>
              <span className="text-2xl lg:text-3xl font-mono font-bold text-white tabular-nums">
                {formatTaka(todayStats.netCash, useBengaliDigits)}
              </span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 transition-all group-hover:scale-105 shrink-0">
              <ArrowRight className="w-7 h-7 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>

      {/* 15. Dashboard Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-[#0b101f] border ${card.borderClass} shadow-lg hover:border-blue-500/40 transition-all group`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">{card.title}</span>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-blue-500/30 transition-colors">
                {card.icon}
              </div>
            </div>

            <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums mb-1">
              {card.value}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{card.sub}</span>
              <span className="text-blue-400/80 font-medium">{card.badge}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary split row: Today's Net Cash summary card & quick recent entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Balance & Cash Flow summary */}
        <div className="bg-[#0b101f] border border-blue-950/40 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                আজকের ক্যাশ হিসাব সংক্ষেপ
              </h3>
              <span className="text-xs text-blue-400 font-mono">Real-time</span>
            </div>

            <div className="space-y-3 py-2">
              <div className="flex justify-between items-center text-sm py-2 border-b border-neutral-800/80">
                <span className="text-slate-400">মোট বিক্রয়:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {formatTaka(todayStats.sale, useBengaliDigits)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-neutral-800/80">
                <span className="text-emerald-400">নগদ জমা:</span>
                <span className="font-mono font-bold text-emerald-300 tabular-nums">
                  {formatTaka(todayStats.deposit, useBengaliDigits)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-neutral-800/80">
                <span className="text-amber-400">মাল ফেরত:</span>
                <span className="font-mono font-bold text-amber-300 tabular-nums">
                  {formatTaka(todayStats.returnAmount, useBengaliDigits)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-neutral-800/80">
                <span className="text-red-400">দোকান খরচ:</span>
                <span className="font-mono font-bold text-red-300 tabular-nums">
                  {formatTaka(todayStats.expense, useBengaliDigits)}
                </span>
              </div>
              <div className="flex justify-between items-center text-base pt-3 font-semibold">
                <span className="text-white">আজকের অবশিষ্ট ক্যাশ:</span>
                <span className="font-mono font-extrabold text-blue-400 text-lg tabular-nums">
                  {formatTaka(todayStats.netCash, useBengaliDigits)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-neutral-800 flex gap-2">
            <button
              onClick={onNewEntry}
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>+ নতুন হিসাব</span>
            </button>
            <button
              onClick={onViewHistory}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>পূর্বের ইতিহাস</span>
            </button>
          </div>
        </div>

        {/* Recent entries list */}
        <div className="lg:col-span-2 bg-[#0b101f] border border-blue-950/40 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  আজকের সর্বশেষ এন্ট্রি সমূহ
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">রিয়েল-টাইমে সেভ হওয়া হিসাব</p>
              </div>
              <button
                onClick={onOpenKhata}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>সম্পূর্ণ টালি খাতা দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentEntries.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>আজকের কোনো হিসাব এখনও এন্ট্রি করা হয়নি।</p>
                <button
                  onClick={onNewEntry}
                  className="mt-3 text-xs text-blue-400 hover:underline font-semibold"
                >
                  প্রথম হিসাব যোগ করুন →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">নং</th>
                      <th className="py-2.5 px-3">বিবরণ</th>
                      <th className="py-2.5 px-3 text-right">বিক্রয়</th>
                      <th className="py-2.5 px-3 text-right">জমা</th>
                      <th className="py-2.5 px-3 text-right">খরচ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/60 font-medium">
                    {recentEntries.slice(-5).reverse().map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {useBengaliDigits ? toBengaliNumber(entry.sl) : entry.sl}
                        </td>
                        <td className="py-3 px-3 text-white font-medium max-w-[200px] truncate">
                          {entry.description}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                          {entry.sale > 0 ? formatTaka(entry.sale, useBengaliDigits) : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                          {entry.deposit > 0 ? formatTaka(entry.deposit, useBengaliDigits) : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-red-400">
                          {entry.expense > 0 ? formatTaka(entry.expense, useBengaliDigits) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-3 text-[11px] text-slate-500 flex justify-between items-center border-t border-neutral-800/80 mt-4">
            <span>কিবোর্ড শর্টকাট: <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-neutral-800 text-slate-300 font-mono">Alt + N</kbd> চেপে নতুন হিসাব লিখুন</span>
            <span>সরাসরি ডাটাবেজে সংরক্ষিত</span>
          </div>
        </div>
      </div>
    </div>
  );
};
