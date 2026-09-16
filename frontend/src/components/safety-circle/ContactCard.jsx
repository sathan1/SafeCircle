import React from 'react';
import { 
  Phone, 
  Mail, 
  Bell, 
  MessageSquare, 
  PhoneCall, 
  Smartphone, 
  Edit3, 
  Trash2, 
  Power, 
  Shield, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import Card from '../common/Card';

const NOTIFICATION_ICONS = {
  Push: Smartphone,
  SMS: MessageSquare,
  Call: PhoneCall,
  Email: Mail
};

const ContactCard = ({ contact, onEdit, onToggleStatus, onDelete }) => {
  const NotificationIcon = NOTIFICATION_ICONS[contact.notificationPreference] || Bell;
  const initial = (contact.name || 'C').charAt(0).toUpperCase();

  return (
    <Card className={`flex flex-col justify-between transition-all duration-200 ${
      !contact.isActive
        ? 'opacity-70 bg-stone-50/70 border-dashed border-stone-300'
        : 'hover:border-rose-200 bg-white shadow-xs'
    }`}>
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl font-bold text-sm flex items-center justify-center border shrink-0 ${
              contact.isActive
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : 'bg-stone-200 text-stone-600 border-stone-300'
            }`}>
              {initial}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                {contact.name}
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                {contact.relationship}
              </span>
            </div>
          </div>

          {/* Active / Inactive Badge */}
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            contact.isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-stone-100 text-stone-500 border-stone-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${contact.isActive ? 'bg-emerald-500' : 'bg-stone-400'}`} />
            {contact.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Priority & Notification Pill Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
            <Shield className="w-3 h-3 text-rose-500" />
            <span>Priority {contact.priority}</span>
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#fcf8f8] text-stone-600 border border-stone-200/70">
            <NotificationIcon className="w-3 h-3 text-stone-400" />
            <span>{contact.notificationPreference}</span>
          </span>
        </div>

        {/* Contact Info Box */}
        <div className="space-y-1.5 text-xs text-stone-600 bg-[#fcf8f8] p-3 rounded-xl border border-stone-200/60 mb-5 font-mono">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0 font-sans" />
            <span>{contact.phone}</span>
          </div>
          {contact.email && (
            <div className="flex items-center gap-2 text-stone-500">
              <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0 font-sans" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onToggleStatus(contact)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
            contact.isActive
              ? 'text-stone-600 bg-stone-50 hover:bg-stone-100 border-stone-200'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
          }`}
          title={contact.isActive ? 'Deactivate contact' : 'Activate contact'}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{contact.isActive ? 'Deactivate' : 'Activate'}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Edit contact details"
            aria-label={`Edit ${contact.name}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(contact)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Remove contact"
            aria-label={`Remove ${contact.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ContactCard;
