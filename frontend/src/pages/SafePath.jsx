import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  RefreshCw, 
  AlertCircle, 
  MapPin, 
  ShieldCheck, 
  Layers,
  Sparkles,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import SafePathMap from '../components/safepath/SafePathMap';
import RoutePreferenceSelector from '../components/safepath/RoutePreferenceSelector';
import RouteCard from '../components/safepath/RouteCard';
import RouteSummary from '../components/safepath/RouteSummary';
import { journeyService } from '../services/journeyService';

// Prototype coordinates generator for plausible demo routes between endpoints
const generateDemoRoutes = (start, dest) => {
  const startLat = start?.latitude || 12.9716;
  const startLng = start?.longitude || 77.5946;
  const destLat = dest?.latitude || 12.9352;
  const destLng = dest?.longitude || 77.6245;

  // Midpoint
  const midLat = (startLat + destLat) / 2;
  const midLng = (startLng + destLng) / 2;

  return [
    {
      id: 'route-b-safepath',
      name: 'SafePath Commercial Corridor (Main Avenue)',
      routeType: 'SAFEPATH',
      preference: 'context',
      tag: 'SafePath Recommended',
      distance: '3.8 km',
      estimatedDuration: '17 mins',
      contextualEstimate: 'Elevated Contextual Coverage',
      signals: [
        'Continuous street lighting',
        'Active commercial corridor & footfall',
        'Designated transit checkpoints',
        'High cellular Escort signal density'
      ],
      waypoints: [
        [startLat, startLng],
        [startLat - 0.008, startLng + 0.006],
        [midLat - 0.004, midLng + 0.012],
        [midLat - 0.015, midLng + 0.018],
        [destLat + 0.006, destLng + 0.005],
        [destLat, destLng]
      ]
    },
    {
      id: 'route-c-balanced',
      name: 'Transit Parkway (Balanced Arterial)',
      routeType: 'BALANCED',
      preference: 'balanced',
      tag: 'Transit Balanced',
      distance: '3.5 km',
      estimatedDuration: '15 mins',
      contextualEstimate: 'Standard Contextual Coverage',
      signals: [
        'Bus stop & metro line proximity',
        'Moderate foot traffic',
        'Partially lit sidewalks',
        'Main arterial road access'
      ],
      waypoints: [
        [startLat, startLng],
        [startLat - 0.012, startLng - 0.004],
        [midLat - 0.002, midLng - 0.008],
        [destLat + 0.010, destLng - 0.005],
        [destLat, destLng]
      ]
    },
    {
      id: 'route-a-shortest',
      name: 'Direct Alley Route (Shortest)',
      routeType: 'SHORTEST',
      preference: 'fastest',
      tag: 'Shortest Distance',
      distance: '3.1 km',
      estimatedDuration: '13 mins',
      contextualEstimate: 'Basic Contextual Coverage',
      signals: [
        'Minimum travel distance',
        'Direct alleys & cross-streets',
        'Low pedestrian footfall',
        'Intermittent lighting'
      ],
      waypoints: [
        [startLat, startLng],
        [startLat - 0.018, startLng + 0.015],
        [destLat, destLng]
      ]
    }
  ];
};

