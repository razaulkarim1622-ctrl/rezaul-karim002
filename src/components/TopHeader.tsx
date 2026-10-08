import React from 'react';
import { 
  PlusCircle, 
  Printer, 
  Download, 
  Calendar, 
  Clock, 
  Sparkles, 
  RefreshCw,
  Cloud
} from 'lucide-react';
import { getBengaliDayName, formatBengaliDate } from '../utils/bengali';

interface TopHeaderProps {
  title: string;
  subTitle?: string;
  onNewEntry?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  onOpenGoogleDrive?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subTitle,
  onNewEntry,
  onPrint,
  onExport,
  onOpenGoogleDrive,
  onRefresh,
  isRefreshing
}) => {
  const now = new Date();
  const dayName = getBengaliDayName(now);
  const formattedDate = formatBengaliDate(now);

  return (
    <header className="h-16 px-6 bg-[#070b14]/90 border-b border-blue-950/40 backdrop-blur-md flex items-center justify-between shrink-0 select-none z-10">
      {/* Zone 1: Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {isRefreshing && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            )}
          </h2>
          {subTitle && (
            <div className="text-xs text-slate-400 font-medium">
              {subTitle}
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Live Bengali Day & Date Information */}
      <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-xl bg-blue-950/20 border border-blue-900/30 text-xs">
        <div className="flex items-center gap-2 text-blue-300 font-medium">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>আজকে : <strong className="text-white font-semibold">{dayName}</strong></span>
        </div>
        <span className="text-blue-950">|</span>
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium text-white">{formattedDate}</span>
        </div>
      </div>

      {/* Zone 3: Primary Desktop Action Affordances */}
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="রিফ্রেশ করুন"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        )}

        {onPrint && (
          <button
            onClick={onPrint}
            title="প্রিন্ট করুন (Print Khata)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>প্রিন্ট হিসাব</span>
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            title="এক্সপোর্ট (Excel/CSV)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>এক্সপোর্ট হিসাব</span>
          </button>
        )}

        {onOpenGoogleDrive && (
          <button
            onClick={onOpenGoogleDrive}
            title="Google Drive ব্যাকআপ ও সিঙ্ক"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-200 hover:text-white bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/40 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Drive</span>
          </button>
        )}

        {onNewEntry && (
          <button
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ নতুন হিসাব</span>
          </button>
        )}
      </div>
    </header>
  );
};
