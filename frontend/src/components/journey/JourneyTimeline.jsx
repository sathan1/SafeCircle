import React from 'react';
import { Clock, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import Card from '../common/Card';

const JourneyTimeline = ({ startedAt, status }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startTimeStr = startedAt ? formatTime(startedAt) : '8:10 PM';
  const confirmTimeStr = startedAt 
    ? formatTime(new Date(new Date(startedAt).getTime() + 60000)) 
    : '8:11 PM';
  const monitorTimeStr = startedAt 
    ? formatTime(new Date(new Date(startedAt).getTime() + 10 * 60000)) 
    : '8:20 PM';

  const events = [
    {
      id: 'e1',
      title: 'Journey started',
      time: startTimeStr,
      desc: 'Origin verified and route initiated.',
      icon: Clock
    },
    {
      id: 'e2',
      title: 'Route confirmed',
      time: confirmTimeStr,
      desc: 'Telemetry matched against scheduled destination.',
      icon: CheckCircle2
    },
    {
      id: 'e3',
      title: 'Journey monitoring active',
      time: monitorTimeStr,
      desc: 'SafeCircle progressive checkpoint watch active.',
      icon: ShieldCheck
    }
  ];

  if (status === 'COMPLETED') {
    events.push({
      id: 'e4',
      title: 'Journey completed safely',
      time: 'Just now',
      desc: 'Arrival acknowledged and escort stood down.',
      icon: CheckCircle2
    });
  } else if (status === 'CANCELLED') {
    events.push({
      id: 'e4',
      title: 'Journey cancelled',
      time: 'Just now',
      desc: 'Journey ended early by user.',
      icon: Activity
    });
  }

  return (
    <Card className="border border-stone-200/80 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-stone-900">Journey Event Timeline</h3>
          <p className="text-xs text-stone-500">Autonomous escort checkpoints and milestones</p>
        </div>
        <span className="text-[11px] font-mono text-stone-400">
          {events.length} Milestones
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
        {events.map((evt) => {
          const Icon = evt.icon;
          return (
            <div key={evt.id} className="relative group">
              <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border border-rose-100 bg-white text-rose-600 shadow-2xs">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="text-xs font-bold text-stone-900">{evt.title}</span>
                <span className="text-[10px] font-mono text-stone-400">{evt.time}</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-snug">{evt.desc}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default JourneyTimeline;
