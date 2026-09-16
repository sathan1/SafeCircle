import React, { useState } from 'react';
import { 
  Check, 
  Minus, 
  RotateCcw, 
  Save, 
  X, 
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
  SAFETY_STATES, 
  INFORMATION_TYPES, 
  INFORMATION_LABELS, 
  INFORMATION_DESCRIPTIONS 
} from '../../services/contactService';

const PermissionMatrix = ({
  contact,
  permissions,
  hasChanges,
  onTogglePermission,
  onSave,
  onCancel,
  onRestoreDefaults,
  isSaving
}) => {
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const handleConfirmRestore = () => {
    setShowRestoreModal(false);
    onRestoreDefaults();
  };

  return (
    <Card noPadding className="overflow-hidden border border-stone-200/80 bg-white">
      {/* Top Header */}
      <div className="p-4 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              Permission Matrix for {contact?.name || 'Contact'}
            </h3>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              contact?.isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}>
              {contact?.isActive ? 'Active Recipient' : 'Inactive Recipient'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Toggle what {contact?.name} is authorized to view across each safety escalation state.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowRestoreModal(true)}
            icon={RotateCcw}
            disabled={isSaving}
          >
            Restore Defaults
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <div className="bg-rose-50/90 border-b border-rose-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span>You have unsaved changes to this contact's policy.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
              className="py-1 px-2.5 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              icon={Save}
              className="py-1 px-3 text-xs"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-[#fcf8f8] border-b border-stone-200 text-xs font-bold text-stone-700">
              <th className="py-3.5 px-6 font-semibold w-2/5">Information Category</th>
              <th className="py-3.5 px-3 text-center font-semibold text-emerald-800">
                <span className="block text-emerald-700 font-extrabold">NORMAL</span>
                <span className="text-[10px] font-normal text-stone-400">Baseline</span>
              </th>
              <th className="py-3.5 px-3 text-center font-semibold text-amber-800">
                <span className="block text-amber-700 font-extrabold">CAUTION</span>
                <span className="text-[10px] font-normal text-stone-400">Mild Delay</span>
              </th>
              <th className="py-3.5 px-3 text-center font-semibold text-orange-800">
                <span className="block text-orange-700 font-extrabold">ELEVATED</span>
                <span className="text-[10px] font-normal text-stone-400">Unanswered</span>
              </th>
              <th className="py-3.5 px-3 text-center font-semibold text-red-800">
                <span className="block text-red-700 font-extrabold">CRISIS</span>
                <span className="text-[10px] font-normal text-stone-400">Emergency</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {INFORMATION_TYPES.map((infoType) => {
              const label = INFORMATION_LABELS[infoType];
              const desc = INFORMATION_DESCRIPTIONS[infoType];

              return (
                <tr key={infoType} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{label}</span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                      {desc}
                    </div>
                  </td>

                  {SAFETY_STATES.map((state) => {
                    const isAllowed = Boolean(permissions?.[state]?.[infoType]);

                    return (
                      <td key={state} className="py-4 px-3 text-center">
                        <button
                          onClick={() => onTogglePermission(state, infoType)}
                          className={`
                            inline-flex items-center justify-center gap-1 w-10 h-10 rounded-xl transition-all duration-150 cursor-pointer border
                            ${
                              isAllowed
                                ? 'bg-rose-50/80 border-rose-300 text-rose-700 shadow-2xs hover:bg-rose-100 hover:border-rose-400'
                                : 'bg-stone-50 border-stone-200/80 text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                            }
                          `}
                          title={`Click to ${isAllowed ? 'deny' : 'allow'} ${label} in ${state} state`}
                          aria-label={`${label} in ${state} state: ${isAllowed ? 'Allowed' : 'Denied'}`}
                        >
                          {isAllowed ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <Minus className="w-4 h-4 text-stone-300 stroke-[2]" />
                          )}
                        </button>
                        <div className="text-[9px] font-semibold mt-1 uppercase tracking-tight text-stone-400">
                          {isAllowed ? 'Allow' : 'Deny'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Restore Defaults Confirmation Dialog */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200/80 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-stone-900">
                  Restore recommended default policy?
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  This will reset permissions for <strong>{contact?.name}</strong> to the SafeCircle recommended defaults. Other contacts will remain unchanged.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowRestoreModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmRestore}
              >
                Restore Defaults
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PermissionMatrix;
