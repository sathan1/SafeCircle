import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import SafetyStatusCard from '../components/dashboard/SafetyStatusCard';
import ActiveJourneyCard from '../components/dashboard/ActiveJourneyCard';
import SafetyCircleCard from '../components/dashboard/SafetyCircleCard';
import PrivacyCard from '../components/dashboard/PrivacyCard';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import QuickActions from '../components/dashboard/QuickActions';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* 1. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 inline-block mb-1.5">
            Personal Safety Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Good evening, Harshika
          </h1>
          <p className="text-sm text-stone-600">
            Your safety, your privacy, your control.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-stone-500 bg-white px-3 py-1.5 rounded-xl border border-stone-200/70 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-rose-600" />
          <span>Active Escort · Ready</span>
        </div>
      </div>

      {/* 2. Large Current Safety Status Card (Hero Element) */}
      <SafetyStatusCard />

      {/* 3. Middle Grid: Active Journey + Circle & Privacy Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActiveJourneyCard />
        </div>
        <div className="space-y-6">
          <SafetyCircleCard />
        </div>
      </div>

      {/* 4. Lower Grid: Privacy Rules + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <PrivacyCard />
        </div>
        <div className="lg:col-span-2">
          <ActivityTimeline />
        </div>
      </div>

      {/* 5. Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;
