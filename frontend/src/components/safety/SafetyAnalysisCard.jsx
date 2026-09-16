import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  WifiOff, 
  CheckCircle2, 
  ShieldAlert, 
  HelpCircle,
  Cpu,
  Info,
  Layers
} from 'lucide-react';

const SIGNAL_ICONS = {
  ROUTE_DEVIATION: MapPin,
  PROLONGED_STOP: Clock,
  MISSED_CHECKIN: AlertTriangle,
  UNUSUAL_JOURNEY_DELAY: Clock,
  DEVICE_OFFLINE: WifiOff
};

const CONFIDENCE_STYLES = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-stone-100 text-stone-600 border-stone-200'
};

const STATE_BADGES = {
  NORMAL: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CAUTION: 'bg-amber-50 text-amber-800 border-amber-200',
  ELEVATED: 'bg-orange-50 text-orange-800 border-orange-200',
  CRISIS: 'bg-rose-50 text-rose-800 border-rose-200'
};

export default function SafetyAnalysisCard({
  state = 'NORMAL',
  signalScore = 0,
  signals = [],
  analysisType = 'RULE_BASED_PROTOTYPE',
  analysisLabel = 'Prototype rule-based anomaly intelligence',
  className = ''
}) {
  const stateBadge = STATE_BADGES[state] || STATE_BADGES.NORMAL;

  return (
    <div className={`bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-rose-50/40 via-white to-stone-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-stone-900">Safety Analysis</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                {analysisLabel}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Explainable anomaly signals identified by SafeCircle's intelligence layer
            </p>
          </div>
        </div>

        {/* Current State & Score Badges */}
        <div className="flex items-center gap-2">
          <div className="text-right mr-1">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
              Safety Signal Score
            </span>
            <span className="text-sm font-extrabold text-stone-900">
              {signalScore} <span className="text-xs font-normal text-stone-400">/ 100</span>
            </span>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${stateBadge}`}>
            State: {state}
          </span>
        </div>
      </div>

      {/* Signals Body */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-rose-600" />
            Detected Anomaly Signals ({signals.length})
          </span>
          <span className="text-stone-400 text-[11px]">
            Signals evaluated individually before state aggregation
          </span>
        </div>

        {signals.length === 0 ? (
          <div className="py-6 px-4 rounded-xl bg-stone-50/70 border border-stone-200/70 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-stone-800">
              No Active Anomaly Signals Detected
            </p>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
              Journey transit conforms to the expected SafePath corridor, timetable checkpoints, and periodic check-in cadence.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map((sig, idx) => {
              const Icon = SIGNAL_ICONS[sig.type] || AlertTriangle;
              const confStyle = CONFIDENCE_STYLES[sig.confidence] || CONFIDENCE_STYLES.Medium;

              return (
                <div 
                  key={sig.id || idx}
                  className="p-4 rounded-xl border border-stone-200/90 bg-white hover:border-rose-200 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900">
                          {sig.title || sig.type}
                        </h4>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {sig.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${confStyle}`}>
                        Anomaly confidence: {sig.confidence}
                      </span>
                      {sig.suggestedScoreContribution && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          +{sig.suggestedScoreContribution} pts
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed">
                    "{sig.description}"
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-stone-700">Source:</span>
                      <span>{sig.source || 'Demo route analysis'}</span>
                    </div>

                    {sig.confidenceRationale && (
                      <div className="text-[10px] text-stone-400 italic">
                        {sig.confidenceRationale}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Prototype Transparency Guardrail Banner */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-stone-800">Anomaly Confidence vs. Danger: </span>
            Anomaly confidence measures how strongly an observed telemetry pattern differs from standard transit baselines. It is <strong>never a probability of danger</strong>. The <strong>Safety State Engine</strong> remains the authoritative decision layer that evaluates cumulative signals and governs state transitions.
          </div>
        </div>
      </div>
    </div>
  );
}
