import React, { useState } from 'react';
import { Camera, ShieldAlert, CheckCircle, AlertTriangle, X, Lock } from 'lucide-react';
import { mobileEvidenceService } from '../../services/native/mobileEvidenceService';

const EmergencyEvidenceModal = ({ isOpen, onClose }) => {
  const [capturing, setCapturing] = useState(false);
  const [evidence, setEvidence] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  if (!isOpen) return null;

  const handleCapture = async () => {
    setCapturing(true);
    setStatusMessage('Requesting camera permission & initializing optical capture...');
    setPermissionDenied(false);

    try {
      const perm = await mobileEvidenceService.requestPermissions();
      if (perm.camera === 'denied') {
        setPermissionDenied(true);
        setStatusMessage('Camera permission was denied. SafeCircle cannot capture emergency evidence without user consent.');
        setCapturing(false);
        return;
      }

      setStatusMessage('Recording single encrypted situational snapshot...');
      const snapshot = await mobileEvidenceService.captureEmergencySnapshot();
      if (snapshot) {
        setEvidence(snapshot);
        setStatusMessage('Snapshot captured securely. Encrypted & queued for authorized emergency escalation contacts.');
      } else {
        setStatusMessage('Snapshot was cancelled by user.');
      }
    } catch (err) {
      setStatusMessage(`Capture failed: ${err.message}`);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Emergency Evidence Mode</h3>
              <p className="text-xs text-stone-500">Transparent, user-authorized situational recording</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-stone-900">
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>Privacy & Transparency Guarantee</span>
            </div>
            <p>
              SafeCircle <strong>never</strong> records secretly in the background. Camera activation requires your explicit touch. Evidence is encrypted and only transmitted to contacts permitted under your Crisis safety policy.
            </p>
          </div>

          {evidence && (
            <div className="border border-stone-200 rounded-xl overflow-hidden p-3 bg-stone-50 text-center">
              <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" /> Evidence Captured & Secured
              </p>
              <img
                src={evidence.dataUrl}
                alt="Captured Emergency Evidence"
                className="max-h-48 mx-auto rounded-lg shadow-xs border border-stone-200 object-contain"
              />
              <p className="text-[10px] text-stone-400 mt-2 font-mono">
                Timestamp: {evidence.timestamp}
              </p>
            </div>
          )}

          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium ${permissionDenied ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-stone-100 text-stone-700'}`}>
              {statusMessage}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            {!evidence ? (
              <button
                onClick={handleCapture}
                disabled={capturing}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                {capturing ? 'Recording...' : 'Authorize & Capture Snapshot'}
              </button>
            ) : (
              <button
                onClick={handleCapture}
                disabled={capturing}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Retake Snapshot
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyEvidenceModal;
