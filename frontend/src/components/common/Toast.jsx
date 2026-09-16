import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-lg shadow-stone-900/5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
      role="status"
      aria-live="polite"
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        isSuccess ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
      }`}>
        {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      </div>

      <div className="text-xs font-semibold text-stone-800 pr-2">
        {message}
      </div>

      <button
        onClick={onClose}
        className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Toast;
