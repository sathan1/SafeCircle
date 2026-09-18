import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, X, PhoneCall, Camera } from 'lucide-react';
import { useSafetyState } from '../../contexts/SafetyStateContext';

const HOLD_DURATION_MS = 2000; // 2 seconds

const EmergencyHoldButton = ({ onOpenEvidence, className = '' }) => {
  const { safetyState, setSafetyState } = useSafetyState();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activated, setActivated] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const startHold = (e) => {
    e.preventDefault();
    setHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= HOLD_DURATION_MS) {
        clearInterval(timerRef.current);
        triggerEmergency();
      }
    }, 40);
  };

  const stopHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setHolding(false);
    setProgress(0);
  };

  const triggerEmergency = () => {
    setHolding(false);
    setProgress(100);
    setSafetyState('CRISIS');
    setActivated(true);
    setModalOpen(true);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <>
      {/* Hold Button Trigger */}
      <div className={`relative inline-block select-none ${className}`}>
        <button
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          className="relative overflow-hidden w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer touch-none"
          title="Press and hold for 2 seconds to trigger emergency"
        >
          {/* Progress fill animation */}
          {holding && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-rose-900/40 transition-all duration-75 pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          )}

          <ShieldAlert className="w-5 h-5 shrink-0 text-white animate-pulse" />
          <span className="relative z-10">
            {holding ? `HOLD TO ACTIVATE (${Math.round((2000 - (progress * 20)) / 100) / 10}s)` : 'EMERGENCY SOS'}
          </span>
        </button>
        <p className="text-[10px] text-stone-400 text-center mt-1">
          Hold 2s to activate · Prevents false alarms
        </p>
      </div>

      {/* Emergency Activated Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-600 animate-in zoom-in-95 duration-200">
            
            <div className="text-center pb-4 border-b border-stone-100">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
                <ShieldAlert className="w-8 h-8 animate-bounce" />
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white inline-block mb-1">
                CRISIS ACTIVE
              </span>
              <h3 className="text-xl font-extrabold text-stone-900">
                Emergency Protection Activated
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Your configured trusted contacts have been unlocked according to your Crisis privacy policy.
              </p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Trusted Contacts Notified</span>
                </p>
                <p className="text-rose-700 text-[11px]">
                  Mom & Priya have received your emergency alert and permitted live coordinates.
                </p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-stone-700">
                <p className="font-semibold text-stone-900">Available Emergency Actions</p>
                <div className="flex gap-2 pt-1">
                  {onOpenEvidence && (
                    <button
                      onClick={() => { setModalOpen(false); onOpenEvidence(); }}
                      className="flex-1 py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Record Evidence</span>
                    </button>
                  )}
                  <a
                    href="tel:112"
                    className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 112 / Help</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setSafetyState('NORMAL');
                  setModalOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
              >
                I Am Safe · De-escalate to Normal
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-2 text-stone-400 hover:text-stone-700 text-xs font-semibold"
              >
                Dismiss Dialog (Keep Crisis Active)
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyHoldButton;
