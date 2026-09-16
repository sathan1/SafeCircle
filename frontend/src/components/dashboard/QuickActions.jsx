import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Users, Lock, Sliders } from 'lucide-react';
import Card from '../common/Card';

const ACTIONS = [
  {
    title: 'Start Journey',
    desc: 'Plan route & activate safety net',
    icon: Navigation,
    path: '/journeys',
    highlight: true
  },
  {
    title: 'Safety Circle',
    desc: 'Manage trusted contacts',
    icon: Users,
    path: '/safety-circle'
  },
  {
    title: 'Privacy Settings',
    desc: 'Adjust per-state permissions',
    icon: Lock,
    path: '/privacy'
  },
  {
    title: 'Demo Simulator',
    desc: 'Simulate Normal to Crisis states',
    icon: Sliders,
    path: '/demo'
  }
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-base font-bold text-stone-900">Quick Actions</h3>
        <p className="text-xs text-stone-500">Instant access to safety controls</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className={`
                text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer
                flex flex-col justify-between group
                ${
                  action.highlight
                    ? 'bg-rose-50/70 border-rose-200/80 hover:bg-rose-100/60 hover:border-rose-300'
                    : 'bg-[#fcf8f8] border-stone-200/70 hover:bg-white hover:border-rose-200 hover:shadow-xs'
                }
              `}
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-stone-200/70 flex items-center justify-center text-rose-600 mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  {action.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;
