import React from 'react';
import { History, ArrowRight, Clock, Shield } from 'lucide-react';
import Card from '../common/Card';

const STATE_BADGE = {
  NORMAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CAUTION: 'bg-amber-50 text-amber-700 border-amber-200',
  ELEVATED: 'bg-orange-50 text-orange-700 border-orange-200',
  CRISIS: 'bg-red-50 text-red-700 border-red-200'
};

const StateTransitionHistory = ({ transitions = [] }) => {
  if (!transitions || transitions.length === 0) {
    return (
      <Card className="border border-stone-200 bg-white p-5 text-center">
        <p className="text-xs text-stone-400">
          No safety state transitions recorded yet for this journey.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-stone-200/80 bg-white shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Safety State Audit Trail
            </h3>
            <p className="text-[11px] text-stone-400">Explainable history of state transitions</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
          {transitions.length} Transitions
        </span>
      </div>

      <div className="space-y-2.5">
        {transitions.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-[#fcf8f8] border border-stone-200/70 text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              {/* Transition badges */}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${STATE_BADGE[item.previousState] || 'bg-stone-100'}`}>
                  {item.previousState}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${STATE_BADGE[item.newState] || 'bg-stone-100'}`}>
                  {item.newState}
                </span>
              </div>

              {/* Time & score */}
              <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                <span className="font-bold text-stone-700">Score: {item.signalScore}</span>
                <span>·</span>
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>

            {/* Reason */}
            <p className="text-stone-700 text-[11px] font-medium leading-snug">
              {item.reason}
            </p>

            <div className="text-[10px] text-stone-400">
              Triggered by: <span className="text-stone-600 font-semibold">{item.triggeredBy}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StateTransitionHistory;
