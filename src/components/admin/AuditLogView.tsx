import React from 'react';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Activity,
  FileSpreadsheet,
  Mail,
  Edit,
  Trash2,
  Lock,
} from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogViewProps {
  logs: AuditLog[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs = [], isLoading, onRefresh }) => {
  const safeLogs = logs || [];
  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN')) {
      return { bg: 'bg-blue-100 text-blue-800', icon: Lock };
    }
    if (action.includes('EMAIL')) {
      return { bg: 'bg-purple-100 text-purple-800', icon: Mail };
    }
    if (action.includes('EXPORT') || action.includes('CSV')) {
      return { bg: 'bg-emerald-100 text-emerald-800', icon: FileSpreadsheet };
    }
    if (action.includes('DELETE')) {
      return { bg: 'bg-rose-100 text-rose-800', icon: Trash2 };
    }
    return { bg: 'bg-slate-100 text-slate-800', icon: Activity };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Admin Security & Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Chronological audit log of all administrator operations and student modifications.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Refresh Logs
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {safeLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                safeLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  const formattedDate = new Date(log.timestamp).toLocaleString();

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {formattedDate}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                        {log.admin_email}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
