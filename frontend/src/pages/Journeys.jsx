import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Plus, 
  Route as RouteIcon,
  RefreshCw,
  AlertCircle,
  Shield,
  Layers
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import StatusBadge from '../components/common/StatusBadge';
import StartJourneyModal from '../components/journey/StartJourneyModal';
import { journeyService } from '../services/journeyService';

const Journeys = () => {
  const navigate = useNavigate();

  const [journeys, setJourneys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadJourneys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await journeyService.getJourneys();
      setJourneys(data);
    } catch (err) {
      setError('Unable to load journeys. Please verify backend connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJourneys();
  }, [loadJourneys]);

  const activeJourney = journeys.find(j => j.status === 'ACTIVE');
  const pastJourneys = journeys.filter(j => j.status !== 'ACTIVE');

  const handleStartJourney = async (journeyData) => {
    setIsStarting(true);
    try {
      const created = await journeyService.createJourney(journeyData);
      showToast('Journey started.');
      setIsModalOpen(false);
      navigate(`/journeys/${created.id}`);
    } catch (err) {
      showToast(err.message || 'Failed to start journey', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '25 mins';
    const diffMs = new Date(end) - new Date(start);
    const diffMins = Math.max(1, Math.round(diffMs / 60000));
    return `${diffMins} mins`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 inline-block mb-1.5">
            Active Escort & History
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Journeys
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Plan, monitor, and review your safety journeys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={Plus}
            size="md"
          >
            Start New Journey
          </Button>
        </div>
      </div>

      {/* Loading / Error / Empty States */}
      {isLoading ? (
        <Card className="py-16 text-center">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">Loading Journeys...</h3>
          <p className="text-xs text-stone-400 mt-1">Fetching live route telemetry</p>
        </Card>
      ) : error ? (
        <Card className="py-12 text-center border-rose-200 bg-rose-50/20">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900 mb-1">
            Unable to load journeys
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
            {error}
          </p>
          <Button onClick={loadJourneys} variant="secondary" size="sm" icon={RefreshCw}>
            Retry Connection
          </Button>
        </Card>
      ) : journeys.length === 0 ? (
        <Card className="py-16 text-center border-2 border-dashed border-stone-200 bg-white/70">
          <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-2xs">
            <RouteIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            No journeys yet.
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6 leading-relaxed">
            Start a journey to begin SafeCircle monitoring and automatic circle check-ins.
          </p>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus} size="md">
            Start New Journey
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 1. VISUALLY PROMINENT ACTIVE JOURNEY SECTION */}
          {activeJourney && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ACTIVE JOURNEY</span>
                </h2>
                <StatusBadge state={activeJourney.currentState} size="sm" />
              </div>

              <Card className="border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50/40 via-white to-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        Monitoring Active
                      </span>
                      <span className="text-xs text-stone-400">
                        Started at {formatTime(activeJourney.startedAt)}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                      <span>{activeJourney.startLocation.name}</span>
                      <span className="text-rose-500 font-normal">→</span>
                      <span>{activeJourney.destination.name}</span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Expected Arrival: <strong>{formatTime(activeJourney.expectedArrival)}</strong></span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-rose-500" />
                        <span>Circle: <strong>{activeJourney.selectedContacts?.length || 1} Recipients</strong></span>
                      </span>
                      {activeJourney.selectedRoute && (
                        <span className="flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                          <RouteIcon className="w-3.5 h-3.5" />
                          <span>{activeJourney.selectedRoute.name}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-auto">
                    <Button
                      onClick={() => navigate(`/journeys/${activeJourney.id}/safepath`)}
                      variant="secondary"
                      size="md"
                    >
                      SafePath Map
                    </Button>
                    <Button
                      onClick={() => navigate(`/journeys/${activeJourney.id}`)}
                      size="md"
                    >
                      <span>View Live Journey</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 2. RECENT JOURNEYS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                RECENT JOURNEYS
              </h2>
              <span className="text-xs text-stone-400 font-mono">
                {pastJourneys.length} Completed / Cancelled
              </span>
            </div>

            {pastJourneys.length === 0 ? (
              <Card className="py-8 text-center text-xs text-stone-400">
                No past journeys recorded yet.
              </Card>
            ) : (
              <div className="space-y-3">
                {pastJourneys.map((j) => (
                  <Card key={j.id} className="hover:border-stone-300 transition-colors py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          j.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}>
                          <RouteIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-stone-900">
                            {j.startLocation.name} → {j.destination.name}
                          </div>
                          <div className="text-xs text-stone-400 mt-0.5 flex flex-wrap items-center gap-2">
                            <span>{formatDate(j.createdAt)}</span>
                            <span>·</span>
                            <span>{calculateDuration(j.startedAt, j.endedAt)}</span>
                            <span>·</span>
                            <span>Final state: <strong className="text-stone-700">{j.currentState}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          j.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          {j.status === 'COMPLETED' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span>{j.status === 'COMPLETED' ? 'Completed' : 'Cancelled'}</span>
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Journey Modal */}
      <StartJourneyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleStartJourney}
        isSubmitting={isStarting}
      />

      {/* Feedback Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default Journeys;
