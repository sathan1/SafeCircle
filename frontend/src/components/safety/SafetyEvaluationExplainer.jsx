import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Sparkles, 
  Sliders, 
  Lock, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const PIPELINE_STEPS = [
  {
    step: 1,
    title: 'Event Detection',
    description: 'A physical journey event or telemetry update occurs (e.g. detour, dwell pause, check-in timeout).',
    icon: Activity
  },
  {
    step: 2,
    title: 'Anomaly Intelligence',
    description: 'Rule-based detectors analyze the condition and generate an explainable signal with transparent confidence.',
    icon: Sparkles
  },
  {
    step: 3,
    title: 'Safety State Engine',
    description: 'The state engine acts as the final decision authority, weighting cumulative active signals into a score.',
    icon: Sliders
  },
  {
    step: 4,
    title: 'State Transition',
    description: 'The journey shifts smoothly between NORMAL, CAUTION, ELEVATED, or CRISIS based on threshold rules.',
    icon: ShieldCheck
  },
  {
    step: 5,
    title: 'Privacy Enforcement',
    description: 'The Privacy Permission Engine dictates exactly what data each trusted contact is permitted to see.',
    icon: Lock
  }
];

export default function SafetyEvaluationExplainer({ className = '' }) {
  return (
    <div className={`p-6 bg-gradient-to-br from-rose-50/40 via-white to-stone-50 rounded-2xl border border-rose-100/80 shadow-xs space-y-5 ${className}`}>
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100/80 text-rose-700 mb-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Architecture Transparency</span>
        </div>
        <h3 className="text-lg font-bold text-stone-900">
          How SafeCircle Evaluates Safety
        </h3>
        <p className="text-xs text-stone-600 mt-0.5">
          A transparent, 5-stage explainable pipeline connecting sensor observations to privacy-controlled disclosures.
        </p>
      </div>

      {/* Pipeline Visual Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.step}
              className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between space-y-2 relative group hover:border-rose-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                  {step.step}
                </div>
                <Icon className="w-4 h-4 text-stone-400 group-hover:text-rose-600 transition-colors" />
              </div>

              <div>
                <h4 className="font-bold text-xs text-stone-900 mb-1">
                  {step.title}
                </h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Black-Box AI & Realism Commitment */}
      <div className="p-4 rounded-xl bg-white border border-stone-200/80 space-y-1.5 text-xs text-stone-600">
        <span className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          SafeCircle Realism & Scientific Integrity Commitment
        </span>
        <p className="text-[11px] leading-relaxed">
          SafeCircle is a safety prototype designed to demonstrate user-owned privacy policy control. It makes 
          <strong> no claims of scientifically validated risk probabilities, guaranteed danger prediction, or 100% accurate AI</strong>. 
          All anomaly evaluations rely on explainable, human-auditable rules designed to keep the user and their trusted circle transparently informed.
        </p>
      </div>
    </div>
  );
}
