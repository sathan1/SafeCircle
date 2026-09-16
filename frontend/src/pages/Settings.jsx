import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Navigation, 
  ShieldAlert, 
  Lock, 
  Watch, 
  Check, 
  Save, 
  Smartphone,
  ChevronRight,
  Calculator,
  Power,
  Info
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSafetyState } from '../contexts/SafetyStateContext';
import AdvancedSafetyConceptsCard from '../components/safety/AdvancedSafetyConceptsCard';

const SECTIONS = [
  { id: 'account', label: 'Account Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'journey', label: 'Journey Preferences', icon: Navigation },
  { id: 'emergency', label: 'Emergency Escalation', icon: ShieldAlert },
  { id: 'privacy', label: 'Privacy & Sharing', icon: Lock },
  { id: 'device', label: 'Device & Wearables', icon: Watch },
  { id: 'discreet', label: 'Discreet Mode', icon: Calculator },
  { id: 'advanced-concepts', label: 'Advanced Safety Concepts', icon: Power },
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [savedNotice, setSavedNotice] = useState(false);
  const { toggleDiscreetMode, isDiscreetMode } = useSafetyState();

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">System Settings</h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Configure safety thresholds, notification channels, and privacy profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Preferences Saved
            </span>
          )}
          <Button onClick={handleSave} icon={Save} size="md">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Section Navigation */}
        <div className="md:col-span-1 space-y-1">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-rose-600/80" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Area */}
        <div className="md:col-span-3">
          <Card>
            {activeSection === 'account' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Account Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Harshika"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Registered Phone</label>
                    <input
                      type="text"
                      defaultValue="+91 99887 76655"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Emergency Medical Notes</label>
                  <textarea
                    rows={2}
                    defaultValue="Asthma inhaler in backpack. Blood group O+."
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                  />
                  <span className="text-[11px] text-stone-400">Only accessible to Primary Contact during Crisis state.</span>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Notification Channels
                </h3>
                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 cursor-pointer">
                    <div>
                      <div className="font-semibold text-stone-900">Push Notifications</div>
                      <div className="text-stone-500">Instant check-in alerts and safety prompt vibrations</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500" />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 cursor-pointer">
                    <div>
                      <div className="font-semibold text-stone-900">SMS Escalation Backup</div>
                      <div className="text-stone-500">Send SMS to trusted circle if data connection drops</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500" />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'journey' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Journey Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Stationary Timeout Check</label>
                    <select className="w-full p-2.5 rounded-xl border border-stone-200 bg-white" defaultValue="8">
                      <option value="5">5 minutes</option>
                      <option value="8">8 minutes (Recommended)</option>
                      <option value="12">12 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Route Deviation Tolerance</label>
                    <select className="w-full p-2.5 rounded-xl border border-stone-200 bg-white" defaultValue="300">
                      <option value="150">150 meters</option>
                      <option value="300">300 meters (Standard)</option>
                      <option value="500">500 meters</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'emergency' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Emergency Escalation Protocols
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200 text-stone-700">
                    <span className="font-bold text-red-900 block mb-1">Crisis Threshold</span>
                    <span>When Crisis state triggers, notify all 3 contacts and transmit pre-recorded emergency audio beacon if enabled.</span>
                  </div>
                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 cursor-pointer">
                    <div>
                      <div className="font-semibold text-stone-900">Auto-Dial Primary Contact on Crisis</div>
                      <div className="text-stone-500">Places direct call to Mom (+91 98765 43210)</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500" />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Privacy & Data Retention
                </h3>
                <p className="text-xs text-stone-600">
                  Telemetry logs from completed safe journeys are automatically purged after 24 hours.
                </p>
                <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs cursor-pointer">
                  <div>
                    <div className="font-semibold text-stone-900">Auto-Purge Location History</div>
                    <div className="text-stone-500">Remove GPS coordinates after journey completion</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500" />
                </label>
              </div>
            )}

            {activeSection === 'device' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Device & Wearable Integration (Simulation)
                </h3>
                <p className="text-xs text-stone-600">
                  In compliance with safety realism rules, wearable fallbacks and discreet triggers are simulated modules.
                </p>
                <div className="p-3 rounded-xl border border-stone-200 bg-[#fcf8f8] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Watch className="w-5 h-5 text-rose-600" />
                    <div>
                      <div className="font-semibold text-stone-900">Smartwatch Fallback Module</div>
                      <div className="text-stone-400">Heart rate & sudden deceleration sensor hook (Mocked)</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                    Simulation Ready
                  </span>
                </div>
              </div>
            )}

            {activeSection === 'discreet' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-rose-600" />
                    <span>Discreet Interface Mode</span>
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    Phase 12
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Discreet Mode transforms the visible application into a neutral utility (functional calculator) for personal privacy when surrounded by onlookers or in shared public transit.
                </p>

                <div className="p-4 rounded-2xl bg-[#fcf8f8] border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-900">Current Interface Presentation:</div>
                      <div className="text-[11px] text-stone-500">
                        {isDiscreetMode ? 'Discreet Mode (Calculator)' : 'Standard Mode (SafeCircle Dashboard)'}
                      </div>
                    </div>
                    <Button 
                      onClick={toggleDiscreetMode}
                      variant="primary"
                      size="sm"
                      icon={Calculator}
                    >
                      {isDiscreetMode ? 'Exit Discreet Mode' : 'Launch Discreet Mode'}
                    </Button>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-500 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>
                      Safe Return: You can return to Standard Mode anytime via the prominent return banner on top of the calculator. Background escort journeys, safety state evaluations, and circle notifications continue uninterrupted.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'advanced-concepts' && (
              <div className="space-y-4">
                <AdvancedSafetyConceptsCard />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
