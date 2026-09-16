import React from 'react';
import { Zap, ShieldCheck, Scale } from 'lucide-react';

const PREFERENCES = [
  {
    id: 'context',
    label: 'Context-Focused',
    badge: 'SafePath Recommended',
    description: 'Prioritizes main avenues, active commercial zones & continuous lighting',
    icon: ShieldCheck
  },
  {
    id: 'balanced',
    label: 'Balanced',
    badge: 'Direct & Transit',
    description: 'Moderate detour with designated transit stops and moderate footfall',
    icon: Scale
  },
  {
    id: 'fastest',
    label: 'Fastest',
    badge: 'Shortest Distance',
    description: 'Direct route optimizing purely for distance and lowest travel time',
    icon: Zap
  }
];

const RoutePreferenceSelector = ({ selectedPreference, onSelectPreference }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
          Route Preference
        </label>
        <span className="text-[10px] text-stone-600">
          Filters route evaluation criteria
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {PREFERENCES.map((pref) => {
          const Icon = pref.icon;
          const isSelected = selectedPreference === pref.id;

          return (
            <button
              key={pref.id}
              type="button"
              onClick={() => onSelectPreference(pref.id)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-rose-50/70 border-rose-400 shadow-2xs'
                  : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-600' : 'text-stone-500'}`} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-rose-900' : 'text-stone-800'}`}>
                      {pref.label}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-stone-500 leading-tight">
                  {pref.description}
                </p>
              </div>

              <div className="mt-2.5 pt-1.5 border-t border-stone-100">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                  isSelected
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-stone-100 text-stone-600'
                }`}>
                  {pref.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoutePreferenceSelector;
