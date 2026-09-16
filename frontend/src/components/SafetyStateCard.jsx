import React from 'react';
import Card from './Card';
import { ArrowRight } from 'lucide-react';

const SafetyStateCard = () => {
  return (
    <Card className="bg-gradient-to-br from-[#2d3748] to-[#1a202c] text-white border-none">
      <h3 className="text-lg font-bold mb-2">Safety Progression</h3>
      <p className="text-sm text-gray-300 mb-6">
        SafeCircle progressively increases information sharing only when the safety state requires it, according to your privacy policy.
      </p>
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-600 before:to-transparent">
         <div className="relative flex items-center justify-between text-sm">
           <span className="flex-1 font-bold text-[#10b981]">NORMAL</span>
           <ArrowRight className="w-4 h-4 text-gray-500" />
           <span className="flex-1 text-right text-gray-400">Minimal tracking</span>
         </div>
         <div className="relative flex items-center justify-between text-sm">
           <span className="flex-1 font-bold text-[#f59e0b]">CAUTION</span>
           <ArrowRight className="w-4 h-4 text-gray-500" />
           <span className="flex-1 text-right text-gray-400">Check-in required</span>
         </div>
         <div className="relative flex items-center justify-between text-sm">
           <span className="flex-1 font-bold text-[#f97316]">ELEVATED</span>
           <ArrowRight className="w-4 h-4 text-gray-500" />
           <span className="flex-1 text-right text-gray-400">Alert trusted contacts</span>
         </div>
         <div className="relative flex items-center justify-between text-sm">
           <span className="flex-1 font-bold text-[#ef4444]">CRISIS</span>
           <ArrowRight className="w-4 h-4 text-gray-500" />
           <span className="flex-1 text-right text-gray-400">Full location shared</span>
         </div>
      </div>
    </Card>
  );
};

export default SafetyStateCard;
