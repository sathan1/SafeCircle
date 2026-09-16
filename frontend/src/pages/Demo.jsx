import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sliders, 
  Shield, 
  AlertTriangle, 
  Activity, 
  AlertCircle, 
  RotateCcw, 
  Info,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  Radio,
  HelpCircle,
  Cpu,
  ArrowRight,
  ExternalLink,
  Route as RouteIcon,
  BellRing,
  CheckCircle2,
  ShieldAlert,
  Smartphone,
  Watch,
  Wifi,
  WifiOff,
  Calculator,
  Power
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import StatusBadge from '../components/common/StatusBadge';
import { useSafetyState } from '../contexts/SafetyStateContext';
import { journeyService } from '../services/journeyService';
import { safetyStateService } from '../services/safetyStateService';
import { checkInService } from '../services/checkInService';
import { anomalyService } from '../services/anomalyService';
import { deviceService } from '../services/deviceService';
import AdvancedSafetyConceptsCard from '../components/safety/AdvancedSafetyConceptsCard';
import { INFO_TYPE_LABELS } from '../services/permissionService';

const ENGINE_EVENTS = [
  {
    type: 'ROUTE_DEVIATION',
    title: 'Route Deviation',
    score: '+25',
    severity: 'MEDIUM',
    icon: RouteIcon,
    tag: 'Sensory Variance',
    description: 'Vehicle deviates from customary or SafePath corridor into unmapped alleyway.',
    triggerDetail: 'Simulated deviation detected (+25 anomaly contribution).'
  },
  {
    type: 'PROLONGED_STOP',
    title: 'Prolonged Stop',
    score: '+20',
    severity: 'MEDIUM',
    icon: Clock,
    tag: 'Motion Variance',
    description: 'Stationary for > 8 mins in an unscheduled, low-commercial activity area.',
    triggerDetail: 'Simulated prolonged stationary state (+20 anomaly contribution).'
  },
  {
    type: 'MISSED_CHECKIN',
    title: 'Missed Check-in',
    score: '+25',
    severity: 'MEDIUM',
    icon: AlertTriangle,
    tag: 'Prompt Timeout',
    description: 'User failed to respond to the 2-minute discreet check-in notification.',
    triggerDetail: 'Checkpoint prompt expired without acknowledgement (+25 anomaly contribution).'
  },
  {
    type: 'DEVICE_OFFLINE',
    title: 'Device Offline',
    score: '+10',
    severity: 'LOW',
    icon: Radio,
    tag: 'Telemetry Gap',
    description: 'Cellular Escort heartbeat disconnected or intermittent signal drop.',
    triggerDetail: 'Simulated temporary telemetry dropout (+10 anomaly contribution).'
  },
  {
    type: 'NEED_HELP',
    title: 'Need Help',
    score: '+50',
    severity: 'HIGH',
    icon: Activity,
    tag: 'User Triggered',
    description: 'User explicitly triggered discreet assistance signal from phone or widget.',
    triggerDetail: 'Discreet help signal initiated by user (+50 anomaly contribution).'
  },
  {
    type: 'EMERGENCY_ACTIVATED',
    title: 'Emergency Activated',
    score: 'CRITICAL',
    severity: 'CRITICAL',
    icon: AlertCircle,
    tag: 'Immediate Crisis',
    description: 'Urgent distress beacon triggered. Direct threshold override straight to CRISIS.',
    triggerDetail: 'Critical emergency beacon activated. Immediate CRISIS escalation.'
  }
];

