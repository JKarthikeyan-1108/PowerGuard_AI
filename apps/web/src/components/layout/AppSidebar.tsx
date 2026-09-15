'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Activity, History, Receipt, Lightbulb, FileText, Bell, Settings,
  Users, ShieldAlert, MapPin, Zap, TrendingUp, BarChart3, Building2,
  UserCog, Cpu, ScrollText, HeartPulse, Network, Wrench, QrCode,
  ChevronLeft, ChevronRight, Gauge, X, Play, MonitorSmartphone,
  HelpCircle, User, LogOut, Radio,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ── Consumer Navigation ──────────────────────────────
const consumerMainNav = [
  { title: 'Dashboard', href: '/consumer', icon: LayoutDashboard },
  { title: 'Live Monitoring', href: '/consumer/monitoring', icon: Activity },
  { title: 'Energy Analytics', href: '/consumer/usage', icon: BarChart3 },
  { title: 'Theft Detection', href: '/consumer/alerts', icon: ShieldAlert },
  { title: 'Bill Prediction', href: '/consumer/billing', icon: Receipt },
  { title: 'Demand Forecast', href: '/consumer/recommendations', icon: TrendingUp },
  { title: 'Alerts', href: '/consumer/alerts', icon: Bell },
  { title: 'Reports', href: '/consumer/reports', icon: FileText },
];

const consumerMgmtNav = [
  { title: 'Settings', href: '/consumer/settings', icon: Settings },
];

// ── Utility Navigation ───────────────────────────────
const utilityMainNav = [
  { title: 'Dashboard', href: '/utility', icon: LayoutDashboard },
  { title: 'Live Monitoring', href: '/utility/analytics', icon: Activity },
  { title: 'Energy Analytics', href: '/utility/analytics', icon: BarChart3 },
  { title: 'Theft Detection', href: '/utility/theft', icon: ShieldAlert },
  { title: 'Demand Forecast', href: '/utility/forecast', icon: TrendingUp },
  { title: 'Alerts', href: '/utility/heatmap', icon: Bell },
  { title: 'Reports', href: '/utility/reports', icon: FileText },
];

const utilityMgmtNav = [
  { title: 'Consumers', href: '/utility/consumers', icon: Users },
  { title: 'Meters', href: '/utility/meters/register', icon: Gauge },
  { title: 'Transformers', href: '/utility/transformers', icon: Zap },
];

// ── Admin Navigation ─────────────────────────────────
const adminMainNav = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Monitoring', href: '/admin/monitoring', icon: MonitorSmartphone },
  { title: 'Digital Twin', href: '/admin/digital-twin', icon: Network },
  { title: 'AI Models', href: '/admin/ai-models', icon: Cpu },
  { title: 'Incidents', href: '/admin/incidents', icon: ShieldAlert },
  { title: 'Maintenance', href: '/admin/maintenance', icon: Wrench },
  { title: 'Reports', href: '/admin/reports', icon: FileText },
  { title: 'Demo Mode', href: '/admin/demo', icon: Play },
];

