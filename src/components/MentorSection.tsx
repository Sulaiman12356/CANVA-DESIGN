import React from 'react';
import { SITE_CONFIG } from '../config';
import { MentorPortrait } from './MentorPortrait';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Quote,
  Target,
  Award,
  Globe,
  Compass
} from 'lucide-react';

interface MentorSectionProps {
  onRegisterClick: () => void;
}

export const MentorSection: React.FC<MentorSectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="mentor" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Background accents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Pill */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Meet Your Instructor</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            Hi, I'm Sulaiman —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600">
              Mr. Clarity.
            </span>
          </h2>
        </div>

        {/* Profile Card */}
        <div className="max-w-5xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-10 md:p-14 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Founder's Real Photograph Container */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
              <MentorPortrait size="lg" showBadge={true} />
              
              <div className="mt-6 text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  ONIFADE SULAIMAN
                </h3>
                <p className="text-sm font-bold text-sky-400">
                  MR. CLARITY
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Founder — Clarity Digital Academy
                </p>
                <div className="pt-2">
                  <span className="inline-block text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded-full">
                    “Learn Skills. Earn Globally.”
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Mentor Philosophy & Teaching Style */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                <p className="text-white font-bold text-lg sm:text-xl leading-snug">
                  I'm a digital skills mentor and the founder of Clarity Digital Academy.
                </p>

                <p>
                  I genuinely enjoy breaking complicated things down into simple, digestible steps.
                  Because when people understand the basics, learning stops feeling intimidating and stressful.
                </p>

                <div className="p-4 bg-blue-950/60 border border-blue-800/60 rounded-2xl text-white">
                  <p className="text-sky-300 font-bold text-base sm:text-lg">
                    "That's what clarity means to me."
                  </p>
                  <p className="text-slate-300 text-sm mt-1">
                    In this 3-day class, I won't just show you what buttons to press.
                    I'll show you how to think like someone who creates clean, balanced and purposeful designs.
                  </p>
                </div>
              </div>

              {/* 3 Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-xs font-bold text-sky-400 block">No Jargon</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Clear plain English</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-xs font-bold text-emerald-400 block">Patient Mentorship</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Questions welcomed</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-xs font-bold text-amber-400 block">Global Mindset</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">High standard outputs</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <button
                  onClick={onRegisterClick}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Learn Directly with Sulaiman (Mr. Clarity)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
