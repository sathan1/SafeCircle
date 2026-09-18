import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Navigation, 
  Activity, 
  UserCheck, 
  Users, 
  AlertTriangle, 
  Compass, 
  Clock, 
  Sliders, 
  ArrowRight, 
  Check, 
  X,
  Radio,
  FileText,
  RefreshCw
} from 'lucide-react';
import { contactDashboardService } from '../services/contactDashboardService';
import { contactService } from '../services/contactService';
import { journeyService } from '../services/journeyService';
import { useSafetyState } from '../contexts/SafetyStateContext';

const STATE_COLORS = {
  NORMAL: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500'
  },
  CAUTION: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500'
  },
  ELEVATED: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    dot: 'bg-orange-500'
  },
  CRISIS: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800',
    dot: 'bg-rose-500'
  }
};

export default function ContactDashboard() {
  const { safetyState: globalSafetyState, setSafetyState: setGlobalSafetyState } = useSafetyState();

  const [journeys, setJourneys] = useState([]);
  const [activeJourney, setActiveJourney] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactView, setContactView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewLoading, setViewLoading] = useState(false);
  const [error, setError] = useState(null);

  // Comparison State
  const [compareContactAId, setCompareContactAId] = useState('');
  const [compareContactBId, setCompareContactBId] = useState('');
  const [compareViewA, setCompareViewA] = useState(null);
  const [compareViewB, setCompareViewB] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Include inactive toggle for demonstration
  const [showInactiveContacts, setShowInactiveContacts] = useState(false);

  // Initial Load: fetch active journey and contacts
  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        const [journeyList, contactList] = await Promise.all([
          journeyService.getJourneys(),
          contactService.getContacts()
        ]);

        setJourneys(journeyList);
        const active = journeyList.find(j => j.status === 'ACTIVE') || journeyList[0] || null;
        setActiveJourney(active);
        setContacts(contactList);

        const firstActive = contactList.find(c => c.isActive !== false) || contactList[0];
        if (firstActive) {
          setSelectedContactId(firstActive.id);
          setCompareContactAId(firstActive.id);
        }

        const secondActive = contactList.find(c => c.id !== firstActive?.id && c.isActive !== false);
        if (secondActive) {
          setCompareContactBId(secondActive.id);
        }
      } catch (err) {
        console.error('Failed to initialize Contact Dashboard:', err);
        setError('Failed to load initial journey or contact records.');
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // Fetch selected contact view whenever journey, contact, or state changes
  useEffect(() => {
    if (!activeJourney?.id || !selectedContactId) return;

    async function fetchView() {
      setViewLoading(true);
      try {
        const view = await contactDashboardService.getContactView(activeJourney.id, selectedContactId);
        setContactView(view);
      } catch (err) {
        console.error('Error fetching contact view:', err);
        setError('Unable to fetch contact view.');
      } finally {
        setViewLoading(false);
      }
    }

    fetchView();

    // Live polling for two-phone synchronization across cellular networks
    const pollInterval = setInterval(async () => {
      try {
        const [latestJourney, updatedView] = await Promise.all([
          journeyService.getJourneyById(activeJourney.id),
          contactDashboardService.getContactView(activeJourney.id, selectedContactId)
        ]);

        if (latestJourney && latestJourney.currentState !== activeJourney.currentState) {
          setActiveJourney(prev => ({ ...prev, currentState: latestJourney.currentState }));
          if (setGlobalSafetyState) setGlobalSafetyState(latestJourney.currentState);
        }

        if (updatedView) {
          setContactView(updatedView);
        }
      } catch (e) {
        // Ignore background poll errors
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [activeJourney?.id, activeJourney?.currentState, selectedContactId]);


  // Fetch Comparison views
  useEffect(() => {
    if (!activeJourney || !compareContactAId || !compareContactBId) return;

    async function fetchCompare() {
      setCompareLoading(true);
      try {
        const [viewA, viewB] = await Promise.all([
          contactDashboardService.getContactView(activeJourney.id, compareContactAId),
          contactDashboardService.getContactView(activeJourney.id, compareContactBId)
        ]);
        setCompareViewA(viewA);
        setCompareViewB(viewB);
      } catch (err) {
        console.error('Error fetching comparison views:', err);
      } finally {
        setCompareLoading(false);
      }
    }

    fetchCompare();
  }, [activeJourney?.id, activeJourney?.currentState, compareContactAId, compareContactBId]);

  // Quick State Simulator Trigger
  const handleStateChange = async (newState) => {
    if (!activeJourney) return;
    try {
      const updated = await contactDashboardService.updateSafetyState(activeJourney.id, newState);
      setActiveJourney(prev => ({ ...prev, currentState: updated.currentState }));
      if (setGlobalSafetyState) {
        setGlobalSafetyState(updated.currentState);
      }
    } catch (err) {
      console.error('Failed to change state:', err);
    }
  };

  const currentState = activeJourney?.currentState || globalSafetyState || 'NORMAL';
  const stateTheme = STATE_COLORS[currentState] || STATE_COLORS.NORMAL;

  const filteredContacts = showInactiveContacts 
    ? contacts 
    : contacts.filter(c => c.isActive !== false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm text-stone-600 font-medium">Evaluating Contact View Permissions...</p>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">No Trusted Contacts Found</h2>
        <p className="text-stone-600 max-w-md mx-auto mb-6">
          Add trusted contacts to your Safety Circle first to see how your privacy policy protects your journey information.
        </p>
        <a 
          href="/safety-circle" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 shadow-sm transition-all"
        >
          Manage Safety Circle
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* 1. Header & Prototype Simulation Banner */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100/70 text-rose-700 mb-1 border border-rose-200/60">
              <Eye className="w-3.5 h-3.5" />
              <span>Contact View — Prototype Simulation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Contact Perspective Dashboard
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Experience SafeCircle from the perspective of your trusted contacts. Observe how your privacy policy dynamically restricts or reveals information depending on who is viewing and the current safety state.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Active Journey:</span>
            <span className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-800 text-xs font-semibold border border-stone-200 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-rose-600" />
              {activeJourney?.destination?.name || 'Home'}
            </span>
          </div>
        </div>

        {/* Privacy Enforcement Notice */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-stone-700 leading-relaxed">
            <span className="font-semibold text-stone-900">Privacy Enforcement Active: </span>
            This view reflects exactly what this trusted contact is authorized to inspect. When the safety level escalates, additional information unlocks automatically in real time.
          </div>
        </div>
      </div>


      {/* 2. Interactive Safety State Changer Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Simulate Journey Safety State:
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${stateTheme.badge}`}>
              Current: {currentState}
            </span>
          </div>

          <div className="text-xs text-stone-500">
            Click any state to observe permissions dynamically adjust:
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'NORMAL', label: '1. Normal', desc: 'Baseline transit', color: 'hover:border-emerald-400' },
            { id: 'CAUTION', label: '2. Caution', desc: 'Delay / slight anomaly', color: 'hover:border-amber-400' },
            { id: 'ELEVATED', label: '3. Elevated', desc: 'Missed check-in / stop', color: 'hover:border-orange-400' },
            { id: 'CRISIS', label: '4. Crisis', desc: 'Distress / high urgency', color: 'hover:border-rose-400' }
          ].map((item) => {
            const isActive = currentState === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleStateChange(item.id)}
                className={`
                  p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between
                  ${isActive 
                    ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-2 ring-rose-500/20' 
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 text-stone-700'
                  }
                `}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-xs font-bold ${isActive ? 'text-rose-900' : 'text-stone-900'}`}>
                    {item.label}
                  </span>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
                </div>
                <span className="text-[11px] text-stone-500">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Contact Selector Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-rose-600" />
            Select Contact to View Perspective:
          </label>

          <button
            onClick={() => setShowInactiveContacts(!showInactiveContacts)}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            {showInactiveContacts ? 'Hide Inactive Contacts' : 'Show Inactive Contacts Demo'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {filteredContacts.map(contact => {
            const isSelected = selectedContactId === contact.id;
            const isInactive = contact.isActive === false;

            return (
              <button
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`
                  p-3.5 rounded-xl border text-left transition-all duration-150 relative
                  ${isSelected 
                    ? 'border-rose-600 bg-white shadow-sm ring-2 ring-rose-500/20' 
                    : 'border-stone-200 bg-stone-50/60 hover:bg-white text-stone-700'
                  }
                  ${isInactive ? 'opacity-70 border-dashed' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0
                    ${isSelected ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700'}
                  `}>
                    {contact.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 truncate">
                        {contact.name}
                      </span>
                      {isInactive && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-stone-200 text-stone-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 truncate">
                      {contact.relationship} · Priority {contact.priority}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-rose-100 flex items-center justify-between text-[11px] text-rose-700 font-medium">
                    <span>Active Perspective</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {viewLoading && (
        <div className="py-8 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
          <span>Evaluating permissions for {contactView?.contact?.name || 'contact'}...</span>
        </div>
      )}

      {contactView && !viewLoading && (
        <div className="space-y-8">
          {/* 4. Selected Contact Perspective Overview Banner */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {contactView.contact.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-stone-900">
                      Viewing as: {contactView.contact.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      {contactView.contact.relationship}
                    </span>
                    {!contactView.contact.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                        Deactivated
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Assigned Priority Level {contactView.contact.priority} · Evaluated against journey "{activeJourney?.destination?.name}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Current Journey State:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${stateTheme.badge}`}>
                  {currentState}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Information Visibility Matrix ("What this contact can see") */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-stone-50/80 border-b border-stone-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  What This Contact Can See
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Real-time permission evaluation result from the Privacy Permission Engine for safety state: <strong className="uppercase">{currentState}</strong>
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-600 font-semibold shadow-2xs">
                Policy Enforcement Active
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {Object.keys(contactView.visibilityMatrix).map(key => {
                const item = contactView.visibilityMatrix[key];
                const isAllowed = item.allowed;

                return (
                  <div key={key} className="px-6 py-3.5 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center shrink-0
                        ${isAllowed ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-400'}
                      `}>
                        {isAllowed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-stone-900">
                          {item.name}
                        </span>
                        <span className="text-xs text-stone-400 ml-2 font-mono">
                          [{item.type}]
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`
                        px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase
                        ${isAllowed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500 border border-stone-200'}
                      `}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. Permission-Aware Disclosed Data Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-rose-600" />
                Disclosed Information Cards
              </h3>
              <span className="text-xs text-stone-500">
                Data fields rendered exactly as received from backend API
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Journey Status */}
              <DisclosedCard
                title="Journey Status"
                icon={Activity}
                typeKey="JOURNEY_STATUS"
                disclosure={contactView.disclosed.JOURNEY_STATUS}
              >
                {contactView.disclosed.JOURNEY_STATUS.allowed && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Transit Status:</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {contactView.disclosed.JOURNEY_STATUS.data?.status || 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Reported Safety State:</span>
                      <span className="font-semibold text-stone-900 uppercase">
                        {contactView.disclosed.JOURNEY_STATUS.data?.safetyState || currentState}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Monitoring Active:</span>
                      <span className="text-stone-700 font-medium">SafeCircle Protected</span>
                    </div>
                  </div>
                )}
              </DisclosedCard>

              {/* Card 2: Approximate Location */}
              <DisclosedCard
                title="Approximate Location"
                icon={MapPin}
                typeKey="APPROXIMATE_LOCATION"
                disclosure={contactView.disclosed.APPROXIMATE_LOCATION}
              >
                {contactView.disclosed.APPROXIMATE_LOCATION.allowed && (
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                      <div className="font-semibold text-stone-900">
                        {contactView.disclosed.APPROXIMATE_LOCATION.data?.approximateArea}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {contactView.disclosed.APPROXIMATE_LOCATION.data?.approximateCity} (Radius: ~500m)
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-500 italic">
                      Notice: Exact latitude/longitude are concealed to protect privacy.
                    </p>
                  </div>
                )}
              </DisclosedCard>

              {/* Card 3: Live Location */}
              <DisclosedCard
                title="Live Location"
                icon={Navigation}
                typeKey="LIVE_LOCATION"
                disclosure={contactView.disclosed.LIVE_LOCATION}
              >
                {contactView.disclosed.LIVE_LOCATION.allowed && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-stone-900 text-stone-100 rounded-xl font-mono text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Latitude:</span>
                        <span className="text-rose-400 font-bold">{contactView.disclosed.LIVE_LOCATION.data?.latitude}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Longitude:</span>
                        <span className="text-rose-400 font-bold">{contactView.disclosed.LIVE_LOCATION.data?.longitude}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800">
                        <span>Accuracy:</span>
                        <span>{contactView.disclosed.LIVE_LOCATION.data?.accuracy}</span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-semibold">
                      <span>Live GPS Authorized by Policy</span>
                    </div>
                  </div>
                )}
              </DisclosedCard>

              {/* Card 4: Emergency Status */}
              <DisclosedCard
                title="Emergency Status"
                icon={AlertTriangle}
                typeKey="EMERGENCY_STATUS"
                disclosure={contactView.disclosed.EMERGENCY_STATUS}
              >
                {contactView.disclosed.EMERGENCY_STATUS.allowed && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Escalation Tier:</span>
                      <span className="font-bold text-stone-900 px-2 py-0.5 rounded bg-stone-100">
                        {contactView.disclosed.EMERGENCY_STATUS.data?.escalationLevel || 'NONE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Active Signals:</span>
                      <span className="font-semibold text-stone-700">
                        {contactView.disclosed.EMERGENCY_STATUS.data?.activeSignalCount} logged signal(s)
                      </span>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg text-stone-700 text-[11px] border border-stone-200/60">
                      {contactView.disclosed.EMERGENCY_STATUS.data?.latestEvent}
                    </div>
                  </div>
                )}
              </DisclosedCard>

              {/* Card 5: Journey Details */}
              <DisclosedCard
                title="Journey Details"
                icon={FileText}
                typeKey="JOURNEY_DETAILS"
                disclosure={contactView.disclosed.JOURNEY_DETAILS}
                className="md:col-span-2"
              >
                {contactView.disclosed.JOURNEY_DETAILS.allowed && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Origin</span>
                      <span className="font-semibold text-stone-900">{contactView.disclosed.JOURNEY_DETAILS.data?.startLocation}</span>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Destination</span>
                      <span className="font-semibold text-stone-900">{contactView.disclosed.JOURNEY_DETAILS.data?.destination}</span>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Selected Route</span>
                      <span className="font-semibold text-stone-900 truncate block">{contactView.disclosed.JOURNEY_DETAILS.data?.routeName}</span>
                    </div>
                  </div>
                )}
              </DisclosedCard>
            </div>
          </div>

          {/* 7. Privacy Explanation Rationale Card */}
          <div className="p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              Why Can This Contact See This?
            </h3>
            <p className="text-xs text-stone-500">
              Clear explainability audit of every information category under current state <strong>{currentState}</strong>:
            </p>

            <div className="space-y-2 pt-2">
              {Object.keys(contactView.visibilityMatrix).map(key => {
                const item = contactView.visibilityMatrix[key];
                return (
                  <div key={key} className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs flex items-start gap-2.5">
                    {item.allowed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Lock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-stone-900 mr-1.5">{item.name}:</span>
                      <span className="text-stone-600">{item.explanation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 8. Contact Comparison Demo Section */}
          <div className="p-6 bg-gradient-to-br from-rose-50/50 via-white to-stone-50 rounded-2xl border border-rose-100/80 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Privacy Innovation Showcase</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  Compare Contact Views Side-by-Side
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Demonstrating that different trusted contacts have distinct permissions under the exact same journey event.
                </p>
              </div>

              <div className="text-xs px-3 py-1 rounded-full bg-white border border-rose-200 text-rose-700 font-bold">
                State: {currentState}
              </div>
            </div>

            {/* Selectors for Contact A and Contact B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  Select Contact A:
                </label>
                <select
                  value={compareContactAId}
                  onChange={(e) => setCompareContactAId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-800 shadow-2xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.relationship}) {c.isActive === false ? '[Inactive]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  Select Contact B:
                </label>
                <select
                  value={compareContactBId}
                  onChange={(e) => setCompareContactBId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-800 shadow-2xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.relationship}) {c.isActive === false ? '[Inactive]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Side-by-Side Table */}
            {compareLoading ? (
              <div className="py-6 text-center text-xs text-stone-500">
                Loading side-by-side comparison...
              </div>
            ) : compareViewA && compareViewB ? (
              <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-2xs">
                <div className="grid grid-cols-12 bg-stone-50 border-b border-stone-200/80 px-4 py-3 text-xs font-bold text-stone-700">
                  <div className="col-span-4">Information Type</div>
                  <div className="col-span-4 text-center">{compareViewA.contact.name} ({compareViewA.contact.relationship})</div>
                  <div className="col-span-4 text-center">{compareViewB.contact.name} ({compareViewB.contact.relationship})</div>
                </div>

                <div className="divide-y divide-stone-100">
                  {Object.keys(compareViewA.visibilityMatrix).map(key => {
                    const itemA = compareViewA.visibilityMatrix[key];
                    const itemB = compareViewB.visibilityMatrix[key];
                    const hasDifference = itemA.allowed !== itemB.allowed;

                    return (
                      <div 
                        key={key} 
                        className={`
                          grid grid-cols-12 px-4 py-3 text-xs items-center transition-colors
                          ${hasDifference ? 'bg-rose-50/40' : 'hover:bg-stone-50/50'}
                        `}
                      >
                        <div className="col-span-4 font-semibold text-stone-900 flex items-center gap-1.5">
                          <span>{itemA.name}</span>
                          {hasDifference && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                              Differs
                            </span>
                          )}
                        </div>

                        <div className="col-span-4 flex justify-center">
                          <span className={`
                            inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold
                            ${itemA.allowed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-400 border border-stone-200'}
                          `}>
                            {itemA.allowed ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[2.5]" />}
                            {itemA.status}
                          </span>
                        </div>

                        <div className="col-span-4 flex justify-center">
                          <span className={`
                            inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold
                            ${itemB.allowed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-400 border border-stone-200'}
                          `}>
                            {itemB.allowed ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[2.5]" />}
                            {itemB.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="p-3.5 rounded-xl bg-white border border-rose-200/80 text-xs text-stone-700 leading-relaxed">
              <strong className="text-stone-900">Key Takeaway: </strong>
              Even when both contacts are trusted members of your Safety Circle experiencing the exact same journey event, their information access is strictly compartmentalized according to your custom privacy policy.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper component for rendering disclosed data cards with fallback to restricted view
 */
function DisclosedCard({ title, icon: Icon, typeKey, disclosure, children, className = '' }) {
  const isAllowed = disclosure?.allowed;

  return (
    <div className={`
      p-5 rounded-2xl border transition-all duration-150 flex flex-col justify-between
      ${isAllowed 
        ? 'bg-white border-stone-200 shadow-xs' 
        : 'bg-stone-50/60 border-stone-200/80 border-dashed'
      }
      ${className}
    `}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`
              w-7 h-7 rounded-lg flex items-center justify-center
              ${isAllowed ? 'bg-rose-50 text-rose-600' : 'bg-stone-200 text-stone-400'}
            `}>
              <Icon className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">{title}</h4>
          </div>

          <span className={`
            px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
            ${isAllowed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-200 text-stone-600'}
          `}>
            {isAllowed ? 'ALLOWED' : 'RESTRICTED'}
          </span>
        </div>

        {isAllowed ? (
          children
        ) : (
          <div className="py-4 text-center space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-stone-200/70 text-stone-500 flex items-center justify-center mx-auto">
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-stone-800">
              Restricted by your privacy policy.
            </p>
            <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
              This category is not authorized for this contact under the current safety state.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
        <span>{typeKey}</span>
        <span>{isAllowed ? 'Disclosed via API' : 'Protected by Server'}</span>
      </div>
    </div>
  );
}
