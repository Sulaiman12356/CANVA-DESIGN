import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  MessageCircle,
  Smartphone,
  Laptop,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  Share2,
  FileText,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
} from 'lucide-react';
import { AdminParticipant, ParticipantStatus } from '../../types';
import { STATUS_COLORS } from './ParticipantTable';

interface ParticipantDetailDrawerProps {
  participant: AdminParticipant | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<AdminParticipant>) => Promise<void>;
  onDelete: (participant: AdminParticipant) => void;
  onSendEmail: (participant: AdminParticipant) => void;
}

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

export const ParticipantDetailDrawer: React.FC<ParticipantDetailDrawerProps> = ({
  participant,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onSendEmail,
}) => {
  if (!isOpen || !participant) return null;

  const [status, setStatus] = useState<ParticipantStatus>(participant.status);
  const [whatsappJoined, setWhatsappJoined] = useState(participant.whatsapp_joined);
  const [attDay1, setAttDay1] = useState(participant.attendance_day_1);
  const [attDay2, setAttDay2] = useState(participant.attendance_day_2);
  const [attDay3, setAttDay3] = useState(participant.attendance_day_3);
  const [masterclassInterest, setMasterclassInterest] = useState(participant.masterclass_interest);
  const [adminNotes, setAdminNotes] = useState(participant.admin_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setStatus(participant.status);
    setWhatsappJoined(participant.whatsapp_joined);
    setAttDay1(participant.attendance_day_1);
    setAttDay2(participant.attendance_day_2);
    setAttDay3(participant.attendance_day_3);
    setMasterclassInterest(participant.masterclass_interest);
    setAdminNotes(participant.admin_notes || '');
    setSaveSuccess(false);
  }, [participant]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdate(participant.id, {
        status,
        whatsapp_joined: whatsappJoined,
        attendance_day_1: attDay1,
        attendance_day_2: attDay2,
        attendance_day_3: attDay3,
        masterclass_interest: masterclassInterest,
        admin_notes: adminNotes,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update participant:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const statusStyle = STATUS_COLORS[status] || STATUS_COLORS['REGISTERED'];
  const waClean = participant.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              {participant.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white leading-tight">
                {participant.full_name}
              </h3>
              <p className="text-xs text-blue-300 font-mono">
                {participant.ticket_number || `ID: ${participant.id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Quick Action Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Pipeline Status
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {status}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ParticipantStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onSendEmail(participant)}
                className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Direct Email</span>
              </button>

              <a
                href={`https://wa.me/${waClean}?text=Hello%20${encodeURIComponent(
                  participant.full_name
                )},%20this%20is%20Mr.%20Clarity%20from%20Clarity%20Digital%20Academy.`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Student Profile Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Registration Profile
            </h4>

            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-semibold text-slate-900 break-all">{participant.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">WhatsApp Phone</span>
                <span className="font-mono font-semibold text-slate-900">{participant.whatsapp}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Primary Device</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  {participant.device === 'Smartphone' ? (
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  {participant.device}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Canva Experience</span>
                <span className="font-semibold text-slate-800">{participant.canva_experience}</span>
              </div>

              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Learning Interest</span>
                <span className="font-semibold text-blue-600">{participant.learning_interest}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Registration Date</span>
                <span className="font-medium text-slate-700">
                  {participant.registration_date} {participant.registration_time}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Last Email Status</span>
                <span className="font-medium text-slate-700 uppercase text-[11px]">
                  {participant.email_status || 'none'}
                  {participant.last_email_sent && ` (${participant.last_email_sent.slice(0, 10)})`}
                </span>
              </div>
            </div>
          </div>

          {/* Ad & Campaign Attribution */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              Meta Ads Attribution (UTMs)
            </h4>

            <div className="grid grid-cols-2 gap-2.5 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">UTM Source</span>
                <span className="font-bold text-slate-800">{participant.utm_source || 'Direct / Organic'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">UTM Medium</span>
                <span className="font-semibold text-slate-700">{participant.utm_medium || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Campaign Name</span>
                <span className="font-semibold text-slate-700">{participant.utm_campaign || '—'}</span>
              </div>
              {participant.utm_content && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Ad Content</span>
                  <span className="font-medium text-slate-700">{participant.utm_content}</span>
                </div>
              )}
              {participant.utm_term && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Ad Keyword / Term</span>
                  <span className="font-medium text-slate-700">{participant.utm_term}</span>
                </div>
              )}
            </div>
          </div>

          {/* Attendance & Engagement Checkboxes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Cohort Engagement & Attendance Trackers
            </h4>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappJoined}
                  onChange={(e) => setWhatsappJoined(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-bold text-slate-800">WhatsApp Group Joined</span>
              </label>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attDay1}
                    onChange={(e) => setAttDay1(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">Day 1 Attended</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attDay2}
                    onChange={(e) => setAttDay2(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">Day 2 Attended</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attDay3}
                    onChange={(e) => setAttDay3(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">Day 3 Attended</span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={masterclassInterest}
                    onChange={(e) => setMasterclassInterest(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="font-bold text-amber-900">
                    Interested in Paid Master Class & Mentorship
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Private Admin Notes
            </label>
            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Spoke on WhatsApp, interested in logo design masterclass, will pay by Friday..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Bottom Save & Delete Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => onDelete(participant)}
            className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Student</span>
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Notes & Status'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
