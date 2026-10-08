import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  X, 
  AlertTriangle, 
  FileSpreadsheet, 
  Database,
  Lock,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { 
  signInWithGoogleDrive, 
  signOutGoogleDrive, 
  getDriveAccessToken, 
  listKhataBackupsFromDrive, 
  uploadBackupToGoogleDrive, 
  deleteFileFromGoogleDrive,
  DriveFileItem
} from '../services/googleDrive';
import { User as FirebaseUser } from 'firebase/auth';
import { KhataEntry, DaySummary, UserProfile } from '../types';
import { formatBengaliDate } from '../utils/bengali';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  currentDate: string;
  entries: KhataEntry[];
  summary: DaySummary;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentDate,
  entries,
  summary
}) => {
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(!!getDriveAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Destructive delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && isConnected) {
      loadFiles();
    }
  }, [isOpen, isConnected]);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const data = await listKhataBackupsFromDrive();
      setFiles(data);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('কানেক্ট করা নেই') || err.message?.includes('401')) {
        setIsConnected(false);
      }
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleConnect = async () => {
    setIsAuthenticating(true);
    setStatusMsg(null);
    try {
      const res = await signInWithGoogleDrive();
      setGoogleUser(res.user);
      setIsConnected(true);
      setStatusMsg({ type: 'success', text: `Google Drive সফলভাবে সংযুক্ত হয়েছে (${res.user.email})` });
      await loadFiles();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Google Drive সংযোগে ত্রুটি হয়েছে' });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = async () => {
    await signOutGoogleDrive();
    setIsConnected(false);
    setGoogleUser(null);
    setFiles([]);
    setStatusMsg({ type: 'success', text: 'Google Drive সংযোগ বিচ্ছিন্ন করা হয়েছে' });
  };

  // Upload today's CSV to Google Drive
  const handleUploadTodayCSV = async () => {
    setUploading(true);
    setStatusMsg(null);
    try {
      let csvContent = '\uFEFF'; // UTF-8 BOM for Bengali in Google Sheets & Excel
      csvContent += 'MRT REGULAR KHATA - দৈনন্দিন হিসাবের খাতা (Google Drive Cloud Backup)\n';
      csvContent += `স্বত্বাধিকারী:,${currentUser.name},মোবাইল:,${currentUser.phone},তারিখ:,${currentDate}\n\n`;
      csvContent += 'ক্রমিক নং,বিবরণ,বিক্রয়,জমা,ফেরত,খরচ,তারিখ,সময়\n';

      entries.forEach((e) => {
        const time = new Date(e.createdAt).toLocaleTimeString();
        const safeDesc = `"${e.description.replace(/"/g, '""')}"`;
        csvContent += `${e.sl},${safeDesc},${e.sale},${e.deposit},${e.returnAmount},${e.expense},${e.date},${time}\n`;
      });

      csvContent += `\nমোট:,,${summary.totalSale},${summary.totalDeposit},${summary.totalReturn},${summary.totalExpense}\n`;
      csvContent += `নীট ক্যাশ (জমা - খরচ - ফেরত):,${summary.netCash}\n`;

      const fileName = `MRT_Khata_${currentDate}_${currentUser.phone}.csv`;
      const uploaded = await uploadBackupToGoogleDrive(fileName, csvContent, 'text/csv');

      setStatusMsg({ 
        type: 'success', 
        text: `আজকের হিসাব সফলভাবে Google Drive-এ আপলোড হয়েছে: "${uploaded.name}"` 
      });
      await loadFiles();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'ড্রাইভে আপলোড ব্যর্থ হয়েছে' });
    } finally {
      setUploading(false);
    }
  };

  // Upload full JSON backup
  const handleUploadFullJson = async () => {
    setUploading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/backup/export', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('mrt_khata_token')}`
        }
      });
      const jsonData = await res.text();
      const fileName = `MRT_Khata_FullBackup_${new Date().toISOString().split('T')[0]}_${currentUser.phone}.json`;
      
      const uploaded = await uploadBackupToGoogleDrive(fileName, jsonData, 'application/json');
      setStatusMsg({ 
        type: 'success', 
        text: `সম্পূর্ণ ডাটাবেজ ব্যাকআপ Google Drive-এ সেভ হয়েছে: "${uploaded.name}"` 
      });
      await loadFiles();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'JSON ব্যাকআপ আপলোড ব্যর্থ' });
    } finally {
      setUploading(false);
    }
  };

  // Perform destructive delete with confirmation
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFileFromGoogleDrive(fileToDelete.id);
      setStatusMsg({ type: 'success', text: `"${fileToDelete.name}" Google Drive থেকে মুছে ফেলা হয়েছে` });
      setFileToDelete(null);
      await loadFiles();
    } catch (err: any) {
      alert(err.message || 'ফাইল মুছতে ব্যর্থ');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0b101f] border border-blue-600/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Google Drive ক্লাউড ব্যাকআপ ও সিঙ্ক</span>
              </h3>
              <p className="text-xs text-slate-400">
                আপনার ব্যবসার হিসাব সরাসরি আপনার নিজস্ব Google Drive-এ নিরাপদে সংরক্ষণ করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Message */}
          {statusMsg && (
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
              statusMsg.type === 'success' 
                ? 'bg-blue-950/60 border border-blue-600/60 text-blue-200' 
                : 'bg-red-950/50 border border-red-800/60 text-red-300'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="flex-1">{statusMsg.text}</span>
            </div>
          )}

          {/* Connect / Auth State Card */}
          <div className="p-5 rounded-xl bg-black/60 border border-neutral-800">
            {!isConnected ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Google Drive কানেক্ট করা নেই
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                    আপনার গুগল ড্রাইভ যুক্ত করলে আপনি ১-ক্লিকে দৈনন্দিন হিসাব ও পূর্ণাঙ্গ ডাটাবেজ ব্যাকআপ আপলোড এবং পর্যবেক্ষণ করতে পারবেন।
                  </p>
                </div>

                {/* Google Sign In Button Styled Per Guidelines */}
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isAuthenticating}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs shadow-md flex items-center gap-2.5 cursor-pointer transition-all active:scale-95 shrink-0 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{isAuthenticating ? 'কানেক্ট হচ্ছে...' : 'Sign in with Google'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 font-bold flex items-center justify-center font-mono">
                    G
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Google Drive সংযুক্ত</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {googleUser?.email || 'Active Session Token'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadFiles}
                    disabled={loadingFiles}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                    title="রিফ্রেশ করুন"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingFiles ? 'animate-spin text-blue-400' : ''}`} />
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-white bg-red-950/30 hover:bg-red-600/80 border border-red-900/40 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ডিসকানেক্ট</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cloud Upload Actions (Only active if connected) */}
          {isConnected && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-400" />
                <span>তাত্ক্ষণিক ক্লাউড আপলোড অপশন</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleUploadTodayCSV}
                  disabled={uploading}
                  className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-black border border-blue-900/50 hover:border-blue-500/80 text-left transition-all cursor-pointer group disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>আজকের হিসাব ড্রাইভে পাঠান (CSV)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    তারিখ: {formatBengaliDate(currentDate)} · Google Sheets-এ সরাসরি খোলা যাবে।
                  </p>
                </button>

                <button
                  onClick={handleUploadFullJson}
                  disabled={uploading}
                  className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-black border border-blue-900/50 hover:border-blue-500/80 text-left transition-all cursor-pointer group disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                    <Database className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ (JSON)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    দোকানের সকল পুরোনো ও নতুন হিসাব সহ সম্পূর্ণ ডাটাবেজ ক্লাউডে ব্যাকআপ।
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Drive Backups List */}
          {isConnected && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-400" />
                  <span>Google Drive-এ সংরক্ষিত ফাইলসমূহ ({files.length} টি)</span>
                </div>
                <span className="text-[11px] text-slate-500">ফোল্ডার: MRT Regular Khata Backups</span>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-black/40 overflow-hidden">
                {loadingFiles ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>ফাইল লোড হচ্ছে...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    গুগল ড্রাইভে এখনও কোনো ব্যাকআপ ফাইল পাওয়া যায়নি। উপরের বাটন দিয়ে প্রথম ব্যাকআপ আপলোড করুন।
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-900 max-h-60 overflow-y-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 hover:bg-white/[0.02] flex items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                            {file.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            আপলোড: {new Date(file.modifiedTime).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-blue-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
                              title="Google Drive-এ ফাইলটি খুলুন"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                            title="Google Drive থেকে ফাইলটি মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-neutral-800 flex items-center justify-between text-xs text-slate-400">
          <span>নিরাপত্তা: ফাইলসমূহ আপনার ব্যক্তিগত Google Cloud Storage অ্যাকাউন্টে সংরক্ষিত থাকে।</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* Mandatory Destructive Operation Confirmation Dialog */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101f] border border-red-800/80 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              Google Drive থেকে ফাইল মুছবেন?
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              আপনি কি নিশ্চিত যে আপনার Google Drive থেকে নিম্নলিখিত ফাইলটি মুছে ফেলতে চান?
            </p>
            <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800 text-xs font-mono text-white mb-6 truncate">
              {fileToDelete.name}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-800 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteFile}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, ড্রাইভ থেকে মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
