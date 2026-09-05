import React from 'react';
import {
  Layers,
  Type,
  Palette,
  LayoutGrid,
  Share2,
  FileText,
  ShieldAlert,
  CreditCard,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Laptop
} from 'lucide-react';

interface LearningSectionProps {
  onRegisterClick: () => void;
}

export const LearningSection: React.FC<LearningSectionProps> = ({ onRegisterClick }) => {
  const learningModules = [
    {
      id: 'fundamentals',
      icon: Layers,
      title: 'Canva Fundamentals',
      description: "Understand Canva's workspace, tools, navigation, element libraries, templates and basic workflow without feeling overwhelmed.",
      tag: 'Core Setup',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
    },
    {
      id: 'typography',
      icon: Type,
      title: 'Typography & Font Pairing',
      description: 'Learn how font selection, sizing, line-height, letter spacing and pairing rules make your text clear, readable and commanding.',
      tag: 'Design Principle',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-600 text-white',
    },
    {
      id: 'colour',
      icon: Palette,
      title: 'Colour Theory & Balance',
      description: 'Understand how to choose harmonious color palettes, apply the 60-30-10 rule, and avoid messy clashing color combinations.',
      tag: 'Aesthetic Rule',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      iconBg: 'bg-sky-600 text-white',
    },
    {
      id: 'layout',
      icon: LayoutGrid,
      title: 'Layout & Alignment',
      description: 'Learn how to position elements properly, use smart alignment grids, and give your design ample whitespace to breathe.',
      tag: 'Visual Structure',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
    },
    {
      id: 'social',
      icon: Share2,
      title: 'Social Media Design',
      description: 'Create clean, scroll-stopping graphics, carousels, and promo banners tailored specifically for Instagram, WhatsApp, Facebook and X.',
      tag: 'Practical Output',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      iconBg: 'bg-amber-600 text-white',
    },
    {
      id: 'flyer',
      icon: FileText,
      title: 'Flyer Design',
      description: 'Learn how to structure event and business promotional flyers so potential customers instantly grasp the headline and key action.',
      tag: 'Marketing Asset',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-600 text-white',
    },
    {
      id: 'logo',
      icon: Sparkles,
      title: 'Logo Design Basics',
      description: 'Understand the core principles behind minimalist, memorable, and purposeful brand marks without overcomplicating shapes.',
      tag: 'Branding Skill',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
      iconBg: 'bg-violet-600 text-white',
    },
    {
      id: 'business-card',
      icon: CreditCard,
      title: 'Business Card Design',
      description: 'Master print dimensions, bleed awareness, contact hierarchy, and create a sleek, professional business card that leaves an impression.',
      tag: 'Print Ready',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
    },
    {
      id: 'devices',
      icon: Smartphone,
      title: 'Smartphone + Laptop Mastery',
      description: 'Learn how to work with Canva regardless of the device in your hands, switching smoothly between mobile app and laptop web browser.',
      tag: 'Any Device',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      iconBg: 'bg-cyan-600 text-white',
    },
  ];

  return (
    <section id="what-you-will-learn" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Comprehensive Syllabus</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            What You Will{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600">
              Learn In 3 Days
            </span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg">
            Every module is designed to give you practical, actionable design clarity you can use immediately.
          </p>
        </div>

        {/* 9 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningModules.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Icon & Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm mt-2.5 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Step-by-step practical
                  </span>
                  <span className="text-slate-400 font-mono">0{index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 sm:mt-16 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Ready to learn all 9 practical skills without paying a dime?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              Limited slots reserved for serious beginners who want to learn step-by-step.
            </p>
          </div>

          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Reserve My Free Spot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
