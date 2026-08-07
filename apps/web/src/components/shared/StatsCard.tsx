'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  iconColor?: string;
  iconBg?: string;
  className?: string;
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title, value, subtitle, icon: Icon, trend, iconColor, iconBg, className, delay = 0
}) => {
  const isPositive = trend && trend.value >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className={cn('card-stat group', className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-energy-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={cn('text-xs font-semibold', isPositive ? 'text-energy-500' : 'text-red-500')}>
                {isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
          iconBg || 'bg-primary/10'
        )}>
          <Icon className={cn('h-6 w-6', iconColor || 'text-primary')} />
        </div>
      </div>
    </motion.div>
  );
};
