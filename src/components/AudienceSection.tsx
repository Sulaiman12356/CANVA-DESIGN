import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Store,
  Video,
  Share2,
  PenTool,
  UserCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface AudienceSectionProps {
  onRegisterClick: () => void;
}

export const AudienceSection: React.FC<AudienceSectionProps> = ({ onRegisterClick }) => {
  const audiences = [
    {
      title: 'Students',
      description: 'Acquire a practical, globally marketable digital skill to design presentations, flyers and generate extra income.',
      icon: GraduationCap,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Entrepreneurs',
      description: 'Stop waiting on expensive graphic designers for basic promo graphics. Design your business assets on demand.',
      icon: Briefcase,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      title: 'Small Business Owners',
      description: 'Create eye-catching price lists, promotional banners, WhatsApp status updates and product catalogues easily.',
      icon: Store,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Content Creators',
      description: 'Design scroll-stopping YouTube thumbnails, Instagram carousels, TikTok covers and brand templates that build an audience.',
      icon: Video,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Social Media Managers',
      description: 'Level up client campaigns with cohesive color schemes, crisp typography, and high-converting visual assets.',
      icon: Share2,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Aspiring Graphic Designers',
      description: 'Build a solid grasp of fundamental design principles before diving into advanced tools like Photoshop or Illustrator.',
      icon: PenTool,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      title: 'Personal Brands',
      description: 'Present yourself professionally across LinkedIn, X, and WhatsApp with sleek header banners and quote graphics.',
      icon: UserCheck,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      title: 'Complete Beginners',
      description: 'Anyone who has never designed anything before and wants a friendly, patient mentor to guide them step-by-step.',
      icon: Sparkles,
      color: 'text-cyan-600 bg-cyan-50',
    },
  ];

  const reassuringTruths = [
    "You don't need previous design experience.",
    "You don't need an expensive laptop.",
    "You don't need Canva Pro to start learning.",
    "You simply need the willingness to learn and practise.",
  ];

  return (
    <section id="who-should-join" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Target Audience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            You Don't Have to Be 'Creative'{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600">
              Before You Join.
            </span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg">
            Design isn't magical talent. It is a learnable skill with clear rules and practical formulas.
          </p>
        </div>

        {/* 8 Audience Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {audiences.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-4 font-bold`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ideal Participant</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Reassuring Truths Card */}
        <div className="mt-12 max-w-4xl mx-auto bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
          <div className="text-center mb-6">
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800">
              Zero Pressure • Genuine Value
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
              What You Actually Need to Get Started:
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reassuringTruths.map((truth, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-100">{truth}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onRegisterClick}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Register Free for the Class</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
