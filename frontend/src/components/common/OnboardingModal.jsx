import React, { useState, useEffect } from 'react';
import { Shield, Users, Lock, Sparkles, Navigation, ChevronRight, X, Check } from 'lucide-react';

const ONBOARDING_KEY = 'safecircle_onboarding_completed_v1';

const SCREENS = [
  {
    step: 1,
    icon: Shield,
    iconBg: 'bg-rose-500 text-white',
    title: 'Welcome to SafeCircle',
    tagline: 'Your safety. Your privacy. Your control.',
    description: 'SafeCircle is built on a simple promise: you should never have to sacrifice your personal privacy just to stay safe.',
    badge: 'Privacy First'
  },
  {
    step: 2,
    icon: Users,
    iconBg: 'bg-rose-100 text-rose-600',
    title: 'Choose Your Safety Circle',
    tagline: 'Add people you truly trust.',
    description: 'Select close family, friends, or trusted guardians to look out for you when traveling.',
    badge: 'Trusted People'
  },
  {
    step: 3,
    icon: Lock,
    iconBg: 'bg-amber-100 text-amber-700',
    title: 'You Decide What They See',
    tagline: 'No blanket tracking. Ever.',
    description: 'Being in your circle does NOT mean seeing your continuous live location. You customize individual permissions for every contact.',
    badge: 'Granular Control'
  },
  {
    step: 4,
    icon: Sparkles,
    iconBg: 'bg-rose-100 text-rose-700',
    title: 'Progressive Protection',
    tagline: 'Info unlocked only when needed.',
    description: 'SafeCircle shares more information ONLY when an unexpected condition or safety escalation actually warrants it.',
    badge: 'Smart Escalation'
  },
  {
    step: 5,
    icon: Navigation,
    iconBg: 'bg-emerald-100 text-emerald-700',
    title: 'Ready for Safe Journey?',
    tagline: 'Peace of mind on every trip.',
    description: 'Set your destination, choose a well-lit route, and your safety circle will stand by without invading your personal privacy.',
    badge: 'Ready to Go'
  }
];

const OnboardingModal = ({ forceOpen = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentStep(0);
    } else {
      const completed = localStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        setIsOpen(true);
      }
    }
  }, [forceOpen]);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStep < SCREENS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  if (!isOpen) return null;

  const current = SCREENS[currentStep];
  const IconComponent = current.icon;
  const isLast = currentStep === SCREENS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 flex flex-col justify-between min-h-[460px] animate-in zoom-in-95 duration-200">
        
        {/* Top Header & Skip */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
            {current.badge}
          </span>
          <button
            onClick={handleComplete}
            className="text-xs font-semibold text-stone-400 hover:text-stone-700 transition-colors p-1"
            aria-label="Skip onboarding"
          >
            Skip
          </button>
        </div>

        {/* Center Content */}
        <div className="my-auto text-center py-4">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-sm ${current.iconBg}`}>
            <IconComponent className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-stone-900 tracking-tight mb-1">
            {current.title}
          </h3>
          <p className="text-xs font-bold text-rose-600 mb-3 uppercase tracking-wider">
            {current.tagline}
          </p>
          <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
            {current.description}
          </p>
        </div>

        {/* Bottom Navigation & Dots */}
        <div>
          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {SCREENS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-rose-600' : 'w-1.5 bg-stone-200'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleNext}
            className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isLast ? 'Get Started' : 'Next'}</span>
            {isLast ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;
