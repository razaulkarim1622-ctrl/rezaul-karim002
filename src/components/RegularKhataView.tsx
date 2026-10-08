import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Download, 
  Check, 
  X, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Receipt,
  Save,
  RotateCcw
} from 'lucide-react';
import { KhataEntry, DaySummary } from '../types';
import { 
  toBengaliNumber, 
  formatTaka, 
  getBengaliDayName, 
  formatBengaliDate, 
  getTodayDateString 
} from '../utils/bengali';

interface RegularKhataViewProps {
  currentDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
  entries: KhataEntry[];
  summary: DaySummary;
  onAddEntry: (payload: {
    date: string;
    description: string;
    sale: number;
    deposit: number;
    returnAmount: number;
    expense: number;
  }) => Promise<void>;
  onUpdateEntry: (id: string, payload: Partial<KhataEntry>) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onPrint: () => void;
  onExport: () => void;
  useBengaliDigits?: boolean;
}

export const RegularKhataView: React.FC<RegularKhataViewProps> = ({
  currentDate,
  onDateChange,
  entries,
  summary,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onPrint,
  onExport,
  useBengaliDigits = true
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KhataEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formDescription, setFormDescription] = useState('');
  const [formSale, setFormSale] = useState('');
  const [formDeposit, setFormDeposit] = useState('');
  const [formReturn, setFormReturn] = useState('');
  const [formExpense, setFormExpense] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Input refs for Enter-to-next navigation
  const descRef = useRef<HTMLInputElement>(null);
  const saleRef = useRef<HTMLInputElement>(null);
  const depositRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);
  const expenseRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const parsedDate = new Date(currentDate + 'T00:00:00');
  const dayName = getBengaliDayName(parsedDate);
  const bengaliDateString = formatBengaliDate(parsedDate);
  const isToday = currentDate === getTodayDateString();

  // Reset form when modal opens
  const openAddModal = () => {
    setEditingEntry(null);
    setFormDescription('');
    setFormSale('');
    setFormDeposit('');
    setFormReturn('');
    setFormExpense('');
    setFormError(null);
    setShowAddModal(true);
  };

  const openEditModal = (entry: KhataEntry) => {
    setEditingEntry(entry);
    setFormDescription(entry.description);
    setFormSale(entry.sale ? String(entry.sale) : '');
    setFormDeposit(entry.deposit ? String(entry.deposit) : '');
    setFormReturn(entry.returnAmount ? String(entry.returnAmount) : '');
    setFormExpense(entry.expense ? String(entry.expense) : '');
    setFormError(null);
    setShowAddModal(true);
  };

  useEffect(() => {
    if (showAddModal) {
      setTimeout(() => descRef.current?.focus(), 80);
    }
  }, [showAddModal]);

  // Navigate dates
  const handlePrevDay = () => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    onDateChange(`${yr}-${mo}-${dy}`);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    onDateChange(`${yr}-${mo}-${dy}`);
  };

  const handleGoToday = () => {
    onDateChange(getTodayDateString());
  };

  // Keyboard Enter navigation between fields
  const handleKeyDown = (e: React.KeyboardEvent, nextFieldRef?: React.RefObject<HTMLInputElement | HTMLButtonElement | null>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      }
    }
  };

  // Save entry (add or edit)
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) {
      setFormError('অনুগ্রহ করে হিসাবের বিবরণ লিখুন (যেমন: কাস্টমার নাম বা খরচের বিবরণ)');
      descRef.current?.focus();
      return;
    }

    const sale = parseFloat(formSale) || 0;
    const deposit = parseFloat(formDeposit) || 0;
    const returnAmount = parseFloat(formReturn) || 0;
    const expense = parseFloat(formExpense) || 0;

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingEntry) {
        await onUpdateEntry(editingEntry.id, {
          description: formDescription.trim(),
          sale,
          deposit,
          returnAmount,
          expense
        });
      } else {
        await onAddEntry({
          date: currentDate,
          description: formDescription.trim(),
          sale,
          deposit,
          returnAmount,
          expense
        });
      }
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await onDeleteEntry(deletingId);
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || 'মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  // Global Alt+N shortcut to open Add Entry
  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'n' || e.key === 'N')) || (e.key === '+' && e.ctrlKey)) {
        e.preventDefault();
        openAddModal();
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, []);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 6. Traditional Tally Khata Header Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#0b1329] via-[#090d19] to-[#070b14] border-2 border-blue-600/40 p-6 lg:p-8 shadow-2xl overflow-hidden">
        {/* Subtle decorative inner ledger lines */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />
        
        {/* Top Centered Bismillah */}
        <div className="text-center mb-5">
          <div className="text-2xl lg:text-3xl font-extrabold text-blue-400 font-serif tracking-widest drop-shadow-md">
            বিসমিল্লাহ
          </div>
          <div className="text-xs text-blue-200/60 uppercase tracking-widest font-sans mt-0.5 font-semibold">
            MRT REGULAR KHATA · DAILY BUSINESS ACCOUNTING
          </div>
        </div>

        {/* Date and Day bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-black/60 rounded-xl p-4 border border-blue-900/40">
          {/* Day Display */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-blue-300">আজকে কি বার :</span>
            <span className="text-base lg:text-lg font-bold text-white bg-blue-950/60 px-4 py-1.5 rounded-lg border border-blue-600/40">
              {dayName}
            </span>
            {isToday && (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-semibold">
                আজকের দিন
              </span>
            )}
          </div>

          {/* Date Selector & Navigation */}
          <div className="flex items-center md:justify-end gap-2">
            <span className="text-sm font-bold text-blue-300 whitespace-nowrap">তারিখ :</span>
            <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-600/40 rounded-lg p-1">
              <button
                onClick={handlePrevDay}
                title="পূর্বের দিন"
                className="p-1 hover:bg-blue-600 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-2">
                <span className="text-sm lg:text-base font-bold text-white font-mono">
                  {bengaliDateString}
                </span>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => e.target.value && onDateChange(e.target.value)}
                  className="bg-transparent text-blue-300 border-none text-xs cursor-pointer focus:outline-none w-5 opacity-70 hover:opacity-100"
                  title="তারিখ পরিবর্তন করুন"
                />
              </div>

              <button
                onClick={handleNextDay}
                title="পরের দিন"
                className="p-1 hover:bg-blue-600 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isToday && (
              <button
                onClick={handleGoToday}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 font-semibold transition-all cursor-pointer"
              >
                আজকে যান
              </button>
            )}
          </div>
        </div>

        {/* Quick action bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-blue-950/60">
          <div className="text-xs text-slate-400">
            মোট হিসাব ভুক্তি: <strong className="text-white font-mono">{useBengaliDigits ? toBengaliNumber(entries.length) : entries.length} টি</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>প্রিন্ট খাতা</span>
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>এক্সপোর্ট (CSV)</span>
            </button>

            {/* 8. Add Entry button */}
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-lg shadow-blue-600/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ নতুন হিসাব</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7. হিসাবের Table */}
      <div className="bg-[#0b101f] border border-blue-950/40 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a] border-b border-blue-900/40 text-xs font-bold text-blue-200 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">নং</th>
                <th className="py-3.5 px-5">বিবরণ (কাস্টমার / খরচ)</th>
                <th className="py-3.5 px-4 text-right">বিক্রয় (৳)</th>
                <th className="py-3.5 px-4 text-right">জমা (৳)</th>
                <th className="py-3.5 px-4 text-right">ফেরত (৳)</th>
                <th className="py-3.5 px-4 text-right">খরচ (৳)</th>
                <th className="py-3.5 px-4 text-center w-28">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-sm">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <p className="text-base font-semibold text-slate-400 mb-1">
                      এই তারিখে কোনো হিসাব লিপিবদ্ধ নেই
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      উপরের বা নিচের <span className="text-blue-400 font-bold">+ নতুন হিসাব</span> বাটনে চাপ দিয়ে প্রথম এন্ট্রি করুন।
                    </p>
                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      নতুন হিসাব লিখুন
                    </button>
                  </td>
                </tr>
              ) : (
                entries.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-blue-950/20 transition-colors group"
                  >
                    {/* নং */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-300">
                      {useBengaliDigits ? toBengaliNumber(item.sl) : item.sl}
                    </td>

                    {/* বিবরণ */}
                    <td className="py-3 px-5 text-white font-medium">
                      <div className="font-semibold text-white">{item.description}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* বিক্রয় */}
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-100">
                      {item.sale > 0 ? (
                        formatTaka(item.sale, useBengaliDigits)
                      ) : (
                        <span className="text-slate-600 font-normal">—</span>
                      )}
                    </td>

                    {/* জমা */}
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-400">
                      {item.deposit > 0 ? (
                        formatTaka(item.deposit, useBengaliDigits)
                      ) : (
                        <span className="text-slate-600 font-normal">—</span>
                      )}
                    </td>

                    {/* ফেরত */}
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-amber-400">
                      {item.returnAmount > 0 ? (
                        formatTaka(item.returnAmount, useBengaliDigits)
                      ) : (
                        <span className="text-slate-600 font-normal">—</span>
                      )}
                    </td>

                    {/* খরচ */}
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-red-400">
                      {item.expense > 0 ? (
                        formatTaka(item.expense, useBengaliDigits)
                      ) : (
                        <span className="text-slate-600 font-normal">—</span>
                      )}
                    </td>

                    {/* 10. Edit & Delete */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          title="সম্পাদনা করুন (Edit)"
                          className="p-1.5 rounded-lg text-blue-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          title="মুছে ফেলুন (Delete)"
                          className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom add entry bar */}
        <div className="p-4 bg-black/40 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            * প্রতিটি হিসাব সাথে সাথে সংরক্ষিত হয়
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ নতুন হিসাব</span>
          </button>
        </div>
      </div>

      {/* 9. Automatic Calculation Summary Section */}
      <div className="rounded-2xl bg-[#0b101f] border border-blue-900/40 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-neutral-800/80 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>আজকের সর্বমোট হিসাব ক্যালকুলেশন</span>
          </h3>
          <span className="text-xs font-mono text-blue-400 font-semibold">
            {bengaliDateString}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* মোট বিক্রয় */}
          <div className="p-4 rounded-xl bg-black/60 border border-neutral-800">
            <div className="text-xs font-semibold text-slate-400 mb-1">মোট বিক্রয়</div>
            <div className="text-xl lg:text-2xl font-mono font-bold text-white tabular-nums">
              {formatTaka(summary.totalSale, useBengaliDigits)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Total Sales</div>
          </div>

          {/* মোট জমা */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
            <div className="text-xs font-semibold text-emerald-400 mb-1">মোট জমা</div>
            <div className="text-xl lg:text-2xl font-mono font-bold text-emerald-300 tabular-nums">
              {formatTaka(summary.totalDeposit, useBengaliDigits)}
            </div>
            <div className="text-[10px] text-emerald-500/70 mt-0.5">Total Received Cash</div>
          </div>

          {/* মোট ফেরত */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
            <div className="text-xs font-semibold text-amber-400 mb-1">মোট ফেরত</div>
            <div className="text-xl lg:text-2xl font-mono font-bold text-amber-300 tabular-nums">
              {formatTaka(summary.totalReturn, useBengaliDigits)}
            </div>
            <div className="text-[10px] text-amber-500/70 mt-0.5">Total Returned Goods</div>
          </div>

          {/* মোট খরচ */}
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40">
            <div className="text-xs font-semibold text-red-400 mb-1">মোট খরচ</div>
            <div className="text-xl lg:text-2xl font-mono font-bold text-red-300 tabular-nums">
              {formatTaka(summary.totalExpense, useBengaliDigits)}
            </div>
            <div className="text-[10px] text-red-500/70 mt-0.5">Total Daily Expenses</div>
          </div>
        </div>

        {/* নীট ক্যাশ সমাপনী */}
        <div className="mt-4 p-4 rounded-xl bg-blue-950/30 border border-blue-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-blue-200">
              আজকের দিনশেষে নীট ক্যাশ ব্যালেন্স
            </div>
            <div className="text-xs text-blue-300/70 font-mono">
              (মোট জমা) - (মোট খরচ) - (মোট ফেরত)
            </div>
          </div>

          <div className="text-2xl lg:text-3xl font-mono font-extrabold text-white tabular-nums">
            {formatTaka(summary.netCash, useBengaliDigits)}
          </div>
        </div>
      </div>

      {/* 8. ADD / EDIT ENTRY MODAL with PC Keyboard Enter Navigation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101f] border border-blue-600/50 rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  {editingEntry ? 'হিসাব সম্পাদন (Edit Entry)' : 'নতুন হিসাব যোগ করুন (Add Entry)'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  তারিখ: {bengaliDateString}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEntry} className="mt-5 space-y-4">
              {/* বিবরণ */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  বিবরণ (কাস্টমার / পার্টি / খরচের বিবরণ) *
                </label>
                <input
                  ref={descRef}
                  type="text"
                  required
                  placeholder="যেমন: রহিম (বিক্রয়), আলম ট্রেডার্স, চা-নাস্তা খরচ..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, saleRef)}
                  className="w-full h-11 px-3 bg-black/60 border border-neutral-800 focus:border-blue-500 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                />
              </div>

              {/* বিক্রয় ও জমা */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    বিক্রয় (৳)
                  </label>
                  <input
                    ref={saleRef}
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={formSale}
                    onChange={(e) => setFormSale(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, depositRef)}
                    className="w-full h-11 px-3 bg-black/60 border border-neutral-800 focus:border-blue-500 rounded-xl text-base font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 text-right"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-emerald-400 block mb-1">
                    জমা / আদায় (৳)
                  </label>
                  <input
                    ref={depositRef}
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, returnRef)}
                    className="w-full h-11 px-3 bg-black/60 border border-neutral-800 focus:border-emerald-500 rounded-xl text-base font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600 text-right"
                  />
                </div>
              </div>

              {/* ফেরত ও খরচ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-amber-400 block mb-1">
                    ফেরত (৳)
                  </label>
                  <input
                    ref={returnRef}
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={formReturn}
                    onChange={(e) => setFormReturn(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, expenseRef)}
                    className="w-full h-11 px-3 bg-black/60 border border-neutral-800 focus:border-amber-500 rounded-xl text-base font-mono text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-600 text-right"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-red-400 block mb-1">
                    খরচ (৳)
                  </label>
                  <input
                    ref={expenseRef}
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={formExpense}
                    onChange={(e) => setFormExpense(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, submitButtonRef)}
                    className="w-full h-11 px-3 bg-black/60 border border-neutral-800 focus:border-red-500 rounded-xl text-base font-mono text-red-300 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder:text-slate-600 text-right"
                  />
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500">
                টিপস: কিবোর্ডের <kbd className="px-1 py-0.5 rounded bg-black border border-neutral-800 text-slate-300">Enter</kbd> চাপলে পরবর্তী ঘরে যাবে।
              </div>

              {/* Buttons */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-800 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  ref={submitButtonRef}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>সংরক্ষণ হচ্ছে...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingEntry ? 'আপডেট করুন' : 'তাত্ক্ষণিক সেভ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101f] border border-red-800/60 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              হিসাবটি মুছে ফেলতে চান?
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              আপনি কি নিশ্চিত এই হিসাব এন্ট্রি মুছে ফেলতে চান? এই ক্রিয়াটি বাতিল করা যাবে না।
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-800 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 cursor-pointer"
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
