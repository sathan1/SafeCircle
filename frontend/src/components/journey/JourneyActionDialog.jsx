import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import Button from '../common/Button';

const JourneyActionDialog = ({ isOpen, actionType, onClose, onConfirm, isProcessing }) => {
  if (!isOpen) return null;

  const isEnd = actionType === 'END';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200/80 shadow-2xl transition-all animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
            isEnd
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {isEnd ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {isEnd ? 'Are you sure you have completed this journey?' : 'Cancel this active journey?'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {isEnd
                ? 'Your journey will be marked as Completed Safely. Automated monitoring will stand down and your circle will receive final arrival confirmation if allowed by your policy.'
                : 'Your journey will be marked as Cancelled. The record will be preserved in your journey history. Continuous monitoring will cease immediately.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant={isEnd ? 'primary' : 'danger'}
            size="sm"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Updating...' : isEnd ? 'End Journey' : 'Cancel Journey'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JourneyActionDialog;
