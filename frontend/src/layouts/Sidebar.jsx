import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Activity, 
  Users, 
  ShieldCheck, 
  History, 
  AlertTriangle, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Start Journey', path: '/journey', icon: MapPin },
    { name: 'Monitoring', path: '/journey/monitor', icon: Activity },
    { name: 'Safety Circle', path: '/safety-circle', icon: Users },
    { name: 'Privacy Policy', path: '/privacy', icon: ShieldCheck },
    { name: 'Safety Events', path: '/events', icon: History },
    { name: 'Emergency', path: '/emergency', icon: AlertTriangle, danger: true },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d81b60] to-[#f48fb1] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#d81b60] to-[#ad1457]">
            SafeCircle
          </span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm
              ${isActive 
                ? (item.danger ? 'bg-red-50 text-red-600' : 'bg-pink-50 text-[#d81b60]') 
                : (item.danger ? 'text-gray-600 hover:bg-red-50 hover:text-red-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
