import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import OfflineBanner from '../common/OfflineBanner';
import EmergencyEvidenceModal from '../safety/EmergencyEvidenceModal';
import { useSafetyState } from '../../contexts/SafetyStateContext';
import DiscreetCalculator from '../discreet/DiscreetCalculator';
import { mobileAppService } from '../../services/native/mobileAppService';
import { mobileNotificationService } from '../../services/native/mobileNotificationService';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const { isDiscreetMode, toggleDiscreetMode } = useSafetyState();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize mobile app native listeners
    mobileAppService.initialize(navigate, () => {
      // If mobile drawer open, close it
      if (mobileOpen) {
        setMobileOpen(false);
        return true;
      }
      return false;
    });

    mobileNotificationService.initialize();
  }, [navigate, mobileOpen]);

  // Back button handler for discreet mode
  useEffect(() => {
    if (isDiscreetMode) {
      const unregister = mobileAppService.pushBackHandler(() => {
        toggleDiscreetMode();
        return true;
      });
      return unregister;
    }
  }, [isDiscreetMode, toggleDiscreetMode]);

  // Back button handler for evidence modal
  useEffect(() => {
    if (evidenceModalOpen) {
      const unregister = mobileAppService.pushBackHandler(() => {
        setEvidenceModalOpen(false);
        return true;
      });
      return unregister;
    }
  }, [evidenceModalOpen]);

  if (isDiscreetMode) {
    return <DiscreetCalculator />;
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] flex flex-col lg:flex-row text-stone-800 selection:bg-rose-100 selection:text-rose-800">
      {/* Offline Status Warning */}
      <OfflineBanner />

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar (Desktop & Tablet Drawer) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <Topbar
          onToggleMobile={() => setMobileOpen(prev => !prev)}
          onOpenEvidence={() => setEvidenceModalOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Native Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Emergency Evidence Modal */}
      <EmergencyEvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
      />
    </div>
  );
};

export default AppLayout;

