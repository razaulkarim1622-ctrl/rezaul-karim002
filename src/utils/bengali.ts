const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const str = String(num);
  return str.replace(/[0-9]/g, digit => BENGALI_DIGITS[parseInt(digit, 10)]);
}

export function formatTaka(amount: number | string | undefined | null, useBengali = true): string {
  const val = typeof amount === 'number' ? amount : parseFloat(String(amount || 0)) || 0;
  const formatted = val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (useBengali) {
    return '৳ ' + toBengaliNumber(formatted);
  }
  return '৳ ' + formatted;
}

const BENGALI_DAYS: Record<number, string> = {
  0: 'রবিবার',
  1: 'সোমবার',
  2: 'মঙ্গলবার',
  3: 'বুধবার',
  4: 'বৃহস্পতিবার',
  5: 'শুক্রবার',
  6: 'শনিবার'
};

const BENGALI_MONTHS: Record<number, string> = {
  0: 'জানুয়ারি',
  1: 'ফেব্রুয়ারি',
  2: 'মার্চ',
  3: 'এপ্রিল',
  4: 'মে',
  5: 'জুন',
  6: 'জুলাই',
  7: 'আগস্ট',
  8: 'সেপ্টেম্বর',
  9: 'অক্টোবর',
  10: 'নভেম্বর',
  11: 'ডিসেম্বর'
};

export function getBengaliDayName(dateObj: Date): string {
  return BENGALI_DAYS[dateObj.getDay()] || '';
}

export function formatBengaliDate(dateInput: string | Date): string {
  const dateObj = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  if (isNaN(dateObj.getTime())) return String(dateInput);

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = BENGALI_MONTHS[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${toBengaliNumber(day)} ${month} ${toBengaliNumber(year)}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
