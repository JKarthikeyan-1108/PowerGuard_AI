// ============================================================
// PowerGuard - Reusable Stat Card Component
// Animated metric display with icon, trend, and gradient
// ============================================================

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';
  delay?: number;
  className?: string;
  onClick?: () => void;
}

const colorMap = {
  blue: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    icon: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-100 dark:border-primary-800/30',
    gradient: 'from-primary-500/10 to-transparent',
  },
  green: {
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    icon: 'text-accent-600 dark:text-accent-400',
    border: 'border-accent-100 dark:border-accent-800/30',
    gradient: 'from-accent-500/10 to-transparent',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-800/30',
    gradient: 'from-amber-500/10 to-transparent',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-100 dark:border-red-800/30',
    gradient: 'from-red-500/10 to-transparent',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-800/30',
    gradient: 'from-purple-500/10 to-transparent',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    icon: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-100 dark:border-cyan-800/30',
    gradient: 'from-cyan-500/10 to-transparent',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  delay = 0,
  className = '',
  onClick,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={`stat-card relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Gradient overlay */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colors.gradient} rounded-bl-full opacity-60`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}>
            <span className={colors.icon}>{icon}</span>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
              trend.direction === 'up'
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : trend.direction === 'down'
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
            }`}>
              {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend.direction === 'neutral' && <Minus className="w-3 h-3" />}
              {trend.value}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
          {value}
        </div>

        {/* Title */}
        <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>

        {/* Subtitle */}
        {subtitle && (
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</div>
        )}
      </div>
    </motion.div>
  );
}
