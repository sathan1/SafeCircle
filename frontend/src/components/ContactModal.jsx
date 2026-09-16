import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const ContactModal = ({ isOpen, onClose, onSave, contact }) => {
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    email: '',
    phone: '',
    priority: 3,
    notificationPreferences: {
      journeyAlerts: true,
      safetyAlerts: true,
      emergencyAlerts: true
    }
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else {
      setFormData({
        name: '',
        relationship: '',
        email: '',
        phone: '',
        priority: 3,
        notificationPreferences: {
          journeyAlerts: true,
          safetyAlerts: true,
          emergencyAlerts: true
        }
      });
    }
    setError('');
  }, [contact, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [name]: checked
        }
      }));
    } else if (name === 'priority') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.relationship) {
      return setError('Name and relationship are required.');
    }

    if (!formData.email && !formData.phone) {
      return setError('At least one contact method (email or phone) is required.');
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save contact');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={contact ? 'Edit Contact' : 'Add Person'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        )}
        
        <Input 
          label="Full Name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          placeholder="e.g. Mom"
        />
        
        <Input 
          label="Relationship" 
          name="relationship" 
          value={formData.relationship} 
          onChange={handleChange} 
          required 
          placeholder="e.g. Parent"
        />

        <Input 
          label="Email Address" 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          placeholder="mom@example.com"
        />

        <Input 
          label="Phone Number" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          placeholder="+1 (555) 000-0000"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select 
            name="priority" 
            value={formData.priority} 
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#d81b60] focus:ring focus:ring-[#f48fb1]/50 outline-none transition-all bg-white"
          >
            <option value={1}>Priority 1 (Highest)</option>
            <option value={2}>Priority 2 (Medium)</option>
            <option value={3}>Priority 3 (Standard)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Priority determines the order used by future escalation workflows.</p>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notification Preferences</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="journeyAlerts" 
                checked={formData.notificationPreferences.journeyAlerts} 
                onChange={handleChange}
                className="rounded text-[#d81b60] focus:ring-[#f48fb1]"
              />
              <span className="text-sm text-gray-700">Journey alerts</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="safetyAlerts" 
                checked={formData.notificationPreferences.safetyAlerts} 
                onChange={handleChange}
                className="rounded text-[#d81b60] focus:ring-[#f48fb1]"
              />
              <span className="text-sm text-gray-700">Safety alerts</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="emergencyAlerts" 
                checked={formData.notificationPreferences.emergencyAlerts} 
                onChange={handleChange}
                className="rounded text-[#d81b60] focus:ring-[#f48fb1]"
              />
              <span className="text-sm text-gray-700">Emergency alerts</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (contact ? 'Save Changes' : 'Add to Safety Circle')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactModal;
