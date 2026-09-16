import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit3, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

const RELATIONSHIP_OPTIONS = ['Parent', 'Sibling', 'Friend', 'Partner', 'Guardian', 'Other'];
const NOTIFICATION_OPTIONS = ['Push', 'SMS', 'Call', 'Email'];

const ContactModal = ({ isOpen, onClose, onSubmit, contactToEdit, isSubmitting }) => {
  const isEditing = Boolean(contactToEdit);

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Parent',
    phone: '',
    email: '',
    priority: 1,
    notificationPreference: 'Push',
    isActive: true
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (contactToEdit) {
      setFormData({
        name: contactToEdit.name || '',
        relationship: contactToEdit.relationship || 'Parent',
        phone: contactToEdit.phone || '',
        email: contactToEdit.email || '',
        priority: contactToEdit.priority || 1,
        notificationPreference: contactToEdit.notificationPreference || 'Push',
        isActive: contactToEdit.isActive !== undefined ? contactToEdit.isActive : true
      });
    } else {
      setFormData({
        name: '',
        relationship: 'Parent',
        phone: '',
        email: '',
        priority: 1,
        notificationPreference: 'Push',
        isActive: true
      });
    }
    setValidationError('');
  }, [contactToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.name.trim()) {
      setValidationError('Please enter a full name.');
      return;
    }
    if (!formData.phone.trim()) {
      setValidationError('Please enter a valid phone number.');
      return;
    }
    const prio = Number(formData.priority);
    if (!Number.isInteger(prio) || prio < 1) {
      setValidationError('Priority must be a positive integer (e.g. 1, 2, 3).');
      return;
    }

    onSubmit({
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      priority: prio
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-stone-200/80 shadow-2xl transition-all animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                {isEditing ? 'Edit Trusted Contact' : 'Add Person to Safety Circle'}
              </h3>
              <p className="text-xs text-stone-500">
                {isEditing ? 'Update contact details and priority' : 'Add a designated responder for safety escalations'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Full Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mom, Ananya Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Relationship <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {RELATIONSHIP_OPTIONS.map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Phone Number <span className="text-rose-600">*</span>
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="contact@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Priority Order <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                required
              />
              <span className="text-[10px] text-stone-400">1 = Highest consideration during alerts</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Notification Preference
            </label>
            <select
              value={formData.notificationPreference}
              onChange={(e) => setFormData({ ...formData, notificationPreference: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              {NOTIFICATION_OPTIONS.map((notif) => (
                <option key={notif} value={notif}>{notif} Notification</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
