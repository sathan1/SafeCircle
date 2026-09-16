import React, { useState, useEffect } from 'react';
import { X, Navigation, Clock, Shield, AlertCircle, Users, Check, Lock } from 'lucide-react';
import Button from '../common/Button';
import { contactService } from '../../services/contactService';

const StartJourneyModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    startLocation: '',
    destination: '',
    expectedArrival: '',
    selectedContacts: [],
    notes: ''
  });

  const [activeContacts, setActiveContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Set default expected arrival to 45 minutes from now in local ISO format (YYYY-MM-DDTHH:mm)
    const defaultETA = new Date(Date.now() + 45 * 60 * 1000);
    const localISO = new Date(defaultETA.getTime() - defaultETA.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setFormData({
      startLocation: 'College',
      destination: 'Home',
      expectedArrival: localISO,
      selectedContacts: [],
      notes: ''
    });
    setValidationError('');

    // Fetch active contacts from Safety Circle
    setIsLoadingContacts(true);
    contactService.getContacts()
      .then(contacts => {
        // Filter only active contacts
        const eligible = contacts.filter(c => c.isActive !== false);
        setActiveContacts(eligible);
        // Pre-select up to 2 active contacts
        if (eligible.length > 0) {
          setFormData(prev => ({
            ...prev,
            selectedContacts: eligible.slice(0, 2).map(c => c.id)
          }));
        }
      })
      .catch(err => {
        console.error('Failed to load contacts for journey:', err);
      })
      .finally(() => {
        setIsLoadingContacts(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleContact = (contactId) => {
    setFormData(prev => {
      const exists = prev.selectedContacts.includes(contactId);
      return {
        ...prev,
        selectedContacts: exists
          ? prev.selectedContacts.filter(id => id !== contactId)
          : [...prev.selectedContacts, contactId]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.startLocation.trim()) {
      setValidationError('Please enter a starting location (From).');
      return;
    }
    if (!formData.destination.trim()) {
      setValidationError('Please enter a destination (To).');
      return;
    }
    if (!formData.expectedArrival) {
      setValidationError('Please specify an expected arrival time.');
      return;
    }

    const arrivalDate = new Date(formData.expectedArrival);
    if (arrivalDate <= new Date()) {
      setValidationError('Expected arrival must be a valid future time.');
      return;
    }

    if (formData.selectedContacts.length === 0) {
      setValidationError('Please select at least one active Safety Circle contact.');
      return;
    }

    onSubmit({
      startLocation: formData.startLocation.trim(),
      destination: formData.destination.trim(),
      expectedArrival: new Date(formData.expectedArrival).toISOString(),
      selectedContacts: formData.selectedContacts,
      notes: formData.notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-stone-200/80 shadow-2xl transition-all animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                Plan & Start New Journey
              </h3>
              <p className="text-xs text-stone-500">
                Activate real-time progressive monitoring for your route
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

        {/* Validation Error Alert */}
        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                From (Starting Point) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. College Campus, Metro"
                value={formData.startLocation}
                onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                To (Destination) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Home, Hostel"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Expected Arrival Time <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={formData.expectedArrival}
                onChange={(e) => setFormData({ ...formData, expectedArrival: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono"
                required
              />
            </div>
            <span className="text-[10px] text-stone-400">Must be set to a future timestamp</span>
          </div>

          {/* Safety Circle Contact Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700">
                Safety Circle Contacts <span className="text-rose-600">*</span>
              </label>
              <span className="text-[10px] text-stone-400">Active Contacts Only</span>
            </div>

            {isLoadingContacts ? (
              <div className="p-3 text-center text-xs text-stone-400 bg-stone-50 rounded-xl">
                Loading Safety Circle contacts...
              </div>
            ) : activeContacts.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                No active contacts found. Please add or activate contacts in the Safety Circle before starting a journey.
              </div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {activeContacts.map((contact) => {
                  const isChecked = formData.selectedContacts.includes(contact.id);
                  return (
                    <label
                      key={contact.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                        isChecked
                          ? 'bg-rose-50/70 border-rose-300 text-stone-900 font-medium shadow-2xs'
                          : 'bg-[#fcf8f8] border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleContact(contact.id)}
                          className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <span>{contact.name}</span>
                        <span className="text-[11px] text-stone-400 font-normal">({contact.relationship})</span>
                      </div>
                      <span className="text-[10px] font-semibold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-100">
                        Priority {contact.priority}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Privacy Rule Notice */}
            <div className="mt-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 leading-relaxed flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>
                These contacts are trusted recipients. What they can access is still controlled by your Privacy Policy.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Optional Note
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Taking Metro Line 2, wearing red jacket"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
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
              disabled={isSubmitting || activeContacts.length === 0}
            >
              {isSubmitting ? 'Starting...' : 'Start Journey'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartJourneyModal;
