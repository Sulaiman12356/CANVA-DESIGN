import React, { useState } from 'react';
import { SITE_CONFIG } from '../config';
import { FAQItem } from '../types';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  MessageCircle
} from 'lucide-react';

interface FAQProps {
  onRegisterClick: () => void;
}

export const FAQ: React.FC<FAQProps> = ({ onRegisterClick }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqs: FAQItem[] = [
    {
      question: 'Is this class really free?',
      answer:
        'Yes, 100% free! You will not be asked to pay any registration fee or hidden subscription charges before joining the 3 days of training.',
    },
    {
      question: 'Do I need a laptop to participate?',
      answer:
        'No. You can participate comfortably using just your smartphone (Android or iPhone) or a laptop. Canva works smoothly on both, and we demonstrate practical techniques for both devices.',
    },
    {
      question: 'Do I need Canva Pro?',
      answer:
        'Not at all. Everything we will be creating and practising in this 3-day class uses the 100% free version of Canva. You do not need an active paid Canva Pro subscription.',
    },
    {
      question: "What if I've never designed before?",
      answer:
        'This class was designed specifically for complete beginners. We start from ground zero with simple terms, step-by-step guidance, and zero complicated technical jargon.',
    },
    {
      question: 'Where will the class take place?',
      answer:
        'The training takes place live in our dedicated Clarity Digital Academy WhatsApp group and online training room. Daily session materials, links, and exercise resources will be shared there.',
    },
    {
      question: 'What time does the class start?',
      answer:
        `The live classes hold daily at ${SITE_CONFIG.CLASS_TIME}. Reminders and countdown notices will be sent to the WhatsApp group well in advance.`,
    },
    {
      question: 'Will there be recordings or replays?',
      answer:
        'Yes, class highlights and step-by-step review guides will be provided to registered participants so you can revise at your own pace if you miss any live segment.',
    },
    {
      question: 'Can I ask questions during the class?',
      answer:
        'Absolutely! We have dedicated Q&A periods where you can ask Mr. Clarity questions, share your work for review, and receive direct mentor feedback.',
    },
    {
      question: 'What happens after the 3 days?',
      answer:
        'By the end of Day 3, you will have completed your first clean designs, earned your milestone certificate of completion, and unlocked clear roadmaps for continuing to monetize or advance your graphic design skillset.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Got Questions?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            Frequently Asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600">
              Questions
            </span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg">
            Everything you need to know about the 3-day class.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-blue-500/80 shadow-md ring-1 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full py-4.5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-150">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Contact Help */}
        <div className="mt-12 text-center p-6 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900">Still have questions?</p>
            <p className="text-xs text-slate-500">Reach out directly to the Clarity Academy support team.</p>
          </div>
          <a
            href={SITE_CONFIG.SOCIAL_LINKS.whatsapp || `https://wa.me/?text=Hello%20Mr.%20Clarity`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
