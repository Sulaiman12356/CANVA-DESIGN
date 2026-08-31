import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Smartphone,
  BookOpen,
  HelpCircle,
  FolderDown,
  Compass,
  ArrowRight
} from 'lucide-react';

interface BenefitsProps {
  onRegisterClick: () => void;
}

export const Benefits: React.FC<BenefitsProps> = ({ onRegisterClick }) => {
  const benefits = [
    {
      title: 'Beginner-Friendly Explanations',
      description: 'Zero high-sounding grammar or technical fluff. We explain design concepts using relatable, everyday examples.',
      icon: Sparkles,
    },
    {
      title: 'Practical Live Demonstrations',
      description: 'Watch step-by-step as designs are created live from a blank canvas so you understand every decision made.',
      icon: Zap,
    },
    {
      title: 'Learn From Phone or Laptop',
      description: 'You are not held back if you only have a mobile device. Everything taught works smoothly on both platforms.',
      icon: Smartphone,
    },
    {
      title: 'Real Design Fundamentals',
      description: 'You will not just learn where buttons are located; you will understand typography, layout and colour theory.',
      icon: Compass,
    },
    {
      title: 'Real Design Exercises',
      description: 'You will actively create real promotional flyers, social media banners, and logos to solidify your learning.',
      icon: CheckCircle2,
    },
    {
      title: 'Live Questions & Community',
      description: 'Get your questions answered directly during class sessions and receive helpful feedback on your submissions.',
      icon: HelpCircle,
    },
    {
      title: 'Curated Learning Resources',
      description: 'Access curated font pairings, color palettes, royalty-free asset libraries and design reference checklists.',
      icon: FolderDown,
    },
    {
      title: 'Direct Mentorship Guidance',
      description: 'Learn directly from Onifade Sulaiman (Mr. Clarity), who is committed to making digital skills accessible to everyone.',
      icon: BookOpen,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>The Clarity Difference</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            What Makes This Class{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600">
              Different?
            </span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg">
            This isn't designed to overwhelm you with complex jargon. It's designed to make Canva truly understandable.
          </p>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <span>✓</span>
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span className="text-emerald-700 font-bold">100% Practical</span>
                  <span>Feature #{index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center max-w-2xl mx-auto space-y-4">
          <p className="text-slate-700 text-sm sm:text-base font-medium italic">
            "Your design doesn't need 15 different elements to prove that you know Canva. Sometimes, the best thing you can add to a design is space."
          </p>
          <button
            onClick={onRegisterClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Experience the Difference — Join Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
