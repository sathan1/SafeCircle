import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SafetyStatusCard from '../components/dashboard/SafetyStatusCard';
import ActiveJourneyCard from '../components/dashboard/ActiveJourneyCard';
import SafetyCircleCard from '../components/dashboard/SafetyCircleCard';
import PrivacyCard from '../components/dashboard/PrivacyCard';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import QuickActions from '../components/dashboard/QuickActions';
import GpsStatusIndicator from '../components/common/GpsStatusIndicator';
import WardsEscortCard from '../components/dashboard/WardsEscortCard';

const Dashboard = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 inline-block mb-1.5">
            Personal Safety Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-sm text-stone-600">
            Your safety, your privacy, your control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <GpsStatusIndicator />
          <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-white px-3 py-1.5 rounded-full border border-stone-200/70 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            <span>Escort Ready</span>
          </div>
        </div>
      </div>


      {/* 2. Large Current Safety Status Card (Hero Element) */}
      <SafetyStatusCard />

      {/* 2.5 Guardian Escort & Pending Invitations (for Mom and Dad) */}
      <WardsEscortCard />

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
