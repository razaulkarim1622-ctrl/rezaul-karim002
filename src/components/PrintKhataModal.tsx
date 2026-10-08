import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { KhataEntry, DaySummary, UserProfile } from '../types';
import { 
  toBengaliNumber, 
  formatTaka, 
  getBengaliDayName, 
  formatBengaliDate 
} from '../utils/bengali';

interface PrintKhataModalProps {
  currentDate: string;
  entries: KhataEntry[];
  summary: DaySummary;
  currentUser: UserProfile;
  onClose: () => void;
  useBengaliDigits?: boolean;
  paperSize?: 'a4' | 'pos';
}

export const PrintKhataModal: React.FC<PrintKhataModalProps> = ({
  currentDate,
  entries,
  summary,
  currentUser,
  onClose,
  useBengaliDigits = true,
  paperSize = 'a4'
}) => {
  const parsedDate = new Date(currentDate + 'T00:00:00');
  const dayName = getBengaliDayName(parsedDate);
  const bengaliDateString = formatBengaliDate(parsedDate);

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-neutral-900 border border-blue-900/40 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Controls Bar (hidden during print) */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              প্রিন্ট প্রিভিউ · MRT REGULAR KHATA
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerPrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>এখনই প্রিন্ট করুন (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet (white background for realistic paper representation and print accuracy) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-950/50 flex justify-center">
          <div 
            id="printable-khata-area"
            className={`w-full bg-white text-black p-8 sm:p-10 shadow-2xl rounded-sm print:shadow-none print:m-0 print:p-0 ${
              paperSize === 'pos' ? 'max-w-[420px] text-xs' : 'max-w-[800px]'
            }`}
          >
            {/* Header: Bismillah */}
            <div className="text-center mb-4 border-b-2 border-black pb-3">
              <div className="text-xl sm:text-2xl font-bold font-serif tracking-widest text-black">
                বিসমিল্লাহির রাহমানির রাহীম
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-blue-900 mt-1">
                MRT REGULAR KHATA
              </h1>
              <div className="text-sm font-bold text-neutral-800">
                {currentUser.name}
              </div>
              <div className="text-xs text-neutral-600 font-mono">
                মোবাইল: {currentUser.phone} · দৈনন্দিন ব্যবসার টালি খাতা
              </div>
            </div>

            {/* Date & Day header */}
            <div className="flex justify-between items-center text-sm font-bold border-b border-black pb-2 mb-4">
              <div>
                আজকে কি বার : <span className="underline decoration-1">{dayName}</span>
              </div>
              <div>
                তারিখ : <span className="underline decoration-1">{bengaliDateString}</span>
              </div>
            </div>

            {/* Accounting Table */}
            <table className="w-full text-left border-collapse border border-black text-xs sm:text-sm mb-6">
              <thead>
                <tr className="bg-neutral-100 text-black border-b border-black font-bold">
                  <th className="border border-black py-2 px-2 text-center w-12">নং</th>
                  <th className="border border-black py-2 px-3">হিসাবের বিবরণ</th>
                  <th className="border border-black py-2 px-2 text-right">বিক্রয়</th>
                  <th className="border border-black py-2 px-2 text-right">জমা</th>
                  <th className="border border-black py-2 px-2 text-right">ফেরত</th>
                  <th className="border border-black py-2 px-2 text-right">খরচ</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-neutral-500 italic">
                      এই তারিখে কোনো হিসাব লিপিবদ্ধ হয়নি
                    </td>
                  </tr>
                ) : (
                  entries.map((item) => (
                    <tr key={item.id} className="border-b border-neutral-300">
                      <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">
                        {useBengaliDigits ? toBengaliNumber(item.sl) : item.sl}
                      </td>
                      <td className="border border-black py-1.5 px-3 font-medium">
                        {item.description}
                      </td>
                      <td className="border border-black py-1.5 px-2 text-right font-mono tabular-nums">
                        {item.sale > 0 ? (useBengaliDigits ? toBengaliNumber(item.sale.toFixed(2)) : item.sale.toFixed(2)) : '—'}
                      </td>
                      <td className="border border-black py-1.5 px-2 text-right font-mono font-bold tabular-nums text-black">
                        {item.deposit > 0 ? (useBengaliDigits ? toBengaliNumber(item.deposit.toFixed(2)) : item.deposit.toFixed(2)) : '—'}
                      </td>
                      <td className="border border-black py-1.5 px-2 text-right font-mono tabular-nums">
                        {item.returnAmount > 0 ? (useBengaliDigits ? toBengaliNumber(item.returnAmount.toFixed(2)) : item.returnAmount.toFixed(2)) : '—'}
                      </td>
                      <td className="border border-black py-1.5 px-2 text-right font-mono tabular-nums">
                        {item.expense > 0 ? (useBengaliDigits ? toBengaliNumber(item.expense.toFixed(2)) : item.expense.toFixed(2)) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Grand Total Row */}
              <tfoot>
                <tr className="bg-neutral-100 font-bold border-t-2 border-black text-black">
                  <td colSpan={2} className="border border-black py-2 px-3 text-right">
                    সর্বমোট হিসাব (Total):
                  </td>
                  <td className="border border-black py-2 px-2 text-right font-mono">
                    {useBengaliDigits ? toBengaliNumber(summary.totalSale.toFixed(2)) : summary.totalSale.toFixed(2)}
                  </td>
                  <td className="border border-black py-2 px-2 text-right font-mono">
                    {useBengaliDigits ? toBengaliNumber(summary.totalDeposit.toFixed(2)) : summary.totalDeposit.toFixed(2)}
                  </td>
                  <td className="border border-black py-2 px-2 text-right font-mono">
                    {useBengaliDigits ? toBengaliNumber(summary.totalReturn.toFixed(2)) : summary.totalReturn.toFixed(2)}
                  </td>
                  <td className="border border-black py-2 px-2 text-right font-mono">
                    {useBengaliDigits ? toBengaliNumber(summary.totalExpense.toFixed(2)) : summary.totalExpense.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Net Cash Statement */}
            <div className="border border-black p-3 bg-neutral-50 mb-8 flex justify-between items-center text-sm">
              <div>
                <span className="font-bold">আজকের দিনশেষে নীট ক্যাশ জমা : </span>
                <span className="text-xs text-neutral-600">(মোট জমা - খরচ - ফেরত)</span>
              </div>
              <div className="text-base font-bold font-mono">
                {formatTaka(summary.netCash, useBengaliDigits)}
              </div>
            </div>

            {/* Signature fields */}
            <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs font-semibold text-neutral-700">
              <div>
                <div className="border-t border-dashed border-black w-40 mx-auto mb-1" />
                <span>ক্যাশিয়ার / হিসাবকারীর স্বাক্ষর</span>
              </div>
              <div>
                <div className="border-t border-dashed border-black w-40 mx-auto mb-1" />
                <span>স্বত্বাধিকারীর স্বাক্ষর</span>
              </div>
            </div>

            {/* Print footer note */}
            <div className="text-[10px] text-neutral-400 text-center mt-8 pt-2 border-t border-neutral-200">
              মুদ্রণ সময়: {new Date().toLocaleString()} · প্রস্তুতকারক: MRT REGULAR KHATA Software
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
