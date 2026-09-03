import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { AdminParticipant, ParticipantStatus } from '../../types';
import { adminApi } from '../../utils/adminApi';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (participant: AdminParticipant) => void;
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

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [device, setDevice] = useState('Smartphone');
  const [canvaExperience, setCanvaExperience] = useState('Beginner');
  const [learningInterest, setLearningInterest] = useState('Everything');
  const [status, setStatus] = useState<ParticipantStatus>('REGISTERED');
  const [adminNotes, setAdminNotes] = useState('');
  const [sendConfirmation, setSendConfirmation] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !whatsappNumber.trim()) {
      setErrorMessage('Full name, email, and WhatsApp phone number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminApi.createParticipant({
        fullName: fullName.trim(),
        email: email.trim(),
        whatsappNumber: whatsappNumber.trim(),
        device,
        canvaExperience,
        learningInterest,
        status,
        adminNotes: adminNotes.trim(),
        sendConfirmation,
      });

      if (res.success && res.participant) {
        onCreated(res.participant);
        onClose();
      } else {
        setErrorMessage(res.message || 'Failed to create participant');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error registering participant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Manually Enroll Participant</h3>
              <p className="text-xs text-blue-300">Add a new student directly into the academy pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ibrahim Adeyemi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="08012345678 or +234..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Device</label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Smartphone">Smartphone</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Both">Both (Phone & Laptop)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience</label>
                <select
                  value={canvaExperience}
                  onChange={(e) => setCanvaExperience(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Used Canva Before">Used Canva Before</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ParticipantStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Learning Interest</label>
              <select
                value={learningInterest}
                onChange={(e) => setLearningInterest(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Everything">Complete Master Foundation (Everything)</option>
                <option value="Flyer Design">Flyers, Church & Business Posters</option>
                <option value="Social Media Graphics">Social Media Graphics & Carousels</option>
                <option value="Monetization">Client Acquisition & Design Monetization</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Internal Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes, referral info, or special instructions..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
              />
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendConfirmation}
                  onChange={(e) => setSendConfirmation(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-blue-950">
                  Send automated admission confirmation email with WhatsApp group link
                </span>
              </label>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enroll Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
