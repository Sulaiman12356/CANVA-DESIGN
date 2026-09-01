import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  Smartphone,
  Laptop,
  Clock,
  Globe,
  RefreshCw,
  Eye,
  Flame,
  Radio,
  Zap,
} from 'lucide-react';
import { adminApi } from '../../utils/adminApi';
import { LiveVisitorMetrics } from '../../types';

export const AdminLiveActivityView: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveVisitorMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const fetchLiveActivity = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await adminApi.getLiveActivity();
      setMetrics(data);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Error fetching live visitor metrics:', err);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveActivity();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLiveActivity();
      }, 8000); // 8 second live polling
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Live Visitor & Activity Monitor
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry of active website visitors, heartbeat tracking, and live conversion funnel events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span>{autoRefresh ? 'Live Polling: ON' : 'Live Polling: Paused'}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchLiveActivity(true)}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Visitors Now */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Radio className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Active Visitors Now</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {metrics?.activeVisitorsNow ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active within past 5 minutes
          </p>
        </div>

        {/* Visitors Past Hour */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-16 h-16 text-blue-400" />
          </div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Past Hour Traffic</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {metrics?.visitorsPastHour ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Distinct visitor sessions (60m)
          </p>
        </div>

        {/* Today's Total Sessions */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe className="w-16 h-16 text-sky-400" />
          </div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Today's Sessions</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {metrics?.todaySessionsCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Lagos Day Session Accumulation
          </p>
        </div>

        {/* Today's Registrations */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="w-16 h-16 text-amber-400" />
          </div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Today's Registrations</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {metrics?.todayRegistrations ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Converted today in database
          </p>
        </div>
      </div>

      {/* Main Dual Grid: Active Sessions & Real-Time Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Visitor Sessions Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Visitor Sessions ({metrics?.activeSessions.length ?? 0})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Synced with server time (WAT/Lagos)
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Loading telemetry...</span>
            </div>
          ) : !metrics?.activeSessions || metrics.activeSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No active visitors currently on the landing page. Heartbeat updates every 20 seconds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Status / Device</th>
                    <th className="py-2.5 px-3">Current View</th>
                    <th className="py-2.5 px-3">Active Duration</th>
                    <th className="py-2.5 px-3">Traffic Origin</th>
                    <th className="py-2.5 px-3">Last Heartbeat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metrics.activeSessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${sess.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                          <div className="flex items-center gap-1.5 font-semibold text-white">
                            {sess.device === 'Smartphone' ? (
                              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-sky-400" />
                            )}
                            <span>{sess.device || 'Desktop'}</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          {sess.session_id.substring(0, 14)}...
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                          {sess.current_page || '/'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-emerald-300">
                          {formatDuration(sess.active_seconds || 0)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-300 font-medium">
                          {sess.utm_source || sess.referrer || 'Direct'}
                        </div>
                        {sess.utm_campaign && (
                          <div className="text-[10px] text-slate-500">
                            {sess.utm_campaign}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {sess.last_heartbeat ? new Date(sess.last_heartbeat).toLocaleTimeString() : 'Just now'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real-Time Live Activity Event Log (1 col) */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Event Feed
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              {lastRefreshedAt.toLocaleTimeString()}
            </span>
          </div>

          {!metrics?.recentEvents || metrics.recentEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No recent activity events recorded.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {metrics.recentEvents.slice(0, 15).map((evt) => {
                const isReg = evt.event === 'registration_completed';
                const isWa = evt.event === 'whatsapp_group_click';
                const isForm = evt.event === 'registration_form_started';

                return (
                  <div
                    key={evt.id}
                    className={`p-2.5 rounded-xl border text-xs transition ${
                      isReg
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : isWa
                        ? 'bg-green-500/10 border-green-500/30 text-green-200'
                        : isForm
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold uppercase tracking-wider text-slate-300">
                        {evt.event.replace(/_/g, ' ')}
                      </span>
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-200 font-medium">
                      {evt.details || `Triggered from ${evt.source || 'Direct'}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
