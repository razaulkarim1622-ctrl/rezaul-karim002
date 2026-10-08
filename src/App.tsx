import React, { useState, useEffect, useCallback } from 'react';
import { api, authStorage } from './services/api';
import { KhataEntry, UserProfile, DaySummary, HistoryDayItem, DashboardStats } from './types';
import { getTodayDateString } from './utils/bengali';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { RegularKhataView } from './components/RegularKhataView';
import { HistoryView } from './components/HistoryView';
import { SearchView } from './components/SearchView';
import { AccountView } from './components/AccountView';
import { SettingsView } from './components/SettingsView';
import { PrintKhataModal } from './components/PrintKhataModal';
import { AdminPanelView } from './components/AdminPanelView';
import { GoogleDriveModal } from './components/GoogleDriveModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authStorage.getUser());
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());

  // Data states
  const [entries, setEntries] = useState<KhataEntry[]>([]);
  const [summary, setSummary] = useState<DaySummary>({
    totalSale: 0,
    totalDeposit: 0,
    totalReturn: 0,
    totalExpense: 0,
    netCash: 0,
    count: 0
  });
  const [historyList, setHistoryList] = useState<HistoryDayItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings
  const [useBengaliDigits, setUseBengaliDigits] = useState<boolean>(() => {
    return localStorage.getItem('mrt_bengali_digits') !== 'false';
  });
  const [printPaperSize, setPrintPaperSize] = useState<'a4' | 'pos'>(() => {
    return (localStorage.getItem('mrt_paper_size') as 'a4' | 'pos') || 'a4';
  });
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  // Check auth session on startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = authStorage.getToken();
      if (token) {
        try {
          const user = await api.getCurrentUser();
          if (user) {
            setCurrentUser(user);
          } else {
            setCurrentUser(null);
          }
        } catch {
          setCurrentUser(null);
        }
      }
      setIsInitializing(false);
    };

    checkAuth();

    // Listen for auth expiration
    const handleAuthExpired = () => {
      setCurrentUser(null);
    };
    window.addEventListener('mrt_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('mrt_auth_expired', handleAuthExpired);
  }, []);

  // Fetch data for the current user and active date
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsRefreshing(true);
    try {
      const [entriesData, histData, statsData] = await Promise.all([
        api.getEntries(currentDate),
        api.getHistory(),
        api.getDashboardStats(currentDate)
      ]);

      setEntries(entriesData.entries);
      setSummary(entriesData.summary);
      setHistoryList(histData);
      setDashboardStats(statsData);
    } catch (err) {
      console.error('Failed to load khata data', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentUser, currentDate]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, currentDate, loadData]);

  // Handlers for accounting entries
  const handleAddEntry = async (payload: {
    date: string;
    description: string;
    sale: number;
    deposit: number;
    returnAmount: number;
    expense: number;
  }) => {
    await api.addEntry(payload);
    await loadData();
  };

  const handleUpdateEntry = async (id: string, payload: Partial<KhataEntry>) => {
    await api.updateEntry(id, payload);
    await loadData();
  };

  const handleDeleteEntry = async (id: string) => {
    await api.deleteEntry(id);
    await loadData();
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleToggleBengaliDigits = (val: boolean) => {
    setUseBengaliDigits(val);
    localStorage.setItem('mrt_bengali_digits', String(val));
  };

  const handleChangePaperSize = (size: 'a4' | 'pos') => {
    setPrintPaperSize(size);
    localStorage.setItem('mrt_paper_size', size);
  };

  // Export Daily or All entries to CSV (with UTF-8 BOM for Microsoft Excel on PC)
  const handleExportCSV = () => {
    if (!currentUser) return;

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'MRT REGULAR KHATA - দৈনন্দিন হিসাবের খাতা\n';
    csvContent += `স্বত্বাধিকারী:,${currentUser.name},ফোন:,${currentUser.phone},তারিখ:,${currentDate}\n\n`;
    csvContent += 'ক্রমিক নং,বিবরণ,বিক্রয়,জমা,ফেরত,খরচ,তারিখ,সময়\n';

    entries.forEach((e) => {
      const time = new Date(e.createdAt).toLocaleTimeString();
      const safeDesc = `"${e.description.replace(/"/g, '""')}"`;
      csvContent += `${e.sl},${safeDesc},${e.sale},${e.deposit},${e.returnAmount},${e.expense},${e.date},${time}\n`;
    });

    csvContent += `\nমোট:,,${summary.totalSale},${summary.totalDeposit},${summary.totalReturn},${summary.totalExpense}\n`;
    csvContent += `নীট ক্যাশ (জমা - খরচ - ফেরত):,${summary.netCash}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MRT_Khata_${currentDate}_${currentUser.phone}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#050811] text-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-sm font-bold uppercase tracking-wider text-blue-300">
          MRT REGULAR KHATA চালু হচ্ছে...
        </div>
      </div>
    );
  }

  // If not logged in, render the Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  // Get active tab title & description
  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'ড্যাশবোর্ড (Dashboard)',
          subTitle: 'দৈনিক ব্যবসার সামগ্রিক পরিসংখ্যান ও লেনদেনের চিত্র'
        };
      case 'khata':
        return {
          title: 'MRT Regular Khata (দৈনন্দিন খাতা)',
          subTitle: 'ঐতিহ্যবাহী টালি খাতার ডিজিটাল হিসাব এন্ট্রি ও পর্যবেক্ষণ'
        };
      case 'history':
        return {
          title: 'হিসাবের ইতিহাস (Daily History)',
          subTitle: 'তারিখ অনুযায়ী পুরোনো হিসাবের তালিকা'
        };
      case 'search':
        return {
          title: 'হিসাব অনুসন্ধান (Search Entries)',
          subTitle: 'যেকোনো কাস্টমার নাম, পণ্যের বিবরণ বা টাকার অংক খুঁজুন'
        };
      case 'account':
        return {
          title: 'একাউন্ট ও ব্যাকআপ (Account & Backup)',
          subTitle: 'ইউজার প্রোফাইল, নিরাপত্তা অডিট ও ডাটা ব্যাকআপ'
        };
      case 'settings':
        return {
          title: 'সিস্টেম সেটিংস (Settings)',
          subTitle: 'ভাষা, সংখ্যা ও প্রিন্ট কনফিগারেশন'
        };
      case 'admin':
        return {
          title: 'এডমিন কন্ট্রোল প্যানেল (Super Admin)',
          subTitle: 'সকল দোকান, হিসাব এবং ব্যবহারকারী ম্যানেজমেন্ট (এডমিন পিন: 111111)'
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex h-screen bg-[#050811] text-white overflow-hidden font-sans">
      {/* Desktop Sidebar (Fixed left 288px) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        todayCount={dashboardStats?.today.entryCount || entries.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader
          title={headerInfo.title}
          subTitle={headerInfo.subTitle}
          onNewEntry={() => {
            setCurrentTab('khata');
          }}
          onPrint={() => setShowPrintModal(true)}
          onExport={handleExportCSV}
          onOpenGoogleDrive={() => setShowDriveModal(true)}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#060a16] to-[#04060d]">
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={dashboardStats}
              recentEntries={entries}
              currentUser={currentUser}
              onOpenKhata={() => setCurrentTab('khata')}
              onNewEntry={() => setCurrentTab('khata')}
              onViewHistory={() => setCurrentTab('history')}
              useBengaliDigits={useBengaliDigits}
            />
          )}

          {currentTab === 'khata' && (
            <RegularKhataView
              currentDate={currentDate}
              onDateChange={(newDate) => setCurrentDate(newDate)}
              entries={entries}
              summary={summary}
              onAddEntry={handleAddEntry}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
              onPrint={() => setShowPrintModal(true)}
              onExport={handleExportCSV}
              useBengaliDigits={useBengaliDigits}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              historyList={historyList}
              onSelectDate={(selectedDate) => {
                setCurrentDate(selectedDate);
                setCurrentTab('khata');
              }}
              useBengaliDigits={useBengaliDigits}
            />
          )}

          {currentTab === 'search' && (
            <SearchView
              onOpenDate={(selectedDate) => {
                setCurrentDate(selectedDate);
                setCurrentTab('khata');
              }}
              useBengaliDigits={useBengaliDigits}
            />
          )}

          {currentTab === 'account' && (
            <AccountView
              currentUser={currentUser}
              onExportCSV={handleExportCSV}
              onOpenGoogleDrive={() => setShowDriveModal(true)}
              useBengaliDigits={useBengaliDigits}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              useBengaliDigits={useBengaliDigits}
              onToggleBengaliDigits={handleToggleBengaliDigits}
              printPaperSize={printPaperSize}
              onChangePrintPaperSize={handleChangePaperSize}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPanelView
              useBengaliDigits={useBengaliDigits}
            />
          )}
        </main>
      </div>

      {/* 21. Dedicated Print Khata Modal */}
      {showPrintModal && (
        <PrintKhataModal
          currentDate={currentDate}
          entries={entries}
          summary={summary}
          currentUser={currentUser}
          onClose={() => setShowPrintModal(false)}
          useBengaliDigits={useBengaliDigits}
          paperSize={printPaperSize}
        />
      )}

      {/* Google Drive Cloud Backup & Sync Modal */}
      <GoogleDriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        currentUser={currentUser}
        currentDate={currentDate}
        entries={entries}
        summary={summary}
      />
    </div>
  );
}
