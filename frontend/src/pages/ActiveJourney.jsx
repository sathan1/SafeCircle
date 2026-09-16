import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Shield, 
  Users, 
  Lock, 
  RefreshCw, 
  AlertCircle,
  Sparkles,
  Compass,
  ArrowRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Eye
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import StatusBadge from '../components/common/StatusBadge';
import SafetyExplainabilityCard from '../components/safety/SafetyExplainabilityCard';
import StateTransitionHistory from '../components/safety/StateTransitionHistory';
import ActiveCheckInCard from '../components/checkin/ActiveCheckInCard';
import EscalationStatusCard from '../components/checkin/EscalationStatusCard';
import SafetyTimeline from '../components/checkin/SafetyTimeline';
import SafetyAnalysisCard from '../components/safety/SafetyAnalysisCard';
import SafetyEvaluationExplainer from '../components/safety/SafetyEvaluationExplainer';
import DeviceConnectivityCard from '../components/safety/DeviceConnectivityCard';
import JourneyActionDialog from '../components/journey/JourneyActionDialog';
import { journeyService } from '../services/journeyService';
import { contactService } from '../services/contactService';
import { safetyStateService } from '../services/safetyStateService';
import { checkInService } from '../services/checkInService';
import { anomalyService } from '../services/anomalyService';
import { deviceService } from '../services/deviceService';
import { canShareInformation, INFORMATION_TYPES, INFO_TYPE_LABELS } from '../services/permissionService';

const QUICK_SIMULATION_EVENTS = [
  { type: 'ROUTE_DEVIATION', label: 'Route Deviation', score: '+25', desc: 'Simulated departure from confirmed avenue' },
  { type: 'PROLONGED_STOP', label: 'Prolonged Stop', score: '+20', desc: 'Stationary for > 8 mins in unscheduled zone' },
  { type: 'MISSED_CHECKIN', label: 'Missed Check-in', score: '+25', desc: 'Scheduled escort checkpoint unanswered' },
  { type: 'DEVICE_OFFLINE', label: 'Device Offline', score: '+10', desc: 'Cellular Escort telemetry intermittent' },
  { type: 'NEED_HELP', label: 'Need Help', score: '+50', desc: 'User triggered silent assistance request' },
  { type: 'EMERGENCY_ACTIVATED', label: 'Emergency', score: 'CRITICAL', desc: 'Urgent distress signal activated' }
];

