import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSafetyState } from '../../contexts/SafetyStateContext';
import DiscreetCalculator from '../discreet/DiscreetCalculator';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDiscreetMode } = useSafetyState();

  if (isDiscreetMode) {
    return <DiscreetCalculator />;
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] flex flex-col lg:flex-row text-stone-800 selection:bg-rose-100 selection:text-rose-800">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleMobile={() => setMobileOpen(prev => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
