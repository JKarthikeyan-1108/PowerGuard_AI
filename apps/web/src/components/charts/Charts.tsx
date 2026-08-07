'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar,
  LineChart as RechartsLineChart, Line,
  PieChart as RechartsPieChart, Pie, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(243, 75%, 59%)', 'hsl(160, 60%, 45%)', 'hsl(30, 80%, 55%)', 'hsl(280, 65%, 60%)', 'hsl(340, 75%, 55%)'];

// Custom tooltip style
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs shadow-lg border">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-semibold text-foreground">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, className, action }) => (
  <Card className={cn('overflow-hidden', className)}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </CardHeader>
    <CardContent className="pt-0">{children}</CardContent>
  </Card>
);

// ── Area Chart ──────────────────────────────────────
interface AreaChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  yKey2?: string;
  height?: number;
  color?: string;
  color2?: string;
  showGrid?: boolean;
}

export const AreaChartComponent: React.FC<AreaChartProps> = ({
  data, xKey, yKey, yKey2, height = 300, color = COLORS[0], color2 = COLORS[1], showGrid = true
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <RechartsAreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
      <defs>
        <linearGradient id={`gradient-${yKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        {yKey2 && (
          <linearGradient id={`gradient-${yKey2}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color2} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color2} stopOpacity={0} />
          </linearGradient>
        )}
      </defs>
      {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />}
      <XAxis dataKey={xKey} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Area type="monotone" dataKey={yKey} stroke={color} fill={`url(#gradient-${yKey})`} strokeWidth={2} dot={false} name={yKey} />
      {yKey2 && <Area type="monotone" dataKey={yKey2} stroke={color2} fill={`url(#gradient-${yKey2})`} strokeWidth={2} dot={false} name={yKey2} />}
    </RechartsAreaChart>
  </ResponsiveContainer>
);

// ── Bar Chart ───────────────────────────────────────
interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  height?: number;
  color?: string;
}

export const BarChartComponent: React.FC<BarChartProps> = ({
  data, xKey, yKey, height = 300, color = COLORS[0]
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
      <XAxis dataKey={xKey} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} name={yKey} />
    </RechartsBarChart>
  </ResponsiveContainer>
);

// ── Line Chart ──────────────────────────────────────
interface LineChartProps {
  data: any[];
  xKey: string;
  lines: { key: string; color: string; label?: string; dashed?: boolean }[];
  height?: number;
}

export const LineChartComponent: React.FC<LineChartProps> = ({
  data, xKey, lines, height = 300
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
      <XAxis dataKey={xKey} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
      <Tooltip content={<CustomTooltip />} />
      {lines.map((line) => (
        <Line
          key={line.key}
          type="monotone"
          dataKey={line.key}
          stroke={line.color}
          strokeWidth={2}
          strokeDasharray={line.dashed ? '5 5' : undefined}
          dot={false}
          name={line.label || line.key}
        />
      ))}
    </RechartsLineChart>
  </ResponsiveContainer>
);

// ── Pie Chart ───────────────────────────────────────
interface PieChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

export const PieChartComponent: React.FC<PieChartProps> = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <RechartsPieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={3}
        dataKey="value"
        stroke="none"
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
    </RechartsPieChart>
  </ResponsiveContainer>
);

export { COLORS };
