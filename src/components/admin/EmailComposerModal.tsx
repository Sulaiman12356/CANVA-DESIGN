import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  Send,
  Sparkles,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Users,
  Copy,
  Info,
} from 'lucide-react';
import { AdminParticipant, EmailTemplate, ClassSettings } from '../../types';
import { adminApi } from '../../utils/adminApi';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetParticipant: AdminParticipant | null;
  bulkParticipantIds: string[];
  totalEligibleCount?: number;
  templates: EmailTemplate[];
  classSettings: ClassSettings | null;
  onEmailSentSuccess: () => void;
}

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({
  isOpen,
  onClose,
  targetParticipant,
  bulkParticipantIds = [],
  totalEligibleCount = 0,
  templates = [],
  classSettings,
  onEmailSentSuccess,
}) => {
  if (!isOpen) return null;

  const safeBulkParticipantIds = bulkParticipantIds || [];
  const safeTemplates = templates || [];
  const isBulk = !targetParticipant && safeBulkParticipantIds.length > 0;
  const recipientCount = isBulk ? safeBulkParticipantIds.length : targetParticipant ? 1 : 0;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load selected template
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;
    const t = safeTemplates.find((item) => item.id === templateId);
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
  };

  // Variable insertion
  const insertVariable = (variable: string) => {
    if (!textareaRef.current) {
      setBody((prev) => prev + variable);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newBody = body.substring(0, start) + variable + body.substring(end);
    setBody(newBody);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + variable.length, start + variable.length);
      }
    }, 50);
  };

  // Render preview with sample data
  const renderPreview = (text: string) => {
    const sample = targetParticipant || {
      full_name: 'Sulaiman Onifade',
      email: 'student@example.com',
      whatsapp: '+2348012345678',
    };

    const firstName = sample.full_name.split(' ')[0] || 'Friend';
    return text
      .replace(/{{first_name}}/g, firstName)
      .replace(/{{full_name}}/g, sample.full_name)
      .replace(/{{email}}/g, sample.email)
      .replace(/{{whatsapp}}/g, sample.whatsapp)
      .replace(/{{class_name}}/g, classSettings?.class_name || 'Free 3-Day Canva Design Class')
      .replace(/{{class_date}}/g, classSettings?.class_date || 'Coming Friday')
      .replace(/{{class_time}}/g, classSettings?.class_time || '8:00 PM (WAT)')
      .replace(/{{class_link}}/g, classSettings?.class_link || 'https://meet.google.com/cda-canva')
      .replace(
        /{{whatsapp_link}}/g,
        classSettings?.whatsapp_group_link || 'https://chat.whatsapp.com/sample'
      );
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in both Subject and Message Body.' });
      return;
    }

    if (isBulk && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    setShowConfirmDialog(false);
    setIsSending(true);
    setStatusMessage(null);

    try {
      if (isBulk) {
        const res = await adminApi.sendBulkEmail(bulkParticipantIds, subject, body);
        setStatusMessage({
          type: 'success',
          text: `Success! Email broadcast dispatched to ${bulkParticipantIds.length} participants (${res.stats?.mode || 'queued'}).`,
        });
      } else if (targetParticipant) {
        const res = await adminApi.sendEmail(targetParticipant.id, subject, body);
        setStatusMessage({
          type: 'success',
          text: `Email successfully sent to ${targetParticipant.full_name} (${targetParticipant.email})!`,
        });
      }

      onEmailSentSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to send email. Please check your email configuration in settings.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const variables = [
    { label: 'First Name', tag: '{{first_name}}' },
    { label: 'Full Name', tag: '{{full_name}}' },
    { label: 'Email', tag: '{{email}}' },
    { label: 'WhatsApp', tag: '{{whatsapp}}' },
    { label: 'Class Name', tag: '{{class_name}}' },
    { label: 'Class Date', tag: '{{class_date}}' },
    { label: 'Class Time', tag: '{{class_time}}' },
    { label: 'WhatsApp Group Link', tag: '{{whatsapp_link}}' },
    { label: 'Class Room Link', tag: '{{class_link}}' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {isBulk ? `Bulk Email Broadcast (${recipientCount} Recipients)` : 'Send Student Email'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBulk
                  ? 'Personalized email to all selected cohort participants'
                  : `Direct communication with ${targetParticipant?.full_name}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-3.5 px-6 text-xs font-bold flex items-center gap-2 shrink-0 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Controls: Edit vs Preview */}
        <div className="px-6 pt-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
          {/* Template Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Template:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">-- Choose Pre-Built Template --</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Edit Composer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'edit' ? (
            <>
              {/* Personalization chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Insert Dynamic Personalization Tag
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {variables.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => insertVariable(v.tag)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-[11px] font-mono font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      + {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Your Canva Class Access Link is Ready! 🎨"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Message Body (Plain Text or HTML)
                </label>
                <textarea
                  ref={textareaRef}
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your message here. You can use tags like {{first_name}}..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all leading-relaxed placeholder:text-slate-400"
                />
              </div>
            </>
          ) : (
            /* Live Preview Panel */
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Below is a real-time sample preview with dynamic tags replaced for{' '}
                  <strong>{targetParticipant?.full_name || 'Sulaiman Onifade'}</strong>.
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-xs space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Subject</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {renderPreview(subject) || '(No subject specified)'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">
                    Rendered Message
                  </span>
                  <div className="whitespace-pre-wrap text-xs text-slate-800 leading-relaxed font-sans bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    {renderPreview(body) || '(No body text entered)'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Double Confirmation Dialog Modal */}
        {showConfirmDialog && (
          <div className="p-4 bg-amber-50 border-t border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-extrabold">Confirm Bulk Delivery?</p>
                <p className="text-[11px] text-amber-800">
                  You are about to dispatch this email to <strong>{bulkParticipantIds.length}</strong> participants.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-3 py-1.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
              >
                {isSending ? 'Dispatching...' : 'Yes, Send Now'}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        {!showConfirmDialog && (
          <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !body.trim()}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSending
                  ? 'Sending...'
                  : isBulk
                  ? `Send to ${recipientCount} Students`
                  : 'Send Email Now'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
