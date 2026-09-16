import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Plus, 
  CheckCircle2,
  BellRing,
  Sparkles
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const ActiveCheckInCard = ({
  checkIn,
  onRequestCheckIn,
  onRespondSafe,
  onRespondNeedHelp,
  isProcessing = false
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!checkIn || checkIn.status !== 'PENDING') {
      setTimeLeft('');
      setIsOverdue(false);
      return;
    }

    const calculateRemaining = () => {
      const now = Date.now();
      const due = new Date(checkIn.dueAt).getTime();
      const diffMs = due - now;

      if (diffMs <= 0) {
        setTimeLeft('00:00 (Due now)');
        setIsOverdue(true);
      } else {
        const totalSecs = Math.floor(diffMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        setIsOverdue(false);
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [checkIn]);

  // When no active check-in is pending
  if (!checkIn || checkIn.status !== 'PENDING') {
    return (
      <Card className="border border-stone-200/80 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-center text-stone-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900">Safety Check-In</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  Inactive
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                No active check-in prompt. You can request a verification checkpoint at any time.
              </p>
            </div>
          </div>

          <Button
            onClick={onRequestCheckIn}
            disabled={isProcessing}
            size="sm"
            icon={Plus}
          >
            Request Check-In
          </Button>
        </div>
      </Card>
    );
  }

  // When a check-in is PENDING
  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50/40 via-white to-white shadow-sm ring-2 ring-amber-400/20">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-amber-100 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <BellRing className="w-3.5 h-3.5 animate-bounce text-amber-700" />
              <span>Safety Check-In Required</span>
            </span>
            <span className="text-[10px] text-stone-500 font-mono">
              ID: {checkIn.id}
            </span>
          </div>

          <h3 className="text-lg font-bold text-stone-900 mt-1">
            Please confirm that you're safe.
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            A routine safety verification has been requested for this journey segment.
          </p>
        </div>

        {/* Live Countdown Clock */}
        <div className={`p-3 rounded-xl border text-center shrink-0 ${
          isOverdue 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <span className="text-[10px] uppercase font-bold tracking-wider block">
            Time Remaining
          </span>
          <div className="text-xl font-black font-mono mt-0.5">
            {timeLeft || '05:00'}
          </div>
        </div>
      </div>

      {/* Meta Specs Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-4">
        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
          <span className="text-[10px] text-stone-500 uppercase font-semibold block">Requested</span>
          <span className="font-bold text-stone-800">
            {new Date(checkIn.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
          <span className="text-[10px] text-stone-500 uppercase font-semibold block">Due By</span>
          <span className="font-bold text-stone-800">
            {new Date(checkIn.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
          <span className="text-[10px] text-stone-500 uppercase font-semibold block">Status</span>
          <span className="font-bold text-amber-700">
            {checkIn.status}
          </span>
        </div>
      </div>

      {/* Primary Action Response Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          disabled={isProcessing}
          onClick={onRespondSafe}
          className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>I'm Safe (Confirm Baseline)</span>
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={onRespondNeedHelp}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Need Help</span>
        </button>
      </div>
    </Card>
  );
};

export default ActiveCheckInCard;
