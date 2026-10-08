import { KhataEntry, UserProfile, DaySummary, HistoryDayItem, DashboardStats } from '../types';

const TOKEN_KEY = 'mrt_khata_token';
const USER_KEY = 'mrt_khata_user';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: UserProfile): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    authStorage.clear();
    // Emit logout event
    window.dispatchEvent(new CustomEvent('mrt_auth_expired'));
  }
  
  return response;
}

export const api = {
  async register(name: string, phone: string, pin: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, pin })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'একাউন্ট তৈরিতে ত্রুটি হয়েছে');
    }
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    return data;
  },

  async login(pin: string, phone?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, phone })
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'লগইন ব্যর্থ হয়েছে');
      err.ambiguous = data.ambiguous;
      err.accounts = data.accounts;
      throw err;
    }
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    return data;
  },

  async getRecentUsers(): Promise<{ name: string; phone: string; maskedPhone: string }[]> {
    try {
      const res = await fetch('/api/auth/recent-users');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const res = await fetchWithAuth('/api/auth/me');
    if (!res.ok) return null;
    const user = await res.json();
    authStorage.setUser(user);
    return user;
  },

  async logout() {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout error', e);
    } finally {
      authStorage.clear();
    }
  },

  async getEntries(date?: string): Promise<{ entries: KhataEntry[]; summary: DaySummary }> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await fetchWithAuth(`/api/entries${query}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'হিসাব লোড করতে ব্যর্থ হয়েছে');
    }
    return res.json();
  },

  async addEntry(payload: {
    date: string;
    description: string;
    sale: number;
    deposit: number;
    returnAmount: number;
    expense: number;
  }): Promise<{ success: boolean; entry: KhataEntry }> {
    const res = await fetchWithAuth('/api/entries', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'নতুন হিসাব সংরক্ষণ করতে ব্যর্থ');
    }
    return data;
  },

  async updateEntry(id: string, payload: Partial<KhataEntry>): Promise<{ success: boolean; entry: KhataEntry }> {
    const res = await fetchWithAuth(`/api/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'হিসাব আপডেট করতে ব্যর্থ');
    }
    return data;
  },

  async deleteEntry(id: string): Promise<boolean> {
    const res = await fetchWithAuth(`/api/entries/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'হিসাব মুছতে ব্যর্থ');
    }
    return true;
  },

  async getHistory(): Promise<HistoryDayItem[]> {
    const res = await fetchWithAuth('/api/history');
    if (!res.ok) throw new Error('ইতিহাস লোড করতে ব্যর্থ');
    return res.json();
  },

  async getDashboardStats(date?: string): Promise<DashboardStats> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await fetchWithAuth(`/api/stats/dashboard${query}`);
    if (!res.ok) throw new Error('পরিসংখ্যান লোড করতে ব্যর্থ');
    return res.json();
  },

  async searchEntries(query: string): Promise<KhataEntry[]> {
    const res = await fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('অনুসন্ধান ব্যর্থ হয়েছে');
    return res.json();
  },

  async getNotificationAudit(): Promise<any[]> {
    const res = await fetchWithAuth('/api/notifications');
    if (!res.ok) return [];
    return res.json();
  },

  async getAdminOverview(): Promise<any> {
    const res = await fetchWithAuth('/api/admin/overview');
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'এডমিন ডেটা লোড ব্যর্থ');
    }
    return res.json();
  },

  async resetUserPin(targetUserId: string, newPin: string): Promise<any> {
    const res = await fetchWithAuth('/api/admin/reset-pin', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, newPin })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'PIN রিসেট ব্যর্থ');
    }
    return data;
  },

  async deleteUser(userId: string): Promise<any> {
    const res = await fetchWithAuth(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'ইউজার মুছতে ব্যর্থ');
    }
    return data;
  }
};
