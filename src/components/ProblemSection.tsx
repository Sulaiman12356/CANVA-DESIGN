import React from 'react';
import {
  HelpCircle,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  MousePointerClick
} from 'lucide-react';

interface ProblemSectionProps {
  onRegisterClick: () => void;
}

export const ProblemSection: React.FC<ProblemSectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="the-problem" className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-800 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>The Reality Check</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            You Have Canva. But Do You{' '}
            <span className="text-blue-700 underline decoration-sky-400 decoration-wavy decoration-2">
              Really Know How to Design?
            </span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg">
            Let's be honest about what happens when most beginners open the Canva app.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Conversational Experience Breakdown */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-medium">
                A lot of people have Canva installed on their phones right now.
              </p>
              
              <ul className="space-y-2.5 text-slate-700 text-sm sm:text-base">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <span>They can easily pick a template.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <span>Change the text.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <span>Change the colours and download the image.</span>
                </li>
              </ul>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 text-amber-900 text-sm sm:text-base font-semibold">
                <p className="leading-snug">
                  👉 But when they try to create something from a blank canvas... everything suddenly becomes confusing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Where should the headline go?</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Which font should I pair?</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>What colours work together?</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Why does it still look "off"?</span>
                </div>
              </div>
            </div>

            {/* Core Golden Rule Callouts */}
            <div className="space-y-3">
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                  💡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider">The Fundamental Truth</h4>
                  <p className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                    "Knowing where the buttons are in Canva doesn't automatically make you a designer."
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-lg flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                  🎯
                </div>
                <div>
                  <h4 className="text-sm font-bold text-sky-200 uppercase tracking-wider">What We Solve</h4>
                  <p className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                    "Canva is the tool. Knowing what to do with the tool is the skill."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Comparison (Struggling vs Design Principles) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 text-center">
                Visual Comparison: Why Most Beginner Designs Look Cluttered
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Struggling / Cluttered Card */}
                <div className="bg-slate-100 rounded-2xl p-4 border border-rose-200 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Cluttered / Unclear
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Without Principles</span>
                  </div>

                  {/* Bad visual demo */}
                  <div className="bg-yellow-200/90 text-red-600 p-3 rounded-xl border-2 border-dashed border-red-400 text-center space-y-2">
                    <p className="font-serif italic font-black text-sm tracking-widest uppercase">
                      🎉 BIG PROMO BUY NOW!! 🔥
                    </p>
                    <div className="bg-emerald-400 text-purple-900 p-1 text-[10px] font-bold">
                      MULTIPLE COMPETING FONTS
                    </div>
                    <div className="flex justify-center gap-1 text-[8px] font-black text-blue-900">
                      <span>NO WHITE SPACE</span>
                      <span>RANDOM STICKERS</span>
                    </div>
                    <p className="text-[9px] bg-white text-black p-1">Contact: 0800000000000000</p>
                  </div>

                  <ul className="mt-3 space-y-1 text-[11px] text-slate-600">
                    <li className="text-rose-700 font-medium">• 5 different fonts competing</li>
                    <li className="text-rose-700 font-medium">• No breathing room/margin</li>
                    <li className="text-rose-700 font-medium">• Clashing colours with zero contrast</li>
                  </ul>
                </div>

                {/* Professional Clarity Design */}
                <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-200 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Clean & Intentional
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">With Mr. Clarity</span>
                  </div>

                  {/* Good visual demo */}
                  <div className="bg-white text-slate-900 p-3 rounded-xl border border-slate-200 shadow-sm text-center space-y-2">
                    <span className="text-[9px] font-bold tracking-widest text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">
                      LIMITED OFFER
                    </span>
                    <h5 className="font-black text-sm text-slate-950 tracking-tight leading-tight">
                      Clarity Starts Here.
                    </h5>
                    <p className="text-[10px] text-slate-600 font-medium leading-tight">
                      Intentional alignment, balanced contrast and clear visual hierarchy.
                    </p>
                    <div className="pt-1">
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-md inline-block">
                        Learn More
                      </span>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1 text-[11px] text-slate-700">
                    <li className="text-emerald-700 font-medium">• 1-2 intentional font pairs</li>
                    <li className="text-emerald-700 font-medium">• Balanced whitespace and padding</li>
                    <li className="text-emerald-700 font-medium">• Clear visual hierarchy</li>
                  </ul>
                </div>

              </div>

              <div className="mt-5 p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs sm:text-sm text-center font-medium">
                "In 3 days, you'll learn why good designs look good and how to recreate that result effortlessly."
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 underline decoration-2 underline-offset-4 cursor-pointer"
              >
                <span>Join the 3-day class to fix your design foundation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
