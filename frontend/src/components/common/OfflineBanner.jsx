import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { mobileNetworkService } from '../../services/native/mobileNetworkService';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    mobileNetworkService.initialize();
    const unsubscribe = mobileNetworkService.subscribe((status) => {
      setIsOnline(status.isOnline);
    });
    return unsubscribe;
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="bg-amber-500 text-stone-900 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm sticky top-0 z-50 animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-2 mx-auto">
        <WifiOff className="w-4 h-4 text-stone-900 shrink-0" />
        <span>
          Offline Mode — Using local safety state & cached policies. Live circle synchronization is paused.
        </span>
      </div>
    </div>
  );
};

export default OfflineBanner;
