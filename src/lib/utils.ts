import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { DayName } from './constants';

// Class name merger
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Format price in INR
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Format duration from minutes
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

// Format date string (ISO) to readable
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format date short
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format time from "09:00" to "9:00 AM"
export function formatTime(time: string): string {
  if (!time) return '';
  const [hourStr, minute] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${minute} ${period}`;
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Pluralize
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

// Greeting based on time
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

// Relative time (e.g. "2 weeks ago")
export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

// Get today's day name (lowercase)
export function getTodayDayName(): DayName {
  const days: DayName[] = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday',
  ];
  return days[new Date().getDay()];
}

// Check if salon is currently open
export function isSalonOpen(openingHours: Record<string, { open: string; close: string; isClosed?: boolean }>): {
  isOpen: boolean;
  todayHours: { open: string; close: string } | null;
} {
  const today = getTodayDayName();
  const todayHours = openingHours[today];

  if (!todayHours || todayHours.isClosed) {
    return { isOpen: false, todayHours: null };
  }

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;

  return { isOpen, todayHours };
}

// Generate next N days as date strings
export function getNextDays(n: number): string[] {
  const days: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

// Format a date string (YYYY-MM-DD) for display
export function formatSlotDate(dateStr: string): {
  dayName: string;
  dayNum: string;
  month: string;
  isToday: boolean;
  isTomorrow: boolean;
} {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.getTime() === today.getTime();
  const isTomorrow = date.getTime() === tomorrow.getTime();

  return {
    dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
    dayNum: date.getDate().toString(),
    month: date.toLocaleDateString('en-IN', { month: 'short' }),
    isToday,
    isTomorrow,
  };
}

// Get hour from time string "09:30" → 9
export function getHourFromTime(time: string): number {
  return parseInt(time.split(':')[0], 10);
}

// Slugify a string
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Generate a pseudo-random color based on string (for avatars)
export function stringToColor(str: string): string {
  const colors = [
    '#7C3AED', '#4F46E5', '#0891B2', '#059669',
    '#D97706', '#DC2626', '#DB2777', '#9333EA',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Parse price range string "200-500" → { min: 200, max: 500 }
export function parsePriceRange(range: string): { min: number; max: number } {
  if (range.endsWith('+')) {
    return { min: parseInt(range, 10), max: Infinity };
  }
  const [min, max] = range.split('-').map(Number);
  return { min, max };
}

// Shuffle array
export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Clamp a number
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

// Calculate distance between two coordinates using Haversine formula
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
export function formatDistanceKm(km: number): string {
  if (km < 0.1) return 'Nearby';
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  if (km < 10) return `${km.toFixed(1)}km away`;
  return `${Math.round(km)}km away`;
}
