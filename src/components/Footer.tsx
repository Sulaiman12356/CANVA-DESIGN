import React from 'react';
import { SITE_CONFIG } from '../config';
import { trackWhatsAppClick } from '../utils/metaPixel';
import {
  MessageCircle,
  Mail,
  Phone,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  ArrowUp,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight block">
                  CLARITY DIGITAL ACADEMY
                </span>
                <span className="text-xs font-bold text-sky-400 tracking-wider">
                  “Learn Skills. Earn Globally.”
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Empowering ambitious learners, entrepreneurs, and creatives with high-income digital design skills that unlock global opportunities.
            </p>

            <div className="pt-1 text-xs text-slate-500">
              <p>
                Founder & Lead Mentor:{' '}
                <span className="text-slate-300 font-semibold">Onifade Sulaiman (Mr. Clarity)</span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#the-problem" className="hover:text-white transition-colors">
                  The Problem With Templates
                </a>
              </li>
              <li>
                <a href="#what-you-will-learn" className="hover:text-white transition-colors">
                  What You'll Learn
                </a>
              </li>
              <li>
                <a href="#curriculum" className="hover:text-white transition-colors">
                  3-Day Curriculum
                </a>
              </li>
              <li>
                <a href="#mentor" className="hover:text-white transition-colors">
                  About Mr. Clarity
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              {onOpenAdmin && (
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="text-slate-500 hover:text-sky-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Admin CRM Portal</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact & Social Links */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Connect With Us
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a
                  href={`tel:${SITE_CONFIG.SUPPORT_PHONE}`}
                  className="hover:text-white transition-colors"
                >
                  {SITE_CONFIG.SUPPORT_PHONE}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <a
                  href={`mailto:${SITE_CONFIG.SUPPORT_EMAIL}`}
                  className="hover:text-white transition-colors"
                >
                  {SITE_CONFIG.SUPPORT_EMAIL}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <a
                  href={SITE_CONFIG.WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('Footer WhatsApp Link')}
                  className="hover:text-white transition-colors"
                >
                  Official WhatsApp Community
                </a>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {SITE_CONFIG.SOCIAL_LINKS.instagram && (
                <a
                  href={SITE_CONFIG.SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-pink-400 hover:border-slate-700 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {SITE_CONFIG.SOCIAL_LINKS.facebook && (
                <a
                  href={SITE_CONFIG.SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-slate-700 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {SITE_CONFIG.SOCIAL_LINKS.twitter && (
                <a
                  href={SITE_CONFIG.SOCIAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-slate-700 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {SITE_CONFIG.SOCIAL_LINKS.youtube && (
                <a
                  href={SITE_CONFIG.SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-slate-700 transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright, legal links & disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Clarity Digital Academy. All rights reserved.</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              {onOpenPrivacy && (
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="hover:text-white transition-colors cursor-pointer underline"
                >
                  Privacy Policy
                </button>
              )}
              {onOpenPrivacy && onOpenTerms && <span>•</span>}
              {onOpenTerms && (
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-white transition-colors cursor-pointer underline"
                >
                  Terms of Participation
                </button>
              )}
              {onOpenAdmin && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="hover:text-sky-400 transition-colors cursor-pointer"
                  >
                    Admin Login
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-600 text-center sm:text-right max-w-md">
            Disclaimer: Canva is a registered trademark of Canva Pty Ltd. This free masterclass is independently organized by Clarity Digital Academy for educational purposes.
          </p>

          <button
            onClick={scrollToTop}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
