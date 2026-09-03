import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  Eye,
  CheckSquare,
  Square,
  RefreshCw,
  Sparkles,
  Smartphone,
  Laptop,
  CheckCircle2,
  Clock,
  X,
  MessageCircle,
  UserPlus,
} from 'lucide-react';
import { AdminParticipant, ParticipantStatus } from '../../types';
import { formatExactRegistrationTime } from '../../utils/dateFormat';

interface ParticipantTableProps {
  participants: AdminParticipant[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  isLoading: boolean;
  searchQuery: string;
  selectedDevice: string;
  selectedExperience: string;
  selectedSource: string;
  selectedStatus: string;
  selectedInterest: string;
  selectedIds: string[];
  onSearchChange: (q: string) => void;
  onFilterChange: (key: string, val: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onToggleSelectId: (id: string) => void;
  onSelectAllVisible: (ids: string[]) => void;
  onDeselectAll: () => void;
  onViewParticipant: (participant: AdminParticipant) => void;
  onEditParticipant: (participant: AdminParticipant) => void;
  onSendSingleEmail: (participant: AdminParticipant) => void;
  onSendBulkEmail: () => void;
  onChangeStatus: (participant: AdminParticipant, status: ParticipantStatus) => void;
  onDeleteParticipant: (participant: AdminParticipant) => void;
  onDownloadCSV: () => void;
  onOpenImportModal: () => void;
  onOpenAddParticipant?: () => void;
  onResendConfirmation?: (participant: AdminParticipant) => Promise<void>;
}

export const STATUS_COLORS: Record<ParticipantStatus, { bg: string; text: string; border: string }> = {
  REGISTERED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'WHATSAPP JOINED': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'DAY 1 ATTENDED': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'DAY 2 ATTENDED': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'DAY 3 ATTENDED': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'MASTER CLASS INTERESTED': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'PAYMENT PENDING': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'PART PAYMENT': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'FULL PAYMENT': { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-400' },
  'PAID STUDENT': { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-600' },
  ABSENT: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

const ALL_STATUSES: ParticipantStatus[] = [
  'REGISTERED',
  'WHATSAPP JOINED',
  'DAY 1 ATTENDED',
  'DAY 2 ATTENDED',
  'DAY 3 ATTENDED',
  'MASTER CLASS INTERESTED',
  'PAYMENT PENDING',
  'PART PAYMENT',
  'FULL PAYMENT',
  'PAID STUDENT',
  'ABSENT',
];

export const ParticipantTable: React.FC<ParticipantTableProps> = ({
  participants = [],
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  isLoading,
  searchQuery,
  selectedDevice,
  selectedExperience,
  selectedSource,
  selectedStatus,
  selectedInterest,
  selectedIds = [],
  onSearchChange,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onToggleSelectId,
  onSelectAllVisible,
  onDeselectAll,
  onViewParticipant,
  onEditParticipant,
  onSendSingleEmail,
  onSendBulkEmail,
  onChangeStatus,
  onDeleteParticipant,
  onDownloadCSV,
  onOpenImportModal,
  onOpenAddParticipant,
  onResendConfirmation,
}) => {
  const safeParticipants = participants || [];
  const safeSelectedIds = selectedIds || [];
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendSuccessId, setResendSuccessId] = useState<string | null>(null);

  const handleResend = async (p: AdminParticipant) => {
    if (!onResendConfirmation) return;
    setResendingId(p.id);
    try {
      await onResendConfirmation(p);
      setResendSuccessId(p.id);
      setTimeout(() => setResendSuccessId(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to resend confirmation email');
    } finally {
      setResendingId(null);
    }
  };

  const isAllVisibleSelected =
    safeParticipants.length > 0 && safeParticipants.every((p) => safeSelectedIds.includes(p.id));

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDevice !== 'All' ||
    selectedExperience !== 'All' ||
    selectedSource !== 'All' ||
    selectedStatus !== 'All' ||
    selectedInterest !== 'All';

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4">
      {/* ---------------- 1. TOP HEADER & PRIMARY ACTION BUTTONS ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Participant Management</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">
              {totalCount} Total
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            View, filter, message, and export enrolled cohort students.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Add Participant Button */}
          {onOpenAddParticipant && (
            <button
              onClick={onOpenAddParticipant}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ADD PARTICIPANT</span>
            </button>
          )}

          {/* Send Bulk Email Button */}
          <button
            onClick={onSendBulkEmail}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>SEND BULK EMAIL</span>
          </button>

          {/* Download CSV */}
          <button
            onClick={onDownloadCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>DOWNLOAD CSV</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={onOpenImportModal}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>IMPORT CSV</span>
          </button>
        </div>
      </div>

      {/* ---------------- 2. SEARCH & MULTI-FILTER BAR ---------------- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search participants by name, email, or WhatsApp..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Status: All</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => onFilterChange('source', e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Source: All</option>
            <option value="Facebook">Facebook Ads</option>
            <option value="Instagram">Instagram Ads</option>
            <option value="Organic">Organic / Direct</option>
            <option value="Other">Other</option>
          </select>

          {/* Device Filter */}
          <select
            value={selectedDevice}
            onChange={(e) => onFilterChange('device', e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Device: All</option>
            <option value="Smartphone">Smartphone</option>
            <option value="Laptop">Laptop</option>
            <option value="Both">Both</option>
          </select>

          {/* Canva Experience */}
          <select
            value={selectedExperience}
            onChange={(e) => onFilterChange('canva_experience', e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Experience: All</option>
            <option value="Beginner">Beginner</option>
            <option value="Used Canva Before">Used Canva Before</option>
            <option value="Intermediate">Intermediate</option>
          </select>

          {/* Learning Interest */}
          <select
            value={selectedInterest}
            onChange={(e) => onFilterChange('learning_interest', e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Interest: All</option>
            <option value="Flyer Design">Flyer Design</option>
            <option value="Logo Design">Logo Design</option>
            <option value="Business Card">Business Card</option>
            <option value="Social Media Design">Social Media Design</option>
            <option value="Everything">Everything</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors whitespace-nowrap cursor-pointer"
            >
              CLEAR FILTERS
            </button>
          )}
        </div>

        {/* Bulk Action Sticky Strip (When selections exist) */}
        {safeSelectedIds.length > 0 && (
          <div className="p-3 bg-blue-50/90 rounded-xl border border-blue-200 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{safeSelectedIds.length} participants selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSendBulkEmail}
                className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Send Email ({safeSelectedIds.length})
              </button>
              <button
                onClick={onDeselectAll}
                className="px-3 py-1.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- 3. FULL PARTICIPANTS TABLE ---------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={() => {
                      if (isAllVisibleSelected) {
                        onDeselectAll();
                      } else {
                        onSelectAllVisible(safeParticipants.map((p) => p.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 font-extrabold">#</th>
                <th className="py-3.5 px-3 font-extrabold">FULL NAME</th>
                <th className="py-3.5 px-3 font-extrabold">EMAIL</th>
                <th className="py-3.5 px-3 font-extrabold">WHATSAPP</th>
                <th className="py-3.5 px-3 font-extrabold">DEVICE</th>
                <th className="py-3.5 px-3 font-extrabold">CANVA EXPERIENCE</th>
                <th className="py-3.5 px-3 font-extrabold">LEARNING INTEREST</th>
                <th className="py-3.5 px-3 font-extrabold">REG. DATE</th>
                <th className="py-3.5 px-3 font-extrabold">SOURCE</th>
                <th className="py-3.5 px-3 font-extrabold">CAMPAIGN</th>
                <th className="py-3.5 px-3 font-extrabold">STATUS</th>
                <th className="py-3.5 px-3 font-extrabold">EMAIL STATUS</th>
                <th className="py-3.5 pr-4 pl-2 text-right font-extrabold">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Loading participants from database...</span>
                    </div>
                  </td>
                </tr>
              ) : safeParticipants.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-16 text-center text-slate-400">
                    <p className="font-bold text-slate-700 text-sm">No participants found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {hasActiveFilters
                        ? 'Try clearing your search query or filters.'
                        : 'New student registrations will appear here in real time.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={onClearFilters}
                        className="mt-3 px-3.5 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                safeParticipants.map((p, idx) => {
                  const isSelected = safeSelectedIds.includes(p.id);
                  const statusStyle =
                    STATUS_COLORS[p.status] || STATUS_COLORS['REGISTERED'];
                  const recordIndex = (currentPage - 1) * pageSize + idx + 1;
                  const formattedIndex = String(recordIndex).padStart(3, '0');

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectId(p.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Number */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 font-semibold">
                        {formattedIndex}
                      </td>

                      {/* Full Name */}
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => onViewParticipant(p)}
                          className="hover:text-blue-600 text-left transition-colors cursor-pointer"
                        >
                          {p.full_name}
                        </button>
                        {p.ticket_number && (
                          <span className="block text-[10px] font-mono text-slate-400 font-normal">
                            {p.ticket_number}
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">
                        <a
                          href={`mailto:${p.email}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {p.email}
                        </a>
                      </td>

                      {/* WhatsApp */}
                      <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                        <a
                          href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-500" />
                          {p.whatsapp}
                        </a>
                      </td>

                      {/* Device */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {p.device === 'Smartphone' ? (
                            <Smartphone className="w-3 h-3 text-slate-400" />
                          ) : (
                            <Laptop className="w-3 h-3 text-slate-400" />
                          )}
                          {p.device}
                        </span>
                      </td>

                      {/* Canva Experience */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                          {p.canva_experience}
                        </span>
                      </td>

                      {/* Learning Interest */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap max-w-[150px] truncate">
                        {p.learning_interest}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-medium text-xs">
                        {formatExactRegistrationTime(p.registration_date, p.registration_time, p.created_at)}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.utm_source.toLowerCase().includes('facebook')
                              ? 'bg-blue-100 text-blue-800'
                              : p.utm_source.toLowerCase().includes('instagram')
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.utm_source || 'Organic'}
                        </span>
                      </td>

                      {/* Campaign */}
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {p.utm_campaign || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap relative">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setStatusDropdownId(
                                statusDropdownId === p.id ? null : p.id
                              )
                            }
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider flex items-center gap-1 cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            <span>{p.status}</span>
                            <span className="text-[9px] opacity-70">▼</span>
                          </button>

                          {/* Quick Status Dropdown Menu */}
                          {statusDropdownId === p.id && (
                            <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in">
                              <p className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                                Change Status
                              </p>
                              {ALL_STATUSES.map((st) => (
                                <button
                                  key={st}
                                  onClick={() => {
                                    onChangeStatus(p, st);
                                    setStatusDropdownId(null);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${
                                    p.status === st
                                      ? 'text-blue-600 bg-blue-50/50'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  <span>{st}</span>
                                  {p.status === st && <CheckCircle2 className="w-3 h-3" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Email Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {p.email_status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Delivered</span>
                          </span>
                        ) : p.email_status === 'failed' ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer"
                            title={p.email_error ? `Error: ${p.email_error}` : 'Delivery failed. Click resend icon to retry.'}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span>Failed {p.email_attempts && p.email_attempts > 1 ? `(${p.email_attempts}x)` : ''}</span>
                          </span>
                        ) : p.email_status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Queued</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                            <span>Not Sent</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-4 pl-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Resend Confirmation Email */}
                          <button
                            onClick={() => handleResend(p)}
                            disabled={resendingId === p.id}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              resendSuccessId === p.id
                                ? 'bg-emerald-50 text-emerald-600'
                                : p.email_status === 'failed'
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title={
                              resendSuccessId === p.id
                                ? 'Confirmation Sent!'
                                : p.email_status === 'failed'
                                ? 'Retry Failed Admission Email'
                                : 'Resend Admission Confirmation Email'
                            }
                          >
                            {resendingId === p.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                            ) : resendSuccessId === p.id ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => onViewParticipant(p)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Profile & Notes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSendSingleEmail(p)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Send Custom Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteParticipant(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Participant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ---------------- 4. PAGINATION FOOTER ---------------- */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-900">{totalCount > 0 ? startRecord : 0}</strong>–
              <strong className="text-slate-900">{endRecord}</strong> of{' '}
              <strong className="text-slate-900">{totalCount}</strong> participants
            </span>

            {/* Page size selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">| Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 font-bold text-slate-800">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
