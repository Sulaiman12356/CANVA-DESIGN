import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles, ArrowRight, Flame } from 'lucide-react';
import { adminApi } from '../utils/adminApi';
import { ClassSettings } from '../types';
import { SITE_CONFIG } from '../config';

interface CountdownBannerProps {
  onRegisterClick: () => void;
  classSettings?: ClassSettings | null;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({
  onRegisterClick,
  classSettings: propSettings,
}) => {
  const [settings, setSettings] = useState<ClassSettings | null>(propSettings || null);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  // Fetch settings if not passed via props
  useEffect(() => {
    if (!propSettings) {
      adminApi.getPublicClassSettings().then((s) => {
        if (s) setSettings(s);
      }).catch(() => {});
    } else {
      setSettings(propSettings);
    }
  }, [propSettings]);

  // Compute Target Time
  useEffect(() => {
    const calculateTargetTimestamp = (): number => {
      // 1. If explicit ISO countdown_target_date is provided by admin
      if (settings?.countdown_target_date) {
        const parsed = new Date(settings.countdown_target_date).getTime();
        if (!isNaN(parsed)) return parsed;
      }

      // 2. Default target: Friday 5th September 2026 20:00:00 WAT (UTC+1)
      const defaultDate = new Date('2026-09-05T20:00:00+01:00').getTime();
      return isNaN(defaultDate) ? Date.now() + 86400000 * 3 : defaultDate;
    };

    const targetTime = calculateTargetTimestamp();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  const classDateLabel = settings?.class_date || SITE_CONFIG.CLASS_DATE;
  const classTimeLabel = settings?.class_time || SITE_CONFIG.CLASS_TIME;

  return (
    <div
      id="landing-countdown-banner"
      className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white border-b border-blue-800/40 shadow-md py-2.5 px-4 relative z-40"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        {/* Left: Class Date & Time Announcement */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-extrabold uppercase tracking-wide">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Next Live Cohort</span>
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-200">
            <span className="text-white font-extrabold">{classDateLabel}</span> •{' '}
            <span className="text-sky-300 font-bold">{classTimeLabel}</span>
          </p>
        </div>

        {/* Right: Live Countdown Clock + Quick Action */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center justify-center bg-slate-900/90 border border-blue-500/30 rounded-lg px-2 py-1 min-w-[42px] sm:min-w-[48px]">
              <span className="text-sm sm:text-base font-black text-sky-400 font-mono leading-tight">
                {String(timeRemaining.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Days</span>
            </div>
            <span className="text-sky-400 font-bold">:</span>
            <div className="flex flex-col items-center justify-center bg-slate-900/90 border border-blue-500/30 rounded-lg px-2 py-1 min-w-[42px] sm:min-w-[48px]">
              <span className="text-sm sm:text-base font-black text-sky-400 font-mono leading-tight">
                {String(timeRemaining.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Hours</span>
            </div>
            <span className="text-sky-400 font-bold">:</span>
            <div className="flex flex-col items-center justify-center bg-slate-900/90 border border-blue-500/30 rounded-lg px-2 py-1 min-w-[42px] sm:min-w-[48px]">
              <span className="text-sm sm:text-base font-black text-sky-400 font-mono leading-tight">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Mins</span>
            </div>
            <span className="text-sky-400 font-bold">:</span>
            <div className="flex flex-col items-center justify-center bg-slate-900/90 border border-blue-500/30 rounded-lg px-2 py-1 min-w-[42px] sm:min-w-[48px]">
              <span className="text-sm sm:text-base font-black text-amber-400 font-mono leading-tight">
                {String(timeRemaining.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Secs</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRegisterClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Claim Free Spot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
