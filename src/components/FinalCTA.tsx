import React from 'react';
import { SITE_CONFIG } from '../config';
import { trackInitiateRegistration } from '../utils/metaPixel';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  HeartHandshake,
  Flame
} from 'lucide-react';

import { PublicClassSettings, ClassSettings } from '../types';

interface FinalCTAProps {
  onRegisterClick: () => void;
  classSettings?: PublicClassSettings | ClassSettings | null;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onRegisterClick, classSettings }) => {
  const isClosed =
    classSettings?.registration_status === 'CLOSED' ||
    (classSettings as any)?.registrationStatus === 'CLOSED';
  const ctaText =
    classSettings?.cta_button_text ||
    (classSettings as any)?.ctaButtonText ||
    'RESERVE MY FREE SPOT';
  return (
    <section className="py-20 sm:py-28 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Gradients & Geometry */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/80 border border-blue-700/60 text-sky-300 text-xs font-black tracking-wider uppercase">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>100% FREE • 3 DAYS • BEGINNER FRIENDLY</span>
        </div>

        {/* Headline */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.15]">
            You've Been Saying{' '}
            <span className="text-slate-400 block sm:inline">"I'll Learn It Someday."</span>
          </h2>
          <p className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 tracking-tight">
            Maybe someday can be today.
          </p>
        </div>

        {/* Human Persuasion Copy */}
        <div className="max-w-2xl mx-auto space-y-3 text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
          <p>
            Three days from now, you could still be struggling to figure out confusing Canva templates... or you could be confidently creating your own clean, attractive designs from scratch.
          </p>
          <p className="text-white font-semibold">
            The class is completely free. All you have to do is take the first step.
          </p>
        </div>

        {/* Main Big CTA Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              trackInitiateRegistration('Final Section Reserve Button');
              onRegisterClick();
            }}
            id="final-section-reserve-btn"
            className={`w-full sm:w-auto font-extrabold text-lg sm:text-xl px-10 py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 cursor-pointer group ${
              isClosed
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-blue-600/40 hover:shadow-blue-600/60'
            }`}
          >
            <span>{isClosed ? 'REGISTRATION CLOSED' : ctaText}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Registration
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Smartphone & Laptop Supported
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Certificate of Completion
          </span>
        </div>

        {/* Mentor Sign-off */}
        <div className="pt-8 border-t border-slate-900 text-xs text-slate-500">
          <p>Taught by Onifade Sulaiman (Mr. Clarity) • Clarity Digital Academy</p>
          <p className="text-slate-400 font-bold mt-0.5">“Learn Skills. Earn Globally.”</p>
        </div>

      </div>
    </section>
  );
};