const Demo = () => {
  const { setSafetyState, isDiscreetMode, toggleDiscreetMode } = useSafetyState();

  const [activeJourney, setActiveJourney] = useState(null);
  const [safetyStateData, setSafetyStateData] = useState(null);
  const [safetyHistory, setSafetyHistory] = useState([]);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [escalationsList, setEscalationsList] = useState([]);
  const [anomalyAnalysis, setAnomalyAnalysis] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadAllSimulatorData = useCallback(async () => {
    setIsLoading(true);
    try {
      const journeys = await journeyService.getJourneys();
      const active = journeys.find(j => j.status === 'ACTIVE') || journeys[0];
      setActiveJourney(active);

      if (active) {
        const [stateRes, historyRes, chkRes, escRes, anomRes, devRes] = await Promise.all([
          safetyStateService.getSafetyState(active.id).catch(() => null),
          safetyStateService.getSafetyHistory(active.id).catch(() => []),
          checkInService.getActiveCheckIn(active.id).catch(() => null),
          checkInService.getEscalations(active.id).catch(() => []),
          anomalyService.getAnomalyAnalysis(active.id).catch(() => null),
          deviceService.getDeviceStatus(active.id).catch(() => null)
        ]);
        setSafetyStateData(stateRes);
        setSafetyHistory(historyRes);
        setActiveCheckIn(chkRes);
        setEscalationsList(escRes);
        setAnomalyAnalysis(anomRes);
        setDeviceStatus(devRes);

        if (stateRes) {
          setSafetyState(stateRes.state, stateRes.reason);
        }
      }
    } catch (err) {
      console.error('Failed to load demo data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setSafetyState]);

  useEffect(() => {
    loadAllSimulatorData();
  }, [loadAllSimulatorData]);

  // Refresh helper
  const refreshSimulatorState = async () => {
    if (!activeJourney) return;
    try {
      const [stateRes, historyRes, chkRes, escRes, anomRes, devRes] = await Promise.all([
        safetyStateService.getSafetyState(activeJourney.id),
        safetyStateService.getSafetyHistory(activeJourney.id),
        checkInService.getActiveCheckIn(activeJourney.id).catch(() => null),
        checkInService.getEscalations(activeJourney.id).catch(() => []),
        anomalyService.getAnomalyAnalysis(activeJourney.id).catch(() => null),
        deviceService.getDeviceStatus(activeJourney.id).catch(() => null)
      ]);
      setSafetyStateData(stateRes);
      setSafetyHistory(historyRes);
      setActiveCheckIn(chkRes);
      setEscalationsList(escRes);
      setAnomalyAnalysis(anomRes);
      setDeviceStatus(devRes);
      if (stateRes) {
        setSafetyState(stateRes.state, stateRes.reason);
      }
    } catch (err) {
      console.warn('Failed to refresh simulator state:', err);
    }
  };

  // Phase 10: Simulate explainable anomaly signal
  const handleSimulateAnomaly = async (type, label, metadata = {}) => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      await anomalyService.simulateAnomaly(activeJourney.id, {
        type,
        description: `Simulated anomaly: ${label}`,
        metadata
      });
      await refreshSimulatorState();
      showToast(`Simulated anomaly signal "${label}" processed by Safety State Engine.`);
    } catch (err) {
      showToast(err.message || 'Failed to simulate anomaly signal', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAnomalySignals = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      await anomalyService.clearSignals(activeJourney.id);
      await refreshSimulatorState();
      showToast('Anomaly signals cleared. Safety state reset to NORMAL baseline.');
    } catch (err) {
      showToast(err.message || 'Failed to clear anomaly signals', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger simulated journey event
  const handleTriggerEvent = async (eventDef) => {
    if (!activeJourney) {
      showToast('No active journey found to run Safety State Engine', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await safetyStateService.addEvent(activeJourney.id, {
        type: eventDef.type,
        description: eventDef.triggerDetail,
        source: 'DEMO'
      });

      await refreshSimulatorState();

      if (result.stateChanged) {
        showToast(`Escalated to ${result.currentSafetyState}! Score: ${result.signalScore}`, 'info');
      } else {
        showToast(`Event processed: ${eventDef.title} (Score: ${result.signalScore})`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to simulate event', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // CHECK-IN CONTROLS
  const handleCreateCheckIn = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      const chk = await checkInService.createCheckIn(activeJourney.id, { minutesUntilDue: 5 });
      setActiveCheckIn(chk);
      await refreshSimulatorState();
      showToast('Check-In prompt requested. Status: PENDING (5 min timer).');
    } catch (err) {
      showToast(err.message || 'Failed to create check-in', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsSafe = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      if (activeCheckIn && activeCheckIn.status === 'PENDING') {
        await checkInService.respondToCheckIn(activeCheckIn.id, 'SAFE');
      } else {
        await safetyStateService.addEvent(activeJourney.id, {
          type: 'USER_CONFIRMED_SAFE',
          description: 'User confirmed safe via simulator clearance',
          source: 'USER'
        });
      }

      await refreshSimulatorState();
      showToast('Safety confirmed! Check-in COMPLETED, active anomalies cleared.');
    } catch (err) {
      showToast(err.message || 'Failed to confirm safety', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsNeedHelp = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      if (activeCheckIn && activeCheckIn.status === 'PENDING') {
        await checkInService.respondToCheckIn(activeCheckIn.id, 'NEED_HELP');
      } else {
        await safetyStateService.addEvent(activeJourney.id, {
          type: 'NEED_HELP',
          description: 'User triggered NEED_HELP in simulator',
          source: 'USER'
        });
      }

      await refreshSimulatorState();
      showToast('Need Help dispatched. Initiated simulated escalation.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to trigger help response', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateMissedCheckIn = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      // If no check-in exists, create an already-overdue one
      if (!activeCheckIn || activeCheckIn.status !== 'PENDING') {
        const pastDue = new Date(Date.now() - 30 * 1000).toISOString();
        await checkInService.createCheckIn(activeJourney.id, { dueAt: pastDue });
      } else {
        // Force the active check-in to be overdue
        const pastDue = new Date(Date.now() - 30 * 1000).toISOString();
        activeCheckIn.dueAt = pastDue;
      }

      const results = await checkInService.checkMissedCheckIns(activeJourney.id);
      await refreshSimulatorState();

      showToast('Simulated Missed Check-In! Status: MISSED -> Level 1 Escalation dispatched.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to simulate missed check-in', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetCheckInDemo = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      await Promise.all([
        checkInService.resetCheckIns(activeJourney.id),
        safetyStateService.resetSafetySimulation(activeJourney.id),
        anomalyService.clearSignals(activeJourney.id).catch(() => null),
        deviceService.resetDeviceState(activeJourney.id).catch(() => null)
      ]);
      await refreshSimulatorState();
      showToast('Demo state safely reset to NORMAL baseline (Score 0). Permanent contacts and journeys preserved.');
    } catch (err) {
      showToast(err.message || 'Failed to reset demo', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Phase 11: Device Fallback Actions
  const handlePhoneUnavailable = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      await deviceService.simulatePhoneUnavailable(activeJourney.id);
      await refreshSimulatorState();
      showToast('Primary phone unavailable — wearable fallback engaged (+10 score contribution).', 'warning');
    } catch (err) {
      showToast(err.message || 'Failed to set phone unavailable', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhoneConnected = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      await deviceService.simulatePhoneConnected(activeJourney.id);
      await refreshSimulatorState();
      showToast('Primary phone reconnected — companion wearable returned to standby.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to reconnect phone', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWearableConnected = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      await deviceService.simulateWearableStatus(activeJourney.id, 'CONNECTED');
      await refreshSimulatorState();
      showToast('Companion wearable connected and synchronized.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to connect wearable', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWearableDisconnected = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      await deviceService.simulateWearableStatus(activeJourney.id, 'DISCONNECTED');
      await refreshSimulatorState();
      showToast('Companion wearable disconnected.', 'warning');
    } catch (err) {
      showToast(err.message || 'Failed to disconnect wearable', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDeviceState = async () => {
    if (!activeJourney) return;
    setIsProcessing(true);
    try {
      await deviceService.resetDeviceState(activeJourney.id);
      await refreshSimulatorState();
      showToast('Device connectivity restored to initial defaults (Phone Connected).', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to reset device state', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentState = safetyStateData?.state || activeJourney?.currentState || 'NORMAL';
  const signalScore = safetyStateData?.signalScore || 0;
  const activeEscalation = escalationsList.find(e => e.status !== 'RESOLVED' && e.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete System Simulator · Phase 13 Final</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            SafeCircle Demo Simulator
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Interactive laboratory to demonstrate Safety State transitions, Check-In prompts, Circle Escalations, Anomaly Intelligence, Device Fallback, and Discreet Mode.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleResetCheckInDemo}
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            disabled={isProcessing}
          >
            Reset Demo
          </Button>
        </div>
      </div>

      {/* Target Active Journey Banner */}
      {activeJourney && (
        <Card className="border border-stone-200/80 bg-white py-3 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-stone-900">Active Escort Journey:</span>
              <span className="text-stone-700 font-medium">
                {activeJourney.startLocation?.name} → {activeJourney.destination?.name}
              </span>
              <span className="font-mono text-stone-600 text-[11px]">({activeJourney.id})</span>
            </div>

            <a
              href={`/journeys/${activeJourney.id}`}
              className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 self-end sm:self-auto"
            >
              Open Live Journey <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </Card>
      )}

      {/* PHASE 8: CHECK-IN & ESCALATION SIMULATOR SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-rose-600" />
              <span>Safety Check-In & Escalation Controls</span>
            </h2>
            <p className="text-xs text-stone-500">
              Trigger check-ins, simulate missed checkpoints, and inspect privacy-governed escalation records.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Phase 8 Active
          </span>
        </div>

        {/* Check-In Action Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleCreateCheckIn}
            className="p-3 rounded-xl bg-white border border-stone-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Clock className="w-4 h-4 text-stone-600 mb-1.5" />
            <div className="font-bold text-xs text-stone-900">Create Check-In</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Prompt user with timer</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleMarkAsSafe}
            className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1.5" />
            <div className="font-bold text-xs text-emerald-950">Mark as Safe</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Clear score to 0</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleMarkAsNeedHelp}
            className="p-3 rounded-xl bg-orange-50 border border-orange-300 hover:bg-orange-100 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <ShieldAlert className="w-4 h-4 text-orange-700 mb-1.5" />
            <div className="font-bold text-xs text-orange-950">Mark Need Help</div>
            <div className="text-[10px] text-orange-700 mt-0.5">Trigger Level 3 Esc.</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSimulateMissedCheckIn}
            className="p-3 rounded-xl bg-red-50 border border-red-300 hover:bg-red-100 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4 text-red-700 mb-1.5" />
            <div className="font-bold text-xs text-red-950">Simulate Missed</div>
            <div className="text-[10px] text-red-700 mt-0.5">+25 score & Level 1 Esc.</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleResetCheckInDemo}
            className="p-3 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50 col-span-2 sm:col-span-1"
          >
            <RotateCcw className="w-4 h-4 text-stone-500 mb-1.5" />
            <div className="font-bold text-xs text-stone-800">Reset Demo</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Revert to baseline</div>
          </button>
        </div>

        {/* Status Display Grid: Active Check-In & Active Escalation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Check-In Status */}
          <Card className="border border-stone-200/80 bg-white">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 mb-3">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Current Check-In Status
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                activeCheckIn
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}>
                {activeCheckIn ? 'PENDING RESPONSE' : 'NO PENDING CHECK-IN'}
              </span>
            </div>

            {activeCheckIn ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Check-In ID:</span>
                  <span className="font-mono text-stone-800">{activeCheckIn.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Requested:</span>
                  <span className="font-bold text-stone-800">{new Date(activeCheckIn.requestedAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Due By:</span>
                  <span className="font-bold text-amber-800">{new Date(activeCheckIn.dueAt).toLocaleTimeString()}</span>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={handleMarkAsSafe}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
                  >
                    Respond SAFE
                  </button>
                  <button
                    onClick={handleMarkAsNeedHelp}
                    className="flex-1 py-1.5 rounded-lg bg-orange-600 text-white font-bold text-[11px] cursor-pointer"
                  >
                    Respond NEED HELP
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-stone-400">
                No active check-in. Click "Create Check-In" above to launch a prompt.
              </div>
            )}
          </Card>

          {/* Active Escalation Status */}
          <Card className="border border-stone-200/80 bg-white">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 mb-3">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Escalation Engine Dispatch
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                activeEscalation
                  ? 'bg-orange-100 text-orange-900 border-orange-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {activeEscalation ? activeEscalation.level : 'STANDBY'}
              </span>
            </div>

            {activeEscalation ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px]">Trigger:</span>
                  <span className="font-bold text-stone-900">{activeEscalation.trigger}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Status:</span>
                  <span className="font-mono text-orange-700 font-bold">{activeEscalation.status}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Dispatched Recipients:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(activeEscalation.targetContacts || []).map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-medium text-[10px]">
                        {c.name} (Priority {c.priority})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-stone-400">
                No active escalations. Escort operating within baseline bounds.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* PHASE 10: ANOMALY INTELLIGENCE SIMULATOR SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>Anomaly Intelligence Simulator</span>
            </h2>
            <p className="text-xs text-stone-500">
              Generate transparent, explainable anomaly signals and feed them to the Safety State Engine.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Phase 10 · Rule-Based
          </span>
        </div>

        {/* Anomaly Controls Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSimulateAnomaly('ROUTE_DEVIATION', 'Route Deviation', { deviationMeters: 380 })}
            className="p-3 rounded-xl bg-white border border-stone-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RouteIcon className="w-4 h-4 text-rose-600 mb-1.5" />
            <div className="font-bold text-xs text-stone-900">Route Deviation</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Corridor divergence (Med/High)</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSimulateAnomaly('PROLONGED_STOP', 'Prolonged Stop', { stopDurationMinutes: 14 })}
            className="p-3 rounded-xl bg-white border border-stone-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Clock className="w-4 h-4 text-amber-600 mb-1.5" />
            <div className="font-bold text-xs text-stone-900">Prolonged Stop</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Stationary dwell &gt; 12 mins</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSimulateAnomaly('UNUSUAL_JOURNEY_DELAY', 'Unexpected Delay', { delayMinutes: 20 })}
            className="p-3 rounded-xl bg-white border border-stone-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Clock className="w-4 h-4 text-orange-600 mb-1.5" />
            <div className="font-bold text-xs text-stone-900">Simulate Delay</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Slow progress vs ETA</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSimulateAnomaly('DEVICE_OFFLINE', 'Device Offline')}
            className="p-3 rounded-xl bg-white border border-stone-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Radio className="w-4 h-4 text-stone-600 mb-1.5" />
            <div className="font-bold text-xs text-stone-900">Device Offline</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Telemetry dropout (Low)</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleClearAnomalySignals}
            className="p-3 rounded-xl bg-stone-100 border border-stone-300 hover:bg-stone-200 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 text-stone-700 mb-1.5" />
            <div className="font-bold text-xs text-stone-900">Clear Signals</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Reset anomaly baseline</div>
          </button>
        </div>

        {/* Active Detected Signals Panel */}
        <Card className="border border-stone-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-rose-600" />
              Active Anomaly Signals ({anomalyAnalysis?.signals?.length || 0})
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
              Demo / Prototype Simulation
            </span>
          </div>

          {(anomalyAnalysis?.signals || []).length === 0 ? (
            <div className="py-4 text-center text-xs text-stone-400">
              No active anomaly signals detected. Transit conforms to expected SafePath corridor.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {anomalyAnalysis.signals.map((sig, i) => (
                <div key={i} className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{sig.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                      sig.confidence === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      sig.confidence === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      Anomaly confidence: {sig.confidence}
                    </span>
                  </div>
                  <p className="text-stone-600 text-[11px]">"{sig.description}"</p>
                  <div className="flex justify-between text-[10px] text-stone-400 pt-1">
                    <span>Source: {sig.source}</span>
                    <span>+{sig.suggestedScoreContribution} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* PHASE 11: DEVICE FALLBACK SIMULATOR SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Watch className="w-4 h-4 text-rose-600" />
              <span>Device Fallback Simulator</span>
            </h2>
            <p className="text-xs text-stone-500">
              Simulate primary phone connection loss and automatic companion wearable fallback.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Phase 11 · Hardware Integration Simulation
          </span>
        </div>

        {/* Device Controls Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePhoneConnected}
            className="p-3 rounded-xl bg-white border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/30 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Smartphone className="w-4 h-4 text-emerald-600 mb-1.5" />
            <div className="font-bold text-xs text-stone-900">Phone Connected</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Primary device active</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePhoneUnavailable}
            className="p-3 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-400 hover:bg-amber-100/60 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <WifiOff className="w-4 h-4 text-amber-700 mb-1.5" />
            <div className="font-bold text-xs text-amber-950">Phone Unavailable</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Engage wearable fallback (+10 pts)</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleWearableConnected}
            className="p-3 rounded-xl bg-white border border-stone-200 hover:border-rose-400 hover:bg-rose-50/30 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Watch className="w-4 h-4 text-rose-600 mb-1.5" />
            <div className="font-bold text-xs text-stone-900">Wearable Connected</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Companion BLE / LTE sync</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleWearableDisconnected}
            className="p-3 rounded-xl bg-white border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Watch className="w-4 h-4 text-stone-500 mb-1.5" />
            <div className="font-bold text-xs text-stone-700">Wearable Offline</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Set companion disconnected</div>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleResetDeviceState}
            className="p-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-rose-300 hover:bg-rose-50/40 text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 text-stone-600 mb-1.5" />
            <div className="font-bold text-xs text-stone-900">Reset Devices</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Restore initial defaults</div>
          </button>
        </div>

        {/* Live Device Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Primary Phone Status */}
          <Card className="border border-stone-200/80 bg-white">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-stone-700" />
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Primary Device · Smartphone
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                deviceStatus?.phone?.status === 'CONNECTED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : deviceStatus?.phone?.status === 'UNAVAILABLE'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}>
                {deviceStatus?.phone?.status || 'CONNECTED'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span className="text-stone-400">Connection:</span>
                <span className="font-medium text-stone-800">{deviceStatus?.phone?.connectionType || 'Cellular 5G'}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span className="text-stone-400">Battery Level:</span>
                <span className="font-mono font-bold text-stone-800">{deviceStatus?.phone?.batteryLevel ?? 88}%</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span className="text-stone-400">Last Synchronized:</span>
                <span className="font-mono text-[11px] text-stone-500">
                  {deviceStatus?.phone?.lastSeen ? new Date(deviceStatus.phone.lastSeen).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
              {deviceStatus?.phone?.status === 'UNAVAILABLE' && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>Primary escort link unreachable. Companion wearable elevated to active fallback source.</span>
                </div>
              )}
            </div>
          </Card>

          {/* Companion Wearable Status */}
          <Card className="border border-stone-200/80 bg-white">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <Watch className="w-4 h-4 text-stone-700" />
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Companion Device · Smartwatch
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {deviceStatus?.wearable?.isFallbackActive && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                    FALLBACK ACTIVE
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  deviceStatus?.wearable?.status === 'CONNECTED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}>
                  {deviceStatus?.wearable?.status || 'CONNECTED'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span className="text-stone-400">Role:</span>
                <span className="font-medium text-stone-800">
                  {deviceStatus?.wearable?.isFallbackActive ? 'Active Fallback Telemetry' : 'Standby Companion'}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span className="text-stone-400">Connection:</span>
                <span className="font-medium text-stone-800">{deviceStatus?.wearable?.connectionType || 'BLE + LTE'}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span className="text-stone-400">Battery Level:</span>
                <span className="font-mono font-bold text-stone-800">{deviceStatus?.wearable?.batteryLevel ?? 92}%</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span className="text-stone-400">Last Synchronized:</span>
                <span className="font-mono text-[11px] text-stone-500">
                  {deviceStatus?.wearable?.lastSeen ? new Date(deviceStatus.wearable.lastSeen).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Fallback Engaged Notice */}
        {deviceStatus?.activeFallbackEngaged && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="leading-relaxed">
              <strong className="font-bold">Hardware Integration Simulation Active:</strong> Companion wearable has assumed telemetry duty following primary device disruption. SafeCircle safety state engine received a explainable <code className="font-mono text-[11px] bg-rose-100 px-1 py-0.5 rounded">DEVICE_OFFLINE</code> signal (+10 score contribution).
            </div>
          </div>
        )}
      </div>

      {/* PHASE 12: DISCREET MODE & ADVANCED DEVICE SAFETY CONCEPTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-rose-600" />
              <span>Discreet Interaction & Advanced Device Safety Concepts</span>
            </h2>
            <p className="text-xs text-stone-500">
              Test neutral utility discreet mode and inspect future OS-level hardware safety architecture.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Phase 12 Active
          </span>
        </div>

        {/* Discreet Mode Launch Card */}
        <Card className="border border-stone-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-stone-700" />
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Discreet Mode Interface Switcher
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  {isDiscreetMode ? 'DISCREET MODE' : 'STANDARD MODE'}
                </span>
              </div>
              <p className="text-xs text-stone-600 max-w-xl">
                Toggles between Standard SafeCircle view and a neutral calculator interface. Background monitoring, journey status, and contact visibility policies continue running seamlessly.
              </p>
            </div>

            <Button
              onClick={toggleDiscreetMode}
              variant="primary"
              size="sm"
              icon={Calculator}
            >
              {isDiscreetMode ? 'Exit Discreet Mode' : 'Switch to Discreet Mode'}
            </Button>
          </div>
        </Card>

        {/* Advanced Safety Concepts Card Component */}
        <AdvancedSafetyConceptsCard />
      </div>

      {/* PHASE 7 ENGINE STATUS & SIGNAL SCORING */}
      <Card className="border-2 border-stone-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-3">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Live Safety State Evaluation
            </span>

            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-stone-900">
                {currentState}
              </h2>
              <StatusBadge state={currentState} size="lg" />
            </div>

            {/* Score Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-stone-700">
                <span>Safety Signal Score: <strong className="text-rose-600">{signalScore}</strong> / 100</span>
                <span className="text-stone-600 text-[11px]">Threshold Rule</span>
              </div>
              <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    currentState === 'CRISIS' ? 'bg-red-600' :
                    currentState === 'ELEVATED' ? 'bg-orange-500' :
                    currentState === 'CAUTION' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(4, signalScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-600 font-semibold pt-0.5">
                <span>0 Normal</span>
                <span>30 Caution</span>
                <span>50 Elevated</span>
                <span>75+ Crisis</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 bg-[#fcf8f8] p-4 rounded-2xl border border-stone-200/70 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-rose-600" />
              <span>Engine Explainability</span>
            </div>

            <p className="text-xs text-stone-700 font-medium leading-relaxed">
              {safetyStateData?.reason || 'Standard escort baseline — no active anomaly signals detected.'}
            </p>

            {safetyStateData?.signals && safetyStateData.signals.length > 0 ? (
              <div>
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                  Active Signals Contributing to Score:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {safetyStateData.signals.map((s, idx) => (
                    <span 
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 font-medium shadow-2xs"
                    >
                      {s.description} <strong>(+{s.score})</strong>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-stone-600 italic">
                Active anomaly signals: 0
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Simulator Event Buttons Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Trigger Journey Anomaly Events
            </h2>
            <p className="text-xs text-stone-600">
              Simulate realistic escort variances. Each event contributes points to the Safety Signal Score.
            </p>
          </div>
          <span className="text-xs text-stone-600 font-mono">
            6 Prototype Rules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENGINE_EVENTS.map((evt) => {
            const Icon = evt.icon;
            const isCritical = evt.score === 'CRITICAL';

            return (
              <Card
                key={evt.type}
                className="flex flex-col justify-between hover:border-rose-300 hover:shadow-xs transition-all bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      isCritical
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      Score: {evt.score}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 mb-0.5">
                    {evt.title}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-rose-600 block mb-1.5">
                    {evt.tag}
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {evt.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleTriggerEvent(evt)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    isCritical
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  } disabled:opacity-50`}
                >
                  Simulate {evt.title} ({evt.score})
                </button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Realism Notice */}
      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold text-stone-700">Demo / Prototype Simulation:</strong>
          These controls simulate check-in events and do not represent a real emergency dispatch system. The system demonstrates explainable rule-based escalation and privacy engine enforcement.
        </div>
      </div>

      {/* Toast Feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default Demo;
