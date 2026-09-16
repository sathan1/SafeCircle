import React from 'react';
import { Shield, AlertTriangle, Activity, AlertCircle } from 'lucide-react';

export const STATUS_CONFIG = {
  NORMAL: {
    label: 'NORMAL',
    display: 'Normal',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    icon: Shield
  },
  CAUTION: {
    label: 'CAUTION',
    display: 'Caution',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
    icon: AlertTriangle
  },
  ELEVATED: {
    label: 'ELEVATED',
    display: 'Elevated',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    dotColor: 'bg-orange-500',
    icon: Activity
  },
  CRISIS: {
    label: 'CRISIS',
    display: 'Crisis',
    color: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
    icon: AlertCircle
  }
};

const StatusBadge = ({ state = 'NORMAL', size = 'md', className = '', showDot = true }) => {
  const config = STATUS_CONFIG[state?.toUpperCase()] || STATUS_CONFIG.NORMAL;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide uppercase ${config.color} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />}
      <Icon className="w-3.5 h-3.5" />
      <span>{config.display}</span>
    </span>
  );
};

export default StatusBadge;
