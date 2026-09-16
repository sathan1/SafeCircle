import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SafetyStateProvider } from './contexts/SafetyStateContext';
import AppLayout from './components/layout/AppLayout';

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

function App() {
  return (
    <SafetyStateProvider>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Primary Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/journeys" element={<Journeys />} />
            <Route path="/journeys/:id" element={<ActiveJourney />} />
            <Route path="/journeys/:id/safepath" element={<SafePath />} />
            <Route path="/safety-circle" element={<SafetyCircle />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact-dashboard" element={<ContactDashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/settings" element={<Settings />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </SafetyStateProvider>
  );
}

export default App;
