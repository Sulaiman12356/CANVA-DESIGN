import React from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle2, Cookie } from 'lucide-react';
import { SITE_CONFIG } from '../config';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Privacy Policy</h3>
              <p className="text-xs text-slate-500">Clarity Digital Academy • Last Updated 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            At <strong>Clarity Digital Academy</strong> (founded by Onifade Sulaiman / Mr. Clarity), we respect your privacy and are committed to protecting the personal information you share when registering for our <strong>Free 3-Day Canva Design Class</strong>.
          </p>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" /> 1. Information We Collect
            </h4>
            <p>When you register through this website, we collect:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Full Name</strong>: To personalize your certificate and learning materials.</li>
              <li><strong>Email Address</strong>: To deliver class schedule confirmations, calendar invites, and Canva template download links.</li>
              <li><strong>WhatsApp Phone Number</strong>: To verify your admission and facilitate your addition to the official interactive training group.</li>
              <li><strong>Learning Preferences & Device Info</strong>: To tailor tutorial pacing for smartphone and laptop users.</li>
              <li><strong>Attribution Data (UTM parameters & Referrers)</strong>: To measure advertising performance across Meta platforms (Facebook & Instagram Ads).</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> 2. How We Use Your Data
            </h4>
            <p>
              Your contact details are strictly used to organize the free class, send lecture links, and provide educational follow-ups. We do <strong>not sell, rent, or trade</strong> your personal contact information to third-party data brokers.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> 3. Meta Ads Measurement & Conversions API
            </h4>
            <p>
              This website employs Meta Pixel and Meta Conversions API (CAPI) with industry-standard cryptographic SHA-256 one-way hashing. This allows us to accurately measure advertising effectiveness on Facebook and Instagram without exposing plain-text sensitive credentials.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">4. Your Control & Rights</h4>
            <p>
              You may opt out of email communications at any time using the unsubscribe link included in all batch messages, or by leaving the WhatsApp group. For questions or data removal requests, contact our support team at <a href={`mailto:${SITE_CONFIG.EMAIL}`} className="text-blue-600 underline">{SITE_CONFIG.EMAIL}</a>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Terms of Participation</h3>
              <p className="text-xs text-slate-500">Clarity Digital Academy Free Masterclass</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Welcome to the <strong>Free 3-Day Canva Design Class</strong> hosted by <strong>Clarity Digital Academy</strong>. By registering for this free training, you agree to the following simple participation terms:
          </p>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">1. 100% Free Educational Training</h4>
            <p className="text-slate-600">
              The 3-day class curriculum, live demonstrations, and standard class templates are completely free of charge. No payment details are ever required to attend the cohort.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">2. Respectful Community Conduct</h4>
            <p className="text-slate-600">
              The official WhatsApp group is dedicated strictly to learning, asking design questions, and sharing practical assignments. Spamming, unsolicited direct messages to fellow students, or promotional advertising is strictly prohibited and leads to immediate removal.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">3. Trademark Notice</h4>
            <p className="text-slate-600">
              Canva® is a registered trademark of Canva Pty Ltd. Clarity Digital Academy is an independent digital skills training institution. This class is an independent educational program designed to teach design principles using accessible tools.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">4. Certificate of Completion</h4>
            <p className="text-slate-600">
              Certificates of completion are awarded to participants who complete the 3-day curriculum and submit the hands-on practical assignment for review.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Agree & Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface CookieNoticeProps {
  onAccept: () => void;
  onOpenPrivacy: () => void;
}

export const CookieNotice: React.FC<CookieNoticeProps> = ({ onAccept, onOpenPrivacy }) => {
  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-md bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
          <Cookie className="w-4 h-4" />
        </div>
        <div className="space-y-2 flex-grow">
          <p className="text-xs text-slate-300 leading-relaxed">
            We use essential cookies and Meta conversion tracking to measure ad performance and improve your class registration experience.{' '}
            <button
              onClick={onOpenPrivacy}
              className="text-sky-400 underline hover:text-sky-300 cursor-pointer"
            >
              Privacy Policy
            </button>
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onAccept}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
