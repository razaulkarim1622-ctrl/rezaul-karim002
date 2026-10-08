export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role?: 'admin' | 'user';
  createdAt: string;
}

export interface KhataEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  sl: number;
  description: string;
  sale: number;
  deposit: number;
  returnAmount: number;
  expense: number;
  createdAt: string;
  updatedAt: string;
}

export interface DaySummary {
  totalSale: number;
  totalDeposit: number;
  totalReturn: number;
  totalExpense: number;
  netCash: number;
  count: number;
}

export interface HistoryDayItem {
  date: string;
  count: number;
  totalSale: number;
  totalDeposit: number;
  totalReturn: number;
  totalExpense: number;
  netCash: number;
  latestTime: string;
}

export interface DashboardStats {
  today: {
    date: string;
    sale: number;
    deposit: number;
    returnAmount: number;
    expense: number;
    netCash: number;
    entryCount: number;
  };
  lifetime: {
    totalEntries: number;
    totalSale: number;
    totalDeposit: number;
    totalExpense: number;
  };
}
