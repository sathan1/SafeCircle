import React from 'react';
import Card from './Card';
import Button from './Button';
import { AlertCircle, Activity, Navigation, ShieldAlert, Users, Phone, Mail } from 'lucide-react';

const ContactCard = ({ contact, onEdit, onDelete }) => {
  return (
    <Card className="flex flex-col h-full border border-gray-100 hover:border-pink-200 transition-colors shadow-sm hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-gray-500 uppercase">
              {contact.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{contact.name}</h3>
            <span className="text-sm text-gray-500 font-medium">{contact.relationship}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            Priority {contact.priority}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {contact.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            {contact.phone}
          </div>
        )}
        {contact.email && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            {contact.email}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4 mt-auto">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notification Preferences</p>
        <div className="grid grid-cols-1 gap-2">
           <div className={`flex items-center text-sm ${contact.notificationPreferences?.journeyAlerts ? 'text-gray-700' : 'text-gray-300'}`}>
             <Navigation className="w-4 h-4 mr-2" />
             Journey alerts
           </div>
           <div className={`flex items-center text-sm ${contact.notificationPreferences?.safetyAlerts ? 'text-gray-700' : 'text-gray-300'}`}>
             <AlertCircle className="w-4 h-4 mr-2" />
             Safety alerts
           </div>
           <div className={`flex items-center text-sm ${contact.notificationPreferences?.emergencyAlerts ? 'text-gray-700' : 'text-gray-300'}`}>
             <ShieldAlert className="w-4 h-4 mr-2" />
             Emergency alerts
           </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="secondary" fullWidth onClick={() => onEdit(contact)}>
          Edit
        </Button>
        <Button variant="danger" fullWidth onClick={() => onDelete(contact)}>
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default ContactCard;
