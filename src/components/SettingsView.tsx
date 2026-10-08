import React from 'react';
import { 
  Settings, 
  Languages, 
  Printer, 
  Sliders, 
  Keyboard, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';

interface SettingsViewProps {
  useBengaliDigits: boolean;
  onToggleBengaliDigits: (val: boolean) => void;
  printPaperSize: 'a4' | 'pos';
  onChangePrintPaperSize: (size: 'a4' | 'pos') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  useBengaliDigits,
  onToggleBengaliDigits,
  printPaperSize,
  onChangePrintPaperSize
}) => {
  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0b101f] border border-blue-950/40 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-blue-400" />
          সিস্টেম ও ডিসপ্লে সেটিংস (Settings)
        </h2>
        <p className="text-xs text-slate-400">
          আপনার পছন্দমতো সফটওয়্যারের সংখ্যা প্রদর্শন এবং প্রিন্ট ফরম্যাট কাস্টমাইজ করুন
        </p>
      </div>

      {/* Numerical format preference */}
      <div className="bg-[#0b101f] border border-blue-950/40 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Languages className="w-4 h-4 text-blue-400" />
          সংখ্যার প্রদর্শন ফরম্যাট (Number Digit Preference)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onToggleBengaliDigits(true)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              useBengaliDigits
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-900/30'
                : 'bg-black/50 border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white">বাংলা সংখ্যা (ঐতিহ্যবাহী)</span>
              {useBengaliDigits && <Check className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-xs text-slate-400 mb-2">
              টাকা ও ক্রমিক নং বাংলা সংখ্যায় দেখাবে (যেমন: ৳ ২,৫০০.০০, নং: ১)
            </p>
            <div className="text-lg font-mono font-bold text-blue-300">
              ৳ ৫,৭৫০.০০ · নং ৩
            </div>
          </button>

          <button
            type="button"
            onClick={() => onToggleBengaliDigits(false)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              !useBengaliDigits
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-900/30'
                : 'bg-black/50 border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white">ইংরেজি সংখ্যা (English Digits)</span>
              {!useBengaliDigits && <Check className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-xs text-slate-400 mb-2">
              টাকা ও ক্রমিক নং আন্তর্জাতিক সংখ্যায় দেখাবে (যেমন: ৳ 2,500.00, Sl: 1)
            </p>
            <div className="text-lg font-mono font-bold text-blue-300">
              ৳ 5,750.00 · Sl 3
            </div>
          </button>
        </div>
      </div>

      {/* Printing Paper Size */}
      <div className="bg-[#0b101f] border border-blue-950/40 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Printer className="w-4 h-4 text-blue-400" />
          প্রিন্ট লেআউট ও সাইজ (Print Paper Setting)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onChangePrintPaperSize('a4')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              printPaperSize === 'a4'
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-900/30'
                : 'bg-black/50 border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-white">A4 লেজার শীট (স্ট্যান্ডার্ড)</span>
              {printPaperSize === 'a4' && <Check className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-xs text-slate-400">
              অফিসিয়াল প্রিন্টার ও দোকানে সাধারণ A4 সাইজের ফুল পেইজ খতিয়ান প্রিন্ট।
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChangePrintPaperSize('pos')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              printPaperSize === 'pos'
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-900/30'
                : 'bg-black/50 border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-white">POS থার্মাল স্লিপ (80mm)</span>
              {printPaperSize === 'pos' && <Check className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-xs text-slate-400">
              ছোট ক্যাশ মেমো থার্মাল প্রিন্টারের জন্য অপ্টিমাইজড রসিদ।
            </p>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="bg-[#0b101f] border border-blue-950/40 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-blue-400" />
          দ্রুত ব্যবহারের জন্য PC কিবোর্ড শর্টকাট
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-black/50 border border-neutral-800 flex items-center justify-between">
            <span className="text-slate-300">নতুন হিসাব যোগ</span>
            <kbd className="px-2 py-1 rounded bg-blue-950 border border-blue-700 font-mono text-blue-300 font-bold">
              Alt + N
            </kbd>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-neutral-800 flex items-center justify-between">
            <span className="text-slate-300">পরবর্তী ফিল্ডে যাওয়া</span>
            <kbd className="px-2 py-1 rounded bg-blue-950 border border-blue-700 font-mono text-blue-300 font-bold">
              Enter
            </kbd>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-neutral-800 flex items-center justify-between">
            <span className="text-slate-300">মডেল বা উইন্ডো বন্ধ</span>
            <kbd className="px-2 py-1 rounded bg-blue-950 border border-blue-700 font-mono text-blue-300 font-bold">
              Esc
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
