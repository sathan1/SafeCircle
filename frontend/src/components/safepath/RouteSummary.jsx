import React from 'react';
import { MapPin, Clock, Shield, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

const RouteSummary = ({
  journey,
  selectedRoute,
  onContinue,
  isSaving
}) => {
  if (!selectedRoute) {
    return (
      <Card className="border border-stone-200 bg-stone-50/50 p-6 text-center">
        <p className="text-xs text-stone-500">
          Please select a route from the available options to review your journey summary.
        </p>
      </Card>
    );
  }

  const isSafePath = selectedRoute.routeType === 'SAFEPATH';

  return (
    <Card className="border border-rose-200/80 bg-gradient-to-br from-white via-white to-rose-50/20 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Selected Route Summary
          </span>
          <h3 className="text-lg font-black text-stone-900 mt-0.5">
            {selectedRoute.name}
          </h3>
        </div>

        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          isSafePath
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-stone-100 text-stone-700 border-stone-200'
        }`}>
          {selectedRoute.tag || (isSafePath ? 'SafePath Recommended' : 'Direct Route')}
        </span>
      </div>

      {/* From / To Endpoint Bar */}
      <div className="p-3 rounded-xl bg-[#fcf8f8] border border-stone-200/60 mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>From: <strong>{journey?.startLocation?.name || 'Origin'}</strong></span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>To: <strong>{journey?.destination?.name || 'Destination'}</strong></span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4 text-xs">
        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
          <span className="text-[10px] uppercase font-bold text-stone-600 block">
            Travel Duration
          </span>
          <span className="font-bold text-stone-900 text-sm">
            {selectedRoute.estimatedDuration}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
          <span className="text-[10px] uppercase font-bold text-stone-600 block">
            Distance
          </span>
          <span className="font-bold text-stone-900 text-sm">
            {selectedRoute.distance}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-stone-600 block">
            Context Assessment
          </span>
          <span className="font-bold text-rose-600 text-sm">
            {selectedRoute.contextualEstimate}
          </span>
        </div>
      </div>

      {/* Realism Disclosure Notice */}
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2 mb-5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong className="font-semibold block text-amber-950">Safety Prototype Notice:</strong>
          Route ratings represent a <em>Contextual Safety Estimate</em> calculated from static corridor attributes (lighting, public footfall, and cellular telemetry). SafeCircle is a prototype escort tool and does not guarantee physical safety.
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          onClick={onContinue}
          disabled={isSaving}
          size="lg"
          className="w-full justify-center"
        >
          {isSaving ? 'Applying Route...' : 'Continue Journey with This Route'}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </Card>
  );
};

export default RouteSummary;
