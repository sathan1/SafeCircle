import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
