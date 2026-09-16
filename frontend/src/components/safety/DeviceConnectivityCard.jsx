import React from 'react';
import { 
  Smartphone, 
  Watch, 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryCharging, 
  RefreshCw, 
  ShieldCheck, 
  Info,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';

export default function DeviceConnectivityCard({
  deviceStatus,
  className = ''
}) {
  if (!deviceStatus) {
    return null;
  }

  const phone = deviceStatus.phone || {};
  const wearable = deviceStatus.wearable || {};
  const isFallbackActive = deviceStatus.fallbackActive || wearable.isFallbackActive;

  const isPhoneConnected = phone.status === 'CONNECTED';
  const isPhoneUnavailable = phone.status === 'UNAVAILABLE';
  const isWearableConnected = wearable.status === 'CONNECTED';

  return (
    <div className={`bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-rose-50/40 via-white to-stone-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-stone-900">Device Connectivity</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100/70 text-rose-700 border border-rose-200">
                Hardware Integration Simulation
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Multi-device heartbeat and companion wearable fallback monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400">Last Synced:</span>
          <span className="font-mono text-stone-700 font-semibold bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
            {deviceStatus.lastSynchronizedAt ? new Date(deviceStatus.lastSynchronizedAt).toLocaleTimeString() : '--:--'}
          </span>
        </div>
      </div>

      {/* Fallback Active Banner */}
      {isFallbackActive && (
        <div className="px-5 py-3 bg-amber-50/90 border-b border-amber-200/80 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Wearable Fallback Active: </strong>
              Primary smartphone is unavailable. SafeCircle is maintaining continuity via companion wearable.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
            Fallback Engaged
          </span>
        </div>
      )}

      {/* Device Cards Grid */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Phone Card */}
          <div className={`
            p-4 rounded-xl border transition-all space-y-3
            ${isPhoneConnected 
              ? 'bg-white border-stone-200 shadow-2xs' 
              : 'bg-stone-50/70 border-stone-300 border-dashed'
            }
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${isPhoneConnected ? 'bg-rose-50 text-rose-600' : 'bg-stone-200 text-stone-500'}
                `}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900">Primary Smartphone</h4>
                  <span className="text-[10px] text-stone-400 block">
                    {phone.modelName || 'Host Device'}
                  </span>
                </div>
              </div>

              <span className={`
                px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                ${isPhoneConnected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-stone-200 text-stone-700 border-stone-300'
                }
              `}>
                {phone.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Connection:</span>
                <span className="font-semibold text-stone-800">{phone.connectionType}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Battery Level:</span>
                <span className="font-semibold text-stone-800 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-stone-500" />
                  {phone.batteryLevel}%
                </span>
              </div>
              <div className="flex justify-between text-stone-500 text-[11px] pt-1 border-t border-stone-100">
                <span>Role:</span>
                <span className="font-medium text-stone-600">Primary Telemetry Origin</span>
              </div>
            </div>
          </div>

          {/* Companion Wearable Card */}
          <div className={`
            p-4 rounded-xl border transition-all space-y-3
            ${isWearableConnected 
              ? isFallbackActive
                ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                : 'bg-white border-stone-200 shadow-2xs'
              : 'bg-stone-50/70 border-stone-300 border-dashed'
            }
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${isWearableConnected ? 'bg-rose-50 text-rose-600' : 'bg-stone-200 text-stone-500'}
                `}>
                  <Watch className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900">Companion Wearable</h4>
                  <span className="text-[10px] text-stone-400 block">
                    {wearable.modelName || 'Escort Companion Band'}
                  </span>
                </div>
              </div>

              <span className={`
                px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                ${isFallbackActive
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : isWearableConnected 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-stone-200 text-stone-700 border-stone-300'
                }
              `}>
                {isFallbackActive ? 'FALLBACK ACTIVE' : wearable.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Connection:</span>
                <span className="font-semibold text-stone-800">{wearable.connectionType}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Battery Level:</span>
                <span className="font-semibold text-stone-800 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-stone-500" />
                  {wearable.batteryLevel}%
                </span>
              </div>
              <div className="flex justify-between text-stone-500 text-[11px] pt-1 border-t border-stone-100">
                <span>Last Synced State:</span>
                <span className="font-semibold text-stone-700 uppercase">
                  {deviceStatus.lastKnownSafetyState || 'NORMAL'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Architecture Explanation (Requirement 7) */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-stone-800">Hardware Integration Architecture: </span>
            Future wearable integration could allow limited safety-state continuity when the phone becomes unavailable. 
            This prototype simulates the architecture without claiming hardware-level functionality or post-shutdown OS tracking.
          </div>
        </div>
      </div>
    </div>
  );
}
