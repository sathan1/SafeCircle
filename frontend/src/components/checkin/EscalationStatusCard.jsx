import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  Lock, 
  RotateCcw, 
  Radio, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { INFO_TYPE_LABELS } from '../../services/permissionService';

const LEVEL_CONFIG = {
  LEVEL_1: {
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    title: 'Level 1 Escalation',
    subtitle: 'Primary Priority Contact Notification (Simulated)'
  },
  LEVEL_2: {
    badge: 'bg-orange-100 text-orange-900 border-orange-300',
    title: 'Level 2 Escalation',
    subtitle: 'Secondary Priority Notification Dispatch (Simulated)'
  },
  LEVEL_3: {
    badge: 'bg-red-100 text-red-900 border-red-300',
    title: 'Level 3 Escalation',
    subtitle: 'Full Emergency Escalation Dispatched (Simulated)'
  }
};

const EscalationStatusCard = ({
  escalations = [],
  onResolveEscalation,
  isProcessing = false
}) => {
  const activeEscalation = escalations.find(
    e => e.status !== 'RESOLVED' && e.status !== 'CANCELLED'
  );

  if (!activeEscalation) {
    return (
      <Card className="border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Escalation Engine Status
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Standby
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              No active escalations. Escort communications operating within standard privacy baseline.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const levelInfo = LEVEL_CONFIG[activeEscalation.level] || LEVEL_CONFIG.LEVEL_1;

  return (
    <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50/40 via-white to-white shadow-sm ring-2 ring-orange-400/20">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-orange-100 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${levelInfo.badge}`}>
              {levelInfo.title}
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              {activeEscalation.status}
            </span>
          </div>

          <h3 className="text-sm font-bold text-stone-900">
            {activeEscalation.trigger}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {activeEscalation.reason}
          </p>
        </div>

        <Button
          onClick={() => onResolveEscalation(activeEscalation.id)}
          disabled={isProcessing}
          variant="secondary"
          size="xs"
          icon={CheckCircle2}
        >
          Resolve Escalation
        </Button>
      </div>

      {/* Target Contacts with Permission Disclosures */}
      <div className="space-y-2 mb-3">
        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
          Simulated Recipient Dispatches ({activeEscalation.targetContacts?.length || 0}):
        </span>

        <div className="space-y-2">
          {(activeEscalation.targetContacts || []).map((tc, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-white border border-stone-200/80 text-xs space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-900">{tc.name}</span>
                  <span className="text-stone-400 text-[10px]">({tc.relationship})</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-stone-100 text-stone-700">
                  Priority {tc.priority}
                </span>
              </div>

              {/* Privacy Permission Disclosures */}
              <div>
                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Privacy Policy Authorization:
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(tc.allowedDisclosures || {}).map(([key, allowed]) => {
                    const label = INFO_TYPE_LABELS[key] || key;
                    return (
                      <span
                        key={key}
                        className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${
                          allowed
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-stone-100 text-stone-400 border-stone-200/50 line-through opacity-60'
                        }`}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Notice */}
      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-[10px] text-stone-500 flex items-start gap-1.5">
        <Radio className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
        <span>
          <strong>Prototype Escalation:</strong> Packets are marked <code>NOTIFIED_SIMULATION</code>. SafeCircle does not dispatch real SMS or contact external emergency authorities.
        </span>
      </div>
    </Card>
  );
};

export default EscalationStatusCard;
