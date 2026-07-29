// ============================================================
// PowerGuard - Landing Page
// Professional hero section, features, architecture, stats
// ============================================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Shield, BarChart3, Brain, Activity, Cpu,
  Users, Bell, ChevronRight, ArrowRight, Check,
  Globe, Lock, Gauge, Database, Radio, Code,
  Sun, Moon, Layers, TrendingUp
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
  { icon: <Activity className="w-6 h-6" />, title: 'Real-time Monitoring', desc: 'Track voltage, current, power, and energy metrics live from smart meters with 5-second refresh intervals.' },
  { icon: <Shield className="w-6 h-6" />, title: 'AI Theft Detection', desc: 'Advanced ML models (Isolation Forest, Random Forest, XGBoost) detect electricity theft with 96% accuracy.' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Energy Analytics', desc: 'Comprehensive analytics dashboard with consumption patterns, area comparisons, and historical trends.' },
  { icon: <Brain className="w-6 h-6" />, title: 'Demand Forecasting', desc: 'Prophet-powered demand prediction for tomorrow, next week, and next month with confidence intervals.' },
  { icon: <Gauge className="w-6 h-6" />, title: 'Bill Prediction', desc: 'AI-driven bill estimation for current and next month, with savings recommendations.' },
  { icon: <Bell className="w-6 h-6" />, title: 'Smart Alerts', desc: 'Real-time alerts for theft, voltage anomalies, meter offline events, and transformer overloads.' },
];

const stats = [
  { value: '10K+', label: 'Smart Meters' },
  { value: '96%', label: 'Detection Accuracy' },
  { value: '<5s', label: 'Response Time' },
  { value: '₹2Cr+', label: 'Revenue Saved' },
];

const techStack = [
  { name: 'React 19', icon: <Code className="w-5 h-5" />, color: 'text-cyan-500' },
  { name: 'Node.js', icon: <Database className="w-5 h-5" />, color: 'text-green-500' },
  { name: 'Python ML', icon: <Brain className="w-5 h-5" />, color: 'text-amber-500' },
  { name: 'MySQL', icon: <Database className="w-5 h-5" />, color: 'text-blue-500' },
  { name: 'FastAPI', icon: <Zap className="w-5 h-5" />, color: 'text-emerald-500' },
  { name: 'IoT/MQTT', icon: <Radio className="w-5 h-5" />, color: 'text-purple-500' },
  { name: 'Docker', icon: <Layers className="w-5 h-5" />, color: 'text-sky-500' },
  { name: 'TailwindCSS', icon: <Code className="w-5 h-5" />, color: 'text-teal-500' },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">PowerGuard</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
            <a href="#architecture" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Architecture</a>
            <a href="#tech" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Technology</a>
            <a href="#stats" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Statistics</a>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hidden sm:block">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 btn-primary text-white text-sm font-medium rounded-xl flex items-center gap-1.5">
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
                <Zap className="w-3.5 h-3.5" />
                AI-Powered Smart Energy Platform
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                Intelligent Smart
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                  Electricity Theft Detection
                </span>
                <br />
                & Energy Analytics
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                Harness the power of AI, Machine Learning & IoT to monitor electricity consumption in real-time, detect theft with 96% accuracy, and forecast energy demand.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="px-8 py-3.5 btn-primary text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/25"
                >
                  Launch Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  Explore Features
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16 relative"
            >
              <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-1 shadow-2xl shadow-primary-500/10">
                <div className="rounded-xl overflow-hidden bg-slate-900 p-6">
                  {/* Mock Dashboard Preview */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-xs text-slate-400">PowerGuard — Consumer Dashboard</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Voltage', value: '236.8 V', color: '#3b82f6' },
                      { label: 'Current', value: '10.25 A', color: '#10b981' },
                      { label: 'Power', value: '2.42 kW', color: '#f59e0b' },
                      { label: 'Energy', value: '147.3 kWh', color: '#8b5cf6' },
                    ].map((m, i) => (
                      <div key={i} className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-[10px] text-slate-400">{m.label}</div>
                        <div className="text-lg font-bold" style={{ color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 bg-slate-800/80 rounded-lg p-4 border border-slate-700/50 h-32">
                      <div className="text-xs text-slate-400 mb-2">Consumption Trend</div>
                      <div className="flex items-end gap-1 h-20">
                        {Array.from({ length: 24 }, (_, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t"
                            style={{
                              height: `${20 + Math.random() * 80}%`,
                              background: `linear-gradient(to top, rgba(59,130,246,0.3), rgba(59,130,246,${0.5 + Math.random() * 0.5}))`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/50 h-32">
                      <div className="text-xs text-slate-400 mb-2">Energy Score</div>
                      <div className="flex items-center justify-center h-20">
                        <div className="relative w-16 h-16">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="3" />
                            <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="78, 100" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-accent-400">78</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/10 via-accent-500/5 to-primary-500/10 rounded-3xl blur-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-primary-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
              Everything You Need for
              <br />
              Smart Energy Management
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              A comprehensive platform combining real-time monitoring, AI analytics, and intelligent automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-100 dark:border-primary-800/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">Architecture</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
              Production-Ready Architecture
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Built with modern microservices architecture, containerized with Docker, and ready for cloud deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Frontend Layer',
                icon: <Globe className="w-8 h-8" />,
                items: ['React 19 + TypeScript', 'TailwindCSS + Shadcn UI', 'Real-time WebSocket', 'Framer Motion', 'Responsive Design'],
                color: 'from-primary-500 to-primary-600',
              },
              {
                title: 'Backend Layer',
                icon: <Database className="w-8 h-8" />,
                items: ['Node.js + Express', 'JWT Authentication', 'REST APIs + WebSocket', 'MySQL Database', 'Smart Meter Simulator'],
                color: 'from-accent-500 to-accent-600',
              },
              {
                title: 'ML Engine',
                icon: <Brain className="w-8 h-8" />,
                items: ['Python + FastAPI', 'XGBoost + Random Forest', 'Prophet Forecasting', 'K-Means Clustering', 'Anomaly Detection'],
                color: 'from-purple-500 to-purple-600',
              },
            ].map((layer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${layer.color}`} />
                <div className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center text-white mb-4`}>
                    {layer.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{layer.title}</h3>
                  <ul className="space-y-2.5">
                    {layer.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-accent-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="tech" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">Technology</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
              Built with Modern Tech Stack
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
              >
                <span className={tech.color}>{tech.icon}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-10 lg:p-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 grid-pattern opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Secure Your Grid?
              </h2>
              <p className="text-lg text-primary-200 mb-8 max-w-xl mx-auto">
                Join thousands of utilities using PowerGuard to detect theft, forecast demand, and save millions in revenue losses.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-white text-primary-700 text-sm font-semibold rounded-xl hover:bg-primary-50 transition-all flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 border-2 border-white/30 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition-all"
                >
                  View Demo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold">PowerGuard</span>
              </div>
              <p className="text-sm text-slate-400">
                AI-powered smart energy management platform for the modern grid.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">© 2026 PowerGuard. All rights reserved.</p>
            <p className="text-xs text-slate-500">Built with ❤️ for Smart India Hackathon</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
