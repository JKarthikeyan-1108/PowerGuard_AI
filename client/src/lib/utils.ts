import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind CSS classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format number as currency (INR) */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format number with units */
export function formatNumber(num: number, decimals = 1): string {
  if (num >= 1000000) return (num / 1000000).toFixed(decimals) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}

/** Format watts to appropriate unit */
export function formatPower(watts: number): string {
  if (watts >= 1000000) return (watts / 1000000).toFixed(2) + ' MW';
  if (watts >= 1000) return (watts / 1000).toFixed(2) + ' kW';
  return watts.toFixed(1) + ' W';
}

/** Format energy in kWh */
export function formatEnergy(kwh: number): string {
  if (kwh >= 1000) return (kwh / 1000).toFixed(2) + ' MWh';
  return kwh.toFixed(2) + ' kWh';
}

/** Format date relative to now */
export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString('en-IN');
}

/** Generate a random ID */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/** Get risk color based on level */
export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low': return 'text-emerald-500';
    case 'medium': return 'text-amber-500';
    case 'high': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

/** Get risk background color */
export function getRiskBgColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

/** Get status color */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': case 'online': case 'normal': return 'text-emerald-500';
    case 'warning': case 'maintenance': return 'text-amber-500';
    case 'critical': case 'tampered': case 'offline': return 'text-red-500';
    case 'inactive': return 'text-gray-500';
    default: return 'text-gray-500';
  }
}

/** Sleep utility for animations */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
