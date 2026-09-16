import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Power, 
  Smartphone, 
  Watch, 
  Radio, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Sliders, 
  Key, 
  Users, 
  FileText,
  HelpCircle
} from 'lucide-react';
import Card from '../common/Card';

const AdvancedSafetyConceptsCard = ({ className = '' }) => {
  const [pressCount, setPressCount] = useState(0);
  const [triggerSimulated, setTriggerSimulated] = useState(false);

  const handleSimulateHardwarePress = () => {
    const nextCount = pressCount + 1;
    if (nextCount >= 5) {
      setPressCount(5);
      setTriggerSimulated(true);
      setTimeout(() => {
        setTriggerSimulated(false);
        setPressCount(0);
      }, 3500);
    } else {
      setPressCount(nextCount);
    }
  };

  const handleResetHardwarePress = () => {
    setPressCount(0);
    setTriggerSimulated(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
            <Power className="w-5 h-5 text-rose-600" />
            <span>Advanced Device Safety Concepts</span>
          </h2>
          <p className="text-xs text-stone-600">
            Architectural documentation and prototype simulations for future operating system and hardware-level safety integration.
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          Phase 12 Architectural Reference
        </span>
      </div>

      {/* 1. OS-LEVEL SAFETY SHUTDOWN CONCEPT */}
      <Card className="border border-stone-200 bg-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                OS-Level Safety Shutdown Concept
              </h3>
              <span className="text-[10px] font-mono text-amber-700 font-semibold">
                Platform Boundary & Architectural Reality
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            Non-Interceptable by Standard App
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 mb-3 text-xs text-amber-900 leading-relaxed font-medium">
          "Some advanced safety behaviors would require operating-system or device-firmware support and cannot be reliably implemented by a normal Android application."
        </div>

        <div className="text-xs text-stone-600 space-y-2 leading-relaxed">
          <p>
            Standard Android and iOS user-space applications are strictly sandboxed. When an operating system shuts down (due to battery depletion, explicit user power-off, or forced reboot), the operating system sends termination signals to all running background processes and unmounts core subsystems.
          </p>
          <p>
            SafeCircle adheres strictly to mobile security engineering standards: we do <strong>not</strong> implement fake OS power-down interception, spoof shutdown animations, or bypass platform sandboxes. True emergency protection during device failure is addressed via independent companion hardware (wearable fallback).
          </p>
        </div>
      </Card>

      {/* 2. HARDWARE TRIGGER CONCEPT */}
      <Card className="border border-stone-200 bg-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Power className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Hardware Trigger Concept
              </h3>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                Future OS / Hardware Integration
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Prototype Simulation
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed mb-4">
          Multiple hardware-button presses (such as 5 rapid presses of the physical power button) could be used as a future emergency trigger where supported by the operating system/device vendor API. Standard third-party Android apps do not have permission to intercept global power button clicks when the screen is locked or the app is closed.
        </p>

        {/* Interactive Prototype Simulation */}
        <div className="p-4 rounded-2xl bg-[#fcf8f8] border border-stone-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800">
              Simulate 5x Power Button Presses:
            </span>
            <span className="font-mono font-bold text-rose-600">
              {pressCount} / 5 clicks
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-600 rounded-full transition-all duration-300"
              style={{ width: `${(pressCount / 5) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSimulateHardwarePress}
              disabled={triggerSimulated}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              {pressCount < 5 ? `Simulate Power Press (${pressCount + 1})` : 'Sequence Triggered!'}
            </button>
            {pressCount > 0 && !triggerSimulated && (
              <button
                onClick={handleResetHardwarePress}
                className="py-2 px-3 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {triggerSimulated && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Hardware Trigger Simulation Successful:</strong> 5-press sequence detected. In a native OS environment, this would signal emergency dispatch or discreet check-in.
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* 3. DEVICE UNAVAILABLE CONCEPT & WEARABLE FALLBACK (CONNECTED TO PHASE 11) */}
      <Card className="border border-stone-200 bg-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center shrink-0">
              <Watch className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Device Unavailable Fallback Architecture
              </h3>
              <span className="text-[10px] font-mono text-stone-500 font-semibold">
                Phase 11 Hardware Integration Pipeline
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Phase 11 Implemented
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed mb-4">
          Because a standard mobile application cannot track location after phone shutdown, SafeCircle utilizes a resilient multi-device architecture. If primary phone telemetry drops, the companion device provides autonomous continuity:
        </p>

        {/* Visual Pipeline Diagram */}
        <div className="p-4 rounded-2xl bg-[#fcf8f8] border border-stone-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
            {/* Step 1: Phone */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 flex flex-col items-center justify-center shadow-2xs">
              <Smartphone className="w-4 h-4 text-stone-700 mb-1" />
              <span className="font-bold text-stone-900 text-[11px]">Primary Phone</span>
              <span className="text-[10px] text-stone-500 mt-0.5">Cellular / GPS</span>
            </div>

            {/* Step 2: Unavailable */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-700 mb-1" />
              <span className="font-bold text-amber-950 text-[11px]">Device Unavailable</span>
              <span className="text-[10px] text-amber-700 mt-0.5">Battery dead / off</span>
            </div>

            {/* Step 3: Last Known State */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 flex flex-col items-center justify-center shadow-2xs">
              <Radio className="w-4 h-4 text-stone-700 mb-1" />
              <span className="font-bold text-stone-900 text-[11px]">Last Known State</span>
              <span className="text-[10px] text-stone-500 mt-0.5">Retained baseline</span>
            </div>

            {/* Step 4: Wearable Fallback */}
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center shadow-2xs">
              <Watch className="w-4 h-4 text-rose-700 mb-1" />
              <span className="font-bold text-rose-950 text-[11px]">Wearable Fallback</span>
              <span className="text-[10px] text-rose-700 mt-0.5">Independent BLE/LTE</span>
            </div>

            {/* Step 5: Future Integration */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 flex flex-col items-center justify-center shadow-2xs">
              <Sliders className="w-4 h-4 text-stone-700 mb-1" />
              <span className="font-bold text-stone-900 text-[11px]">Future Integration</span>
              <span className="text-[10px] text-stone-500 mt-0.5">OS / OEM Support</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-600">
            <span>Safety State Signal: <code className="font-mono font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded">DEVICE_OFFLINE (+10 pts)</code></span>
            <span>Handover: Autonomous companion switch</span>
          </div>
        </div>
      </Card>

      {/* 4. PRIVACY PRINCIPLE: USER-CONTROLLED PRIVACY */}
      <Card className="border border-stone-200 bg-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                User-Controlled Privacy Principle
              </h3>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                SafeCircle Core Architecture
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Privacy First
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed mb-4">
          The central privacy innovation of SafeCircle is that trusted presence does <strong>not</strong> grant blanket access. Information exposure is always mathematically governed by four user-controlled rules:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#fcf8f8] border border-stone-200/70 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <Users className="w-4 h-4 text-rose-600" />
              <span>1. The user chooses trusted contacts</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              No one receives safety telemetry without explicit user addition and active circle membership.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#fcf8f8] border border-stone-200/70 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <Key className="w-4 h-4 text-rose-600" />
              <span>2. The user defines permissions</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Custom disclosure profiles dictate which information types (status, approximate area, live GPS, emergency alert, details) each contact is eligible to see.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#fcf8f8] border border-stone-200/70 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>3. Safety state controls policy</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Disclosures adapt progressively as the safety state transitions from <code className="font-mono text-stone-700">NORMAL</code> → <code className="font-mono text-amber-700">CAUTION</code> → <code className="font-mono text-orange-700">ELEVATED</code> → <code className="font-mono text-rose-700">CRISIS</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#fcf8f8] border border-stone-200/70 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>4. No automatic total disclosure</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Contacts do <strong>not</strong> automatically receive all information merely by virtue of being in the circle. In <code className="font-mono text-stone-700">NORMAL</code> state, precise coordinates are never shared.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedSafetyConceptsCard;
