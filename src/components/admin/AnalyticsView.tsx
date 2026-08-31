import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Share2,
  Smartphone,
  Laptop,
  Layers,
  Award,
  Calendar,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { CRMStats } from '../../types';

interface AnalyticsViewProps {
  stats: CRMStats | null;
  isLoading: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, isLoading }) => {
  const total = stats?.total || 0;

  // Source breakdowns
  const sources = stats?.sourceCounts || {};
  const devices = stats?.deviceCounts || {};
  const experiences = stats?.experienceCounts || {};
  const skills = stats?.skillCounts || {};
  const dayTimeline = stats?.dayCounts || {};

  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Meta Ads & Audience Intelligence</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Comprehensive real-time analytics generated across all enrolled Canva participants.
        </p>
      </div>

      {/* 4 Multi-Dimension Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Ad Attribution Source */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Ad Channel Attribution</span>
            </h4>
            <span className="text-xs font-bold text-slate-400">{total} Total</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(sources).map(([sourceName, count]) => {
              const num = Number(count) || 0;
              const pct = getPercentage(num);
              const isFb = sourceName.toLowerCase().includes('facebook');
              const isIg = sourceName.toLowerCase().includes('instagram');
              const color = isFb
                ? 'bg-[#1877F2]'
                : isIg
                ? 'bg-[#E4405F]'
                : 'bg-emerald-500';

              return (
                <div key={sourceName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      {sourceName}
                    </span>
                    <span>
                      {num} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Device Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>Student Hardware / Device</span>
            </h4>
            <span className="text-xs font-bold text-slate-400">Readiness</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(devices).map(([devName, count]) => {
              const num = Number(count) || 0;
              const pct = getPercentage(num);
              return (
                <div key={devName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      {devName === 'Smartphone' ? (
                        <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <Laptop className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      {devName}
                    </span>
                    <span>
                      {num} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Canva Experience Baseline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Canva Skill Baseline</span>
            </h4>
            <span className="text-xs font-bold text-slate-400">Class Preparation</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(experiences).map(([expName, count]) => {
              const num = Number(count) || 0;
              const pct = getPercentage(num);
              return (
                <div key={expName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{expName}</span>
                    <span>
                      {num} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Top Learning Interests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Highest Demand Skills</span>
            </h4>
            <span className="text-xs font-bold text-slate-400">Curriculum Focus</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(skills).map(([skillName, count]) => {
              const num = Number(count) || 0;
              const pct = getPercentage(num);
              return (
                <div key={skillName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{skillName}</span>
                    <span>
                      {num} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Daily Registration Velocity Timeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Daily Registration Velocity</span>
          </h4>
          <span className="text-xs text-slate-400 font-medium">Daily signups logged</span>
        </div>

        {Object.keys(dayTimeline).length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No registration history recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
            {Object.entries(dayTimeline)
              .sort(([a], [b]) => (a > b ? 1 : -1))
              .slice(-14)
              .map(([dayDate, count]) => (
                <div
                  key={dayDate}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center flex flex-col justify-between"
                >
                  <span className="text-[11px] font-bold text-slate-500">{dayDate}</span>
                  <span className="text-xl font-extrabold text-blue-600 mt-1">{count}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Signups</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
