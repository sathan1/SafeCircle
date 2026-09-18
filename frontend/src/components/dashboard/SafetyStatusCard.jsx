import React from 'react';
import { Shield, AlertTriangle, Activity, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSafetyState } from '../../contexts/SafetyStateContext';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import EmergencyHoldButton from '../common/EmergencyHoldButton';

const STATE_DETAILS = {
  NORMAL: {
    badgeState: 'NORMAL',
    headline: "You're Safe",
    description: "No information is being shared beyond your normal privacy settings. Your circle sees only basic status.",
    icon: Shield,
    accentBorder: 'border-l-emerald-500',
    bgTint: 'bg-emerald-50/50',
    textColor: 'text-emerald-800'
  },
  CAUTION: {
    badgeState: 'CAUTION',
    headline: 'Unusual Condition Detected',
    description: "Something unusual was detected (e.g., unexpected delay or deviation). Please check in so we know you're okay.",
    icon: AlertTriangle,
    accentBorder: 'border-l-amber-500',
    bgTint: 'bg-amber-50/60',
    textColor: 'text-amber-800'
  },
  ELEVATED: {
    badgeState: 'ELEVATED',
    headline: 'Safety Escalation Active',
    description: "We couldn't confirm your safety after prompts. Your configured trusted contacts have been notified according to your rules.",
    icon: Activity,
    accentBorder: 'border-l-orange-500',
    bgTint: 'bg-orange-50/60',
    textColor: 'text-orange-800'
  },
  CRISIS: {
    badgeState: 'CRISIS',
    headline: 'Emergency Protection Active',
    description: "Emergency condition active. Full emergency contacts notified with permitted situational details and live GPS.",
    icon: AlertCircle,
    accentBorder: 'border-l-rose-600',
    bgTint: 'bg-rose-50/60',
    textColor: 'text-rose-800'
  }
};

const SafetyStatusCard = ({ onOpenEvidence }) => {
  const { safetyState } = useSafetyState();
  const navigate = useNavigate();
  const details = STATE_DETAILS[safetyState] || STATE_DETAILS.NORMAL;
  const Icon = details.icon;

  return (
    <Card className={`border-l-4 ${details.accentBorder} ${details.bgTint} transition-colors duration-200`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-stone-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-xs border border-stone-200/80">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge state={safetyState} size="sm" />
              <span className="text-xs text-stone-500 font-medium">Deterministic Rule Authority</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight mt-0.5">
              {details.headline}
            </h2>
          </div>
        </div>

        {/* Emergency SOS Quick Hold Button */}
        <EmergencyHoldButton onOpenEvidence={onOpenEvidence} className="w-full sm:w-auto" />
      </div>

      <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <p className="text-stone-700 leading-relaxed max-w-2xl">
          {details.description}
        </p>

        <button
          onClick={() => navigate('/alerts')}
          className="flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700 whitespace-nowrap transition-colors"
        >
          <span>Safety Timeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Honest AI / Detection transparency notice */}
      <div className="mt-3 pt-2.5 border-t border-stone-200/40 flex items-center gap-1.5 text-[11px] text-stone-500">
        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span>
          SafeCircle uses explainable journey signals and user safety rules — not invasive black-box tracking.
        </span>
      </div>
    </Card>
  );
};

export default SafetyStatusCard;
