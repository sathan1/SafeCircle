import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../common/Button';

const DeleteContactDialog = ({ isOpen, onClose, onConfirm, contact, isDeleting }) => {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200/80 shadow-2xl transition-all animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Remove this person from your Safety Circle?
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Are you sure you want to remove <strong>{contact.name}</strong> ({contact.relationship})? They will immediately stop receiving journey checkpoints and escalation notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onConfirm(contact.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteContactDialog;
