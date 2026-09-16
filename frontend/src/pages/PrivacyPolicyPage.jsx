import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import contactService from '../services/contactService';
import privacyService from '../services/privacyService';
import { ShieldCheck, Eye, EyeOff, Lock, AlertTriangle, Navigation, MapPin } from 'lucide-react';

const SAFETY_STATES = ['NORMAL', 'CAUTION', 'ELEVATED', 'CRISIS'];

const INFO_TYPES = [
  { key: 'journeyStatus', label: 'Journey Status', description: 'Shows whether your journey is on track.' },
  { key: 'safetyAlert', label: 'Safety Alert', description: 'Notifies this person when your safety state changes.' },
  { key: 'approximateLocation', label: 'Approximate Location', description: 'Shares a general area instead of your exact position.' },
  { key: 'liveLocation', label: 'Live Location', description: 'Shares your current location during an authorized emergency state.' },
  { key: 'emergencyStatus', label: 'Emergency Status', description: 'Shows that an emergency state has been activated.' },
  { key: 'evidenceStatus', label: 'Evidence Status', description: 'Indicates whether emergency evidence mode is active.' }
];

const PrivacyPolicyPage = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Preview state
  const [previewState, setPreviewState] = useState('NORMAL');
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await contactService.getContacts();
        setContacts(data);
        if (data.length > 0) {
          setSelectedContact(data[0]);
        }
      } catch (err) {
        console.error('Failed to load contacts', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContacts();
  }, []);

  useEffect(() => {
    const loadPolicy = async () => {
      if (!selectedContact) return;
      try {
        const data = await privacyService.getPolicyForContact(selectedContact._id);
        setPolicy(data);
        // Clear preview when switching contacts
        setPreviewData(null);
      } catch (err) {
        console.error('Failed to load policy', err);
      }
    };
    loadPolicy();
  }, [selectedContact]);

  const handleToggle = (stateName, infoKey) => {
    setPolicy(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [stateName]: {
          ...prev.permissions[stateName],
          [infoKey]: !prev.permissions[stateName][infoKey]
        }
      }
    }));
  };

  const handleSavePolicy = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await privacyService.updatePolicy(selectedContact._id, policy.permissions);
      setSaveMessage('Policy saved successfully.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Failed to save policy.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunPreview = async () => {
    if (!selectedContact) return;
    try {
      const result = await privacyService.evaluatePolicy(selectedContact._id, previewState);
      setPreviewData(result.evaluation);
    } catch (err) {
      console.error('Preview evaluation failed', err);
    }
  };

  // Auto-run preview when state changes if we already ran it
  useEffect(() => {
    if (previewData) handleRunPreview();
  }, [previewState]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-500 font-medium">Loading privacy configurations...</div>;
  }

  if (contacts.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Your Privacy Policy" description="You decide what each person can access as your safety state changes." />
        <EmptyState 
          icon={Lock}
          title="No contacts configured"
          description="You need to add someone to your Safety Circle before you can configure a privacy policy."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Your Privacy Policy" 
        description="You decide what each person can access as your safety state changes." 
      />

      {/* Visual Explanation */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-none mb-6">
        <div className="flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-[#d81b60] shrink-0 mt-1" />
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Information Sharing</h3>
            <p className="text-sm text-gray-700 mb-4">
              SafeCircle does not continuously expose all of your information. Access increases only when the safety state changes and your policy permits it.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600">
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100">NORMAL → Minimal/none</span>
              <span className="text-gray-400">→</span>
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100 text-yellow-600">CAUTION → Safety notification</span>
              <span className="text-gray-400">→</span>
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100 text-orange-600">ELEVATED → + Approx Location</span>
              <span className="text-gray-400">→</span>
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100 text-red-600">CRISIS → + Live Location</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Contact Selector Sidebar */}
        <div className="lg:w-64 shrink-0 space-y-2">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Select Contact</h3>
          {contacts.map(contact => (
            <button
              key={contact._id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between ${
                selectedContact?._id === contact._id 
                  ? 'bg-[#d81b60] text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-[#d81b60] border border-gray-100'
              }`}
            >
              <div>
                <div className="font-bold">{contact.name}</div>
                <div className={`text-xs ${selectedContact?._id === contact._id ? 'text-pink-100' : 'text-gray-500'}`}>
                  {contact.relationship}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Policy Designer Area */}
        <div className="flex-1 space-y-6">
          {policy ? (
            <Card className="border-t-4 border-t-[#d81b60]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 uppercase">Information Access: {selectedContact.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Toggle what {selectedContact.name} can see at each safety state.</p>
                </div>
                <Button onClick={handleSavePolicy} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Policy'}
                </Button>
              </div>

              {saveMessage && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                  {saveMessage}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-4 px-4 font-semibold text-gray-500 border-b border-gray-100 w-1/3">Information Type</th>
                      {SAFETY_STATES.map(state => (
                        <th key={state} className="py-4 px-2 text-center font-bold text-xs tracking-wider text-gray-500 border-b border-gray-100">
                          {state}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INFO_TYPES.map(info => (
                      <tr key={info.key} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900 text-sm">{info.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{info.description}</div>
                        </td>
                        {SAFETY_STATES.map(state => (
                          <td key={`${state}-${info.key}`} className="py-4 px-2 text-center align-middle">
                            <button 
                              onClick={() => handleToggle(state, info.key)}
                              className={`w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors ${
                                policy.permissions[state][info.key] 
                                  ? 'bg-pink-100 text-[#d81b60]' 
                                  : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              {policy.permissions[state][info.key] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="flex h-64 items-center justify-center bg-white rounded-2xl border border-gray-100">
              <div className="text-gray-500 font-medium">Loading policy...</div>
            </div>
          )}

          {/* Safety State Preview */}
          <Card className="bg-gray-900 text-white border-none shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-pink-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold">Interactive Preview (Backend Verified)</h3>
            </div>
            
            <p className="text-sm text-gray-400 mb-6">
              Select a safety state to run a simulation against the backend permission engine. This demonstrates exactly what information is allowed to leave the server.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {SAFETY_STATES.map(state => (
                <button
                  key={state}
                  onClick={() => setPreviewState(state)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    previewState === state
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>

            <Button variant="secondary" onClick={handleRunPreview} className="mb-6 !bg-gray-800 !text-white hover:!bg-gray-700 !border-gray-700">
              Run Preview for {previewState}
            </Button>

            {previewData && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h4 className="font-medium text-gray-300 mb-4">What would {selectedContact?.name} see?</h4>
                
                {Object.keys(previewData.allowedInformation).length === 0 ? (
                  <p className="text-gray-500 italic">No information shared.</p>
                ) : (
                  <ul className="space-y-3">
                    {Object.entries(previewData.allowedInformation).map(([key, value]) => {
                      const label = INFO_TYPES.find(i => i.key === key)?.label || key;
                      return (
                        <li key={key} className="flex items-start gap-3">
                          <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                          <div>
                            <span className="font-medium text-white">{label}</span>
                            <span className="text-xs text-gray-400 block mt-0.5">{JSON.stringify(value)}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {previewData.deniedInformation?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Stripped by Backend (Unauthorized)</p>
                    <div className="flex flex-wrap gap-2">
                      {previewData.deniedInformation.map(key => (
                        <span key={key} className="px-2 py-1 bg-red-900/30 text-red-400 border border-red-900/50 rounded text-xs line-through">
                          {INFO_TYPES.find(i => i.key === key)?.label || key}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
