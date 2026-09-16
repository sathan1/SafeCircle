import React from 'react';
import { Users, AlertTriangle, ShieldCheck, Power } from 'lucide-react';

const ContactSelector = ({ contacts, selectedContactId, onSelectContact }) => {
  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-rose-600" />
          <span>Select Contact</span>
        </label>
        <span className="text-[11px] text-stone-400">
          Independent Policy per Person
        </span>
      </div>

      {/* Horizontal pill list */}
      <div className="flex flex-wrap gap-2.5">
        {contacts.map((contact) => {
          const isSelected = contact.id === selectedContactId;
          const initial = (contact.name || 'C').charAt(0).toUpperCase();

          return (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className={`
                flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all duration-150 cursor-pointer
                ${
                  isSelected
                    ? 'bg-rose-50/90 border-rose-400 text-rose-950 shadow-xs ring-2 ring-rose-200'
                    : 'bg-white border-stone-200/80 text-stone-700 hover:border-rose-200 hover:bg-stone-50'
                }
              `}
            >
              <div className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                contact.isActive
                  ? 'bg-rose-200 text-rose-800'
                  : 'bg-stone-200 text-stone-500'
              }`}>
                {initial}
              </div>

              <div className="text-left">
                <div className="leading-tight">{contact.name}</div>
                <div className="text-[10px] font-normal text-stone-400">{contact.relationship}</div>
              </div>

              {/* Status dot */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${contact.isActive ? 'bg-emerald-500' : 'bg-stone-400'}`}
                title={contact.isActive ? 'Active Contact' : 'Inactive Contact'}
              />
            </button>
          );
        })}
      </div>

      {/* Inactive Contact Alert */}
      {selectedContact && !selectedContact.isActive && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>{selectedContact.name} is currently Inactive.</strong>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              Inactive contacts are strictly excluded from receiving journey checkpoints or escalation packets regardless of matrix settings. You can activate this contact in the Safety Circle tab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSelector;
