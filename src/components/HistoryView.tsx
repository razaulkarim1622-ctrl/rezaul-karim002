import React, { useState } from 'react';
import { 
  Calendar, 
  ArrowRight, 
  Search, 
  TrendingUp, 
  Receipt, 
  Layers, 
  Clock,
  ArrowDownLeft,
  ChevronRight
} from 'lucide-react';
import { HistoryDayItem } from '../types';
import { 
  toBengaliNumber, 
  formatTaka, 
  formatBengaliDate, 
  getBengaliDayName 
} from '../utils/bengali';

interface HistoryViewProps {
  historyList: HistoryDayItem[];
  onSelectDate: (date: string) => void;
  useBengaliDigits?: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyList,
  onSelectDate,
  useBengaliDigits = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = historyList.filter(item => {
    const bDate = formatBengaliDate(item.date);
    const day = getBengaliDayName(new Date(item.date + 'T00:00:00'));
    return (
      item.date.includes(searchTerm) ||
      bDate.includes(searchTerm) ||
      day.includes(searchTerm)
    );
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b101f] border border-blue-950/40 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            হিসাবের ইতিহাস (Daily History)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            তারিখ অনুযায়ী পূর্ববর্তী দিনের সকল দৈনন্দিন হিসাবের খাতা সংরক্ষিত আছে
          </p>
        </div>

        {/* Filter input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="তারিখ দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-black/60 border border-neutral-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none"
          />
        </div>
      </div>

      {/* History Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-[#0b101f] border border-blue-950/40 rounded-2xl p-8">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
          <p className="text-base font-semibold text-slate-300">কোনো ইতিহাস খুঁজে পাওয়া যায়নি</p>
          <p className="text-xs text-slate-500 mt-1">
            নতুন কোনো তারিখে হিসাব এন্ট্রি করলে তা এখানে তারিখ অনুযায়ী সাজানো থাকবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const dateObj = new Date(item.date + 'T00:00:00');
            const dayName = getBengaliDayName(dateObj);
            const bDate = formatBengaliDate(dateObj);

            return (
              <div
                key={item.date}
                onClick={() => onSelectDate(item.date)}
                className="group p-5 rounded-2xl bg-[#0b101f] border border-blue-950/40 hover:border-blue-500/60 transition-all cursor-pointer shadow-lg hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 group-hover:bg-blue-600/15 rounded-full blur-2xl transition-all" />

                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div>
                    <div className="text-base font-extrabold text-white group-hover:text-blue-300 transition-colors">
                      {bDate}
                    </div>
                    <div className="text-xs font-semibold text-blue-400 mt-0.5">
                      {dayName} · <span className="font-mono text-slate-400">{item.date}</span>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-950 border border-blue-800/40 text-blue-200 font-mono">
                    {useBengaliDigits ? toBengaliNumber(item.count) : item.count} এন্ট্রি
                  </span>
                </div>

                {/* Metrics */}
                <div className="space-y-2 py-2 border-y border-neutral-900/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">মোট বিক্রয়:</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {formatTaka(item.totalSale, useBengaliDigits)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400">মোট জমা:</span>
                    <span className="font-mono font-bold text-emerald-300 tabular-nums">
                      {formatTaka(item.totalDeposit, useBengaliDigits)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-400">মোট খরচ:</span>
                    <span className="font-mono font-bold text-red-300 tabular-nums">
                      {formatTaka(item.totalExpense, useBengaliDigits)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-neutral-900">
                    <span className="text-blue-300 font-semibold">নীট ব্যালেন্স:</span>
                    <span className="font-mono font-bold text-blue-200 tabular-nums">
                      {formatTaka(item.netCash, useBengaliDigits)}
                    </span>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-400 transition-colors font-medium">
                  <span>খাতা খুলুন</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
