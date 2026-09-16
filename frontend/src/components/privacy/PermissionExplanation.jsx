import React from 'react';
import { Shield, Info, AlertTriangle, Activity, AlertCircle } from 'lucide-react';
import Card from '../common/Card';

const TIERS = [
  {
    state: 'NORMAL',
    title: 'Normal State',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    icon: Shield,
    desc: 'Your trusted contacts receive only the minimal baseline information you have explicitly authorized (typically general journey status only).'
  },
  {
    state: 'CAUTION',
    title: 'Caution State',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    desc: 'Triggered upon minor route variance or stationary delay. Additional safety check signals may become available according to your configured rules.'
  },
  {
    state: 'ELEVATED',
    title: 'Elevated State',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    icon: Activity,
    desc: 'Triggered when safety prompts remain unacknowledged. Coarse location radius and trajectory data are unlocked for selected contacts as authorized.'
  },
  {
    state: 'CRISIS',
    title: 'Crisis State',
    color: 'text-red-700 bg-red-50 border-red-200',
    icon: AlertCircle,
    desc: 'Triggered during confirmed emergency or prolonged silence. Pre-authorized crisis circle receives emergency packets and live location telemetry.'
  }
];

const PermissionExplanation = () => {
  return (
    <Card className="border border-stone-200/80 bg-white">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-stone-900">
            How the SafeCircle Engine Works
          </h3>
          <p className="text-xs text-stone-500">
            Progressive data release governed deterministically by user-owned policies.
          </p>
        </div>
      </div>

      <p className="text-xs text-stone-600 mb-4 leading-relaxed">
        SafeCircle operates on the principle of <em>progressive disclosure</em>. Rather than continuously broadcasting your live location, the platform enforces your personal privacy matrix, escalating data access only when safety conditions shift.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          return (
            <div key={tier.state} className="p-3 rounded-xl bg-[#fcf8f8] border border-stone-200/70">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tier.color}`}>
                  {tier.state}
                </span>
                <span className="font-bold text-stone-900">{tier.title}</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-snug">
                {tier.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-[11px] text-stone-500">
        <strong>Privacy Assurance:</strong> Permissions are evaluated server-side. No private GPS coordinate or telemetry packet is ever transmitted to a contact without passing explicit authorization.
      </div>
    </Card>
  );
};

export default PermissionExplanation;
