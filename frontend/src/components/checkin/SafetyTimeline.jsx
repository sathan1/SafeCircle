import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  Radio, 
  Bell,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Card from '../common/Card';

const getEventVisuals = (item) => {
  const type = item.type || item.eventCategory || '';

  if (type === 'CHECKIN_REQUESTED') {
    return {
      dotColor: 'bg-amber-500',
      icon: Clock,
      title: 'Safety Check-in Requested',
      badge: 'Check-in'
    };
  }
  if (type === 'USER_CONFIRMED_SAFE' || item.response === 'SAFE') {
    return {
      dotColor: 'bg-emerald-500',
      icon: CheckCircle2,
      title: 'User Confirmed Safe',
      badge: 'Safe'
    };
  }
  if (type === 'MISSED_CHECKIN' || item.status === 'MISSED') {
    return {
      dotColor: 'bg-red-500',
      icon: AlertTriangle,
      title: 'Check-in Missed (+25)',
      badge: 'Missed'
    };
  }
  if (type === 'NEED_HELP' || item.response === 'NEED_HELP') {
    return {
      dotColor: 'bg-red-600',
      icon: ShieldAlert,
      title: 'Need Help Triggered (+50)',
      badge: 'Distress'
    };
  }
  if (type === 'STATE_CHANGE') {
    return {
      dotColor: 'bg-orange-500',
      icon: Activity,
      title: `Safety State: ${item.previousState} → ${item.newState}`,
      badge: 'State Shift'
    };
  }
  if (type === 'ESCALATION') {
    return {
      dotColor: 'bg-red-500',
      icon: Radio,
      title: `${item.level} Escalation Simulated`,
      badge: 'Escalation'
    };
  }

  return {
    dotColor: 'bg-rose-500',
    icon: Bell,
    title: item.title || item.description || 'Escort Event',
    badge: 'Event'
  };
};

const SafetyTimeline = ({
  checkIns = [],
  events = [],
  transitions = [],
  escalations = []
}) => {
  // Aggregate and sort all timeline items chronologically
  const timelineItems = [];

  // Check-ins
  checkIns.forEach(chk => {
    timelineItems.push({
      id: `chk-req-${chk.id}`,
      type: 'CHECKIN_REQUESTED',
      timestamp: chk.requestedAt,
      description: `Discreet check-in prompt initiated. Due by ${new Date(chk.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });

    if (chk.status === 'COMPLETED') {
      timelineItems.push({
        id: `chk-res-${chk.id}`,
        type: chk.response === 'NEED_HELP' ? 'NEED_HELP' : 'USER_CONFIRMED_SAFE',
        timestamp: chk.respondedAt || chk.updatedAt || chk.requestedAt,
        description: chk.response === 'NEED_HELP' ? 'User responded NEED HELP to prompt' : 'User confirmed safe via prompt'
      });
    } else if (chk.status === 'MISSED') {
      timelineItems.push({
        id: `chk-miss-${chk.id}`,
        type: 'MISSED_CHECKIN',
        timestamp: chk.dueAt,
        description: 'Check-in due time expired without user acknowledgement'
      });
    }
  });

  // State transitions
  transitions.forEach(tr => {
    timelineItems.push({
      id: `tr-${tr.id}`,
      type: 'STATE_CHANGE',
      previousState: tr.previousState,
      newState: tr.newState,
      timestamp: tr.timestamp,
      description: `${tr.reason} (Score: ${tr.signalScore})`
    });
  });

  // Escalations
  escalations.forEach(esc => {
    timelineItems.push({
      id: `esc-${esc.id}`,
      type: 'ESCALATION',
      level: esc.level,
      timestamp: esc.createdAt,
      description: `Notification simulation recorded for ${esc.targetContacts?.length || 1} contact(s): ${esc.reason}`
    });
  });

  // Journey events (deviations, offline, stops)
  events.forEach(evt => {
    if (!['JOURNEY_STARTED', 'USER_CONFIRMED_SAFE', 'MISSED_CHECKIN', 'NEED_HELP'].includes(evt.type)) {
      timelineItems.push({
        id: `evt-${evt.id}`,
        type: evt.type,
        timestamp: evt.timestamp,
        description: `Safety signal added: ${evt.description} (+${evt.scoreContribution})`
      });
    }
  });

  // Sort newest first
  timelineItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Card className="border border-stone-200/80 bg-white shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Safety Timeline
          </h3>
          <p className="text-[11px] text-stone-400">
            Chronological log of check-ins, signals, state transitions & escalations
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-50 px-2.5 py-1 rounded-full border border-stone-200">
          {timelineItems.length} Logged Items
        </span>
      </div>

      {timelineItems.length === 0 ? (
        <div className="p-6 text-center text-xs text-stone-400">
          No safety milestones recorded yet for this journey.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
          {timelineItems.map((item) => {
            const visual = getEventVisuals(item);
            const Icon = visual.icon;

            return (
              <div key={item.id} className="relative text-xs group">
                {/* Dot */}
                <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${visual.dotColor} ring-4 ring-white shadow-2xs`} />

                <div className="p-2.5 rounded-xl bg-[#fcf8f8] border border-stone-200/70 hover:border-stone-300 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-stone-900">
                      <Icon className="w-3.5 h-3.5 text-stone-500" />
                      <span>{visual.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default SafetyTimeline;
