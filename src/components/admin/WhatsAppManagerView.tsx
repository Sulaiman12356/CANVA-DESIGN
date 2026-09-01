import React, { useState } from 'react';
import {
  MessageCircle,
  Copy,
  ExternalLink,
  CheckCircle2,
  Users,
  ShieldCheck,
  Info,
  Send,
  Sparkles,
} from 'lucide-react';
import { ClassSettings, CRMStats, AdminParticipant } from '../../types';
import { adminApi } from '../../utils/adminApi';

interface WhatsAppManagerViewProps {
  classSettings: ClassSettings | null;
  stats: CRMStats | null;
  participants: AdminParticipant[];
  onSettingsUpdated: (s: ClassSettings) => void;
  onRefreshData: () => void;
}

export const WhatsAppManagerView: React.FC<WhatsAppManagerViewProps> = ({
  classSettings,
  stats,
  participants = [],
  onSettingsUpdated,
  onRefreshData,
}) => {
  const safeParticipants = participants || [];
  const [groupLink, setGroupLink] = useState(
    classSettings?.whatsapp_group_link || 'https://chat.whatsapp.com/sample-canva-group'
  );
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const total = stats?.total || 0;
  const whatsappJoined = stats?.whatsappJoined || 0;
  const rate = total > 0 ? Math.round((whatsappJoined / total) * 100) : 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(groupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveLink = async () => {
    if (!groupLink.trim()) return;
    setIsSaving(true);
    try {
      const updated = await adminApi.updateClassSettings({
        whatsapp_group_link: groupLink.trim(),
      });
      onSettingsUpdated(updated);
      setFeedback('WhatsApp group link updated successfully!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkMarkJoined = async () => {
    const unjoined = safeParticipants.filter((p) => !p.whatsapp_joined);
    if (unjoined.length === 0) {
      alert('All currently visible participants are already marked as WhatsApp Joined!');
      return;
    }

    if (
      !window.confirm(
        `Mark ${unjoined.length} visible participants as "WHATSAPP JOINED"?`
      )
    ) {
      return;
    }

    try {
      for (const p of unjoined) {
        await adminApi.updateParticipant(p.id, {
          whatsapp_joined: true,
          status: 'WHATSAPP JOINED',
        });
      }
      onRefreshData();
      setFeedback(`Marked ${unjoined.length} participants as WhatsApp Joined!`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert('Error updating participants');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <span>WhatsApp Cohort Community Manager</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Manage your student WhatsApp community link, track group join conversions, and update student statuses.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Conversion Overview Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
          <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-tight">
            IN WHATSAPP GROUP
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">
            {whatsappJoined}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">{rate}% join rate</span>
        </div>

        <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100">
          <span className="text-[11px] font-bold uppercase text-blue-800 tracking-tight">
            TOTAL REGISTERED
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">{total}</p>
          <span className="text-[11px] text-blue-700 font-semibold">Total Students</span>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-100">
          <span className="text-[11px] font-bold uppercase text-amber-800 tracking-tight">
            PENDING JOIN
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">
            {Math.max(0, total - whatsappJoined)}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold">Need Reminder Email</span>
        </div>
      </div>

      {/* Group Link Control */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">Official Cohort WhatsApp Group Link</h3>
        <p className="text-xs text-slate-500">
          This link is embedded across your landing page buttons, registration thank you pass, and automated email confirmation sequences.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={groupLink}
            onChange={(e) => setGroupLink(e.target.value)}
            placeholder="https://chat.whatsapp.com/..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSaveLink}
            disabled={isSaving}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Link'}
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Group Link'}</span>
          </button>

          <a
            href={groupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Group in WhatsApp</span>
          </a>
        </div>
      </div>

      {/* WhatsApp Cloud API & Verification Guidance */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>WhatsApp Verification Guidance</span>
        </h4>
        <div className="text-xs text-slate-600 leading-relaxed space-y-2">
          <p>
            When students click <strong>"JOIN WHATSAPP CLASS GROUP"</strong> on the registration page or in their email, Meta Pixel tracks the <code>WhatsAppClick</code> event.
          </p>
          <p>
            Because WhatsApp group membership is private within WhatsApp, you can mark students as <strong>"WHATSAPP JOINED"</strong> manually in the CRM table or use the bulk update shortcut below once you cross-check member names with your group list.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleBulkMarkJoined}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Mark All Currently Visible Students as WhatsApp Joined
          </button>
        </div>
      </div>
    </div>
  );
};
