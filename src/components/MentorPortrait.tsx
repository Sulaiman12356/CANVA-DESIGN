import React, { useState, useEffect } from 'react';
import { SITE_CONFIG } from '../config';
import { safeGetItem } from '../utils/storage';
import { adminApi } from '../utils/adminApi';
import { CheckCircle2, Award, Sparkles } from 'lucide-react';
import defaultMentorPic from '../assets/images/mr_clarity_profile_1788134298716.jpg';

interface MentorPortraitProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showBadge?: boolean;
  className?: string;
  customImage?: string | null;
}

export const MentorPortrait: React.FC<MentorPortraitProps> = ({
  size = 'lg',
  showBadge = true,
  className = '',
  customImage = null,
}) => {
  const [imgError, setImgError] = useState(false);
  const [remoteImage, setRemoteImage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch latest class settings to see if founder photo was updated by admin
    adminApi.getPublicClassSettings().then((settings) => {
      const img = settings?.founderImageUrl || (settings as any)?.founder_image_url;
      if (img) {
        setRemoteImage(img);
        setImgError(false);
      }
    }).catch(() => {});

    // Listen for storage updates
    const handleStorageChange = () => {
      const localStored = safeGetItem('cda_mentor_photo');
      if (localStored) {
        setRemoteImage(localStored);
        setImgError(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const localStored = safeGetItem('cda_mentor_photo');
  const imageSrc = customImage || remoteImage || localStored || '/sulaiman.jpg' || SITE_CONFIG.MENTOR_IMAGE || defaultMentorPic;

  // Render sizes
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80',
    hero: 'w-14 h-14 sm:w-16 sm:h-16',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Outer Glow & Gradient Ring */}
      <div className="relative rounded-3xl p-1.5 bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-800 shadow-xl shadow-blue-950/10">
        <div
          className={`${sizeClasses[size]} rounded-[22px] overflow-hidden bg-slate-900 relative flex items-center justify-center`}
        >
          {!imgError ? (
            <img
              src={imageSrc}
              alt="Onifade Sulaiman (Mr. Clarity), Founder of Clarity Digital Academy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
              onError={() => {
                // If the direct local path fails, keep fallback portrait active
                setImgError(true);
              }}
            />
          ) : (
            // High quality fallback vector representation of Sulaiman's monochrome pose
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950 text-white p-4 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-400/40 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-blue-400">OS</span>
              </div>
              <p className="text-sm font-semibold text-white">Onifade Sulaiman</p>
              <p className="text-xs text-blue-300">Mr. Clarity</p>
              <span className="mt-2 text-[10px] uppercase tracking-wider text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                Verified Mentor
              </span>
            </div>
          )}

          {/* Subtle lighting vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Floating Mentor Verified Badge */}
      {showBadge && size === 'lg' && (
        <div className="absolute -bottom-4 -right-2 sm:right-2 bg-white border border-slate-100 shadow-xl shadow-slate-900/10 rounded-2xl py-2 px-3.5 flex items-center gap-2.5 animate-bounce-subtle">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-900">Mr. Clarity</span>
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Founder & Head Mentor</p>
          </div>
        </div>
      )}
    </div>
  );
};
