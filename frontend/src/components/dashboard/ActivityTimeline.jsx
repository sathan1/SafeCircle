import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import Card from '../common/Card';
import { useSafetyState } from '../../contexts/SafetyStateContext';

const ActivityTimeline = () => {
  const { timelineEvents } = useSafetyState();

  const getEventIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'crisis':
        return <Activity className="w-4 h-4 text-red-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Clock className="w-4 h-4 text-rose-500" />;
    }
  };

  const getEventBadgeClass = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-100 border-amber-200';
      case 'crisis':
        return 'bg-red-100 border-red-200';
      case 'success':
        return 'bg-emerald-100 border-emerald-200';
      default:
        return 'bg-rose-50 border-rose-100';
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-stone-900">Recent Safety Activity</h3>
          <p className="text-xs text-stone-500">Autonomous checkpoints & state audit log</p>
        </div>
        <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
          {timelineEvents.length} Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-stone-200">
        {timelineEvents.slice(0, 5).map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline node icon */}
            <div className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border ${getEventBadgeClass(evt.type)} bg-white shadow-2xs`}>
              {getEventIcon(evt.type)}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span className="text-sm font-semibold text-stone-900 group-hover:text-rose-700 transition-colors">
                {evt.title}
              </span>
              <span className="text-xs font-mono text-stone-400 shrink-0">
                {evt.time}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              {evt.detail}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityTimeline;
