// ============================================================
// PowerGuard - Main Application Entry
// React Router v7, Auth Context, Theme Context
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import type { UserRole } from './types';

// Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardLayout from './components/layout/DashboardLayout';
import ConsumerDashboard from './pages/consumer/ConsumerDashboard';
import RecommendationsPage from './pages/consumer/RecommendationsPage';
import UtilityDashboard from './pages/utility/UtilityDashboard';
import TheftDetectionPage from './pages/utility/TheftDetectionPage';
import SimulatorPage from './pages/utility/SimulatorPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SystemHealthPage from './pages/admin/SystemHealthPage';
import MlModelsPage from './pages/admin/MlModelsPage';

/** Protected route - requires auth + role */
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading PowerGuard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}

/** Placeholder page for routes under development */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">This module is under development.</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Consumer Routes */}
      <Route
        path="/consumer"
        element={
          <ProtectedRoute allowedRoles={['consumer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ConsumerDashboard />} />
        <Route path="live-meter" element={<PlaceholderPage title="Live Meter Monitor" />} />
        <Route path="analytics" element={<PlaceholderPage title="Energy Analytics" />} />
        <Route path="predictions" element={<PlaceholderPage title="AI Predictions" />} />
        <Route path="alerts" element={<PlaceholderPage title="Alerts & Notifications" />} />
        <Route path="reports" element={<PlaceholderPage title="Reports & Downloads" />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="settings" element={<PlaceholderPage title="Settings & Profile" />} />
      </Route>

      {/* Utility Routes */}
      <Route
        path="/utility"
        element={
          <ProtectedRoute allowedRoles={['utility']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UtilityDashboard />} />
        <Route path="consumers" element={<PlaceholderPage title="Consumer Management" />} />
        <Route path="meters" element={<PlaceholderPage title="Smart Meter Management" />} />
        <Route path="theft-detection" element={<TheftDetectionPage />} />
        <Route path="alerts" element={<PlaceholderPage title="Alert Center" />} />
        <Route path="inspections" element={<PlaceholderPage title="Inspection Queue" />} />
        <Route path="transformers" element={<PlaceholderPage title="Transformer Analytics" />} />
        <Route path="forecast" element={<PlaceholderPage title="Energy Demand Forecast" />} />
        <Route path="reports" element={<PlaceholderPage title="Reports & Exports" />} />
        <Route path="simulator" element={<SimulatorPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<PlaceholderPage title="User Management" />} />
        <Route path="meters" element={<PlaceholderPage title="System Meters" />} />
        <Route path="ml-models" element={<MlModelsPage />} />
        <Route path="alerts" element={<PlaceholderPage title="System Alerts" />} />
        <Route path="system-health" element={<SystemHealthPage />} />
        <Route path="logs" element={<PlaceholderPage title="System Logs" />} />
        <Route path="reports" element={<PlaceholderPage title="Admin Reports" />} />
        <Route path="settings" element={<PlaceholderPage title="System Settings" />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
