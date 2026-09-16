import React from 'react';
import { Shield, AlertTriangle, Activity, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSafetyState } from '../../contexts/SafetyStateContext';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';

const STATE_DETAILS = {
  NORMAL: {
    bannerTitle: 'SAFE JOURNEY',
    headline: 'Routine Journey Protection',
    description: 'Your current journey is progressing normally. Telemetry is within expected bounds and no unprompted alerts have been dispatched.',
    icon: Shield,
    accentBorder: 'border-l-emerald-500',
    badgeState: 'NORMAL',
    bgTint: 'bg-emerald-50/40',
    indicatorColor: 'bg-emerald-500',
    textColor: 'text-emerald-800'
  },
  CAUTION: {
    bannerTitle: 'CAUTION CHECK-IN',
    headline: 'Minor Delay or Route Variance',
    description: 'A brief route anomaly or stationary delay was detected. SafeCircle has scheduled a prompt check-in. Trusted contacts see general journey progress.',
    icon: AlertTriangle,
    accentBorder: 'border-l-amber-500',
    badgeState: 'CAUTION',
    bgTint: 'bg-amber-50/50',
    indicatorColor: 'bg-amber-500',
    textColor: 'text-amber-800'
  },
  ELEVATED: {
    bannerTitle: 'ELEVATED MONITORING',
    headline: 'Unresolved Check-In Prompt',
    description: 'Two safety prompts elapsed without response. Authorized contacts have been notified with coarse location and journey trajectory according to your privacy rules.',
    icon: Activity,
    accentBorder: 'border-l-orange-500',
    badgeState: 'ELEVATED',
    bgTint: 'bg-orange-50/50',
    indicatorColor: 'bg-orange-500',
    textColor: 'text-orange-800'
  },
  CRISIS: {
    bannerTitle: 'CRISIS ESCALATION',
    headline: 'Emergency Circle Activated',
    description: 'Safety state escalated to Crisis. High-priority alerts dispatched to designated emergency contacts with authorized live telemetry packets.',
    icon: AlertCircle,
    accentBorder: 'border-l-red-500',
    badgeState: 'CRISIS',
    bgTint: 'bg-red-50/50',
    indicatorColor: 'bg-red-500',
    textColor: 'text-red-800'
  }
};

const SafetyStatusCard = () => {
  const { safetyState } = useSafetyState();
  const navigate = useNavigate();
  const details = STATE_DETAILS[safetyState] || STATE_DETAILS.NORMAL;
  const Icon = details.icon;

  return (
    <Card className={`border-l-4 ${details.accentBorder} ${details.bgTint} transition-all duration-300 relative overflow-hidden`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-stone-200/70 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-stone-800" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {details.bannerTitle}
              </span>
              <StatusBadge state={safetyState} size="sm" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mb-2">
              {details.headline}
            </h2>
            <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
              {details.description}
            </p>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/50">
          <button
            onClick={() => navigate('/demo')}
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer bg-white/80 px-3 py-1.5 rounded-xl border border-rose-100"
          >
            <span>Simulate States</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default SafetyStatusCard;