const ActiveJourney = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [journey, setJourney] = useState(null);
  const [selectedContactsDetails, setSelectedContactsDetails] = useState([]);
  const [safetyEvaluation, setSafetyEvaluation] = useState(null);
  const [safetyHistory, setSafetyHistory] = useState([]);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [checkInsList, setCheckInsList] = useState([]);
  const [escalationsList, setEscalationsList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [anomalyAnalysis, setAnomalyAnalysis] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulatingEvent, setIsSimulatingEvent] = useState(false);

  // Action dialogs
  const [actionDialog, setActionDialog] = useState({ isOpen: false, type: 'END' });
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadJourneyDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [jData, allContacts, sEvaluation, sHistory, activeChk, allChks, allEscs, allEvts, anomData, devData] = await Promise.all([
        journeyService.getJourneyById(id),
        contactService.getContacts().catch(() => []),
        safetyStateService.getSafetyState(id).catch(() => null),
        safetyStateService.getSafetyHistory(id).catch(() => []),
        checkInService.getActiveCheckIn(id).catch(() => null),
        checkInService.getCheckIns(id).catch(() => []),
        checkInService.getEscalations(id).catch(() => []),
        safetyStateService.getEvents(id).catch(() => []),
        anomalyService.getAnomalyAnalysis(id).catch(() => null),
        deviceService.getDeviceStatus(id).catch(() => null)
      ]);

      setJourney(jData);
      setSafetyEvaluation(sEvaluation);
      setSafetyHistory(sHistory);
      setActiveCheckIn(activeChk);
      setCheckInsList(allChks);
      setEscalationsList(allEscs);
      setEventsList(allEvts);
      setAnomalyAnalysis(anomData);
      setDeviceStatus(devData);

      const resolved = allContacts.filter(c => (jData.selectedContacts || []).includes(c.id));
      setSelectedContactsDetails(resolved);
    } catch (err) {
      setError('Unable to load journey telemetry. The journey may not exist or the backend is offline.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJourneyDetails();
  }, [loadJourneyDetails]);

  // Periodic polling for active check-in and safety state (e.g. every 4 seconds)
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const [activeChk, allChks, sEvaluation, allEscs, allEvts, anomData, devData] = await Promise.all([
          checkInService.getActiveCheckIn(id).catch(() => null),
          checkInService.getCheckIns(id).catch(() => []),
          safetyStateService.getSafetyState(id).catch(() => null),
          checkInService.getEscalations(id).catch(() => []),
          safetyStateService.getEvents(id).catch(() => []),
          anomalyService.getAnomalyAnalysis(id).catch(() => null),
          deviceService.getDeviceStatus(id).catch(() => null)
        ]);
        setActiveCheckIn(activeChk);
        setCheckInsList(allChks);
        if (sEvaluation) setSafetyEvaluation(sEvaluation);
        setEscalationsList(allEscs);
        setEventsList(allEvts);
        if (anomData) setAnomalyAnalysis(anomData);
        if (devData) setDeviceStatus(devData);
      } catch (e) {
        // silent background poll
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [id]);

  // Refresh all safety and check-in telemetry
  const refreshAllTelemetry = async () => {
    if (!id) return;
    try {
      const [jData, sEvaluation, sHistory, activeChk, allChks, allEscs, allEvts, anomData, devData] = await Promise.all([
        journeyService.getJourneyById(id),
        safetyStateService.getSafetyState(id),
        safetyStateService.getSafetyHistory(id),
        checkInService.getActiveCheckIn(id).catch(() => null),
        checkInService.getCheckIns(id).catch(() => []),
        checkInService.getEscalations(id).catch(() => []),
        safetyStateService.getEvents(id).catch(() => []),
        anomalyService.getAnomalyAnalysis(id).catch(() => null),
        deviceService.getDeviceStatus(id).catch(() => null)
      ]);
      setJourney(jData);
      setSafetyEvaluation(sEvaluation);
      setSafetyHistory(sHistory);
      setActiveCheckIn(activeChk);
      setCheckInsList(allChks);
      setEscalationsList(allEscs);
      setEventsList(allEvts);
      setAnomalyAnalysis(anomData);
      setDeviceStatus(devData);
    } catch (err) {
      console.warn('Failed to refresh telemetry:', err);
    }
  };

  // Check-In Actions
  const handleRequestCheckIn = async () => {
    if (!journey) return;
    setIsSimulatingEvent(true);
    try {
      const newChk = await checkInService.createCheckIn(journey.id, { minutesUntilDue: 5 });
      setActiveCheckIn(newChk);
      await refreshAllTelemetry();
      showToast('Safety Check-In prompt initiated. Due in 5 minutes.');
    } catch (err) {
      showToast(err.message || 'Failed to request check-in', 'error');
    } finally {
      setIsSimulatingEvent(false);
    }
  };

  const handleRespondSafe = async () => {
    if (!activeCheckIn) return;
    setIsSimulatingEvent(true);
    try {
      await checkInService.respondToCheckIn(activeCheckIn.id, 'SAFE');
      await refreshAllTelemetry();
      showToast('Confirmed safe. Anomaly score cleared & state returned to NORMAL.');
    } catch (err) {
      showToast(err.message || 'Failed to submit response', 'error');
    } finally {
      setIsSimulatingEvent(false);
    }
  };

  const handleRespondNeedHelp = async () => {
    if (!activeCheckIn) return;
    setIsSimulatingEvent(true);
    try {
      await checkInService.respondToCheckIn(activeCheckIn.id, 'NEED_HELP');
      await refreshAllTelemetry();
      showToast('Assistance signal sent. Level 3 simulated escalation dispatched.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to submit response', 'error');
    } finally {
      setIsSimulatingEvent(false);
    }
  };

  const handleResolveEscalation = async (escId) => {
    setIsSimulatingEvent(true);
    try {
      await checkInService.resolveEscalation(escId, 'Resolved by user on Active Journey page');
      await refreshAllTelemetry();
      showToast('Escalation resolved.');
    } catch (err) {
      showToast(err.message || 'Failed to resolve escalation', 'error');
    } finally {
      setIsSimulatingEvent(false);
    }
  };

  // Trigger simulated journey event via Safety State Engine
  const handleTriggerEvent = async (type, description) => {
    if (!journey) return;
    setIsSimulatingEvent(true);
    try {
      const result = await safetyStateService.addEvent(journey.id, {
        type,
        description,
        source: 'DEMO'
      });

      await refreshAllTelemetry();

      if (result.stateChanged) {
        showToast(`Safety State escalated to ${result.currentSafetyState}! (Score: ${result.signalScore})`, 'info');
      } else {
        showToast(`Event added: ${type} (Score: ${result.signalScore})`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to trigger event', 'error');
    } finally {
      setIsSimulatingEvent(false);
    }
  };

  // Handle "I'm Safe" user clearance (standalone)
  const handleUserConfirmedSafe = async () => {
    if (!journey) return;
    setIsSimulatingEvent(true);
    try {
      if (activeCheckIn && activeCheckIn.status === 'PENDING') {
        await checkInService.respondToCheckIn(activeCheckIn.id, 'SAFE');
      } else {
        await safetyStateService.addEvent(journey.id, {
          type: 'USER_CONFIRMED_SAFE',
          description: 'User tapped "I am Safe" clearance button',
          source: 'USER'
        });
      }

      await refreshAllTelemetry();
      showToast('Safety confirmed. Active anomalies cleared — state returned toward NORMAL.');
    } catch (err) {
      showToast(err.message || 'Failed to confirm safety', 'error');
    } finally {
      setIsSimulatingEvent(false);
    }
  };

  // Reset simulation back to NORMAL
  const handleResetSimulation = async () => {
    if (!journey) return;
    setIsSimulatingEvent(true);
    try {
      await Promise.all([
        safetyStateService.resetSafetySimulation(journey.id),
        checkInService.resetCheckIns(journey.id)
      ]);
      await refreshAllTelemetry();
      showToast('Safety simulation reset to NORMAL (Score 0).');
    } catch (err) {
      showToast(err.message || 'Failed to reset simulation', 'error');
    } finally {
      setIsSimulatingEvent(false);
    }
  };

  // Handle End or Cancel journey
  const handleConfirmAction = async () => {
    if (!journey) return;
    setIsProcessingAction(true);
    const newStatus = actionDialog.type === 'END' ? 'COMPLETED' : 'CANCELLED';
    try {
      const updated = await journeyService.updateJourneyStatus(journey.id, newStatus);
      setJourney(updated);
      setActionDialog({ isOpen: false, type: 'END' });
      showToast(newStatus === 'COMPLETED' ? 'Journey completed successfully.' : 'Journey cancelled.');
    } catch (err) {
      showToast('Failed to update journey status', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (start, end) => {
    if (!start) return '0 mins';
    const endTime = end ? new Date(end) : new Date();
    const diffMs = endTime - new Date(start);
    const diffMins = Math.max(1, Math.round(diffMs / 60000));
    return `${diffMins} mins in progress`;
  };

  if (isLoading) {
    return (
      <Card className="py-20 text-center">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-bold text-stone-800">Loading Journey Telemetry...</h3>
        <p className="text-xs text-stone-400 mt-1">Evaluating Safety State Engine & Check-In System</p>
      </Card>
    );
  }

  if (error || !journey) {
    return (
      <Card className="py-16 text-center border-rose-200 bg-rose-50/20">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-stone-900 mb-1">
          {error || 'Journey Not Found'}
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
          Please check that the ID is valid or return to the Journeys list.
        </p>
        <Button onClick={() => navigate('/journeys')} size="sm">
          Return to Journeys
        </Button>
      </Card>
    );
  }

  const isActive = journey.status === 'ACTIVE';
  const currentSafetyState = safetyEvaluation?.state || journey.currentState || 'NORMAL';

  return (
    <div className="space-y-6">
      {/* Back button and page toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/journeys')}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
            aria-label="Back to journeys"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900">
                {isActive ? 'Active Journey Escort' : `Journey (${journey.status})`}
              </h1>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}>
                {journey.status}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Journey ID: <span className="font-mono">{journey.id}</span>
            </p>
          </div>
        </div>

        {/* Action Controls for Active Journey */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/contact-dashboard')}
            variant="outline"
            size="sm"
            icon={Eye}
          >
            Contact View
          </Button>
          <Button
            onClick={() => navigate(`/journeys/${journey.id}/safepath`)}
            variant="outline"
            size="sm"
            icon={Compass}
          >
            SafePath Map
          </Button>
          {isActive && (
            <>
              <Button
                onClick={() => setActionDialog({ isOpen: true, type: 'CANCEL' })}
                variant="secondary"
                size="sm"
              >
                Cancel Journey
              </Button>
              <Button
                onClick={() => setActionDialog({ isOpen: true, type: 'END' })}
                variant="primary"
                size="sm"
              >
                End Journey
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 1. Large Current Safety State & Explainability Card (Phase 7 Engine) */}
      <SafetyExplainabilityCard
        state={currentSafetyState}
        signalScore={safetyEvaluation?.signalScore || 0}
        activeSignals={safetyEvaluation?.signals || []}
        reason={safetyEvaluation?.reason || ''}
        lastSafeConfirmation={safetyEvaluation?.lastSafeConfirmation}
      />

      {/* 1b. Explainable Anomaly Intelligence Signals (Phase 10) */}
      <SafetyAnalysisCard
        state={currentSafetyState}
        signalScore={safetyEvaluation?.signalScore || 0}
        signals={anomalyAnalysis?.signals || []}
        analysisType={anomalyAnalysis?.analysisType || 'RULE_BASED_PROTOTYPE'}
        analysisLabel={anomalyAnalysis?.analysisLabel || 'Prototype rule-based anomaly intelligence'}
      />

      {/* 1c. Device Connectivity & Wearable Fallback (Phase 11) */}
      <DeviceConnectivityCard
        deviceStatus={deviceStatus}
        className="mb-6"
      />

      {/* 2. Active Check-In Card (Phase 8 Check-In System) */}
      {isActive && (
        <ActiveCheckInCard
          checkIn={activeCheckIn}
          onRequestCheckIn={handleRequestCheckIn}
          onRespondSafe={handleRespondSafe}
          onRespondNeedHelp={handleRespondNeedHelp}
          isProcessing={isSimulatingEvent}
        />
      )}

      {/* 3. Escalation Status Card (Phase 8 Escalation Engine) */}
      <EscalationStatusCard
        escalations={escalationsList}
        onResolveEscalation={handleResolveEscalation}
        isProcessing={isSimulatingEvent}
      />

      {/* 4. Main Route & Escort Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Route Telemetry Card */}
          <Card className="border border-stone-200/80 bg-white">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Route Telemetry
                </span>
                <h2 className="text-2xl font-black text-stone-900 mt-0.5">
                  {journey.startLocation.name} → {journey.destination.name}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-stone-400 uppercase font-semibold">Expected Arrival</span>
                <div className="text-lg font-bold font-mono text-stone-900">
                  {formatTime(journey.expectedArrival)}
                </div>
              </div>
            </div>

            {/* Route Progress Visual Bar */}
            <div className="bg-[#fcf8f8] rounded-2xl p-4 border border-stone-200/70 mb-5">
              <div className="flex justify-between text-xs text-stone-600 mb-2 font-semibold">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>From: {journey.startLocation.name}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>To: {journey.destination.name}</span>
                </span>
              </div>
              <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  isActive ? 'bg-rose-500 w-[55%]' : 'bg-stone-400 w-full'
                }`} />
              </div>
            </div>

            {/* Journey Meta Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Started At</span>
                <span className="font-bold text-stone-800">{formatTime(journey.startedAt)}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Duration</span>
                <span className="font-bold text-stone-800">{calculateDuration(journey.startedAt, journey.endedAt)}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Status</span>
                <span className="font-bold text-stone-800">{journey.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Safety State</span>
                <span className="font-bold text-stone-800">{currentSafetyState}</span>
              </div>
            </div>

            {journey.notes && (
              <div className="mt-4 p-3 rounded-xl bg-[#fcf8f8] border border-stone-200/60 text-xs text-stone-600">
                <span className="font-semibold text-stone-700 block mb-0.5">Journey Note:</span>
                {journey.notes}
              </div>
            )}
          </Card>

          {/* SafePath Route Telemetry Card */}
          {journey.selectedRoute ? (
            <Card className="border border-rose-200/80 bg-gradient-to-r from-rose-50/30 via-white to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                      Selected SafePath Escort Route
                    </span>
                    <h4 className="text-sm font-bold text-stone-900">
                      {journey.selectedRoute.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {journey.selectedRoute.contextualEstimate || 'Elevated Coverage'}
                  </span>
                  <Button
                    onClick={() => navigate(`/journeys/${journey.id}/safepath`)}
                    variant="outline"
                    size="xs"
                  >
                    Change Route
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
                <div className="p-2 rounded-lg bg-[#fcf8f8] border border-stone-100">
                  <span className="text-[10px] text-stone-600 block font-semibold">Distance</span>
                  <span className="font-bold text-stone-800">{journey.selectedRoute.distance}</span>
                </div>
                <div className="p-2 rounded-lg bg-[#fcf8f8] border border-stone-100">
                  <span className="text-[10px] text-stone-600 block font-semibold">Est. Duration</span>
                  <span className="font-bold text-stone-800">{journey.selectedRoute.estimatedDuration}</span>
                </div>
                <div className="p-2 rounded-lg bg-[#fcf8f8] border border-stone-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-stone-600 block font-semibold">Classification</span>
                  <span className="font-bold text-stone-800">{journey.selectedRoute.routeType || 'SafePath'}</span>
                </div>
              </div>

              {journey.selectedRoute.signals && journey.selectedRoute.signals.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                    Active Contextual Signals (Demo)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {journey.selectedRoute.signals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-md bg-stone-50 border border-stone-200/60 text-stone-700 font-medium"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="border border-dashed border-stone-200 bg-[#fcf8f8] p-4 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-800">
                      No SafePath Route Selected
                    </h4>
                    <p className="text-xs text-stone-500">
                      Preview street lighting, footfall corridors, and compare route options on the interactive map.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/journeys/${journey.id}/safepath`)}
                  size="sm"
                  icon={Compass}
                >
                  Select SafePath Route
                </Button>
              </div>
            </Card>
          )}

          {/* 5. Phase 8 Unified Safety Timeline */}
          <SafetyTimeline
            checkIns={checkInsList}
            events={eventsList}
            transitions={safetyHistory}
            escalations={escalationsList}
          />

          {/* Safety State Audit Trail */}
          <StateTransitionHistory transitions={safetyHistory} />
        </div>

        {/* Right Column: Safety Circle & Dynamic Privacy Disclosures & Simulator */}
        <div className="space-y-6">
          {/* Selected Safety Circle & Dynamic Privacy Engine Disclosures */}
          <Card className="border border-stone-200/80 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Safety Circle Disclosures</h3>
                  <p className="text-[11px] text-stone-400">
                    Governed by Privacy Permission Engine for state: <strong>{currentSafetyState}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {selectedContactsDetails.length === 0 ? (
                <div className="p-3 text-xs text-stone-400 text-center bg-stone-50 rounded-xl">
                  No contacts attached to this journey.
                </div>
              ) : (
                selectedContactsDetails.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded-xl bg-[#fcf8f8] border border-stone-200/70 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-900">{contact.name}</div>
                        <div className="text-[10px] text-stone-400">{contact.relationship}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-rose-700 border border-rose-100">
                        Priority {contact.priority}
                      </span>
                    </div>

                    {/* Dynamic Permission Evaluation Badges */}
                    <div className="pt-1.5 border-t border-stone-200/60">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Authorized in {currentSafetyState}:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {INFORMATION_TYPES.map((infoType) => {
                          const isAllowed = canShareInformation(contact, currentSafetyState, infoType);
                          const label = INFO_TYPE_LABELS[infoType];
                          return (
                            <span
                              key={infoType}
                              className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${
                                isAllowed
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-stone-100 text-stone-400 border-stone-200/60 line-through opacity-60'
                              }`}
                              title={isAllowed ? `Authorized for ${label}` : `Restricted for ${label}`}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Privacy Rule Assurance Note */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-500 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Rule Active:</strong> The Safety State Engine determines the state ({currentSafetyState}), while your configured Privacy Policy strictly controls what each recipient can inspect.
              </span>
            </div>
          </Card>

          {/* Safety State Event Simulator Panel */}
          <Card className="border border-stone-200/80 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Escort Event Simulator
                </h3>
              </div>
              <button
                onClick={() => navigate('/demo')}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                Full Demo <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mb-3">
              Trigger explainable journey events to test safety state escalation.
            </p>

            <div className="space-y-1.5 mb-3">
              {QUICK_SIMULATION_EVENTS.map((evt) => (
                <button
                  key={evt.type}
                  disabled={isSimulatingEvent}
                  onClick={() => handleTriggerEvent(evt.type, evt.desc)}
                  className="w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-between bg-[#fcf8f8] text-stone-700 border-stone-200 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-50"
                >
                  <span>{evt.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    evt.score === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {evt.score}
                  </span>
                </button>
              ))}
            </div>

            {/* De-escalation & Reset buttons */}
            <div className="pt-2 border-t border-stone-100 space-y-1.5">
              <button
                disabled={isSimulatingEvent}
                onClick={handleUserConfirmedSafe}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>I'm Safe (Confirm Baseline)</span>
              </button>

              <button
                disabled={isSimulatingEvent}
                onClick={handleResetSimulation}
                className="w-full py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulation (Score 0)</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. SafeCircle 5-Stage Evaluation Pipeline Explainer (Phase 10) */}
      <SafetyEvaluationExplainer />

      {/* Confirmation Action Dialog */}
      <JourneyActionDialog
        isOpen={actionDialog.isOpen}
        actionType={actionDialog.type}
        onClose={() => setActionDialog({ isOpen: false, type: 'END' })}
        onConfirm={handleConfirmAction}
        isProcessing={isProcessingAction}
      />

      {/* Toast Feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default ActiveJourney;
