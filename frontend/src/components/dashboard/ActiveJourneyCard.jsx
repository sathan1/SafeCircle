import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Shield, 
  Route as RouteIcon,
  BellRing, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import { journeyService } from '../../services/journeyService';
import { checkInService } from '../../services/checkInService';

const ActiveJourneyCard = () => {
  const navigate = useNavigate();
  const [activeJourney, setActiveJourney] = useState(null);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [latestEscalation, setLatestEscalation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    journeyService.getJourneys()
      .then(async journeys => {
        if (!isMounted) return;
        const active = journeys.find(j => j.status === 'ACTIVE');
        setActiveJourney(active || null);

        if (active) {
          const [chk, escs] = await Promise.all([
            checkInService.getActiveCheckIn(active.id).catch(() => null),
            checkInService.getEscalations(active.id).catch(() => [])
          ]);
          if (isMounted) {
            setActiveCheckIn(chk);
            const activeEsc = (escs || []).find(e => e.status !== 'RESOLVED' && e.status !== 'CANCELLED');
            setLatestEscalation(activeEsc || null);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load active journey telemetry for dashboard:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <Card className="py-8 text-center text-xs text-stone-400">
        Loading active journey status...
      </Card>
    );
  }

  if (!activeJourney) {
    return (
      <Card className="border border-dashed border-stone-300 bg-white/70">
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-1">No Active Journey</h3>
          <p className="text-xs text-stone-500 mb-4 max-w-sm mx-auto">
            Start a journey to activate real-time progressive monitoring, SafePath corridors, and automatic circle checkpoints.
          </p>
          <Button onClick={() => navigate('/journeys')} size="sm">
            Start a Journey
          </Button>
        </div>
      </Card>
    );
  }

  const startName = activeJourney.startLocation?.name || 'Origin';
  const destName = activeJourney.destination?.name || 'Destination';
  const routeName = activeJourney.selectedRoute?.name || 'Main Commercial Avenue (SafePath)';
  const routeDistance = activeJourney.selectedRoute?.distance || '3.8 km';
  const routeEstimate = activeJourney.selectedRoute?.estimatedDuration || '17 mins';

  return (
    <Card className="hover:border-rose-200 transition-colors border-l-4 border-l-rose-500 bg-white shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
            Active Journey Escort
          </span>
        </div>
        <StatusBadge state={activeJourney.currentState} size="sm" />
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <span>{startName}</span>
          <span className="text-rose-500 font-normal">→</span>
          <span>{destName}</span>
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mt-2">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>ETA: <strong>{formatTime(activeJourney.expectedArrival)}</strong></span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-rose-500" />
            <span>Circle: <strong>{activeJourney.selectedContacts?.length || 2} Recipients</strong></span>
          </span>
        </div>
      </div>

      {/* SafePath Route Summary */}
      <div className="p-3 rounded-xl bg-[#fcf8f8] border border-stone-200/70 mb-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
            <RouteIcon className="w-3.5 h-3.5 text-rose-600" />
            <span>Selected SafePath:</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            SafePath Verified
          </span>
        </div>
        <div className="text-xs text-stone-700 font-medium truncate">
          {routeName}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-stone-500">
          <span>Distance: <strong>{routeDistance}</strong></span>
          <span>•</span>
          <span>Estimated: <strong>{routeEstimate}</strong></span>
        </div>
      </div>

      {/* Real-time Check-In & Escalation Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 text-xs">
        {/* Check-In Cardlet */}
        <div className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-rose-600" />
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Active Check-In</div>
              <div className="font-bold text-stone-800">
                {activeCheckIn ? (activeCheckIn.status === 'PENDING' ? 'Prompt Active' : activeCheckIn.status) : 'Standby (Safe)'}
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            activeCheckIn?.status === 'PENDING' 
              ? 'bg-amber-100 text-amber-800 animate-pulse' 
              : 'bg-emerald-50 text-emerald-700'
          }`}>
            {activeCheckIn?.status === 'PENDING' ? 'Pending' : 'Ok'}
          </span>
        </div>

        {/* Escalation Cardlet */}
        <div className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Escalation Dispatch</div>
              <div className="font-bold text-stone-800">
                {latestEscalation ? latestEscalation.level : 'Standby'}
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            latestEscalation 
              ? 'bg-orange-100 text-orange-800 font-bold' 
              : 'bg-emerald-50 text-emerald-700'
          }`}>
            {latestEscalation ? 'Dispatched' : 'Normal'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-[11px] text-stone-500 mb-1.5 font-medium">
          <span>{startName}</span>
          <span className="text-rose-600 font-bold">Escort In Progress</span>
          <span>{destName}</span>
        </div>
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-rose-500 rounded-full w-[65%]" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={() => navigate(`/journeys/${activeJourney.id}/safepath`)}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
        >
          <span>View SafePath</span>
        </Button>
        <Button
          onClick={() => navigate(`/journeys/${activeJourney.id}`)}
          variant="primary"
          size="sm"
          className="w-full sm:w-auto"
        >
          <span>Live Monitor</span>
          <ChevronRight className="w-4 h-4 ml-1 text-white/80" />
        </Button>
      </div>
    </Card>
  );
};

export default ActiveJourneyCard;
