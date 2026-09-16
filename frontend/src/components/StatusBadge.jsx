import React from 'react';
import { Shield, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';

const StatusBadge = ({ state = 'NORMAL', className = '' }) => {
  const configs = {
    NORMAL: {
      color: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20",
      icon: Shield,
      label: "Normal"
    },
    CAUTION: {
      color: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
      icon: AlertTriangle,
      label: "Caution"
    },
    ELEVATED: {
      color: "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20",
      icon: Activity,
      label: "Elevated"
    },
    CRISIS: {
      color: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
      icon: ShieldAlert,
      label: "Crisis"
    }
  };

  const config = configs[state] || configs.NORMAL;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color} ${className}`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
