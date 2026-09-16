import React from 'react';
import { Shield, AlertTriangle, Activity, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';

const STATE_CONFIGS = {
  NORMAL: {
    banner: 'SAFE JOURNEY',
    headline: 'Standard Journey Protection',
    description: 'Your journey is currently progressing normally within expected route boundaries.',
    icon: Shield,
    accentBorder: 'border-l-emerald-500',
    bgTint: 'bg-emerald-50/40',
    textColor: 'text-emerald-800'
  },
  CAUTION: {
    banner: 'CAUTION STATE',
    headline: 'Minor Delay or Stationary Variance',
    description: 'A mild delay or stationary variance was observed. A gentle check-in prompt has been scheduled.',
    icon: AlertTriangle,
    accentBorder: 'border-l-amber-500',
    bgTint: 'bg-amber-50/50',
    textColor: 'text-amber-800'
  },
  ELEVATED: {
    banner: 'ELEVATED MONITORING',
    headline: 'Unacknowledged Safety Prompt',
    description: 'Safety check elapsed without response. Coarse status dispatched to authorized contacts.',
    icon: Activity,
    accentBorder: 'border-l-orange-500',
    bgTint: 'bg-orange-50/50',
    textColor: 'text-orange-800'
  },
  CRISIS: {
    banner: 'CRISIS ESCALATION',
    headline: 'Emergency Protocol Active',
    description: 'Emergency threshold triggered. High-priority escalation dispatched to all designated circle contacts.',
    icon: AlertCircle,
    accentBorder: 'border-l-red-500',
    bgTint: 'bg-red-50/50',
    textColor: 'text-red-800'
  }
};

const SafetyStatusCard = ({ state = 'NORMAL' }) => {
  const config = STATE_CONFIGS[state?.toUpperCase()] || STATE_CONFIGS.NORMAL;
  const Icon = config.icon;

  return (
    <Card className={`border-l-4 ${config.accentBorder} ${config.bgTint} transition-all duration-300 relative`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-stone-200/70 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-stone-800" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {config.banner}
              </span>
              <StatusBadge state={state} size="sm" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mb-1">
              {config.headline}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SafetyStatusCard;
