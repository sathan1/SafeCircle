import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Info,
  LogOut,
  Sparkles,
  Wifi,
  Server,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useSafetyState } from '../contexts/SafetyStateContext';
import AdvancedSafetyConceptsCard from '../components/safety/AdvancedSafetyConceptsCard';
import OnboardingModal from '../components/common/OnboardingModal';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl } from '../services/apiConfig';
import mobileDiscreetService from '../services/native/mobileDiscreetService';

const SECTIONS = [
  { id: 'account', label: 'Account Profile', icon: User },
  { id: 'server', label: 'Server & Network', icon: Wifi },
  { id: 'discreet', label: 'Discreet Mode', icon: Calculator },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'journey', label: 'Journey Preferences', icon: Navigation },
  { id: 'emergency', label: 'Emergency Escalation', icon: ShieldAlert },
  { id: 'privacy', label: 'Privacy & Sharing', icon: Lock },
  { id: 'device', label: 'Device & Wearables', icon: Watch },
  { id: 'advanced-concepts', label: 'Advanced Safety Concepts', icon: Power },
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [savedNotice, setSavedNotice] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { toggleDiscreetMode, isDiscreetMode } = useSafetyState();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Server & Network state
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [connStatus, setConnStatus] = useState(null); // 'testing' | 'connected' | 'error'
  const [connMessage, setConnMessage] = useState('');

  // Discreet mode state
  const [launcherMode, setLauncherMode] = useState(mobileDiscreetService.getSavedMode());
  const [discreetPin, setDiscreetPin] = useState(mobileDiscreetService.getSavedPin());
  const [newPin, setNewPin] = useState('');
  const [pinNotice, setPinNotice] = useState({ message: '', type: '' });
  const [isChangingLauncher, setIsChangingLauncher] = useState(false);

  useEffect(() => {
    mobileDiscreetService.getCurrentLauncherMode().then(mode => {
      if (mode) setLauncherMode(mode);
    });
  }, []);

  const handleTestConnection = async () => {
    setConnStatus('testing');
    setConnMessage('Pinging SafeCircle backend...');
    const start = Date.now();
    try {
      const res = await fetch(`${apiUrl.trim().replace(/\/+$/, '')}/api/config`, {
        headers: { 'Accept': 'application/json' }
      });
      const latency = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        setConnStatus('connected');
        setConnMessage(`Connected successfully (${latency}ms) — Backend: ${data.appName || 'SafeCircle'} v${data.version || '1.0'}`);
      } else {
        setConnStatus('error');
        setConnMessage(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      setConnStatus('error');
      setConnMessage(`Cannot reach backend at ${apiUrl}: ${err.message}. If testing on physical phone, ensure phone and laptop are connected to the same Wi-Fi and laptop firewall permits port 5000.`);
    }
  };

  const handleSaveApiUrl = () => {
    const updated = setApiBaseUrl(apiUrl);
    setApiUrlState(updated);
    handleSave();
  };

  const handleResetApiUrl = () => {
    const defaultUrl = resetApiBaseUrl();
    setApiUrlState(defaultUrl);
    setConnStatus(null);
    setConnMessage('');
    handleSave();
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinNotice({ message: 'PIN must be exactly 4 numeric digits (e.g. 1234)', type: 'error' });
      return;
    }
    try {
      mobileDiscreetService.setPin(newPin);
      setDiscreetPin(newPin);
      setNewPin('');
      setPinNotice({ message: 'Discreet unlock PIN updated successfully!', type: 'success' });
      setTimeout(() => setPinNotice({ message: '', type: '' }), 3000);
    } catch (err) {
      setPinNotice({ message: err.message, type: 'error' });
    }
  };

  const handleSelectLauncher = async (mode) => {
    setIsChangingLauncher(true);
    try {
      setLauncherMode(mode);
      await mobileDiscreetService.setLauncherMode(mode);
      handleSave();
    } finally {
      setIsChangingLauncher(false);
    }
  };

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
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
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-base font-bold text-stone-900">
                    Account Profile
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Active Session
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      readOnly
                      value={user?.name || 'SafeCircle User'}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      readOnly
                      value={user?.email || 'user@safecircle.app'}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 font-medium"
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

                {/* Session & First-Run Walkthrough Controls */}
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <div className="text-xs font-bold text-stone-900">App Guidance & Session</div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setShowWalkthrough(true)}
                      className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-rose-600" />
                      <span>View Safety Walkthrough</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmLogout(true)}
                      className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out of SafeCircle</span>
                    </button>
                  </div>
                </div>

                {/* Logout Confirmation Modal */}
                {confirmLogout && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                        <LogOut className="w-6 h-6" />
                      </div>
                      <h4 className="text-center font-bold text-base text-stone-900">Sign out of SafeCircle?</h4>
                      <p className="text-center text-xs text-stone-500 mt-1 mb-5">
                        Your offline safety beacon and active monitoring session will be concluded until you sign in again.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmLogout(false)}
                          className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-200"
                        >
                          Yes, Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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

            {/* Server & Network Configuration */}
            {activeSection === 'server' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-rose-600" />
                      <span>Server & Network Configuration</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Configure your backend server URL to connect mobile phones to your laptop on the same Wi-Fi.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Backend Server URL (API & WebSockets)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={apiUrl}
                        onChange={(e) => setApiUrlState(e.target.value)}
                        placeholder="http://192.168.1.100:5000"
                        className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-mono text-stone-900 focus:outline-rose-500"
                      />
                      <Button onClick={handleSaveApiUrl} size="sm" variant="primary">
                        Apply URL
                      </Button>
                      <Button onClick={handleResetApiUrl} size="sm" variant="secondary">
                        Reset Default
                      </Button>
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      Default: <code className="font-mono text-stone-700">http://localhost:5000</code>. For physical phones, enter your laptop's Wi-Fi IP (e.g. <code className="font-mono text-stone-700">http://192.168.x.x:5000</code>).
                    </span>
                  </div>

                  {/* Test Connection Button & Status */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">Connection Health Check</span>
                      <Button
                        onClick={handleTestConnection}
                        size="sm"
                        variant="secondary"
                        icon={RefreshCw}
                        disabled={connStatus === 'testing'}
                      >
                        {connStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                      </Button>
                    </div>

                    {connStatus && (
                      <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
                        connStatus === 'connected' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : connStatus === 'testing'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {connStatus === 'connected' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : connStatus === 'testing' ? (
                          <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed font-medium">{connMessage}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1">
                    <div className="font-bold text-stone-800">Testing on Multiple Physical Phones:</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Connect your laptop and physical phones to the same Wi-Fi network (or laptop mobile hotspot).</li>
                      <li>Find your laptop's IPv4 address by running <code className="bg-stone-200/70 px-1 rounded">ipconfig</code> in PowerShell.</li>
                      <li>Enter <code className="bg-stone-200/70 px-1 rounded">http://&lt;your-laptop-ip&gt;:5000</code> above and tap "Apply URL".</li>
                      <li>Ensure your laptop Windows Firewall allows inbound connections on TCP port 5000.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Discreet Mode */}
            {activeSection === 'discreet' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-rose-600" />
                      <span>Discreet Interface & Launcher Disguise</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Protect your privacy in shared spaces with neutral utility disguises and private PIN access.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    Discreet Mode
                  </span>
                </div>

                {/* In-App Mode Toggle */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-900">In-App Interface View:</div>
                      <div className="text-[11px] text-stone-500">
                        {isDiscreetMode ? 'Discreet Mode Active (Calculator View)' : 'Standard Mode Active (SafeCircle View)'}
                      </div>
                    </div>
                    <Button 
                      onClick={toggleDiscreetMode}
                      variant="primary"
                      size="sm"
                      icon={Calculator}
                    >
                      {isDiscreetMode ? 'Exit Discreet View' : 'Launch Calculator View'}
                    </Button>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    When active, SafeCircle presents a functional calculator. Background journeys, location updates, and safety state evaluations continue running silently.
                  </p>
                </div>

                {/* Launcher Icon Appearance Selector */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-stone-800">
                    Android Home Screen App Appearance
                  </label>
                  <p className="text-xs text-stone-500">
                    Select how the SafeCircle app icon and name appear on your phone's home screen.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <button
                      type="button"
                      disabled={isChangingLauncher}
                      onClick={() => handleSelectLauncher('normal')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        launcherMode === 'normal'
                          ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold mb-2">
                        SC
                      </div>
                      <div className="text-xs font-bold text-stone-900">SafeCircle</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Standard branding</div>
                      {launcherMode === 'normal' && (
                        <span className="mt-2 inline-block text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isChangingLauncher}
                      onClick={() => handleSelectLauncher('calculator')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        launcherMode === 'calculator'
                          ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mb-2">
                        <Calculator className="w-4 h-4 text-stone-700" />
                      </div>
                      <div className="text-xs font-bold text-stone-900">Calculator</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Discreet utility icon</div>
                      {launcherMode === 'calculator' && (
                        <span className="mt-2 inline-block text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isChangingLauncher}
                      onClick={() => handleSelectLauncher('notes')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        launcherMode === 'notes'
                          ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-2">
                        <Lock className="w-4 h-4 text-amber-700" />
                      </div>
                      <div className="text-xs font-bold text-stone-900">Notes</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Neutral notepad disguise</div>
                      {launcherMode === 'notes' && (
                        <span className="mt-2 inline-block text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* 4-Digit Unlock PIN Configuration */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold text-stone-900">Discreet Unlock PIN</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200">
                      Current PIN: {discreetPin}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed">
                    Type this PIN into the in-app Calculator and press <strong>=</strong> to instantly return to SafeCircle.
                  </p>

                  <form onSubmit={handleSavePin} className="flex gap-2 pt-1">
                    <input
                      type="password"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Enter new 4-digit PIN"
                      className="w-48 text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-mono tracking-widest text-center"
                    />
                    <Button type="submit" size="sm" variant="primary">
                      Update PIN
                    </Button>
                  </form>

                  {pinNotice.message && (
                    <div className={`text-xs font-medium p-2 rounded-xl border ${
                      pinNotice.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {pinNotice.message}
                    </div>
                  )}
                </div>

                {/* Honest Boundaries Disclosure */}
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-500 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-stone-700">
                    <Info className="w-3.5 h-3.5 text-stone-400" />
                    <span>Privacy & OS Boundaries Note</span>
                  </div>
                  <p className="leading-relaxed">
                    Discreet Mode switches the home screen launcher alias on supported Android devices and provides a functional calculator disguise. It does <strong>not</strong> alter Android system-level task switchers, process monitors, or bypass operating system security policies.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'device' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Device & Wearable Integration
                </h3>
                <p className="text-xs text-stone-600">
                  Companion wearables provide automatic telemetry backup if the primary smartphone is disrupted or runs out of battery during an active escort.
                </p>
                <div className="p-3 rounded-xl border border-stone-200 bg-[#fcf8f8] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Watch className="w-5 h-5 text-rose-600" />
                    <div>
                      <div className="font-semibold text-stone-900">Smartwatch Companion Link</div>
                      <div className="text-stone-500">BLE heartbeat & sudden deceleration sensor integration</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                    Companion Standby
                  </span>
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
      {/* Replayable Onboarding Walkthrough */}
      <OnboardingModal forceOpen={showWalkthrough} onClose={() => setShowWalkthrough(false)} />
    </div>
  );
};

export default Settings;
