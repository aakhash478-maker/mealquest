/**
 * Local Date and Time Utilities for MealQuest
 * Always uses local browser timezone, NEVER UTC toISOString splits.
 */

/**
 * Returns YYYY-MM-DD string in local browser time
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a local Date object
 */
export function parseLocalDateKey(dateKey: string): Date {
  if (!dateKey || !dateKey.includes('-')) return new Date();
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Returns yesterday's dateKey in local time
 */
export function getYesterdayLocalDateKey(date: Date = new Date()): string {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() - 1);
  return getLocalDateKey(d);
}

/**
 * Formats a date or dateKey as "Weekday, DD Month YYYY"
 * e.g. "Friday, 11 September 2026"
 */
export function formatLocalDateWithWeekday(val?: Date | string | number): string {
  if (!val) return '';
  let d: Date;
  if (typeof val === 'string' && val.length === 10 && val.includes('-') && !val.includes('T')) {
    d = parseLocalDateKey(val);
  } else {
    d = new Date(val);
  }

  if (isNaN(d.getTime())) return String(val);

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formats a timestamp into local 12-hour time
 * e.g. "9:42 AM"
 */
export function formatLocalTime(timestamp: number | Date = new Date()): string {
  const d = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formats a timestamp into "Weekday, DD Month YYYY • hh:mm AM/PM"
 */
export function formatLocalDateTime(timestamp: number | Date = new Date()): string {
  const d = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  if (isNaN(d.getTime())) return '';
  return `${formatLocalDateWithWeekday(d)} • ${formatLocalTime(d)}`;
}
