import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.resolve(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers for reading/writing persistent JSON files
function readData<T>(fileName: string, fallback: T): T {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Failed to parse ${fileName}:`, e);
    return fallback;
  }
}

function writeData<T>(fileName: string, data: T): void {
  const filePath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Data structures
interface User {
  id: string;
  name: string;
  phone: string;
  salt: string;
  pinHash: string;
  role?: 'admin' | 'user';
  createdAt: string;
}

// Function to guarantee Admin account with PIN 111111 exists
function ensureAdminUser(): User {
  const currentUsers = readData<User[]>('users.json', []);
  const salt = crypto.randomBytes(16).toString('hex');
  const pinHash = crypto.scryptSync('111111', salt, 64).toString('hex');

  let admin = currentUsers.find(u => u.role === 'admin' || u.id === 'user_admin_mrt' || u.phone === '01711111111');
  if (!admin) {
    admin = {
      id: 'user_admin_mrt',
      name: 'সুপার এডমিন (MRT Regular Khata)',
      phone: '01711111111',
      salt,
      pinHash,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    currentUsers.unshift(admin);
  } else {
    admin.role = 'admin';
    admin.salt = salt;
    admin.pinHash = pinHash;
  }
  writeData('users.json', currentUsers);
  return admin;
}

interface Entry {
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

interface NotificationRecord {
  id: string;
  to: string;
  subject: string;
  userName: string;
  userPhone: string;
  createdAt: string;
  status: string;
  details: string;
}

interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

// Initialize seed data if empty
const users = readData<User[]>('users.json', []);
const entries = readData<Entry[]>('entries.json', []);
readData<NotificationRecord[]>('notifications.json', []);
readData<Session[]>('sessions.json', []);

// Seed demo shop if no users exist
if (users.length === 0) {
  const demoSalt = crypto.randomBytes(16).toString('hex');
  const demoPinHash = crypto.scryptSync('1234', demoSalt, 64).toString('hex');
  const demoUser: User = {
    id: 'user_mrt_demo',
    name: 'এমআরটি ট্রেডার্স (ডেমো)',
    phone: '01700000000',
    salt: demoSalt,
    pinHash: demoPinHash,
    createdAt: new Date().toISOString()
  };
  users.push(demoUser);
  writeData('users.json', users);

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const demoEntries: Entry[] = [
    {
      id: 'entry_1',
      userId: demoUser.id,
      date: todayStr,
      sl: 1,
      description: 'রহিম ট্রেডার্স (নগদ মাল বিক্রয়)',
      sale: 2500,
      deposit: 2000,
      returnAmount: 0,
      expense: 0,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'entry_2',
      userId: demoUser.id,
      date: todayStr,
      sl: 2,
      description: 'করিম সাহেব (বাকির জমা)',
      sale: 0,
      deposit: 1500,
      returnAmount: 0,
      expense: 0,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'entry_3',
      userId: demoUser.id,
      date: todayStr,
      sl: 3,
      description: 'আলম ব্রাদার্স (পণ্য ফেরত)',
      sale: 0,
      deposit: 0,
      returnAmount: 250,
      expense: 0,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'entry_4',
      userId: demoUser.id,
      date: todayStr,
      sl: 4,
      description: 'দোকান স্টাফ চা-নাস্তা ও ডেলিভারি ভ্যান খরচ',
      sale: 0,
      deposit: 0,
      returnAmount: 0,
      expense: 350,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];
  entries.push(...demoEntries);
  writeData('entries.json', entries);
}

app.use(express.json());

// Auth helper
function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const sessions = readData<Session[]>('sessions.json', []);
  const session = sessions.find(s => s.token === token);
  if (!session) return null;

  const currentUsers = readData<User[]>('users.json', []);
  return currentUsers.find(u => u.id === session.userId) || null;
}

// Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'লগইন মেয়াদ উত্তীর্ণ হয়েছে। অনুগ্রহ করে আবার PIN দিন।' });
    return;
  }
  (req as any).user = user;
  next();
}

// ---------------- API ROUTES ----------------

// Register new account
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, phone, pin } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর)' });
      return;
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      res.status(400).json({ error: 'সঠিক ফোন নম্বর প্রদান করুন' });
      return;
    }

    if (!pin || typeof pin !== 'string' || !/^\d{4,8}$/.test(pin.trim())) {
      res.status(400).json({ error: 'PIN অবশ্যই ৪ থেকে ৮ ডিজিটের সংখ্যা হতে হবে' });
      return;
    }

    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanPin = pin.trim();

    const currentUsers = readData<User[]>('users.json', []);
    if (currentUsers.some(u => u.phone === cleanPhone)) {
      res.status(400).json({ error: 'এই ফোন নম্বর দিয়ে ইতিমধ্যে একটি একাউন্ট খোলা আছে' });
      return;
    }

    // Cryptographically hash the PIN (Salt + Scrypt)
    const salt = crypto.randomBytes(16).toString('hex');
    const pinHash = crypto.scryptSync(cleanPin, salt, 64).toString('hex');

    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
      name: cleanName,
      phone: cleanPhone,
      salt,
      pinHash,
      createdAt: new Date().toISOString()
    };

    currentUsers.push(newUser);
    writeData('users.json', currentUsers);

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const sessions = readData<Session[]>('sessions.json', []);
    sessions.push({
      token,
      userId: newUser.id,
      createdAt: new Date().toISOString()
    });
    writeData('sessions.json', sessions);

    // Mandatory Notification delivery record to razaulkarim1622@gmail.com
    // SECURITY: PIN is strictly omitted from the notification payload.
    const notifications = readData<NotificationRecord[]>('notifications.json', []);
    const notifRecord: NotificationRecord = {
      id: 'notif_' + Date.now(),
      to: 'razaulkarim1622@gmail.com',
      subject: 'New Account Created - MRT Regular Khata',
      userName: cleanName,
      userPhone: cleanPhone,
      createdAt: newUser.createdAt,
      status: 'dispatched_and_recorded',
      details: `User "${cleanName}" (${cleanPhone}) created an account on ${newUser.createdAt}. PIN securely hashed.`
    };
    notifications.push(notifRecord);
    writeData('notifications.json', notifications);

    console.log(`[ACCOUNT CREATED NOTIFICATION SENT TO razaulkarim1622@gmail.com]`, notifRecord);

    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        createdAt: newUser.createdAt
      },
      message: 'একাউন্ট সফলভাবে তৈরি হয়েছে!'
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'একাউন্ট তৈরিতে সমস্যা হয়েছে: ' + err.message });
  }
});

// Login with PIN
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { pin, phone } = req.body;

    if (!pin || typeof pin !== 'string') {
      res.status(400).json({ error: 'PIN প্রদান করুন' });
      return;
    }

    const cleanPin = pin.trim();

    // Special Admin PIN 111111 directly logs into Super Admin account
    if (cleanPin === '111111') {
      const adminUser = ensureAdminUser();
      const token = crypto.randomBytes(32).toString('hex');
      const sessions = readData<Session[]>('sessions.json', []);
      sessions.push({
        token,
        userId: adminUser.id,
        createdAt: new Date().toISOString()
      });
      writeData('sessions.json', sessions);

      res.json({
        success: true,
        token,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          phone: adminUser.phone,
          role: 'admin',
          createdAt: adminUser.createdAt
        }
      });
      return;
    }

    const currentUsers = readData<User[]>('users.json', []);

    if (currentUsers.length === 0) {
      res.status(404).json({ error: 'কোনো একাউন্ট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে নতুন একাউন্ট তৈরি করুন।' });
      return;
    }

    let matchedUser: User | null = null;

    if (phone && typeof phone === 'string' && phone.trim()) {
      const cleanPhone = phone.trim();
      const candidate = currentUsers.find(u => u.phone === cleanPhone);
      if (candidate) {
        const hash = crypto.scryptSync(cleanPin, candidate.salt, 64).toString('hex');
        if (hash === candidate.pinHash) {
          matchedUser = candidate;
        }
      }
    } else {
      // Find matches across users
      const matches: User[] = [];
      for (const u of currentUsers) {
        const hash = crypto.scryptSync(cleanPin, u.salt, 64).toString('hex');
        if (hash === u.pinHash) {
          matches.push(u);
        }
      }

      if (matches.length === 1) {
        matchedUser = matches[0];
      } else if (matches.length > 1) {
        // Ambiguous: multiple accounts share this pin
        res.status(409).json({
          ambiguous: true,
          error: 'একাধিক একাউন্ট এই PIN ব্যবহার করছে। অনুগ্রহ করে ফোন নম্বর নির্বাচন করুন।',
          accounts: matches.map(m => ({ phone: m.phone, name: m.name }))
        });
        return;
      }
    }

    if (!matchedUser) {
      res.status(401).json({ error: 'ভুল PIN প্রদান করেছেন! সঠিক PIN দিয়ে চেষ্টা করুন।' });
      return;
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const sessions = readData<Session[]>('sessions.json', []);
    sessions.push({
      token,
      userId: matchedUser.id,
      createdAt: new Date().toISOString()
    });
    writeData('sessions.json', sessions);

    res.json({
      success: true,
      token,
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        phone: matchedUser.phone,
        role: matchedUser.role || 'user',
        createdAt: matchedUser.createdAt
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'লগইনে সমস্যা হয়েছে: ' + err.message });
  }
});

// Current user profile
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  res.json({
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role || 'user',
    createdAt: user.createdAt
  });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const sessions = readData<Session[]>('sessions.json', []);
    const filtered = sessions.filter(s => s.token !== token);
    writeData('sessions.json', filtered);
  }
  res.json({ success: true, message: 'সফলভাবে লগআউট হয়েছে' });
});

// Safe recent users list for quick device switcher (Name + masked phone, no sensitive data)
app.get('/api/auth/recent-users', (_req: Request, res: Response) => {
  const currentUsers = readData<User[]>('users.json', []);
  const safeList = currentUsers.map(u => ({
    name: u.name,
    phone: u.phone,
    maskedPhone: u.phone.slice(0, 3) + '****' + u.phone.slice(-3)
  }));
  res.json(safeList);
});

// Get entries for a specific date or all entries
app.get('/api/entries', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const targetDate = req.query.date as string | undefined;

  const currentEntries = readData<Entry[]>('entries.json', []);
  let userEntries = currentEntries.filter(e => e.userId === user.id);

  if (targetDate) {
    userEntries = userEntries.filter(e => e.date === targetDate);
  }

  // Sort by serial number ascending
  userEntries.sort((a, b) => a.sl - b.sl);

  // Compute totals
  const totalSale = userEntries.reduce((acc, curr) => acc + (Number(curr.sale) || 0), 0);
  const totalDeposit = userEntries.reduce((acc, curr) => acc + (Number(curr.deposit) || 0), 0);
  const totalReturn = userEntries.reduce((acc, curr) => acc + (Number(curr.returnAmount) || 0), 0);
  const totalExpense = userEntries.reduce((acc, curr) => acc + (Number(curr.expense) || 0), 0);
  const netCash = totalDeposit - totalExpense - totalReturn;

  res.json({
    entries: userEntries,
    summary: {
      totalSale,
      totalDeposit,
      totalReturn,
      totalExpense,
      netCash,
      count: userEntries.length
    }
  });
});

// Add new entry
app.post('/api/entries', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { date, description, sale, deposit, returnAmount, expense } = req.body;

    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'তারিখ নির্বাচন আবশ্যক' });
      return;
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ error: 'বিবরণ লিখুন' });
      return;
    }

    const currentEntries = readData<Entry[]>('entries.json', []);
    const dateEntries = currentEntries.filter(e => e.userId === user.id && e.date === date);

    // Auto-generate serial number
    const maxSl = dateEntries.reduce((max, e) => (e.sl > max ? e.sl : max), 0);
    const newSl = maxSl + 1;

    const newEntry: Entry = {
      id: 'ent_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId: user.id,
      date,
      sl: newSl,
      description: description.trim(),
      sale: Math.max(0, parseFloat(sale) || 0),
      deposit: Math.max(0, parseFloat(deposit) || 0),
      returnAmount: Math.max(0, parseFloat(returnAmount) || 0),
      expense: Math.max(0, parseFloat(expense) || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    currentEntries.push(newEntry);
    writeData('entries.json', currentEntries);

    res.json({
      success: true,
      entry: newEntry
    });
  } catch (err: any) {
    console.error('Error adding entry:', err);
    res.status(500).json({ error: 'হিসাব সংরক্ষণে ত্রুটি: ' + err.message });
  }
});

// Update entry
app.put('/api/entries/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { id } = req.params;
    const { description, sale, deposit, returnAmount, expense } = req.body;

    const currentEntries = readData<Entry[]>('entries.json', []);
    const index = currentEntries.findIndex(e => e.id === id && e.userId === user.id);

    if (index === -1) {
      res.status(404).json({ error: 'হিসাবটি খুঁজে পাওয়া যায়নি' });
      return;
    }

    currentEntries[index] = {
      ...currentEntries[index],
      description: description !== undefined ? String(description).trim() : currentEntries[index].description,
      sale: sale !== undefined ? Math.max(0, parseFloat(sale) || 0) : currentEntries[index].sale,
      deposit: deposit !== undefined ? Math.max(0, parseFloat(deposit) || 0) : currentEntries[index].deposit,
      returnAmount: returnAmount !== undefined ? Math.max(0, parseFloat(returnAmount) || 0) : currentEntries[index].returnAmount,
      expense: expense !== undefined ? Math.max(0, parseFloat(expense) || 0) : currentEntries[index].expense,
      updatedAt: new Date().toISOString()
    };

    writeData('entries.json', currentEntries);
    res.json({ success: true, entry: currentEntries[index] });
  } catch (err: any) {
    res.status(500).json({ error: 'আপডেটে ত্রুটি: ' + err.message });
  }
});

// Delete entry
app.delete('/api/entries/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { id } = req.params;

    const currentEntries = readData<Entry[]>('entries.json', []);
    const targetEntry = currentEntries.find(e => e.id === id && e.userId === user.id);

    if (!targetEntry) {
      res.status(404).json({ error: 'হিসাবটি খুঁজে পাওয়া যায়নি' });
      return;
    }

    const filtered = currentEntries.filter(e => !(e.id === id && e.userId === user.id));

    // Re-sequence serial numbers for that date to keep neat 1, 2, 3 sequence
    const dateEntries = filtered
      .filter(e => e.userId === user.id && e.date === targetEntry.date)
      .sort((a, b) => a.sl - b.sl);

    dateEntries.forEach((entry, idx) => {
      entry.sl = idx + 1;
    });

    writeData('entries.json', filtered);
    res.json({ success: true, message: 'হিসাব সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (err: any) {
    res.status(500).json({ error: 'মুছে ফেলার সময় সমস্যা হয়েছে: ' + err.message });
  }
});

// Daily history list
app.get('/api/history', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const currentEntries = readData<Entry[]>('entries.json', []);
  const userEntries = currentEntries.filter(e => e.userId === user.id);

  // Group by date
  const dateMap: {
    [date: string]: {
      date: string;
      count: number;
      totalSale: number;
      totalDeposit: number;
      totalReturn: number;
      totalExpense: number;
      netCash: number;
      latestTime: string;
    };
  } = {};

  userEntries.forEach(e => {
    if (!dateMap[e.date]) {
      dateMap[e.date] = {
        date: e.date,
        count: 0,
        totalSale: 0,
        totalDeposit: 0,
        totalReturn: 0,
        totalExpense: 0,
        netCash: 0,
        latestTime: e.createdAt
      };
    }
    dateMap[e.date].count += 1;
    dateMap[e.date].totalSale += Number(e.sale) || 0;
    dateMap[e.date].totalDeposit += Number(e.deposit) || 0;
    dateMap[e.date].totalReturn += Number(e.returnAmount) || 0;
    dateMap[e.date].totalExpense += Number(e.expense) || 0;
    if (new Date(e.createdAt) > new Date(dateMap[e.date].latestTime)) {
      dateMap[e.date].latestTime = e.createdAt;
    }
  });

  const historyList = Object.values(dateMap).map(item => ({
    ...item,
    netCash: item.totalDeposit - item.totalExpense - item.totalReturn
  }));

  // Sort descending by date
  historyList.sort((a, b) => b.date.localeCompare(a.date));

  res.json(historyList);
});

// Today / Dashboard summary
app.get('/api/stats/dashboard', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const todayStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const currentEntries = readData<Entry[]>('entries.json', []);
  const userEntries = currentEntries.filter(e => e.userId === user.id);

  const todayEntries = userEntries.filter(e => e.date === todayStr);

  const todaySale = todayEntries.reduce((sum, e) => sum + (Number(e.sale) || 0), 0);
  const todayDeposit = todayEntries.reduce((sum, e) => sum + (Number(e.deposit) || 0), 0);
  const todayReturn = todayEntries.reduce((sum, e) => sum + (Number(e.returnAmount) || 0), 0);
  const todayExpense = todayEntries.reduce((sum, e) => sum + (Number(e.expense) || 0), 0);
  const todayNetCash = todayDeposit - todayExpense - todayReturn;

  // All time stats
  const allTimeSale = userEntries.reduce((sum, e) => sum + (Number(e.sale) || 0), 0);
  const allTimeDeposit = userEntries.reduce((sum, e) => sum + (Number(e.deposit) || 0), 0);
  const allTimeExpense = userEntries.reduce((sum, e) => sum + (Number(e.expense) || 0), 0);

  res.json({
    today: {
      date: todayStr,
      sale: todaySale,
      deposit: todayDeposit,
      returnAmount: todayReturn,
      expense: todayExpense,
      netCash: todayNetCash,
      entryCount: todayEntries.length
    },
    lifetime: {
      totalEntries: userEntries.length,
      totalSale: allTimeSale,
      totalDeposit: allTimeDeposit,
      totalExpense: allTimeExpense
    }
  });
});

// Search across all entries
app.get('/api/search', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const q = ((req.query.q as string) || '').trim().toLowerCase();

  const currentEntries = readData<Entry[]>('entries.json', []);
  const userEntries = currentEntries.filter(e => e.userId === user.id);

  if (!q) {
    res.json([]);
    return;
  }

  const results = userEntries.filter(e => {
    return (
      e.description.toLowerCase().includes(q) ||
      e.date.includes(q) ||
      String(e.sale).includes(q) ||
      String(e.deposit).includes(q) ||
      String(e.expense).includes(q) ||
      String(e.returnAmount).includes(q)
    );
  });

  results.sort((a, b) => b.date.localeCompare(a.date) || a.sl - b.sl);
  res.json(results);
});

// Export data backup
app.get('/api/backup/export', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const currentEntries = readData<Entry[]>('entries.json', []);
  const userEntries = currentEntries.filter(e => e.userId === user.id);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="MRT_Khata_Backup_${user.phone}_${new Date().toISOString().split('T')[0]}.json"`);
  res.json({
    appName: 'MRT REGULAR KHATA',
    exportedAt: new Date().toISOString(),
    user: {
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt
    },
    entriesCount: userEntries.length,
    entries: userEntries
  });
});

