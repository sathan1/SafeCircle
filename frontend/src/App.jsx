import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SafetyStateProvider } from './contexts/SafetyStateContext';
import { Shield } from 'lucide-react';
import AppLayout from './components/layout/AppLayout';
import OnboardingModal from './components/common/OnboardingModal';

import Dashboard from './pages/Dashboard';
import Journeys from './pages/Journeys';
import ActiveJourney from './pages/ActiveJourney';
import SafePath from './pages/SafePath';
import SafetyCircle from './pages/SafetyCircle';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Alerts from './pages/Alerts';
import Demo from './pages/Demo';
import Settings from './pages/Settings';
import ContactDashboard from './pages/ContactDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

/**
 * Route guard for authenticated views.
 * Shows branded loading screen while verifying session,
 * and redirects unauthenticated users to /login.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex flex-col items-center justify-center p-4 selection:bg-rose-100 selection:text-rose-800">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-xl shadow-rose-200 animate-pulse">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="mt-5 text-base font-black text-stone-900 tracking-tight">
          SafeCircle
        </h2>
        <p className="mt-1 text-xs font-semibold text-rose-600 uppercase tracking-widest">
          Securing Safety Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <OnboardingModal />
      <Outlet />
    </>
  );
};

/**
 * Route guard for public auth views (Login, Register).
 * Redirects already logged-in users to the main dashboard.
 */
const PublicOnlyRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-200 animate-pulse">
          <Shield className="w-6 h-6" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <SafetyStateProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Direct Hackathon Simulation Route (Immediate Access for Evaluators) */}
            <Route element={<AppLayout />}>
              <Route path="/demo" element={<Demo />} />
            </Route>

            {/* Authenticated Application Shell */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/journeys" element={<Journeys />} />
                <Route path="/journeys/:id" element={<ActiveJourney />} />
                <Route path="/journeys/:id/safepath" element={<SafePath />} />
                <Route path="/safety-circle" element={<SafetyCircle />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/contact-dashboard" element={<ContactDashboard />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SafetyStateProvider>
    </AuthProvider>
  );
}

export default App;
