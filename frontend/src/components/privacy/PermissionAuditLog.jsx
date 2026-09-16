import React from 'react';
import { History, Clock, CheckCircle2, Shield } from 'lucide-react';
import Card from '../common/Card';

const PermissionAuditLog = ({ recentLogs = [] }) => {
  const defaultLogs = [
    {
      id: 'log-1',
      title: 'Privacy Policy Initialized',
      contact: 'Mom',
      info: 'Recommended Default Policy',
      state: 'ALL',
      action: 'Applied',
      time: '12 mins ago'
    },
    {
      id: 'log-2',
      title: 'Emergency Override Verified',
      contact: 'Priya (Sister)',
      info: 'Live Location',
      state: 'CRISIS',
      action: 'Allowed',
      time: '25 mins ago'
    },
    {
      id: 'log-3',
      title: 'Baseline Visibility Restriced',
      contact: 'Ananya',
      info: 'Approximate Location',
      state: 'NORMAL',
      action: 'Denied',
      time: '1 hour ago'
    }
  ];

  const logs = recentLogs.length > 0 ? recentLogs : defaultLogs;

  return (
    <Card className="border border-stone-200/80 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Policy Audit Log
            </h3>
            <p className="text-xs text-stone-500">
              Recent adjustments made to your personal data sharing matrix
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-stone-400">
          {logs.length} Logged
        </span>
      </div>

      <div className="divide-y divide-stone-100 text-xs">
        {logs.map((log) => (
          <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2.5">
              <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <div>
                <span className="font-bold text-stone-900">{log.title}</span>
                <span className="text-stone-500 text-[11px]"> · {log.contact} ({log.info} / {log.state})</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                log.action === 'Allowed' || log.action === 'Applied'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-stone-100 text-stone-600'
              }`}>
                {log.action}
              </span>
              <span className="font-mono text-[10px] text-stone-400">{log.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PermissionAuditLog;
