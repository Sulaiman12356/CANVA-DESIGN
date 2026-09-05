import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Laptop,
  Layers,
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DayCurriculum } from '../types';
import { trackInitiateRegistration, trackViewContent } from '../utils/metaPixel';

interface CurriculumProps {
  onRegisterClick: () => void;
}

export const Curriculum: React.FC<CurriculumProps> = ({ onRegisterClick }) => {
  const [activeDay, setActiveDay] = useState<number>(1);

  const handleDaySelect = (dayNum: number) => {
    setActiveDay(dayNum);
    trackViewContent(`Curriculum Day ${dayNum}`);
  };

  const days: DayCurriculum[] = [
    {
      dayNumber: 1,
      title: 'UNDERSTANDING CANVA',
      subtitle: 'From interface confusion to navigation clarity',
      humanDescription:
        "By the end of Day 1, Canva shouldn't look like a room full of buttons anymore. You'll know what you're looking at and where to start.",
      topics: [
        'What is Canva vs What is Graphic Design?',
        'Navigating the Canva workspace (Desktop & Mobile)',
        'Understanding Templates, Elements, and Uploads',
        'Text boxes, formatting, and page management',
        'Smartphone vs Laptop workflow nuances',
        'Basic tools, shortcuts, and canvas setup',
      ],
      practicalOutcome: 'Complete comfort navigating the Canva dashboard without hesitation.',
    },
    {
      dayNumber: 2,
      title: 'THE FUNDAMENTALS OF GOOD DESIGN',
      subtitle: 'The secret rules that make designs look premium',
      humanDescription:
        'This is where we stop simply moving things around and start understanding WHY good designs look good.',
      topics: [
        'Typography: Font pairing, sizing, and line height',
        'Colour harmony: The 60-30-10 rule and emotional palettes',
        'Contrast: Making words jump off the screen easily',
        'Alignment & Grid systems: No more crooked elements',
        'Visual hierarchy: Guiding the viewer\'s eyes intentionally',
        'Spacing & Balance: Giving your designs room to breathe',
      ],
      practicalOutcome: 'The ability to fix an "ugly" design and turn it into a clean, balanced graphic.',
    },
    {
      dayNumber: 3,
      title: "LET'S ACTUALLY DESIGN",
      subtitle: 'Hands-on creation from scratch to export',
      humanDescription:
        'No long story. This is where you open Canva and actually put your hands to work.',
      topics: [
        'Live Project 1: High-converting Promotional Flyer',
        'Live Project 2: Engaging Social Media Post / Banner',
        'Live Project 3: Clean Logo mark & Business Card layout',
        'Designing from scratch vs smartly modifying templates',
        'Exporting for Print (PDF) vs Web (PNG/JPG)',
        'Next steps, portfolio building, and Q&A review',
      ],
      practicalOutcome: '3 complete, polished designs ready for your portfolio or social media.',
    },
  ];

  return (
    <section id="curriculum" className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Structured 3-Day Journey</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            The 3-Day{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600">
              Class Curriculum
            </span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg">
            No fluff. No complicated technical jargon. Just clear daily progression.
          </p>
        </div>

        {/* Day Selector Tabs for Desktop / Tablets */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-3xl mx-auto mb-8">
          {days.map((day) => {
            const isSelected = activeDay === day.dayNumber;
            return (
              <button
                key={day.dayNumber}
                onClick={() => handleDaySelect(day.dayNumber)}
                className={`w-full sm:w-1/3 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    isSelected ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {day.dayNumber}
                </span>
                <span>DAY {day.dayNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Active Day Detail Display Card */}
        <div className="max-w-4xl mx-auto">
          {days.map((day) => {
            if (day.dayNumber !== activeDay) return null;
            return (
              <div
                key={day.dayNumber}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
              >
                {/* Day Banner Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-blue-600 text-white uppercase tracking-wider">
                        Day {day.dayNumber} Focus
                      </span>
                      <span className="text-xs font-bold text-slate-400">8:00 PM WAT</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {day.title}
                    </h3>
                    <p className="text-sm font-medium text-blue-700 mt-0.5">{day.subtitle}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl text-xs text-blue-900 font-semibold sm:max-w-[220px]">
                    <span className="block text-[10px] text-blue-600 uppercase font-black tracking-wider">
                      🎯 Daily Outcome
                    </span>
                    {day.practicalOutcome}
                  </div>
                </div>

                {/* Human Voice Description Quote */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <span className="text-2xl font-serif text-sky-400 shrink-0">“</span>
                  <p className="text-sm sm:text-base font-semibold text-slate-200 leading-relaxed italic">
                    {day.humanDescription}
                  </p>
                </div>

                {/* Day Topics Checklist */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
                    What We'll Cover Step-by-Step
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {day.topics.map((topic, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-800 text-sm font-medium hover:border-blue-200 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Includes downloadable practice assets & checklists</span>
                  </div>

                  <button
                    onClick={() => {
                      trackInitiateRegistration('Curriculum Day Card Action');
                      onRegisterClick();
                    }}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Register For This Class</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* All 3 Days Scannable Timeline Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <span className="text-xs font-black text-blue-600 uppercase">Day 1</span>
            <p className="text-sm font-bold text-slate-900 mt-1">Understanding Canva</p>
            <p className="text-xs text-slate-500 mt-1">No more feeling lost with tools</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <span className="text-xs font-black text-blue-600 uppercase">Day 2</span>
            <p className="text-sm font-bold text-slate-900 mt-1">Design Fundamentals</p>
            <p className="text-xs text-slate-500 mt-1">Typography, colours & spacing</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <span className="text-xs font-black text-blue-600 uppercase">Day 3</span>
            <p className="text-sm font-bold text-slate-900 mt-1">Let's Actually Design</p>
            <p className="text-xs text-slate-500 mt-1">Flyers, logos, social media & cards</p>
          </div>
        </div>

      </div>
    </section>
  );
};