const adminMgmtNav = [
  { title: 'Users', href: '/admin/users', icon: UserCog },
  { title: 'Meters', href: '/admin/meters', icon: Gauge },
  { title: 'Transformers', href: '/admin/transformers', icon: Zap },
  { title: 'Billing', href: '/admin/billing', icon: Receipt },
  { title: 'System Health', href: '/admin/system', icon: HeartPulse },
  { title: 'Audit Logs', href: '/admin/audit', icon: ScrollText },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

// ── Super-Admin Navigation ───────────────────────────
const superAdminMainNav = [
  { title: 'Platform Control', href: '/super-admin', icon: LayoutDashboard },
  { title: 'Organizations', href: '/super-admin/organizations', icon: Building2 },
  { title: 'Billing & Plans', href: '/super-admin/billing', icon: Receipt },
  { title: 'Global Settings', href: '/super-admin/settings', icon: Settings },
];

const superAdminMgmtNav: typeof superAdminMainNav = [];

// ── VoltGuard Logo SVG ───────────────────────────────
const VoltGuardLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export const AppSidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const role = user?.role;
  const mainNav = role === 'SUPER_ADMIN' ? superAdminMainNav : role === 'ADMIN' ? adminMainNav : role === 'UTILITY_OFFICER' ? utilityMainNav : consumerMainNav;
  const mgmtNav = role === 'SUPER_ADMIN' ? superAdminMgmtNav : role === 'ADMIN' ? adminMgmtNav : role === 'UTILITY_OFFICER' ? utilityMgmtNav : consumerMgmtNav;

  const roleLabel = role === 'SUPER_ADMIN' ? 'Platform Admin' : role === 'ADMIN' ? 'Org Admin' : role === 'UTILITY_OFFICER' ? 'Utility Officer' : 'Consumer';

  const isActive = (href: string) => {
    const baseRoute = role === 'SUPER_ADMIN' ? '/super-admin' : role === 'ADMIN' ? '/admin' : role === 'UTILITY_OFFICER' ? '/utility' : '/consumer';
    if (href === baseRoute) return pathname === href;
    return pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: { title: string; href: string; icon: React.ComponentType<{ className?: string }> } }) => {
    const active = isActive(item.href);
    const link = (
      <Link
        href={item.href}
        onClick={onMobileClose}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
          active
            ? 'bg-[#2F75B5] text-white shadow-md shadow-[#2F75B5]/25'
            : 'text-white/60 hover:text-white hover:bg-white/8',
          collapsed && 'justify-center px-0'
        )}
      >
        <item.icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-white')} />
        {!collapsed && <span>{item.title}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{item.title}</TooltipContent>
        </Tooltip>
      );
    }
    return link;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen flex flex-col transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ backgroundColor: '#061A33' }}
      >
        {/* ── Logo ─────────────────────────── */}
        <div className={cn(
          'flex items-center border-b border-white/8 px-4 shrink-0',
          collapsed ? 'justify-center h-16' : 'gap-3 h-[72px]'
        )}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2F75B5] to-[#00BFFF] shadow-lg shadow-[#2F75B5]/30">
            <VoltGuardLogo className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-white">
                Volt<span className="bg-gradient-to-r from-[#2F75B5] to-[#20C997] bg-clip-text text-transparent">Guard</span>
              </span>
              <span className="text-[10px] text-[#20C997]/80 font-medium truncate">Smart Energy. Secure Future.</span>
            </div>
          )}
          {/* Mobile close */}
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden text-white/60 hover:text-white hover:bg-white/10" onClick={onMobileClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Navigation ───────────────────── */}
        <ScrollArea className="flex-1 py-3">
          <nav className="flex flex-col gap-0.5 px-2">
            {mainNav.map((item) => (
              <NavLink key={item.href + item.title} item={item} />
            ))}

            {/* Management Section */}
            {mgmtNav.length > 0 && (
              <>
                {!collapsed && (
                  <div className="mt-6 mb-2 px-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Management</span>
                  </div>
                )}
                {collapsed && <div className="my-3 mx-3 border-t border-white/10" />}
                {mgmtNav.map((item) => (
                  <NavLink key={item.href + item.title} item={item} />
                ))}
              </>
            )}
          </nav>
        </ScrollArea>

        {/* ── Bottom Section ────────────────── */}
        <div className="shrink-0 border-t border-white/8 p-2 space-y-0.5">
          {/* Help */}
          {!collapsed ? (
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-colors"
            >
              <HelpCircle className="h-[18px] w-[18px]" />
              <span>Help & Support</span>
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="#" className="flex items-center justify-center rounded-lg p-2.5 text-white/50 hover:text-white hover:bg-white/8 transition-colors">
                  <HelpCircle className="h-[18px] w-[18px]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Help & Support</TooltipContent>
            </Tooltip>
          )}

          {/* Profile */}
          {!collapsed ? (
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-colors"
            >
              <User className="h-[18px] w-[18px]" />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{user?.firstName} {user?.lastName}</span>
                <span className="text-[10px] text-white/30">{roleLabel}</span>
              </div>
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/profile" className="flex items-center justify-center rounded-lg p-2.5 text-white/50 hover:text-white hover:bg-white/8 transition-colors">
                  <User className="h-[18px] w-[18px]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
          )}

          {/* Logout */}
          {!collapsed ? (
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span>Logout</span>
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => logout()} className="flex w-full items-center justify-center rounded-lg p-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="h-[18px] w-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          )}

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className={cn(
              'w-full hidden lg:flex text-white/40 hover:text-white hover:bg-white/8 mt-1',
              collapsed ? 'justify-center' : 'justify-start gap-2'
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
};