const SafePath = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [journey, setJourney] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preference filter: 'context' | 'balanced' | 'fastest'
  const [preference, setPreference] = useState('context');
  const [selectedRouteId, setSelectedRouteId] = useState('route-b-safepath');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Missing coordinates toggle for test / demo verification
  const [forceMissingCoords, setForceMissingCoords] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadJourney = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await journeyService.getJourneyById(id);
      setJourney(data);

      if (data.selectedRoute?.routeId) {
        setSelectedRouteId(data.selectedRoute.routeId);
      }
    } catch (err) {
      setError('Unable to load journey for SafePath route selection.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJourney();
  }, [loadJourney]);

  // Derived effective coordinates
  const effectiveStart = useMemo(() => {
    if (forceMissingCoords) return { name: journey?.startLocation?.name, latitude: null, longitude: null };
    if (!journey) return null;
    return {
      name: journey.startLocation.name,
      latitude: journey.startLocation.latitude || 12.9716,
      longitude: journey.startLocation.longitude || 77.5946
    };
  }, [journey, forceMissingCoords]);

  const effectiveDest = useMemo(() => {
    if (forceMissingCoords) return { name: journey?.destination?.name, latitude: null, longitude: null };
    if (!journey) return null;
    return {
      name: journey.destination.name,
      latitude: journey.destination.latitude || 12.9352,
      longitude: journey.destination.longitude || 77.6245
    };
  }, [journey, forceMissingCoords]);

  // Route options
  const availableRoutes = useMemo(() => {
    return generateDemoRoutes(effectiveStart, effectiveDest);
  }, [effectiveStart, effectiveDest]);

  // Handle preference change: automatically selects the route best matching that preference
  const handlePreferenceChange = (newPref) => {
    setPreference(newPref);
    const matching = availableRoutes.find(r => r.preference === newPref);
    if (matching) {
      setSelectedRouteId(matching.id);
    }
  };

  const currentSelectedRoute = useMemo(() => {
    return availableRoutes.find(r => r.id === selectedRouteId) || availableRoutes[0];
  }, [availableRoutes, selectedRouteId]);

  // Save selected route to journey and return to journey view
  const handleContinueJourney = async () => {
    if (!journey || !currentSelectedRoute) return;
    setIsSaving(true);
    try {
      await journeyService.updateJourneyRoute(journey.id, {
        routeId: currentSelectedRoute.id,
        name: currentSelectedRoute.name,
        distance: currentSelectedRoute.distance,
        estimatedDuration: currentSelectedRoute.estimatedDuration,
        routeType: currentSelectedRoute.routeType,
        contextualEstimate: currentSelectedRoute.contextualEstimate,
        signals: currentSelectedRoute.signals,
        waypoints: currentSelectedRoute.waypoints
      });

      showToast(`Selected "${currentSelectedRoute.name}". Redirecting to journey...`);
      setTimeout(() => {
        navigate(`/journeys/${journey.id}`);
      }, 600);
    } catch (err) {
      showToast(err.message || 'Failed to apply route', 'error');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="py-20 text-center">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-bold text-stone-800">Calculating SafePath Routes...</h3>
        <p className="text-xs text-stone-400 mt-1">Analyzing street-level safety signals and lighting data</p>
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
          Please verify that the journey ID is valid.
        </p>
        <Button onClick={() => navigate('/journeys')} size="sm">
          Return to Journeys
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/journeys/${journey.id}`)}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
            aria-label="Back to Journey"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900">
                SafePath Route Selection
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                Interactive Escort
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {journey.startLocation.name} → {journey.destination.name}
            </p>
          </div>
        </div>

        {/* Demo Toggle for Testing Missing Coordinates */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setForceMissingCoords(!forceMissingCoords)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
              forceMissingCoords
                ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{forceMissingCoords ? 'Simulating: Coordinates Missing' : 'Simulate Missing Coordinates'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column = Map & Route Cards; Right Column = Summary & Continue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Map & Route Options) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* 1. SafePath Map View */}
          <SafePathMap
            startLocation={effectiveStart}
            destination={effectiveDest}
            routes={availableRoutes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(routeId) => setSelectedRouteId(routeId)}
          />

          {/* 2. Route Preference Selector */}
          <Card className="border border-stone-200/80 bg-white">
            <RoutePreferenceSelector
              selectedPreference={preference}
              onSelectPreference={handlePreferenceChange}
            />
          </Card>

          {/* 3. Available Route Options List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-600" />
                <span>Available Route Options ({availableRoutes.length})</span>
              </h3>
              <span className="text-[11px] text-stone-600">
                Click any route card to select
              </span>
            </div>

            <div className="space-y-3">
              {availableRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isSelected={route.id === selectedRouteId}
                  onSelect={(id) => setSelectedRouteId(id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Summary & Confirmation) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <RouteSummary
            journey={journey}
            selectedRoute={currentSelectedRoute}
            onContinue={handleContinueJourney}
            isSaving={isSaving}
          />
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

export default SafePath;
