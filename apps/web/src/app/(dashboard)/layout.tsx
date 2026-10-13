'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { cn } from '@/lib/utils';
import { SocketProvider } from '@/providers/SocketProvider';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Show a minimal loading skeleton while auth state is being hydrated.
  // The Next.js middleware handles the redirect for unauthenticated users —
  // this guard prevents a brief flash of the layout without user data.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#2F75B5] flex items-center justify-center animate-pulse">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading PowerGuard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={cn(
        'flex flex-1 flex-col overflow-hidden transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'
      )}>
        <AppHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <SocketProvider namespace={user?.role === 'ADMIN' ? '/admin' : user?.role === 'UTILITY_OFFICER' ? '/utility' : '/consumer'}>
            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </SocketProvider>
        </main>
      </div>
    </div>
  );
}

