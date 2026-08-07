'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Activity, History, Receipt, Lightbulb, FileText, Bell, Settings,
  Users, ShieldAlert, MapPin, Zap, TrendingUp, BarChart3, Building2,
  UserCog, Cpu, ScrollText, HeartPulse, Database, Radio, MonitorSmartphone,
  ChevronLeft, ChevronRight, Gauge, X, Play, Network, Wrench, QrCode
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const consumerNav = [
  { title: 'Dashboard', href: '/consumer', icon: LayoutDashboard },
  { title: 'Live Monitoring', href: '/consumer/monitoring', icon: Activity },
  { title: 'Usage History', href: '/consumer/usage', icon: History },
  { title: 'Billing & Savings', href: '/consumer/billing', icon: Receipt },
  { title: 'Recommendations', href: '/consumer/recommendations', icon: Lightbulb },
  { title: 'Reports', href: '/consumer/reports', icon: FileText },
  { title: 'Alerts', href: '/consumer/alerts', icon: Bell },
  { title: 'Settings', href: '/consumer/settings', icon: Settings },
];

const utilityNav = [
  { title: 'Dashboard', href: '/utility', icon: LayoutDashboard },
  { title: 'Consumers', href: '/utility/consumers', icon: Users },
  { title: 'Theft Detection', href: '/utility/theft', icon: ShieldAlert },
  { title: 'Risk Heatmap', href: '/utility/heatmap', icon: MapPin },
  { title: 'Transformers', href: '/utility/transformers', icon: Zap },
  { title: 'Register Meter', href: '/utility/meters/register', icon: QrCode },
  { title: 'Demand Forecast', href: '/utility/forecast', icon: TrendingUp },
  { title: 'Analytics', href: '/utility/analytics', icon: BarChart3 },
  { title: 'Reports', href: '/utility/reports', icon: FileText },
];

const adminNav = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: UserCog },
  { title: 'Meters', href: '/admin/meters', icon: Gauge },
  { title: 'Areas', href: '/admin/areas', icon: MapPin },
  { title: 'Transformers', href: '/admin/transformers', icon: Zap },
  { title: 'System Health', href: '/admin/system', icon: HeartPulse },
  { title: 'Digital Twin', href: '/admin/digital-twin', icon: Network },
  { title: 'Maintenance', href: '/admin/maintenance', icon: Wrench },
  { title: 'Billing', href: '/admin/billing', icon: Receipt },
  { title: 'Monitoring', href: '/admin/monitoring', icon: MonitorSmartphone },
  { title: 'Demo Mode', href: '/admin/demo', icon: Play },
  { title: 'AI Models', href: '/admin/ai-models', icon: Cpu },
  { title: 'Audit Logs', href: '/admin/audit', icon: ScrollText },
  { title: 'Incidents', href: '/admin/incidents', icon: ShieldAlert },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

const superAdminNav = [
  { title: 'Platform Control', href: '/super-admin', icon: LayoutDashboard },
  { title: 'Organizations', href: '/super-admin/organizations', icon: Building2 },
  { title: 'Billing & Plans', href: '/super-admin/billing', icon: Receipt },
  { title: 'Global Settings', href: '/super-admin/settings', icon: Settings },
];

export const AppSidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse, mobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = user?.role === 'SUPER_ADMIN' ? superAdminNav : user?.role === 'ADMIN' ? adminNav : user?.role === 'UTILITY_OFFICER' ? utilityNav : consumerNav;
  const roleLabel = user?.role === 'SUPER_ADMIN' ? 'Platform Admin' : user?.role === 'ADMIN' ? 'Org Admin' : user?.role === 'UTILITY_OFFICER' ? 'Utility Officer' : 'Consumer';
  const roleColor = user?.role === 'SUPER_ADMIN' ? 'text-red-400' : user?.role === 'ADMIN' ? 'text-purple-400' : user?.role === 'UTILITY_OFFICER' ? 'text-amber-400' : 'text-energy-400';

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        'fixed top-0 left-0 z-40 h-screen flex flex-col border-r bg-sidebar transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[260px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn('flex h-16 items-center border-b border-sidebar-border px-4', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-electric-600 to-electric-500 shadow-lg shadow-electric-500/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-sidebar-foreground">PowerGuard</span>
              <span className={cn('text-[10px] font-medium', roleColor)}>{roleLabel}</span>
            </div>
          )}
          {/* Mobile close */}
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={onMobileClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== `/${user?.role?.toLowerCase().replace('_', '-')}` && pathname.startsWith(item.href));
              
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/15'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <item.icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'text-primary')} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return link;
            })}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle */}
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className={cn('w-full hidden lg:flex', collapsed ? 'justify-center' : 'justify-start gap-2')}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
};
