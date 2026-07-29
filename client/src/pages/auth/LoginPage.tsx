// ============================================================
// PowerGuard - Login Page
// Professional auth page with role tabs, dark left panel,
// matching the reference design screenshot
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Shield, BarChart3, CheckCircle, Eye, EyeOff,
  Mail, Lock, ArrowRight, Sun, Moon, Globe,
  Activity, Cpu, Users, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import type { UserRole } from '../../types';

const roles: { key: UserRole; label: string; icon: React.ReactNode }[] = [
  { key: 'consumer', label: 'Consumer', icon: <Users className="w-4 h-4" /> },
  { key: 'utility', label: 'Utility', icon: <Activity className="w-4 h-4" /> },
  { key: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
];

const features = [
  { icon: <Zap className="w-5 h-5" />, label: 'Real-time Monitoring' },
  { icon: <Shield className="w-5 h-5" />, label: 'AI Theft Detection' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Energy Analytics' },
  { icon: <CheckCircle className="w-5 h-5" />, label: 'Secure & Reliable' },
];

const bottomFeatures = [
  { icon: <Shield className="w-5 h-5 text-primary-500" />, title: 'Secure & Private', desc: 'End-to-end encryption and secure access' },
  { icon: <Activity className="w-5 h-5 text-primary-500" />, title: 'Real-time Alerts', desc: 'Get instant notifications on suspicious activities' },
  { icon: <BarChart3 className="w-5 h-5 text-primary-500" />, title: 'AI Powered', desc: 'Advanced ML models for accurate theft detection' },
  { icon: <Cpu className="w-5 h-5 text-primary-500" />, title: 'Energy Efficient', desc: 'Optimize usage and reduce energy wastage' },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('consumer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email || `demo@${selectedRole}.com`, password || 'demo123', selectedRole);
      if (success) {
        navigate(`/${selectedRole}`);
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
          <Globe className="w-4 h-4" />
          English
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Hero Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:w-[45%] relative overflow-hidden gradient-hero text-white p-8 lg:p-12 flex flex-col justify-between min-h-[300px] lg:min-h-screen"
        >
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 grid-pattern opacity-30" />
          
          {/* Animated background circles */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">PowerGuard</span>
            </div>

            {/* Hero Text */}
            <div className="space-y-3 mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                Smart Energy.
                <br />
                Secure Tomorrow.
                <br />
                <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
                  Intelligent Monitoring.
                </span>
              </h1>
              <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
            </div>

            <p className="text-slate-300 text-sm lg:text-base leading-relaxed max-w-md mb-12">
              AI, ML and IoT powered platform for real-time electricity monitoring, theft detection, demand forecasting and energy analytics.
            </p>

            {/* Smart Meter Visual */}
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-5 border border-slate-700/50 backdrop-blur-sm max-w-xs mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="live-dot" />
                <span className="text-xs text-accent-400 font-medium">LIVE METER DATA</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Voltage</div>
                  <div className="text-lg font-bold text-accent-400">236.8 <span className="text-xs text-slate-500">V</span></div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Current</div>
                  <div className="text-lg font-bold text-primary-400">10.25 <span className="text-xs text-slate-500">A</span></div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Power</div>
                  <div className="text-lg font-bold text-amber-400">2.42 <span className="text-xs text-slate-500">kW</span></div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Energy</div>
                  <div className="text-lg font-bold text-purple-400">147.3 <span className="text-xs text-slate-500">kWh</span></div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-4 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-accent-400">
                    {f.icon}
                  </div>
                  <span className="text-[11px] text-slate-300 leading-tight">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="relative z-10 mt-6 flex items-center gap-3 bg-accent-500/10 border border-accent-500/20 rounded-xl px-4 py-3"
          >
            <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent-400" />
            </div>
            <p className="text-sm text-slate-300">
              Together, let's build a smarter and greener energy future.
            </p>
          </motion.div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex items-center justify-center p-6 lg:p-12"
        >
          <div className="w-full max-w-md">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back!</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Login to continue to your account</p>
            </div>

            {/* Role Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
              {roles.map(role => (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                    selectedRole === role.key
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {role.icon}
                  {role.label}
                </button>
              ))}
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email address / Username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember Me / Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500/30"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 btn-primary text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-slate-50 dark:bg-slate-950 text-xs text-slate-400">or login with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Google', color: 'text-red-500', letter: 'G' },
                  { name: 'Microsoft', color: 'text-blue-500', letter: 'M' },
                  { name: 'Apple', color: 'text-slate-900 dark:text-white', letter: '' },
                ].map(provider => (
                  <button
                    key={provider.name}
                    type="button"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    <span className={`font-bold ${provider.color}`}>{provider.letter || '🍎'}</span>
                    {provider.name}
                  </button>
                ))}
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Bottom Features Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {bottomFeatures.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0 mt-0.5">
                {f.icon}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-3 text-xs text-slate-400 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        © 2026 <span className="text-primary-600 dark:text-primary-400 font-medium">PowerGuard</span>. All rights reserved.
      </div>
    </div>
  );
}
