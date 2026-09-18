import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, Shield, Calculator, Camera, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSafetyState } from '../../contexts/SafetyStateContext';
import StatusBadge from '../common/StatusBadge';

const ROUTE_INFO = {
  '/': { title: 'Dashboard', desc: 'Real-time overview of your safety circle & active journeys.' },
  '/journeys': { title: 'Journeys', desc: 'Track, plan, and review your protected travel routes.' },
  '/safety-circle': { title: 'Safety Circle', desc: 'Manage your trusted contacts and escalation contacts.' },
  '/privacy': { title: 'Privacy Policy', desc: 'Configure progressive data exposure rules per safety tier.' },
  '/alerts': { title: 'Alerts & Activity', desc: 'Audit log of safety signals, checkpoints, and escalations.' },
  '/demo': { title: 'Demo Simulator', desc: 'Simulate safety state transitions from Normal to Crisis.' },
  '/settings': { title: 'Settings', desc: 'Manage your account, device telemetry, and emergency preferences.' },
};

const Topbar = ({ onToggleMobile, onOpenEvidence }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { safetyState, toggleDiscreetMode } = useSafetyState();

  const isRoot = location.pathname === '/';

  const getPageInfo = () => {
    if (location.pathname.startsWith('/journeys/')) {
      return { title: 'Active Journey Monitor', desc: 'Live checkpoint telemetry and progressive circle awareness.' };
    }
    return ROUTE_INFO[location.pathname] || { title: 'SafeCircle', desc: 'Privacy-First Progressive Protection' };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Back button on sub-pages or Mobile Menu toggle on root */}
        {!isRoot ? (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-stone-700" />
          </button>
        ) : (
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Dynamic Page Header */}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-stone-500 hidden sm:block">
            {pageInfo.desc}
          </p>
        </div>
      </div>

      {/* Right Action Icons & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Emergency Evidence Button */}
        <button
          onClick={onOpenEvidence}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
          title="Emergency Evidence Mode"
        >
          <Camera className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Evidence</span>
        </button>

        {/* Discreet Mode Button */}
        <button
          onClick={toggleDiscreetMode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          title="Switch to Discreet Mode (Calculator Interface)"
        >
          <Calculator className="w-3.5 h-3.5 text-stone-600" />
          <span className="hidden sm:inline">Discreet Mode</span>
        </button>

        {/* Global Safety State Indicator */}
        <div className="hidden md:flex items-center">
          <StatusBadge state={safetyState} size="sm" />
        </div>

        {/* Alerts Notification Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-xl text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          aria-label="View alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl text-stone-700 hover:bg-stone-100/70 border border-stone-200/70 transition-colors cursor-pointer"
          aria-label="User settings"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <span className="text-xs font-semibold hidden sm:inline text-stone-800">
            {user?.name ? user.name.split(' ')[0] : 'Account'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
