import React from 'react';
import {
  Users,
  Calendar,
  Clock,
  MessageCircle,
  Award,
  Sparkles,
  TrendingUp,
  Mail,
  Download,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { CRMStats, AdminParticipant } from '../../types';
import { AdminTab } from './AdminLayout';

interface AdminDashboardHomeProps {
  stats: CRMStats | null;
  recentParticipants: AdminParticipant[];
  isLoading: boolean;
  onNavigateTab: (tab: AdminTab) => void;
  onSelectParticipant: (participant: AdminParticipant) => void;
  onDownloadCSV: () => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({
  stats,
  recentParticipants,
  isLoading,
  onNavigateTab,
  onSelectParticipant,
  onDownloadCSV,
}) => {
  const total = stats?.total || 0;
  const today = stats?.today || 0;
  const thisWeek = stats?.thisWeek || 0;
  const whatsappJoined = stats?.whatsappJoined || 0;
  const classAttended = stats?.classAttended || 0;
  const masterClassInterested = stats?.masterClassInterested || 0;

  // Real conversion rates
  const whatsappRate = total > 0 ? Math.round((whatsappJoined / total) * 100) : 0;
  const attendanceRate = total > 0 ? Math.round((classAttended / total) * 100) : 0;
  const masterclassRate = total > 0 ? Math.round((masterClassInterested / total) * 100) : 0;

  // Source percentages
  const fbCount = stats?.sourceCounts?.Facebook || 0;
  const igCount = stats?.sourceCounts?.Instagram || 0;
  const organicCount = stats?.sourceCounts?.Organic || 0;
  const otherCount = stats?.sourceCounts?.Other || 0;

  const fbPct = total > 0 ? Math.round((fbCount / total) * 100) : 0;
  const igPct = total > 0 ? Math.round((igCount / total) * 100) : 0;
  const orgPct = total > 0 ? Math.round((organicCount / total) * 100) : 0;
  const otherPct = total > 0 ? Math.round((otherCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ---------------- 1. KEY STATISTICS CARDS ---------------- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Cohort Live Performance
          </h3>
          <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Real-Time Sync
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total Registered */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold tracking-tight uppercase text-slate-500">
                TOTAL PARTICIPANTS
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isLoading ? '...' : total}
              </span>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Enrolled Students</p>
            </div>
          </div>

          {/* Today */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold tracking-tight uppercase text-slate-500">
                TODAY
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isLoading ? '...' : today}
              </span>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Last 24 Hours</p>
            </div>
          </div>

          {/* This Week */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold tracking-tight uppercase text-slate-500">
                THIS WEEK
              </span>
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isLoading ? '...' : thisWeek}
              </span>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Rolling 7-day intake</p>
            </div>
          </div>

          {/* WhatsApp Joined */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold tracking-tight uppercase text-slate-500">
                WHATSAPP JOINED
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isLoading ? '...' : whatsappJoined}
                </span>
                <span className="text-xs font-bold text-emerald-600">({whatsappRate}%)</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">In Official Group</p>
            </div>
          </div>

          {/* Class Attended */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold tracking-tight uppercase text-slate-500">
                CLASS ATTENDED
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isLoading ? '...' : classAttended}
                </span>
                <span className="text-xs font-bold text-purple-600">({attendanceRate}%)</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Active Learners</p>
            </div>
          </div>

          {/* Master Class Interested */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold tracking-tight uppercase text-slate-500">
                MASTER CLASS
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isLoading ? '...' : masterClassInterested}
                </span>
                <span className="text-xs font-bold text-amber-600">({masterclassRate}%)</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">High Intent Leads</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- 2. QUICK SHORTCUTS & CONVERSION FUNNEL ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Quick Admin Actions
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onNavigateTab('participants')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-all group cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800">Manage CRM</p>
              <p className="text-[10px] text-slate-500">Filter & edit</p>
            </button>

            <button
              onClick={() => onNavigateTab('send_email')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-left transition-all group cursor-pointer"
            >
              <Mail className="w-4 h-4 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800">Send Bulk Email</p>
              <p className="text-[10px] text-slate-500">Class broadcast</p>
            </button>

            <button
              onClick={onDownloadCSV}
              className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-all group cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800">Download CSV</p>
              <p className="text-[10px] text-slate-500">Full export</p>
            </button>

            <button
              onClick={() => onNavigateTab('whatsapp')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-all group cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800">WhatsApp Link</p>
              <p className="text-[10px] text-slate-500">Group management</p>
            </button>
          </div>
        </div>

        {/* Center: Conversion Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Cohort Student Journey Pipeline
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">
              From Ad Click to Master Class
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Step 1: Registered */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>1. Form Registration (Free Class)</span>
                <span>{total} students (100%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-full" />
              </div>
            </div>

            {/* Step 2: WhatsApp Joined */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>2. Joined WhatsApp Cohort</span>
                <span>
                  {whatsappJoined} students ({whatsappRate}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${whatsappRate}%` }}
                />
              </div>
            </div>

            {/* Step 3: Attended Live Class */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>3. Attended 3-Day Live Training</span>
                <span>
                  {classAttended} students ({attendanceRate}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>

            {/* Step 4: Masterclass Interested */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>4. Master Class & Mentorship High Intent</span>
                <span>
                  {masterClassInterested} students ({masterclassRate}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${masterclassRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- 3. ACQUISITION CHANNELS & RECENT REGISTRATIONS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ad Attribution Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-sm">Registrations by Source</h4>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Full Analytics →
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]" /> Facebook Ads
                </span>
                <span>
                  {fbCount} ({fbPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1877F2] rounded-full" style={{ width: `${fbPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E4405F]" /> Instagram Ads
                </span>
                <span>
                  {igCount} ({igPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#E4405F] rounded-full" style={{ width: `${igPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Organic & Direct
                </span>
                <span>
                  {organicCount} ({orgPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${orgPct}%` }} />
              </div>
            </div>

            {otherCount > 0 && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Other Sources
                  </span>
                  <span>
                    {otherCount} ({otherPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${otherPct}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-sm">Recent Registrations</h4>
            <button
              onClick={() => onNavigateTab('participants')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({total})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentParticipants.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No participants registered yet. Registrations from your landing page will appear here immediately.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2 font-bold">Student</th>
                    <th className="pb-2 font-bold">WhatsApp</th>
                    <th className="pb-2 font-bold">Device</th>
                    <th className="pb-2 font-bold">Source</th>
                    <th className="pb-2 font-bold">Status</th>
                    <th className="pb-2 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentParticipants.slice(0, 5).map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => onSelectParticipant(p)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 pr-2">
                        <p className="font-bold text-slate-900">{p.full_name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{p.email}</p>
                      </td>
                      <td className="py-2.5 pr-2 font-mono text-[11px] text-slate-600">{p.whatsapp}</td>
                      <td className="py-2.5 pr-2 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          {p.device === 'Smartphone' ? (
                            <Smartphone className="w-3 h-3 text-slate-400" />
                          ) : (
                            <Laptop className="w-3 h-3 text-slate-400" />
                          )}
                          {p.device}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {p.utm_source || 'Organic'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-blue-600 hover:text-blue-800">
                        View
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
