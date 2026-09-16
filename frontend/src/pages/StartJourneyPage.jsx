import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import contactService from '../services/contactService';
import journeyService from '../services/journeyService';
import { Navigation, MapPin, Users, ShieldAlert, Clock } from 'lucide-react';

const StartJourneyPage = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    eta: '',
    selectedContacts: [],
    selectedRoute: 'B' // Mock SafePath choice
  });

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await contactService.getContacts();
        setContacts(data);
      } catch (err) {
        console.error('Failed to load contacts', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContacts();
  }, []);

  const handleContactToggle = (contactId) => {
    setFormData(prev => {
      const isSelected = prev.selectedContacts.includes(contactId);
      return {
        ...prev,
        selectedContacts: isSelected 
          ? prev.selectedContacts.filter(id => id !== contactId)
          : [...prev.selectedContacts, contactId]
      };
    });
  };

  const handleStartJourney = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.from || !formData.to || !formData.eta) {
      return setError('Please fill in From, To, and Expected Arrival.');
    }

    setIsSubmitting(true);
    try {
      // 1. Create the Journey (PLANNED)
      const journey = await journeyService.createJourney({
        startLocation: { name: formData.from, latitude: 0, longitude: 0 },
        destination: { name: formData.to, latitude: 0, longitude: 0 },
        expectedArrival: new Date(formData.eta),
        selectedContacts: formData.selectedContacts,
        route: formData.selectedRoute
      });

      // 2. Start the Journey (ACTIVE)
      await journeyService.startJourney(journey._id);

      // 3. Redirect to Monitoring
      navigate(`/journey/monitor/${journey._id}`);
    } catch (err) {
      setError(err.message || 'Failed to start journey.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader 
        title="Start a Journey" 
        description="Plan your journey and decide who can support you if something changes." 
      />

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleStartJourney} className="space-y-6">
        
        {/* Route Details */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#d81b60]" />
            Route Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="From" 
              name="from" 
              value={formData.from}
              onChange={(e) => setFormData({...formData, from: e.target.value})}
              placeholder="e.g. College Library"
              required
            />
            <Input 
              label="To" 
              name="to" 
              value={formData.to}
              onChange={(e) => setFormData({...formData, to: e.target.value})}
              placeholder="e.g. Home"
              required
            />
          </div>
          <div className="mt-4">
            <Input 
              label="Expected Arrival Time" 
              name="eta" 
              type="datetime-local"
              value={formData.eta}
              onChange={(e) => setFormData({...formData, eta: e.target.value})}
              required
            />
          </div>
        </Card>

        {/* SafePath Mock */}
        {(formData.from && formData.to) && (
          <Card className="border-t-4 border-t-[#d81b60]">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#d81b60]" />
              SafePath Analysis
            </h3>
            <p className="text-sm text-gray-500 mb-4">Context-based route assessment. Select a route based on your comfort level.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.selectedRoute === 'A' ? 'border-[#d81b60] bg-pink-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                onClick={() => setFormData({...formData, selectedRoute: 'A'})}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-900">Route A (Direct)</span>
                  <span className="text-sm font-semibold text-gray-600">18 min</span>
                </div>
                <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                  <ShieldAlert className="w-4 h-4" /> Estimated risk: Higher
                </div>
                <p className="text-xs text-gray-500 mt-2">Faster, but traverses less well-lit areas.</p>
              </div>

              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.selectedRoute === 'B' ? 'border-[#d81b60] bg-pink-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                onClick={() => setFormData({...formData, selectedRoute: 'B'})}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-900">Route B (Recommended)</span>
                  <span className="text-sm font-semibold text-gray-600">21 min</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <ShieldAlert className="w-4 h-4" /> Estimated risk: Lower
                </div>
                <p className="text-xs text-gray-500 mt-2">Slightly longer, highly active pedestrian areas.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Safety Circle Selection */}
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#d81b60]" />
              Safety Circle Watchers
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <strong>Privacy Note:</strong> Your selected contacts will only receive information according to your Privacy Policy.
          </p>

          {isLoading ? (
            <div className="text-sm text-gray-500">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No contacts in your Safety Circle. You can still start a journey, but no one will be notified.</div>
          ) : (
            <div className="space-y-2">
              {contacts.map(contact => (
                <label key={contact._id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.selectedContacts.includes(contact._id)}
                    onChange={() => handleContactToggle(contact._id)}
                    className="w-5 h-5 text-[#d81b60] rounded focus:ring-[#f48fb1]"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{contact.name}</div>
                    <div className="text-xs text-gray-500">{contact.relationship}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Starting...' : 'Start Journey'}
        </Button>
      </form>
    </div>
  );
};

export default StartJourneyPage;
