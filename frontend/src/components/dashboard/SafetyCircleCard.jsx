import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { contactService } from '../../services/contactService';

const SafetyCircleCard = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    contactService.getContacts()
      .then(data => {
        if (isMounted) setContacts(data);
      })
      .catch(() => {
        // Fallback demo state if backend not yet ready
      });
    return () => { isMounted = false; };
  }, []);

  const totalCount = contacts.length || 3;
  const displayContacts = contacts.length > 0 ? contacts.slice(0, 3) : [
    { name: 'Mom', initial: 'M' },
    { name: 'Priya', initial: 'P' },
    { name: 'Ananya', initial: 'A' }
  ];

  return (
    <Card className="hover:border-rose-200 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
            Active Circle
          </span>
        </div>

        <div className="mb-4">
          <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Safety Circle
          </span>
          <h3 className="text-2xl font-extrabold text-stone-900 mt-0.5">
            {totalCount} Trusted Contacts
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Designated responders for caution, elevated, and crisis escalation.
          </p>
        </div>

        {/* Contact Avatars Row */}
        <div className="flex items-center gap-2 mb-6">
          {displayContacts.map((contact, idx) => (
            <div
              key={contact.id || idx}
              className="flex items-center gap-2 bg-[#fcf8f8] px-2.5 py-1.5 rounded-xl border border-stone-200/70"
            >
              <div className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 font-bold text-[11px] flex items-center justify-center">
                {contact.initial || (contact.name ? contact.name.charAt(0).toUpperCase() : 'C')}
              </div>
              <span className="text-xs font-medium text-stone-800 truncate max-w-[80px]">
                {contact.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Button
          onClick={() => navigate('/safety-circle')}
          variant="secondary"
          size="sm"
          fullWidth
        >
          <span>Manage Safety Circle</span>
          <ChevronRight className="w-4 h-4 ml-1 text-stone-400" />
        </Button>
      </div>
    </Card>
  );
};

export default SafetyCircleCard;