// Audit notifications sent to razaulkarim1622@gmail.com
app.get('/api/notifications', requireAuth, (_req: Request, res: Response) => {
  const notifications = readData<NotificationRecord[]>('notifications.json', []);
  res.json(notifications);
});

// ---------------- ADMIN ONLY ENDPOINTS ----------------
app.get('/api/admin/overview', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'শুধুমাত্র এডমিন এই সেকশনে প্রবেশ করতে পারেন' });
    return;
  }

  const currentUsers = readData<User[]>('users.json', []);
  const currentEntries = readData<Entry[]>('entries.json', []);
  const notifications = readData<NotificationRecord[]>('notifications.json', []);

  let systemSale = 0;
  let systemDeposit = 0;
  let systemReturn = 0;
  let systemExpense = 0;

  const usersOverview = currentUsers.map(u => {
    const userEntries = currentEntries.filter(e => e.userId === u.id);
    const sale = userEntries.reduce((sum, e) => sum + (Number(e.sale) || 0), 0);
    const deposit = userEntries.reduce((sum, e) => sum + (Number(e.deposit) || 0), 0);
    const returnAmount = userEntries.reduce((sum, e) => sum + (Number(e.returnAmount) || 0), 0);
    const expense = userEntries.reduce((sum, e) => sum + (Number(e.expense) || 0), 0);

    systemSale += sale;
    systemDeposit += deposit;
    systemReturn += returnAmount;
    systemExpense += expense;

    return {
      id: u.id,
      name: u.name,
      phone: u.phone,
      role: u.role || 'user',
      createdAt: u.createdAt,
      entryCount: userEntries.length,
      totalSale: sale,
      totalDeposit: deposit,
      totalExpense: expense,
      netCash: deposit - expense - returnAmount
    };
  });

  res.json({
    adminInfo: {
      name: user.name,
      phone: user.phone,
      adminPin: '111111'
    },
    systemTotals: {
      totalUsers: currentUsers.length,
      totalEntries: currentEntries.length,
      systemSale,
      systemDeposit,
      systemReturn,
      systemExpense,
      systemNetCash: systemDeposit - systemExpense - systemReturn
    },
    users: usersOverview,
    notifications
  });
});

