import React from 'react';
import { SITE_CONFIG } from '../config';
import {
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Laptop,
  Smartphone,
  ShieldCheck,
  Award
} from 'lucide-react';

interface SocialProofProps {
  onRegisterClick: () => void;
}

export const SocialProof: React.FC<SocialProofProps> = ({ onRegisterClick }) => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Community & Learning Standards</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            What to Expect in the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600">
              Live Classroom
            </span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg">
            We believe in honest, practical learning. Here is how our 3-day class community operates.
          </p>
        </div>

        {/* 3 Pillars of the Classroom Experience */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Interactive WhatsApp Group
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              You will be added to the official cohort group where daily class links, practice templates, and prompts are shared promptly at 8:00 PM WAT.
            </p>
            <div className="pt-2 text-xs font-semibold text-blue-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Live Q&A Sessions
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Hands-On Design Reviews
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              You will submit your Day 2 and Day 3 design exercises. Mr. Clarity reviews common mistakes in real time so everyone learns how to improve.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Constructive Feedback
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Official Digital Certificate
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Participants who complete all 3 days and submit their practical project receive a verified Clarity Digital Academy Certificate of Completion.
            </p>
            <div className="pt-2 text-xs font-semibold text-indigo-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Verified Milestone
            </div>
          </div>

        </div>

        {/* Commitment Statement */}
        <div className="mt-10 max-w-3xl mx-auto p-5 bg-blue-50/70 border border-blue-100 rounded-2xl text-center text-xs sm:text-sm text-slate-700 font-medium">
          <p>
            🛡️ <span className="font-bold text-slate-900">100% Free & Transparent:</span> There are no surprise hidden fees to attend this 3-day class. You only need your device and an active internet connection.
          </p>
        </div>

      </div>
    </section>
  );
};
