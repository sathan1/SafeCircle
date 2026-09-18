import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { mobileLocationService } from '../../services/native/mobileLocationService';

const GpsStatusIndicator = ({ className = '' }) => {
  const [locationStatus, setLocationStatus] = useState({
    isLive: false,
    isStale: false,
    accuracy: null,
    source: null,
    lastChecked: null
  });
  const [checking, setChecking] = useState(false);

  const checkLocation = async () => {
    setChecking(true);
    try {
      const loc = await mobileLocationService.getCurrentLocation();
      setLocationStatus({
        isLive: loc.isLive,
        isStale: loc.isStale,
        accuracy: loc.accuracy,
        source: loc.source,
        lastChecked: new Date(loc.timestamp).toLocaleTimeString()
      });
    } catch (e) {
      console.warn('GPS check failed:', e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkLocation();
    const interval = setInterval(checkLocation, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusDisplay = () => {
    if (locationStatus.isLive) {
      return {
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500',
        label: `Live GPS (±${Math.round(locationStatus.accuracy || 10)}m)`,
        desc: `High accuracy lock via ${locationStatus.source}`
      };
    }
    if (locationStatus.isStale) {
      return {
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        dotColor: 'bg-amber-500',
        label: `Stale Location (${locationStatus.lastChecked || 'prior'})`,
        desc: 'Signal unavailable or waiting for new GPS fix'
      };
    }
    return {
      badgeColor: 'bg-stone-100 text-stone-600 border-stone-200',
      dotColor: 'bg-stone-400',
      label: 'Acquiring GPS...',
      desc: 'Requesting device location'
    };
  };

  const status = getStatusDisplay();

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium ${status.badgeColor} ${className}`}>
      <span className={`w-2 h-2 rounded-full ${status.dotColor} ${locationStatus.isLive ? 'animate-pulse' : ''}`} />
      <span>{status.label}</span>
      <button
        onClick={checkLocation}
        disabled={checking}
        className="ml-1 text-stone-400 hover:text-stone-700 disabled:opacity-50"
        title="Refresh GPS status"
      >
        <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default GpsStatusIndicator;
