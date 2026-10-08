import React, { useState } from 'react';
import { Search, Calendar, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { KhataEntry } from '../types';
import { api } from '../services/api';
import { formatTaka, toBengaliNumber, formatBengaliDate, getBengaliDayName } from '../utils/bengali';

interface SearchViewProps {
  onOpenDate: (date: string) => void;
  useBengaliDigits?: boolean;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onOpenDate,
  useBengaliDigits = true
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KhataEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await api.searchEntries(query.trim());
      setResults(data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Search Header Bar */}
      <div className="bg-[#0b101f] border border-blue-950/40 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-blue-400" />
          হিসাব অনুসন্ধান (Search Entries)
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          নাম, বিবরণ, টাকার পরিমাণ অথবা তারিখ দিয়ে সমগ্র ডাটাবেজে দ্রুত অনুসন্ধান করুন
        </p>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              autoFocus
              placeholder="যেমন: রহিম, আলম, 500, 2026-10-08..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-black/60 border border-neutral-800 focus:border-blue-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 h-11 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            {loading ? (
              <span>খোঁজা হচ্ছে...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>অনুসন্ধান করুন</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results view */}
      {hasSearched && (
        <div className="bg-[#0b101f] border border-blue-950/40 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="text-sm font-bold text-white">
              অনুসন্ধানের ফলাফল: <span className="text-blue-400 font-mono">{useBengaliDigits ? toBengaliNumber(results.length) : results.length} টি</span> হিসাব পাওয়া গেছে
            </div>
          </div>

          {results.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-400">"{query}" দিয়ে কোনো হিসাব খুঁজে পাওয়া যায়নি</p>
              <p className="text-xs text-slate-500 mt-1">ভিন্ন শব্দ বা তারিখ দিয়ে পুনরায় চেষ্টা করুন</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-3">তারিখ ও বার</th>
                    <th className="py-3 px-3">নং</th>
                    <th className="py-3 px-4">বিবরণ</th>
                    <th className="py-3 px-3 text-right">বিক্রয়</th>
                    <th className="py-3 px-3 text-right">জমা</th>
                    <th className="py-3 px-3 text-right">খরচ</th>
                    <th className="py-3 px-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 font-medium">
                  {results.map((entry) => {
                    const d = new Date(entry.date + 'T00:00:00');
                    return (
                      <tr key={entry.id} className="hover:bg-blue-950/20 transition-colors">
                        <td className="py-3 px-3 text-blue-300 font-mono">
                          <div>{formatBengaliDate(d)}</div>
                          <div className="text-[10px] text-slate-500">{getBengaliDayName(d)}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {useBengaliDigits ? toBengaliNumber(entry.sl) : entry.sl}
                        </td>
                        <td className="py-3 px-4 text-white font-semibold">
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
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onOpenDate(entry.date)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <span>খাতা দেখুন</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
