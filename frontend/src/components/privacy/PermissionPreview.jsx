import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight
} from 'lucide-react';
import Card from '../common/Card';
import { 
  SAFETY_STATES, 
  INFORMATION_TYPES, 
  INFORMATION_LABELS,
  contactService 
} from '../../services/contactService';

const PermissionPreview = ({ contact, permissions }) => {
  const [selectedState, setSelectedState] = useState('ELEVATED');
  const [selectedInfo, setSelectedInfo] = useState('LIVE_LOCATION');
  const [backendVerified, setBackendVerified] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Local evaluation check
  const isLocallyAllowed = contact?.isActive !== false && Boolean(permissions?.[selectedState]?.[selectedInfo]);

  // Reset backend verification when inputs change
  useEffect(() => {
    setBackendVerified(null);
  }, [selectedState, selectedInfo, contact, permissions]);

  const verifyWithBackend = async () => {
    if (!contact?.id) return;
    setIsVerifying(true);
    try {
      const res = await contactService.checkAuthorization(contact.id, selectedState, selectedInfo);
      setBackendVerified(res);
    } catch (err) {
      console.error('Backend verify failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="bg-white border border-stone-200/80">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Demonstration Widget</span>
          </div>
          <h3 className="text-base font-bold text-stone-900">
            Permission Preview
          </h3>
          <p className="text-xs text-stone-500">
            Evaluate whether <strong>{contact?.name || 'this contact'}</strong> would be granted access in real time.
          </p>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Simulated Safety State
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {SAFETY_STATES.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                  selectedState === st
                    ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-2xs font-bold'
                    : 'bg-[#fcf8f8] border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Requested Information Category
          </label>
          <select
            value={selectedInfo}
            onChange={(e) => setSelectedInfo(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#fcf8f8] focus:ring-1 focus:ring-rose-400 focus:outline-none cursor-pointer"
          >
            {INFORMATION_TYPES.map((it) => (
              <option key={it} value={it}>
                {INFORMATION_LABELS[it]}
              </option>
            ))}
          </select>

          <div className="mt-3 flex justify-end">
            <button
              onClick={verifyWithBackend}
              disabled={isVerifying}
              className="text-[11px] font-semibold text-rose-700 hover:text-rose-800 hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>{isVerifying ? 'Checking...' : 'Verify with Backend Engine →'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Output Result Banner */}
      <div className={`p-4 rounded-2xl border transition-all duration-200 ${
        isLocallyAllowed
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-rose-50/70 border-rose-200 text-rose-950'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isLocallyAllowed
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-rose-100 text-rose-700 border-rose-200'
            }`}>
              {isLocallyAllowed ? (
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <XCircle className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <div className="text-xs text-stone-600">
                Would <strong>{contact?.name}</strong> be allowed to see <strong>{INFORMATION_LABELS[selectedInfo]}</strong> in <strong>{selectedState}</strong> state?
              </div>
              <div className="text-lg font-black tracking-tight mt-0.5 flex items-center gap-2">
                <span>{isLocallyAllowed ? 'YES — GRANTED' : 'NO — DENIED'}</span>
                {!contact?.isActive && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Inactive Contact
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-stone-600 mt-2.5 pt-2 border-t border-stone-200/50">
          {!contact?.isActive
            ? `Denied because ${contact?.name} is marked as inactive in Safety Circle.`
            : isLocallyAllowed
            ? `Based on ${contact?.name}'s current permission policy: explicit consent granted for ${selectedState} state.`
            : `Based on ${contact?.name}'s current permission policy: data withheld to preserve personal privacy.`}
        </p>

        {/* Backend verification confirmation if triggered */}
        {backendVerified && (
          <div className="mt-2.5 p-2 rounded-xl bg-white/90 border border-stone-200/80 text-[11px] text-stone-700 flex items-center justify-between">
            <span className="font-semibold text-emerald-800">
              Backend Authorization Confirmed: {backendVerified.isAuthorized ? 'true (Allowed)' : 'false (Denied)'}
            </span>
            <span className="text-stone-400 font-mono text-[10px]">
              HTTP 200 /api/contacts/{contact?.id}/authorize
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PermissionPreview;
