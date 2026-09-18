import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Navigation, 
  Users, 
  Lock, 
  Bell, 
  Sliders, 
  Settings as SettingsIcon,
  X,
  UserCheck,
  Calculator,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSafetyState } from '../../contexts/SafetyStateContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Journeys', path: '/journeys', icon: Navigation },
  { name: 'Safety Circle', path: '/safety-circle', icon: Users },
  { name: 'Privacy Policy', path: '/privacy', icon: Lock },
  { name: 'Contact View', path: '/contact-dashboard', icon: UserCheck },
  { name: 'Alerts', path: '/alerts', icon: Bell },
  { name: 'Demo Simulator', path: '/demo', icon: Sliders },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { safetyState, toggleDiscreetMode } = useSafetyState();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const isCrisis = safetyState === 'CRISIS';
  const isCaution = safetyState === 'CAUTION' || safetyState === 'ELEVATED';

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-200/80 flex flex-col justify-between
        transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'}
      `}
    >
      {/* Top Logo & Header */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-stone-100">
          <NavLink to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-sm shadow-rose-200 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-stone-900 flex items-center gap-1.5">
                SafeCircle
              </div>
              <p className="text-[10px] text-rose-600 font-semibold tracking-wider uppercase">
                Privacy · Safety
              </p>
            </div>
          </NavLink>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${
                    isActive
                      ? 'bg-rose-50/90 text-rose-700 shadow-xs border-l-4 border-rose-600 pl-3 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0 text-rose-600/80" />
                <span>{item.name}</span>
                {item.name === 'Demo Simulator' && (
                  <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-rose-100/70 text-rose-700">
                    Live
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileOpen(false);
                toggleDiscreetMode();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all cursor-pointer border border-stone-200/70"
            >
              <Calculator className="w-4 h-4 text-stone-500" />
              <span>Discreet Mode</span>
              <span className="ml-auto text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                Utility
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* User Profile Section at bottom of Sidebar */}
      <div className="p-4 border-t border-stone-100 space-y-2">
        <div className="bg-[#fcf8f8] rounded-xl p-3 border border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center border border-rose-200 shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-stone-900 leading-none mb-1 truncate">
                {user?.name || 'SafeCircle User'}
              </div>
              <div className="text-[11px] text-stone-500 flex items-center gap-1 truncate">
                {user?.email || 'Protected Account'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 shrink-0">
            <span className={`w-2 h-2 rounded-full ${isCrisis ? 'bg-red-500' : isCaution ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
            <span className={isCrisis ? 'text-red-600 text-[10px]' : isCaution ? 'text-amber-600 text-[10px]' : 'text-emerald-600 text-[10px]'}>
              {isCrisis ? 'Crisis' : isCaution ? 'Caution' : 'Safe'}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200/70 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
