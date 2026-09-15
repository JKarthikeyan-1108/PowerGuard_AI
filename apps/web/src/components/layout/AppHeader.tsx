'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Moon, Sun, Search, LogOut, User, Settings, Globe, ChevronDown, RefreshCw } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

// Map routes to page titles/subtitles
const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/consumer': { title: 'Dashboard', subtitle: 'Overview of your electricity usage and system health' },
  '/consumer/monitoring': { title: 'Live Monitoring', subtitle: 'Real-time energy consumption tracking' },
  '/consumer/usage': { title: 'Energy Analytics', subtitle: 'Detailed consumption analysis and patterns' },
  '/consumer/billing': { title: 'Bill Prediction', subtitle: 'Predicted electricity bill and cost breakdown' },
  '/consumer/alerts': { title: 'Alerts', subtitle: 'Security alerts and notifications' },
  '/consumer/reports': { title: 'Reports', subtitle: 'Energy consumption and analytics reports' },
  '/consumer/recommendations': { title: 'Demand Forecast', subtitle: 'AI-powered demand predictions' },
  '/consumer/settings': { title: 'Settings', subtitle: 'Account preferences and configuration' },
  '/utility': { title: 'Dashboard', subtitle: 'Utility operations overview' },
  '/utility/consumers': { title: 'Consumers', subtitle: 'Consumer account management' },
  '/utility/theft': { title: 'Theft Detection', subtitle: 'AI-powered theft alerts and investigation' },
  '/utility/heatmap': { title: 'Risk Heatmap', subtitle: 'Geographic risk visualization' },
  '/utility/analytics': { title: 'Analytics', subtitle: 'System-wide energy analytics' },
  '/utility/forecast': { title: 'Demand Forecast', subtitle: 'Grid demand predictions' },
  '/utility/reports': { title: 'Reports', subtitle: 'Operational reports and exports' },
  '/utility/transformers': { title: 'Transformers', subtitle: 'Transformer load and health monitoring' },
  '/admin': { title: 'Dashboard', subtitle: 'System administration overview' },
  '/admin/users': { title: 'Users', subtitle: 'User account management' },
  '/admin/meters': { title: 'Meters', subtitle: 'Meter fleet management' },
  '/admin/monitoring': { title: 'Monitoring', subtitle: 'System-wide monitoring console' },
  '/admin/system': { title: 'System Health', subtitle: 'Infrastructure health and metrics' },
  '/admin/settings': { title: 'Settings', subtitle: 'Platform configuration' },
  '/profile': { title: 'Profile', subtitle: 'Your account details' },
};

function getPageMeta(pathname: string): { title: string; subtitle: string } {
  // Exact match first
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  // Prefix match for nested routes
  const match = Object.keys(PAGE_META)
    .filter(key => pathname.startsWith(key) && key !== '/')
    .sort((a, b) => b.length - a.length)[0];
  if (match) return PAGE_META[match];
  return { title: 'Dashboard', subtitle: '' };
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'VG';
  const pageMeta = getPageMeta(pathname);

  const [lastUpdated, setLastUpdated] = React.useState('10 sec ago');

  // Simulate last-updated ticker
  React.useEffect(() => {
    let seconds = 10;
    const timer = setInterval(() => {
      seconds += 10;
      if (seconds < 60) setLastUpdated(`${seconds} sec ago`);
      else setLastUpdated(`${Math.floor(seconds / 60)} min ago`);
    }, 10000);
    return () => clearInterval(timer);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-white/80 dark:bg-background/80 backdrop-blur-xl px-4 sm:px-6">
      {/* Mobile menu */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <div className="hidden sm:flex flex-col min-w-0 mr-4">
        <h2 className="text-sm font-bold text-[#1F2937] dark:text-foreground leading-none">{pageMeta.title}</h2>
        {pageMeta.subtitle && (
          <p className="text-[11px] text-gray-400 dark:text-muted-foreground mt-0.5 truncate">{pageMeta.subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              'flex h-9 w-full rounded-lg border border-gray-200 dark:border-border/50 bg-gray-50/50 dark:bg-muted/30 pl-10 pr-4 text-sm transition-all duration-200',
              'placeholder:text-gray-400 dark:placeholder:text-muted-foreground/50',
              'focus:outline-none focus:ring-2 focus:ring-[#2F75B5]/20 focus:border-[#2F75B5]/30 focus:bg-white dark:focus:bg-background'
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted px-1.5 font-mono text-[10px] font-medium text-gray-400 dark:text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      {/* Right side actions */}
      <div className="flex items-center gap-1.5">
        {/* System status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 mr-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-medium text-green-700 dark:text-green-400 whitespace-nowrap">System Online</span>
        </div>

        {/* Last updated */}
        <div className="hidden lg:flex items-center gap-1 text-[10px] text-gray-400 dark:text-muted-foreground mr-1">
          <span className="whitespace-nowrap">Last updated: {lastUpdated}</span>
          <button
            onClick={() => {
              setLastUpdated('just now');
              window.location.reload();
            }}
            className="p-0.5 hover:text-gray-600 dark:hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Language selector */}
        <button className="hidden sm:inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-500 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors">
          <Globe className="h-3.5 w-3.5" />
          <span className="font-medium">EN</span>
          <ChevronDown className="h-2.5 w-2.5" />
        </button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative h-9 w-9">
          <Sun className={cn('h-4 w-4 transition-all', theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100')} />
          <Moon className={cn('absolute h-4 w-4 transition-all', theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0')} />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 gap-2 pl-2 pr-3">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-[#2F75B5]/10 text-[#2F75B5] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium leading-none text-[#1F2937] dark:text-foreground">{user?.firstName} {user?.lastName}</span>
                <span className="text-[10px] text-gray-400 dark:text-muted-foreground">{user?.role?.replace('_', ' ')}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/consumer/settings')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
