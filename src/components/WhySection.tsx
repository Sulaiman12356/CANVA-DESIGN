import React from 'react';
import { SITE_CONFIG } from '../config';
import { MentorPortrait } from './MentorPortrait';
import {
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Quote,
  Target,
  GraduationCap
} from 'lucide-react';

interface WhySectionProps {
  onRegisterClick: () => void;
}

export const WhySection: React.FC<WhySectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="why-free" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Decorative ambient background accent */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Pill */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-extrabold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
            <span>A Personal Note From The Mentor</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            Why I Decided to Teach This{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600">
              For Free
            </span>
          </h2>
        </div>

        {/* Narrative Card */}
        <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border border-slate-800 relative">
          
          {/* Top Quote Icon */}
          <div className="absolute -top-5 left-8 sm:left-12 w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Quote className="w-5 h-5 fill-white" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
            
            {/* Story Text */}
            <div className="md:col-span-8 space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              
              <p className="text-white font-bold text-lg sm:text-xl leading-snug">
                I didn't create this class because I think everyone must become a full-time graphic designer.
              </p>

              <p>
                I created it because I've seen so many people with genuinely good ideas struggle to communicate those ideas visually.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-2">
                <div className="flex items-center gap-2 text-sm text-slate-200 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                  <span>Some people want to start a business.</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-200 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                  <span>Some want to promote their services.</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-200 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                  <span>Some want to create content online.</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-200 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                  <span>Some are students seeking a valuable skill.</span>
                </div>
              </div>

              <p>
                But they don't know where to start. And sometimes, the high cost of courses becomes another barrier that stops people before they even begin.
              </p>

              <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-800/60 text-white font-medium space-y-1">
                <p className="text-sky-300 font-bold text-base">So I thought: Why not create a simple starting point?</p>
                <p className="text-slate-300 text-sm sm:text-base">
                  Three days. No complicated theory. No pressure. Just learning, practising, and understanding how Canva actually works.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <div>
                  <h4 className="text-white font-bold text-base sm:text-lg">Onifade Sulaiman</h4>
                  <p className="text-sky-400 text-xs sm:text-sm font-medium">
                    Mr. Clarity • Founder, Clarity Digital Academy
                  </p>
                </div>
              </div>

            </div>

            {/* Mentor Portrait Card on Right */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
              <MentorPortrait size="lg" showBadge={false} className="mx-auto" />
              <div className="mt-4 bg-slate-800/90 border border-slate-700 p-3 rounded-2xl text-center w-full max-w-[260px]">
                <p className="text-xs font-bold text-white">Onifade Sulaiman</p>
                <p className="text-[11px] text-sky-400 font-medium">Also known as Mr. Clarity</p>
                <p className="text-[10px] text-slate-400 mt-1">"Learn Skills. Earn Globally."</p>
              </div>
            </div>

          </div>

          {/* Bottom Action */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              <span className="text-emerald-400 font-bold">100% Free Training</span> • Open to all beginners across Africa & beyond
            </div>
            <button
              onClick={onRegisterClick}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>Accept Free Invitation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
