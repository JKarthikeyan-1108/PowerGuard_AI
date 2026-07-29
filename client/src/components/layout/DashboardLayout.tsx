// ============================================================
// PowerGuard - Dashboard Layout
// Main layout with collapsible sidebar and top navbar
// ============================================================

import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Menu, X, Bell, Search, Sun, Moon, LogOut, User,
  ChevronDown, Settings, HelpCircle,
  LayoutDashboard, Activity, BarChart3, Shield, AlertTriangle,
  FileText, Cpu, Users, Gauge, Brain, Radio,
  Building2, MapPin, Wrench, Database, Cog, Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import type { UserRole } from '../../types';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const navItems: Record<UserRole, NavItem[]> = {
  consumer: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" />, path: '/consumer' },
    { label: 'Live Meter', icon: <Activity className="w-4.5 h-4.5" />, path: '/consumer/live-meter' },
    { label: 'Analytics', icon: <BarChart3 className="w-4.5 h-4.5" />, path: '/consumer/analytics' },
    { label: 'AI Predictions', icon: <Brain className="w-4.5 h-4.5" />, path: '/consumer/predictions' },
    { label: 'Alerts', icon: <AlertTriangle className="w-4.5 h-4.5" />, path: '/consumer/alerts', badge: 3 },
    { label: 'Reports', icon: <FileText className="w-4.5 h-4.5" />, path: '/consumer/reports' },
    { label: 'Recommendations', icon: <Gauge className="w-4.5 h-4.5" />, path: '/consumer/recommendations' },
    { label: 'Settings', icon: <Settings className="w-4.5 h-4.5" />, path: '/consumer/settings' },
  ],
  utility: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" />, path: '/utility' },
    { label: 'Consumers', icon: <Users className="w-4.5 h-4.5" />, path: '/utility/consumers' },
    { label: 'Smart Meters', icon: <Cpu className="w-4.5 h-4.5" />, path: '/utility/meters' },
    { label: 'Theft Detection', icon: <Shield className="w-4.5 h-4.5" />, path: '/utility/theft-detection' },
    { label: 'Alerts', icon: <AlertTriangle className="w-4.5 h-4.5" />, path: '/utility/alerts', badge: 6 },
    { label: 'Inspections', icon: <MapPin className="w-4.5 h-4.5" />, path: '/utility/inspections' },
    { label: 'Transformers', icon: <Radio className="w-4.5 h-4.5" />, path: '/utility/transformers' },
    { label: 'Demand Forecast', icon: <BarChart3 className="w-4.5 h-4.5" />, path: '/utility/forecast' },
    { label: 'Reports', icon: <FileText className="w-4.5 h-4.5" />, path: '/utility/reports' },
    { label: 'Simulator', icon: <Activity className="w-4.5 h-4.5" />, path: '/utility/simulator' },
  ],
  admin: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" />, path: '/admin' },
    { label: 'Users', icon: <Users className="w-4.5 h-4.5" />, path: '/admin/users' },
    { label: 'Smart Meters', icon: <Cpu className="w-4.5 h-4.5" />, path: '/admin/meters' },
    { label: 'ML Models', icon: <Brain className="w-4.5 h-4.5" />, path: '/admin/ml-models' },
    { label: 'Alerts', icon: <AlertTriangle className="w-4.5 h-4.5" />, path: '/admin/alerts', badge: 4 },
    { label: 'System Health', icon: <Database className="w-4.5 h-4.5" />, path: '/admin/system-health' },
    { label: 'Logs', icon: <Layers className="w-4.5 h-4.5" />, path: '/admin/logs' },
    { label: 'Reports', icon: <FileText className="w-4.5 h-4.5" />, path: '/admin/reports' },
    { label: 'Settings', icon: <Cog className="w-4.5 h-4.5" />, path: '/admin/settings' },
  ],
};

const roleLabels: Record<UserRole, string> = {
  consumer: 'Consumer Panel',
  utility: 'Utility Board',
  admin: 'Admin Console',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || 'consumer';
  const items = navItems[role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`hidden lg:flex flex-col sidebar text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <div className="text-base font-bold tracking-tight">PowerGuard</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{roleLabels[role]}</div>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item flex items-center gap-3 text-sm ${
                  isActive ? 'active' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="truncate">{item.label}</span>
                )}
                {sidebarOpen && item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <Menu className="w-4 h-4" />
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-72 sidebar text-white z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-base font-bold">PowerGuard</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">{roleLabels[role]}</div>
                  </div>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {items.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`sidebar-item flex items-center gap-3 text-sm ${
                        isActive ? 'active' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none w-full"
              />
              <kbd className="hidden md:inline-flex text-[10px] text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-mono">⌘K</kbd>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Help */}
            <button className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block">
              <HelpCircle className="w-4.5 h-4.5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'User'}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</div>
                      <div className="text-xs text-slate-500">{user?.email}</div>
                    </div>
                    <Link
                      to={`/${role}/settings`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to={`/${role}/settings`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
