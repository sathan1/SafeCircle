import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  AlertCircle, 
  Info, 
  Cpu, 
  HelpCircle,
  Clock
} from 'lucide-react';
import Card from '../common/Card';

const STATE_CONFIG = {
  NORMAL: {
    label: 'NORMAL',
    title: 'Standard Escort Baseline',
    colorText: 'text-emerald-700',
    colorBg: 'bg-emerald-50',
    colorBorder: 'border-emerald-200',
    barColor: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: ShieldCheck,
    description: 'All movement indicators are within baseline thresholds. Journey proceeds with silent background monitoring.'
  },
  CAUTION: {
    label: 'CAUTION',
    title: 'Minor Variance Detected',
    colorText: 'text-amber-700',
    colorBg: 'bg-amber-50',
    colorBorder: 'border-amber-200',
    barColor: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: AlertTriangle,
    description: 'Unusual journey conditions detected (such as an unscheduled detour or prolonged stop). Discreet user prompt initiated.'
  },
  ELEVATED: {
    label: 'ELEVATED',
    title: 'Unresolved Escort Signals',
    colorText: 'text-orange-700',
    colorBg: 'bg-orange-50',
    colorBorder: 'border-orange-200',
    barColor: 'bg-orange-500',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: Activity,
    description: 'Multiple or recurring anomaly signals without user clearance. Authorizes configured secondary disclosures per privacy policy.'
  },
  CRISIS: {
    label: 'CRISIS',
    title: 'Critical Emergency Threshold',
    colorText: 'text-red-700',
    colorBg: 'bg-red-50',
    colorBorder: 'border-red-200',
    barColor: 'bg-red-600',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    icon: AlertCircle,
    description: 'Urgent emergency condition activated or critical safety signal score exceeded. Escalation disclosures dispatched to authorized circle.'
  }
};

const SafetyExplainabilityCard = ({
  state = 'NORMAL',
  signalScore = 0,
  activeSignals = [],
  reason = '',
  lastSafeConfirmation = null
}) => {
  const upperState = (state || 'NORMAL').toUpperCase();
  const config = STATE_CONFIG[upperState] || STATE_CONFIG.NORMAL;
  const Icon = config.icon;

  // Normalized score percentage for progress bar (capped at 100)
  const scorePercent = Math.min(100, Math.max(0, signalScore));

  return (
    <Card className={`border-2 ${config.colorBorder} ${config.colorBg}/30 bg-white transition-all shadow-xs`}>
      {/* 1. Header & State Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 mb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-0.5">
            CURRENT SAFETY STATE
          </span>
          <div className="flex items-center gap-2.5">
            <h2 className={`text-2xl sm:text-3xl font-black ${config.colorText} tracking-tight`}>
              {config.label}
            </h2>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${config.badgeClass}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{config.title}</span>
            </span>
          </div>
        </div>

        {/* Source & Engine Label */}
        <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/70 self-start sm:self-auto">
          <Cpu className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Source: <strong>Safety State Engine</strong></span>
        </div>
      </div>

      {/* 2. Safety Signal Score Meter */}
      <div className="bg-[#fcf8f8] rounded-2xl p-4 border border-stone-200/70 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Safety Signal Score:</span>
              <span className={`text-base font-extrabold ${config.colorText}`}>
                {signalScore}
              </span>
              <span className="text-stone-600 text-xs font-normal">/ 100</span>
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Cumulative anomaly score evaluated across active journey events.
            </p>
          </div>

          {/* Threshold Legend Indicator */}
          <div className="flex items-center gap-1 text-[10px] font-semibold text-stone-600">
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">0-29 Normal</span>
            <span>→</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">30-49 Caution</span>
            <span>→</span>
            <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">50-74 Elevated</span>
            <span>→</span>
            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">75+ Crisis</span>
          </div>
        </div>

        {/* Meter Bar */}
        <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${config.barColor}`} 
            style={{ width: `${Math.max(4, scorePercent)}%` }}
          />
        </div>
      </div>

      {/* 3. "Why is the state currently here?" Explainability Section */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-rose-600" />
          <span>Why is the state currently here?</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2.5">
          <p className="text-xs text-stone-700 font-medium leading-relaxed">
            {reason || config.description}
          </p>

          {/* Active Contributing Signals */}
          {activeSignals && activeSignals.length > 0 ? (
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                Active Contributing Signals:
              </span>
              <div className="space-y-1.5">
                {activeSignals.map((sig, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="font-bold text-stone-800">{sig.description || sig.type}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      +{sig.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-600 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>No active anomaly signals currently accumulating score.</span>
            </div>
          )}

          {lastSafeConfirmation && (
            <div className="text-[10px] text-stone-600 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>Last user safety clearance: {new Date(lastSafeConfirmation).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Prototype Disclaimer */}
      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-stone-700">Prototype rule-based evaluation: </strong>
          <span>The Safety Signal Score reflects simulated escort rule contributions. SafeCircle does not claim this score represents a scientifically verified probability of physical danger.</span>
        </div>
      </div>
    </Card>
  );
};

export default SafetyExplainabilityCard;
