import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Navigation,
  Users,
  Lock,
  Bell
} from 'lucide-react';
import { useSafetyState } from '../../contexts/SafetyStateContext';

const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Journeys', path: '/journeys', icon: Navigation },
  { name: 'Circle', path: '/safety-circle', icon: Users },
  { name: 'Privacy', path: '/privacy', icon: Lock },
  { name: 'Alerts', path: '/alerts', icon: Bell },
];

const MobileBottomNav = () => {
  const { safetyState } = useSafetyState();
  const isCrisis = safetyState === 'CRISIS';
  const isElevated = safetyState === 'ELEVATED' || safetyState === 'CAUTION';

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-2 py-1 flex items-center justify-around shadow-lg"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.35rem)' }}
      aria-label="Mobile Navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `
              flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 min-h-[48px] min-w-[56px]
              ${
                isActive
                  ? 'text-rose-600 font-bold bg-rose-50/80 scale-105'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }
            `}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.name === 'Alerts' && (isCrisis || isElevated) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white animate-ping" />
              )}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
