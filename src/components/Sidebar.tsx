import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Search, 
  UserCheck, 
  Settings, 
  LogOut,
  Building2,
  CalendarCheck,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab = 'dashboard' | 'khata' | 'history' | 'search' | 'account' | 'settings' | 'admin';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  todayCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  todayCount = 0
}) => {
  const isAdmin = currentUser.role === 'admin';

  const navItems: { id: NavTab; label: string; subLabel: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subLabel: 'সার্বিক চিত্র ও পরিসংখ্যান',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'khata',
      label: 'MRT Regular Khata',
      subLabel: 'দৈনন্দিন টালি খাতা',
      icon: <BookOpen className="w-5 h-5 text-blue-400" />,
      badge: todayCount > 0 ? `${todayCount} এন্ট্রি` : undefined
    },
    {
      id: 'history',
      label: 'হিসাবের ইতিহাস',
      subLabel: 'পূর্ববর্তী দিনের খাতা',
      icon: <History className="w-5 h-5" />
    },
    {
      id: 'search',
      label: 'অনুসন্ধান (Search)',
      subLabel: 'নাম, টাকা বা তারিখ খুঁজুন',
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'account',
      label: 'Account & Backup',
      subLabel: 'প্রোফাইল ও নোটিফিকেশন',
      icon: <UserCheck className="w-5 h-5" />
    },
    {
      id: 'settings',
      label: 'Settings',
      subLabel: 'ভাষা, সংখ্যা ও প্রিন্ট অপশন',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'এডমিন প্যানেল',
      subLabel: 'কন্ট্রোল ও ইউজার ম্যানেজমেন্ট',
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      badge: 'PIN: 111111'
    });
  }

  return (
    <aside className="w-72 h-screen bg-[#070b14] border-r border-blue-950/40 flex flex-col shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-blue-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white leading-tight uppercase font-sans">
              MRT REGULAR KHATA
            </div>
            <div className="text-[11px] text-blue-400 font-medium">
              Daily Business Accounting
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          মূল মেনু
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
                  {item.icon}
                </span>
                <div className="truncate">
                  <div className="text-sm leading-snug truncate">{item.label}</div>
                  <div className={`text-[11px] truncate ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                    {item.subLabel}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-blue-800 text-blue-100' : 'bg-blue-950 text-blue-300 border border-blue-800/40'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info & Logout at bottom */}
      <div className="p-3 border-t border-blue-950/40 bg-black/40">
        <div className="p-3 rounded-xl bg-[#0d1424] border border-blue-900/30 mb-2">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
              {isAdmin ? 'সুপার এডমিন' : 'সক্রিয় একাউন্ট'}
            </span>
            {isAdmin && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono font-bold">
                PIN: 111111
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-white truncate">
            {currentUser.name}
          </div>
          <div className="text-xs font-mono text-slate-400 truncate">
            {currentUser.phone}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-red-400 hover:text-white bg-red-950/20 hover:bg-red-600/80 border border-red-900/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>লগআউট (Logout)</span>
        </button>
      </div>
    </aside>
  );
};
