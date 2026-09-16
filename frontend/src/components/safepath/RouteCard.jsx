import React from 'react';
import { Clock, Navigation, CheckCircle2, Shield, Sparkles } from 'lucide-react';

const RouteCard = ({
  route,
  isSelected,
  onSelect
}) => {
  const isSafePath = route.routeType === 'SAFEPATH';

  return (
    <div
      onClick={() => onSelect(route.id)}
      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
        isSelected
          ? 'bg-rose-50/40 border-rose-500 shadow-sm ring-2 ring-rose-500/20'
          : 'bg-white border-stone-200/80 hover:border-stone-300 hover:shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isSafePath
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}>
              {route.tag || (isSafePath ? 'SafePath Recommended' : 'Alternative Route')}
            </span>

            <span className="text-[10px] text-stone-500 font-mono">
              {route.id}
            </span>
          </div>

          <h3 className="text-base font-bold text-stone-900 leading-snug">
            {route.name}
          </h3>
        </div>

        {/* Travel Metrics */}
        <div className="flex items-center gap-3 sm:text-right shrink-0">
          <div className="bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100 text-left sm:text-right">
            <div className="flex items-center sm:justify-end gap-1 text-xs font-bold text-stone-900">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>{route.estimatedDuration}</span>
            </div>
            <div className="text-[11px] text-stone-500">
              {route.distance}
            </div>
          </div>

          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-rose-600 border-rose-600 text-white'
              : 'border-stone-300 bg-white text-transparent'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Contextual Safety Assessment Badge */}
      <div className="mb-3 p-2.5 rounded-xl bg-white border border-stone-200/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className={`w-4 h-4 ${isSafePath ? 'text-rose-600' : 'text-stone-500'}`} />
          <div>
            <span className="text-xs font-bold text-stone-800 block">
              {route.contextualEstimate}
            </span>
            <span className="text-[10px] text-stone-500 font-medium">
              Contextual Safety Estimate · Demo data
            </span>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
          isSafePath
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-stone-100 text-stone-600'
        }`}>
          {isSafePath ? 'Optimal Signals' : 'Standard'}
        </span>
      </div>

      {/* Available Safety Signals */}
      <div>
        <div className="text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
          Available Safety Signals
        </div>
        <div className="flex flex-wrap gap-1.5">
          {route.signals.map((sig, idx) => (
            <span
              key={idx}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                isSelected
                  ? 'bg-white text-rose-950 border-rose-200/80 shadow-2xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200/60'
              }`}
            >
              {sig}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteCard;
