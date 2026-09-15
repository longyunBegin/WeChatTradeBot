const HOLIDAYS_2026 = new Set([
  '2026-01-01',
  '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-23',
  '2026-04-06',
  '2026-05-01', '2026-05-04', '2026-05-05',
  '2026-06-19',
  '2026-09-25',
  '2026-10-01', '2026-10-02', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08',
]);

const HOLIDAYS_2025 = new Set([
  '2025-01-01',
  '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31', '2025-02-03', '2025-02-04',
  '2025-04-04', '2025-04-07',
  '2025-05-01', '2025-05-02', '2025-05-05',
  '2025-05-31', '2025-06-02',
  '2025-10-01', '2025-10-02', '2025-10-03', '2025-10-06', '2025-10-07', '2025-10-08',
]);

const HOLIDAYS_2024 = new Set([
  '2024-01-01',
  '2024-02-09', '2024-02-12', '2024-02-13', '2024-02-14', '2024-02-15', '2024-02-16',
  '2024-04-04', '2024-04-05', '2024-04-06',
  '2024-05-01', '2024-05-02', '2024-05-03', '2024-05-05',
  '2024-06-10',
  '2024-09-16', '2024-09-17',
  '2024-10-01', '2024-10-02', '2024-10-03', '2024-10-04', '2024-10-07',
]);

function getDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getHolidaySet(year) {
  switch (year) {
    case 2024: return HOLIDAYS_2024;
    case 2025: return HOLIDAYS_2025;
    case 2026: return HOLIDAYS_2026;
    default: return new Set();
  }
}

export function isTradingDay(date = new Date()) {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }
  const dateStr = getDateStr(date);
  const holidays = getHolidaySet(date.getFullYear());
  if (holidays.has(dateStr)) {
    return false;
  }
  return true;
}

export function getNextTradingDay(date = new Date()) {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  while (!isTradingDay(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export { getDateStr };