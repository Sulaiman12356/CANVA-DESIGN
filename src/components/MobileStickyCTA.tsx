import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '../config';
import { trackInitiateRegistration } from '../utils/metaPixel';

interface MobileStickyCTAProps {
  onRegisterClick: () => void;
}

export const MobileStickyCTA: React.FC<MobileStickyCTAProps> = ({ onRegisterClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show only after scrolling down past the top hero
      const shouldShow = window.scrollY > 400;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 py-2.5 px-4 sm:hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-blue-700 tracking-tight flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            3-Day Free Canva Class
          </span>
          <span className="text-[10px] text-slate-500 font-medium">100% Free • No Experience Needed</span>
        </div>

        <button
          onClick={() => {
            trackInitiateRegistration('Mobile Sticky Bottom Bar');
            onRegisterClick();
          }}
          id="mobile-sticky-register-btn"
          className="bg-blue-600 active:bg-blue-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-1.5 shrink-0"
        >
          <span>Register Free</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