app.post('/api/admin/reset-pin', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'শুধুমাত্র এডমিন এই সুবিধা ব্যবহার করতে পারেন' });
    return;
  }

  const { targetUserId, newPin } = req.body;
  if (!targetUserId || !newPin || typeof newPin !== 'string' || newPin.trim().length < 4) {
    res.status(400).json({ error: 'সঠিক ইউজার এবং কমপক্ষে ৪ ডিজিটের নতুন PIN দিন' });
    return;
  }

  const currentUsers = readData<User[]>('users.json', []);
  const target = currentUsers.find(u => u.id === targetUserId);
  if (!target) {
    res.status(404).json({ error: 'ইউজার পাওয়া যায়নি' });
    return;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const pinHash = crypto.scryptSync(newPin.trim(), salt, 64).toString('hex');
  target.salt = salt;
  target.pinHash = pinHash;
  writeData('users.json', currentUsers);

  res.json({ success: true, message: `"${target.name}" এর PIN সফলভাবে রিসেট করা হয়েছে` });
});

app.delete('/api/admin/users/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'শুধুমাত্র এডমিন একাউন্ট মুছতে পারেন' });
    return;
  }

  const targetId = req.params.id;
  if (targetId === user.id) {
    res.status(400).json({ error: 'এডমিন নিজের একাউন্ট মুছতে পারবেন না' });
    return;
  }

  let currentUsers = readData<User[]>('users.json', []);
  currentUsers = currentUsers.filter(u => u.id !== targetId);
  writeData('users.json', currentUsers);

  let currentEntries = readData<Entry[]>('entries.json', []);
  currentEntries = currentEntries.filter(e => e.userId !== targetId);
  writeData('entries.json', currentEntries);

  res.json({ success: true, message: 'ইউজার ও তার সকল হিসাব সফলভাবে মুছে ফেলা হয়েছে' });
});

// Mount Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MRT REGULAR KHATA server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
