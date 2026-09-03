import React from 'react';
import { SITE_CONFIG } from '../config';
import { trackWhatsAppClick } from '../utils/metaPixel';
import {
  MessageCircle,
  ArrowRight,
  BellRing,
  Clock,
  Sparkles,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

interface WhatsAppCTAProps {
  whatsappLink?: string;
}

export const WhatsAppCTA: React.FC<WhatsAppCTAProps> = ({ whatsappLink }) => {
  const link = whatsappLink || SITE_CONFIG.WHATSAPP_GROUP_LINK;
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 border border-emerald-800/40 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Active Learning Hub</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                Join the Class{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Community
                </span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Registration alone isn't enough. Join the official WhatsApp group so you don't miss daily class links, practice materials, and mentor announcements.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-emerald-400" /> Daily 8:00 PM WAT
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <BellRing className="w-4 h-4 text-emerald-400" /> Instant Reminders
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Smartphone className="w-4 h-4 text-emerald-400" /> Direct from phone
                </span>
              </div>
            </div>

            {/* Right Action */}
            <div className="md:col-span-4 flex flex-col items-center md:items-end justify-center text-center">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('WhatsApp Community Section', 'group')}
                id="main-whatsapp-section-cta"
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-sm sm:text-base py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group text-center"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>JOIN WHATSAPP GROUP</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <p className="text-[11px] text-slate-400 mt-3 text-center md:text-right">
                Free to join • No spam allowed
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
