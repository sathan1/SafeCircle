import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Activity, 
  Filter, 
  Trash2, 
  Radio, 
  Clock, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { useSafetyState } from '../contexts/SafetyStateContext';
import { journeyService } from '../services/journeyService';
import { checkInService } from '../services/checkInService';
import { safetyStateService } from '../services/safetyStateService';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const { safetyState } = useSafetyState();

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const journeys = await journeyService.getJourneys();
      const active = journeys.find(j => j.status === 'ACTIVE') || journeys[0];

      const alertList = [];

      if (active) {
        const [checkIns, escalations, transitions] = await Promise.all([
          checkInService.getCheckIns(active.id).catch(() => []),
          checkInService.getEscalations(active.id).catch(() => []),
          safetyStateService.getSafetyHistory(active.id).catch(() => [])
        ]);

        // Escalations
        escalations.forEach(esc => {
          alertList.push({
            id: `esc-${esc.id}`,
            title: `${esc.level} Escalation Dispatched (Simulation)`,
            category: esc.level === 'LEVEL_3' ? 'CRISIS' : (esc.level === 'LEVEL_2' ? 'ELEVATED' : 'CAUTION'),
            desc: `Simulated notification sent to ${esc.targetContacts?.length || 1} contact(s): ${esc.trigger}. ${esc.reason}`,
            time: new Date(esc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: esc.createdAt,
            isSimulation: true,
            status: esc.status
          });
        });

        // Check-ins
        checkIns.forEach(chk => {
          if (chk.status === 'MISSED') {
            alertList.push({
              id: `chk-miss-${chk.id}`,
              title: 'Missed Check-In Alert',
              category: 'CAUTION',
              desc: `Safety verification checkpoint due at ${new Date(chk.dueAt).toLocaleTimeString()} was missed without response. Initiated Level 1 escalation.`,
              time: new Date(chk.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: chk.dueAt,
              isSimulation: false,
              status: 'MISSED'
            });
          } else if (chk.status === 'PENDING') {
            alertList.push({
              id: `chk-pend-${chk.id}`,
              title: 'Check-In Verification Pending',
              category: 'NORMAL',
              desc: `Active safety prompt awaiting user response. Due by ${new Date(chk.dueAt).toLocaleTimeString()}.`,
              time: new Date(chk.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: chk.requestedAt,
              isSimulation: false,
              status: 'PENDING'
            });
          } else if (chk.status === 'COMPLETED') {
            alertList.push({
              id: `chk-comp-${chk.id}`,
              title: chk.response === 'NEED_HELP' ? 'Assistance Request Recorded' : 'Check-In Verification Confirmed',
              category: chk.response === 'NEED_HELP' ? 'CRISIS' : 'NORMAL',
              desc: chk.response === 'NEED_HELP' 
                ? 'User indicated assistance needed via safety check-in prompt.' 
                : 'User confirmed safe status via check-in prompt. Active anomaly score cleared.',
              time: new Date(chk.respondedAt || chk.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: chk.respondedAt || chk.updatedAt,
              isSimulation: false,
              status: 'COMPLETED'
            });
          }
        });

        // State changes
        transitions.forEach(tr => {
          if (tr.previousState !== tr.newState) {
            alertList.push({
              id: `tr-${tr.id}`,
              title: `Safety State Changed: ${tr.previousState} → ${tr.newState}`,
              category: tr.newState,
              desc: `${tr.reason} (Score: ${tr.signalScore}). Evaluated by ${tr.triggeredBy}.`,
              time: new Date(tr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: tr.timestamp,
              isSimulation: false,
              status: tr.newState
            });
          }
        });
      }

      // Default baseline notice if empty
      if (alertList.length === 0) {
        alertList.push({
          id: 'init-norm',
          title: 'Escort System Baseline Confirmed',
          category: 'NORMAL',
          desc: 'Automated monitoring active. Journey operates within standard safety parameters.',
          time: 'Just now',
          timestamp: new Date().toISOString(),
          isSimulation: false,
          status: 'NORMAL'
        });
      }

      // Sort newest first
      alertList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAlerts(alertList);
    } catch (err) {
      console.warn('Failed to load live alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const filtered = filter === 'ALL'
    ? alerts
    : alerts.filter(a => a.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-1.5">
            <Bell className="w-3.5 h-3.5" />
            <span>Escort Audit & Dispatches</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Alerts & Safety Notifications
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Real-time check-in prompts, missed checkpoints, safety state shifts, and simulated escalation logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadAlerts}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setAlerts([])}
            variant="ghost"
            size="sm"
            icon={Trash2}
          >
            Clear View
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'NORMAL', 'CAUTION', 'ELEVATED', 'CRISIS'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="py-12 text-center text-stone-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
            <p className="text-xs">Fetching alert telemetry...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-12 text-stone-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
            <p className="text-sm font-medium">No notifications in this filter</p>
          </Card>
        ) : (
          filtered.map((alert) => (
            <Card
              key={alert.id}
              className="transition-all hover:border-stone-300 bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.category === 'CRISIS'
                      ? 'bg-red-100 text-red-700'
                      : alert.category === 'ELEVATED'
                      ? 'bg-orange-100 text-orange-700'
                      : alert.category === 'CAUTION'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {alert.category === 'CRISIS' ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : alert.category === 'ELEVATED' || alert.category === 'CAUTION' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">{alert.title}</h4>
                      {alert.isSimulation && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Simulation
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                      {alert.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-stone-400">{alert.time}</span>
                  <StatusBadge state={alert.category} size="sm" showDot={false} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
