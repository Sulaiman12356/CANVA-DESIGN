import React from 'react';
import { SITE_CONFIG } from '../config';
import { CanvaWorkspaceVisual } from './CanvaWorkspaceVisual';
import { MentorPortrait } from './MentorPortrait';
import { trackInitiateRegistration } from '../utils/metaPixel';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Smartphone,
  Laptop,
  Award,
  MessageCircle,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface HeroProps {
  onRegisterClick: () => void;
  onLearnMoreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRegisterClick, onLearnMoreClick }) => {
  return (
    <section
      id="hero"
      className="relative pt-36 pb-16 sm:pt-44 sm:pb-24 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white"
    >
      {/* Decorative Subtle Grid & Geometry */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900 text-white text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-md shadow-blue-900/15">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>100% FREE • 3 DAYS • BEGINNER FRIENDLY</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Live Training with Onifade Sulaiman (Mr. Clarity)</span>
          </div>
        </div>

        {/* Main Headline & Human Copy */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15] uppercase">
            You Don't Need to Be a Designer to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500">
              Start Designing.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-700 font-medium max-w-3xl mx-auto leading-relaxed">
            {SITE_CONFIG.CLASS_SUBTITLE}
          </p>

          {/* Authentic First-Person Hook */}
          <div className="inline-block bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl py-3 px-5 sm:px-6 text-slate-700 text-sm sm:text-base font-normal shadow-sm">
            <p className="flex items-center justify-center gap-2 text-slate-800 italic">
              <span className="text-blue-600 font-serif text-lg font-bold">“</span>
              Maybe you've opened Canva before and wondered, <span className="font-semibold text-slate-900">'Where do I even start?'</span> That's exactly what we'll work through together.
              <span className="text-blue-600 font-serif text-lg font-bold">”</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                trackInitiateRegistration('Hero Main Button');
                onRegisterClick();
              }}
              id="hero-reserve-cta"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-3 group cursor-pointer"
            >
              <span>RESERVE MY FREE SPOT</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={onLearnMoreClick}
              id="hero-see-learning-cta"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-6 py-4 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>SEE WHAT I'LL LEARN</span>
            </button>
          </div>

          {/* Trust Line */}
          <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-tight flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Free practical training
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Beginner-friendly
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-slate-700">
              <Smartphone className="w-4 h-4 text-blue-600" /> Smartphone + <Laptop className="w-4 h-4 text-blue-600" /> Laptop
            </span>
          </p>
        </div>

        {/* Hero Visual Mockup Section */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
          <CanvaWorkspaceVisual />
        </div>

        {/* 4 Core Value Pillars (Matching conversion prototype) */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center mb-2.5">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">No Experience Needed</h4>
            <p className="text-xs text-slate-500 mt-1">Start completely from scratch</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 mx-auto flex items-center justify-center mb-2.5">
              <Laptop className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Practical Training</h4>
            <p className="text-xs text-slate-500 mt-1">Real step-by-step design exercises</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-2.5">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Live on WhatsApp</h4>
            <p className="text-xs text-slate-500 mt-1">Ask questions and get answers</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 mx-auto flex items-center justify-center mb-2.5">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Certificate of Completion</h4>
            <p className="text-xs text-slate-500 mt-1">Celebrate your 3-day milestone</p>
          </div>
        </div>

        {/* Statement Bar */}
        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm font-extrabold tracking-wider text-slate-500 uppercase">
            3 DAYS THAT COULD <span className="text-blue-700 underline decoration-amber-400 decoration-2 underline-offset-4">CHANGE YOUR SKILLSET</span> FOREVER.
          </p>
        </div>

      </div>
    </section>
  );
};
