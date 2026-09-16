import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import journeyService from '../services/journeyService';
import safetyService from '../services/safetyService';
import { MapPin, Navigation, Clock, ShieldAlert, CheckCircle, AlertTriangle, Play, Pause, Activity, FileText } from 'lucide-react';

const JourneyMonitoringPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journey, setJourney] = useState(null);
  const [events, setEvents] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchJourneyData = async () => {
    try {
      const [journeyData, eventsData, transitionsData] = await Promise.all([
        journeyService.getJourney(id),
        journeyService.getEvents(id),
        safetyService.getTransitions(id)
      ]);
      setJourney(journeyData);
      setEvents(eventsData);
      setTransitions(transitionsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneyData();
    // Poll for updates in a real app, but for demo we manually trigger via panel
  }, [id]);

  const handleSimulate = async (action) => {
    setIsSimulating(true);
    try {
      await journeyService.simulateEvent(id, action);
      await fetchJourneyData();
    } catch (err) {
      alert('Simulation failed: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleEndJourney = async () => {
    if (window.confirm('Are you sure you want to end this journey?')) {
      try {
        await journeyService.endJourney(id);
        navigate('/dashboard');
      } catch (err) {
        alert('Failed to end journey');
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Journey...</div>;
  if (!journey) return <div className="p-8 text-center text-red-500">Journey not found</div>;

  const isCompleted = journey.status === 'COMPLETED';

const getSafetyColor = (state) => {
    switch (state) {
      case 'NORMAL': return 'text-green-400';
      case 'CAUTION': return 'text-yellow-400';
      case 'ELEVATED': return 'text-orange-400';
      case 'CRISIS': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getSafetyBg = (state) => {
    switch (state) {
      case 'NORMAL': return 'bg-gray-900';
      case 'CAUTION': return 'bg-yellow-900 text-white';
      case 'ELEVATED': return 'bg-orange-900 text-white';
      case 'CRISIS': return 'bg-red-900 text-white animate-pulse';
      default: return 'bg-gray-900';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex justify-between items-start">
        <PageHeader 
          title="Active Journey" 
          description={`${journey.startLocation.name} → ${journey.destination.name}`}
        />
        {!isCompleted && (
          <Button variant="danger" onClick={handleEndJourney}>End Journey</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Overview */}
          <Card className={`text-white border-none shadow-xl transition-colors duration-500 ${getSafetyBg(journey.currentSafetyState)}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-white/60 text-xs uppercase tracking-wider font-bold">ETA</span>
                <div className="font-bold text-lg flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" />
                  {new Date(journey.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div>
                <span className="text-white/60 text-xs uppercase tracking-wider font-bold">Status</span>
                <div className="font-bold text-lg mt-1 text-white">
                  {journey.status}
                </div>
              </div>
              <div>
                <span className="text-white/60 text-xs uppercase tracking-wider font-bold">Progress</span>
                <div className="font-bold text-lg mt-1">
                  {journey.progress || 0}%
                </div>
              </div>
              <div>
                <span className="text-white/60 text-xs uppercase tracking-wider font-bold">Safety State</span>
                <div className={`font-bold text-lg mt-1 flex items-center gap-2 ${getSafetyColor(journey.currentSafetyState)}`}>
                  <ShieldAlert className="w-4 h-4" />
                  {journey.currentSafetyState}
                </div>
              </div>
            </div>
          </Card>

          {/* Map Simulation */}
          <Card className="p-0 overflow-hidden border-2 border-gray-100">
            <div className="bg-gray-50 h-64 relative w-full flex items-center justify-center p-8">
              {/* Simulated Path */}
              <div className="absolute w-[80%] h-1 bg-gray-300 rounded-full">
                {/* Progress bar */}
                <div 
                  className="absolute left-0 top-0 h-full bg-[#d81b60] transition-all duration-1000" 
                  style={{ width: `${journey.progress || 0}%` }}
                ></div>
              </div>
              
              {/* Markers */}
              <div className="absolute left-[10%] flex flex-col items-center -mt-8">
                <MapPin className="w-6 h-6 text-gray-500 mb-1" />
                <span className="text-xs font-bold text-gray-500">Start</span>
              </div>
              
              <div className="absolute right-[10%] flex flex-col items-center -mt-8">
                <MapPin className="w-6 h-6 text-gray-500 mb-1" />
                <span className="text-xs font-bold text-gray-500">Destination</span>
              </div>

              {/* User Position */}
              <div 
                className="absolute flex flex-col items-center -mt-8 transition-all duration-1000 z-10"
                style={{ left: `calc(10% + (0.8 * ${journey.progress || 0}%))` }}
              >
                <div className="w-4 h-4 bg-[#d81b60] rounded-full shadow-[0_0_15px_rgba(216,27,96,0.5)] border-2 border-white animate-pulse"></div>
                <span className="text-xs font-bold text-[#d81b60] mt-2 bg-white px-2 py-0.5 rounded shadow-sm">You</span>
              </div>
            </div>
            <div className="p-3 bg-white text-xs text-center text-gray-500 border-t border-gray-100">
              Visual map simulation for prototype demonstration
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#d81b60]" />
              Journey Timeline
            </h3>
            <div className="space-y-6">
              {events.length === 0 ? (
                <div className="text-sm text-gray-500">No events logged yet.</div>
              ) : (
                events.map((event, idx) => (
                  <div key={event._id} className="flex gap-4 relative">
                    {idx !== events.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-gray-100"></div>
                    )}
                    <div className="w-6 h-6 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center shrink-0 z-10 mt-0.5">
                      <div className="w-2 h-2 bg-[#d81b60] rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{event.eventType.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{event.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* State Transitions */}
          {transitions.length > 0 && (
            <Card className="border-l-4 border-l-orange-500 bg-orange-50/30">
              <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                Safety State Engine Log
              </h3>
              <div className="space-y-3">
                {transitions.map((t) => (
                  <div key={t._id} className="p-3 bg-white rounded shadow-sm border border-orange-100 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-800">
                        {t.previousState} <span className="text-gray-400 mx-1">→</span> <span className={t.newState === 'NORMAL' ? 'text-green-600' : 'text-orange-600'}>{t.newState}</span>
                      </span>
                      <span className="text-xs text-gray-400">{new Date(t.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-600 italic">"{t.reason}"</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

        {/* Demo Controls Column */}
        <div className="space-y-6">
          <Card className="border-2 border-dashed border-[#d81b60] bg-pink-50/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-purple-500"></div>
            <h3 className="font-bold text-[#d81b60] uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Demo Simulation Panel
            </h3>
            <p className="text-xs text-gray-600 mb-6">Use these controls to simulate real-world events for your college guide. (Phase 7 will connect these to the Safety Engine).</p>
            
            <div className="space-y-3">
              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => handleSimulate('MOVE_FORWARD')}
                disabled={isCompleted || isSimulating}
                className="justify-start bg-white"
                icon={Navigation}
              >
                Move Forward (Progress)
              </Button>
              
              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => handleSimulate('ROUTE_DEVIATION')}
                disabled={isCompleted || isSimulating}
                className="justify-start bg-white text-orange-700 border-orange-200 hover:bg-orange-50 hover:text-orange-800"
                icon={AlertTriangle}
              >
                Trigger Route Deviation
              </Button>

              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => handleSimulate('UNEXPECTED_STOP')}
                disabled={isCompleted || isSimulating}
                className="justify-start bg-white text-orange-700 border-orange-200 hover:bg-orange-50 hover:text-orange-800"
                icon={Pause}
              >
                Trigger Unexpected Stop
              </Button>

              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => handleSimulate('DEVICE_OFFLINE')}
                disabled={isCompleted || isSimulating}
                className="justify-start bg-white text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800"
                icon={ShieldAlert}
              >
                Trigger Device Offline
              </Button>

              <div className="my-4 border-t border-pink-200"></div>

              <Button 
                fullWidth 
                onClick={() => handleSimulate('IM_SAFE')}
                disabled={isCompleted || isSimulating}
                className="justify-start bg-green-600 hover:bg-green-700 text-white border-transparent"
                icon={CheckCircle}
              >
                I'm Safe (Resolve Warnings)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JourneyMonitoringPage;
