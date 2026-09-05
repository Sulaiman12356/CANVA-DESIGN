import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Save,
  CheckCircle2,
  AlertTriangle,
  Link,
  MessageCircle,
  Clock,
  Calendar,
  Zap,
  Lock,
  Unlock,
  Camera,
  Upload,
  RotateCcw,
  Timer,
  Eye,
  Loader2,
  Users,
  Target,
  FileText,
  Activity,
  Sparkles,
  Share2,
  ShieldCheck,
  Flame,
  Check,
  ChevronRight,
  Database,
} from 'lucide-react';
import { ClassSettings, EmailTemplate } from '../../types';
import { adminApi } from '../../utils/adminApi';
import { safeSetItem, safeGetItem, compressImageFile } from '../../utils/storage';
import { initMetaPixel, syncMetaPixelWithAds, isValidPixelId } from '../../utils/metaPixel';
import defaultMentorPic from '../../assets/images/mr_clarity_profile_1788134298716.jpg';

interface ClassSettingsViewProps {
  initialSettings: ClassSettings | null;
  templates: EmailTemplate[];
  onSettingsUpdated: (newSettings: ClassSettings) => void;
}

export const ClassSettingsView: React.FC<ClassSettingsViewProps> = ({
  initialSettings,
  templates,
  onSettingsUpdated,
}) => {
  const [formData, setFormData] = useState<ClassSettings>(() => {
    let cached: any = null;
    try {
      const cachedStr = safeGetItem('cda_cached_class_settings');
      if (cachedStr) cached = JSON.parse(cachedStr);
    } catch {}

    const source = initialSettings || cached || {};
    return {
      class_name: source.class_name || source.className || 'Free 3-Day Canva Design Class',
      class_title: source.class_title || source.classTitle || source.class_name || 'Free 3-Day Canva Design Class',
      subtitle: source.subtitle || source.classSubtitle || 'Learn Skills. Earn Globally. Transform From a Complete Beginner to a Confident Visual Creator in 3 Practical Evenings.',
      description: source.description || source.classDescription || 'Master practical Canva design for real-world business, social media, marketing campaigns, and global client monetization.',
      class_date: source.class_date || source.classDate || 'March 27th to 29th, 2026',
      class_time: source.class_time || source.classTime || '8:00 PM to 9:30 PM (WAT)',
      start_time: source.start_time || source.classStartTime || '8:00 PM',
      end_time: source.end_time || source.classEndTime || '9:30 PM',
      timezone: source.timezone || 'WAT (UTC+1)',
      class_link: source.class_link || source.classLink || 'https://meet.google.com/cda-canva-live',
      whatsapp_group_link:
        source.whatsapp_group_link || source.whatsappGroupLink || 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
      registration_status: source.registration_status || source.registrationStatus || 'OPEN',
      registration_deadline: source.registration_deadline || 'March 27, 2026, 7:59 PM',
      available_slots: source.available_slots || 500,
      total_registered: source.total_registered || 0,
      cta_button_text: source.cta_button_text || 'RESERVE MY FREE SPOT',
      cta_button_link: source.cta_button_link || '#register',
      meta_pixel_id: source.meta_pixel_id || source.metaPixelId || '',
      automation_enabled: source.automation_enabled ?? true,
      automation_template_id: source.automation_template_id || 'tmpl_reg_confirmation',
      founder_image_url: source.founder_image_url || '',
      countdown_target_date: source.countdown_target_date || source.countdownTargetDate || '2026-03-27T20:00:00',
    };
  });

  const isDirtyRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [metaSyncNotice, setMetaSyncNotice] = useState<{ message: string; success: boolean } | null>(null);

  // Helper to reliably update fields and mark dirty to prevent polling resets
  const updateField = (field: keyof ClassSettings | string, value: any) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Real-time Countdown Timer Preview calculation
  const [countdownRemaining, setCountdownRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    diffSeconds: 0,
  });

  // Only update from initialSettings if the user is NOT actively editing
  useEffect(() => {
    if (!initialSettings) return;

    if (isDirtyRef.current) {
      // User has unsaved edits: do NOT overwrite their countdown or date settings
      return;
    }

    const incomingCountdown =
      initialSettings.countdown_target_date ||
      (initialSettings as any).countdownTargetDate;
    const incomingClassDate =
      initialSettings.class_date ||
      (initialSettings as any).classDate;

    setFormData((prev) => ({
      ...prev,
      ...initialSettings,
      class_title: initialSettings.class_title || initialSettings.class_name || prev.class_title,
      class_date: incomingClassDate || prev.class_date,
      class_time: initialSettings.class_time || (initialSettings as any).classTime || prev.class_time,
      start_time: initialSettings.start_time || prev.start_time,
      end_time: initialSettings.end_time || prev.end_time,
      countdown_target_date: incomingCountdown || prev.countdown_target_date,
      meta_pixel_id: initialSettings.meta_pixel_id ?? prev.meta_pixel_id,
      total_registered: initialSettings.total_registered ?? prev.total_registered,
    }));
  }, [initialSettings]);

  // Live countdown clock ticker for Admin preview
  useEffect(() => {
    const updateCountdown = () => {
      const targetStr = formData.countdown_target_date;
      if (!targetStr) {
        setCountdownRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, diffSeconds: 0 });
        return;
      }

      const targetTime = new Date(targetStr).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (isNaN(targetTime) || diff <= 0) {
        setCountdownRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, diffSeconds: 0 });
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const days = Math.floor(totalSecs / (3600 * 24));
      const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      setCountdownRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        diffSeconds: totalSecs,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [formData.countdown_target_date]);

  const handleFounderPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const compressedBase64 = await compressImageFile(file, 600, 0.85);
        setFormData((prev) => ({ ...prev, founder_image_url: compressedBase64 }));
        safeSetItem('cda_mentor_photo', compressedBase64);
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Failed to compress picture:', err);
        alert('Could not process this image file. Please try another image.');
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleResetFounderPhoto = () => {
    setFormData((prev) => ({ ...prev, founder_image_url: '' }));
    safeSetItem('cda_mentor_photo', '');
    window.dispatchEvent(new Event('storage'));
  };

  // Quick Preset Handlers for Time Countdown
  const setCountdownPreset = (daysFromNow: number, hour = 20, minute = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, minute, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    updateField('countdown_target_date', formatted);
  };

  // Quick Preset Handlers for Class Date Display Format
  const setClassDatePreset = (preset: string) => {
    updateField('class_date', preset);
  };

  // Synchronize Meta Pixel ID with Meta Ads live
  const handleSyncMetaPixel = () => {
    const cleaned = (formData.meta_pixel_id || '').trim();
    if (!cleaned) {
      setMetaSyncNotice({ message: 'Enter a numeric Meta Pixel ID before synchronizing.', success: false });
      setTimeout(() => setMetaSyncNotice(null), 4000);
      return;
    }

    const res = syncMetaPixelWithAds(cleaned);
    setMetaSyncNotice({ message: res.message, success: res.success });
    setTimeout(() => setMetaSyncNotice(null), 4500);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      if (formData.founder_image_url) {
        safeSetItem('cda_mentor_photo', formData.founder_image_url);
        window.dispatchEvent(new Event('storage'));
      }

      if (formData.meta_pixel_id) {
        safeSetItem('cda_meta_pixel_id', formData.meta_pixel_id.trim());
        initMetaPixel();
        window.dispatchEvent(new Event('storage'));
      }

      const updated = await adminApi.updateClassSettings(formData);
      safeSetItem('cda_cached_class_settings', JSON.stringify(updated));

      isDirtyRef.current = false;
      setIsDirty(false);

      onSettingsUpdated(updated);

      // Dispatch event for other components to re-render countdown and date displays immediately
      window.dispatchEvent(new CustomEvent('classSettingsUpdated', { detail: updated }));
      window.dispatchEvent(new Event('storage'));

      setFeedback('Class countdown, date display, Meta Pixel, and automation settings saved and synchronized live!');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update class settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRegistrationStatus = () => {
    updateField('registration_status', formData.registration_status === 'OPEN' ? 'CLOSED' : 'OPEN');
  };

  const isPixelValid = isValidPixelId(formData.meta_pixel_id || '');

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Class Countdown, Date Display & Meta Ads Synchronization</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure the countdown timer, class date display format, landing page copy, registered student data storage, and Meta Ads sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isDirty && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Unsaved Changes</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0 ${
              isDirty
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500 ring-offset-2'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isDirty ? 'Save & Publish Live Now' : 'Save & Publish Live'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* STORAGE & AUTOMATION STATUS BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-blue-800/40 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
                Registered Student Storage & Instant Automation
              </h3>
              <p className="text-xs text-slate-300">
                Landing page registrations are automatically stored in the Admin database & Cloud Firestore with zero delay.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{formData.total_registered || 0} Students Stored</span>
            </span>

            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
              formData.automation_enabled
                ? 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                : 'bg-amber-500/20 border-amber-400/30 text-amber-300'
            }`}>
              {formData.automation_enabled ? 'Auto-Email: Active' : 'Auto-Email: Paused'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Real-time persistence in local DB & Firestore</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Instant admission pass & WhatsApp link dispatch</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Full student record & UTM access in Admin tabs</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============================================================ */}
        {/* 1. TIME COUNTDOWN SETTING & LIVE PREVIEW                     */}
        {/* ============================================================ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-600" />
              <span>Landing Page Time Countdown Configuration</span>
            </h3>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              !countdownRemaining.isExpired
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {!countdownRemaining.isExpired ? 'Active • Ticking on Landing Page' : 'Expired • Target Reached'}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Set the exact countdown target date and time. This clock powers the sticky top countdown banner on the landing page and creates urgency for visitors to register before slots run out.
          </p>

          {/* DateTime Picker Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Countdown Target (Date & Exact Time)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.countdown_target_date ? formData.countdown_target_date.substring(0, 16) : ''}
                onChange={(e) => updateField('countdown_target_date', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCountdownPreset(1, 20, 0)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                Tomorrow 8PM
              </button>
              <button
                type="button"
                onClick={() => setCountdownPreset(3, 20, 0)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => setCountdownPreset(7, 20, 0)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                In 7 Days
              </button>
              <button
                type="button"
                onClick={() => updateField('countdown_target_date', '2026-03-27T20:00:00')}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                March 27, 2026
              </button>
              <button
                type="button"
                onClick={() => updateField('countdown_target_date', '2026-09-05T20:00:00')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                Sept 5, 2026
              </button>
            </div>
          </div>

          {/* REAL-TIME COUNTDOWN PREVIEW CARD */}
          <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Live Countdown Clock Preview</span>
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                Target: {formData.countdown_target_date ? new Date(formData.countdown_target_date).toLocaleString() : 'Not Set'}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-4 py-2">
              <div className="flex flex-col items-center bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl min-w-[65px] sm:min-w-[80px]">
                <span className="text-xl sm:text-2xl font-black font-mono text-white">
                  {String(countdownRemaining.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-0.5">Days</span>
              </div>
              <span className="text-xl font-bold text-slate-600">:</span>
              <div className="flex flex-col items-center bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl min-w-[65px] sm:min-w-[80px]">
                <span className="text-xl sm:text-2xl font-black font-mono text-white">
                  {String(countdownRemaining.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-0.5">Hours</span>
              </div>
              <span className="text-xl font-bold text-slate-600">:</span>
              <div className="flex flex-col items-center bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl min-w-[65px] sm:min-w-[80px]">
                <span className="text-xl sm:text-2xl font-black font-mono text-white">
                  {String(countdownRemaining.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-0.5">Mins</span>
              </div>
              <span className="text-xl font-bold text-slate-600">:</span>
              <div className="flex flex-col items-center bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl min-w-[65px] sm:min-w-[80px]">
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                  {String(countdownRemaining.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-0.5">Secs</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              {countdownRemaining.isExpired
                ? 'Countdown has expired. Visitors will see "Class is Starting!" or "Cohort in Session".'
                : `Active Countdown: Ticking down in real-time across desktop and mobile visitor screens.`}
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. CLASS DATE DISPLAY FORMAT & SCHEDULE                      */}
        {/* ============================================================ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Class Date Display Format & Schedule</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Landing Page Hero & Header</span>
          </div>

          <p className="text-xs text-slate-500">
            Control how the cohort dates and times are styled across the top announcement banner, landing hero section, countdown bar, and confirmation emails.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Class Date (Display Format)</span>
              </label>
              <input
                type="text"
                value={formData.class_date}
                onChange={(e) => updateField('class_date', e.target.value)}
                placeholder="e.g. Friday 5th to Sunday 7th September, 2026"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quick Format Presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">Quick Format Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'March 27th to 29th, 2026',
                  'Friday 5th to Sunday 7th September, 2026',
                  'September 5 to 7, 2026',
                  'Saturday 12th to Monday 14th September, 2026',
                  'Friday 18th to Sunday 20th September, 2026',
                  'Friday 25th to Sunday 27th September, 2026',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setClassDatePreset(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      formData.class_date === preset
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* LIVE BANNER PREVIEW */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Live Landing Page Banner Display Preview</span>
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-200">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] uppercase font-extrabold tracking-wider border border-blue-400/30">
                  Next Live Cohort
                </span>
                <span>{formData.class_date || 'Date Not Configured'}</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300">{formData.class_time || '8:00 PM to 9:30 PM (WAT)'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Time String</label>
              <input
                type="text"
                value={formData.class_time}
                onChange={(e) => updateField('class_time', e.target.value)}
                placeholder="e.g. 8:00 PM to 9:30 PM (WAT)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="text"
                value={formData.start_time || '8:00 PM'}
                onChange={(e) => updateField('start_time', e.target.value)}
                placeholder="8:00 PM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="text"
                value={formData.end_time || '9:30 PM'}
                onChange={(e) => updateField('end_time', e.target.value)}
                placeholder="9:30 PM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Zone</label>
              <input
                type="text"
                value={formData.timezone || 'WAT (UTC+1)'}
                onChange={(e) => updateField('timezone', e.target.value)}
                placeholder="WAT (UTC+1)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. META PIXEL ID SYNCHRONIZATION WITH META ADS               */}
        {/* ============================================================ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Meta Pixel ID Synchronization with Meta Ads</span>
            </h3>

            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                isPixelValid
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {isPixelValid ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Synchronized with Meta Ads & Graph CAPI</span>
                  </>
                ) : (
                  <span>Ready Mode (Enter Pixel ID)</span>
                )}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Enter your Meta (Facebook) Pixel ID below. When synchronized, all visitor interactions, form submissions, and WhatsApp community clicks are tracked simultaneously via client-side Meta Pixel SDK and server-side Conversions API (CAPI) with customer data hashing for high Meta Ads Event Quality.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Meta Pixel ID (10 to 20 digits)</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={formData.meta_pixel_id || ''}
                onChange={(e) => updateField('meta_pixel_id', e.target.value.trim())}
                placeholder="e.g. 123456789012345"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSyncMetaPixel}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Test & Sync Pixel</span>
              </button>
            </div>

            {metaSyncNotice && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                metaSyncNotice.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {metaSyncNotice.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{metaSyncNotice.message}</span>
              </div>
            )}
          </div>

          {/* Meta Ads Tracking Architecture Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
              Synchronized Meta Ads Standard Events:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-mono font-bold text-blue-600">PageView</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Fired on every landing page and admission pass visit.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-mono font-bold text-indigo-600">InitiateRegistration</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Fired when visitor clicks "Reserve My Free Spot" or starts form intake.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-mono font-bold text-emerald-600">CompleteRegistration</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Fired ONLY after student record is stored in DB. Passes hashed email, phone, and ticket number to Meta CAPI.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-mono font-bold text-purple-600">Lead (WhatsApp Community)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Fired when registered student clicks to join the cohort WhatsApp room.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. INSTANT AUTOMATION ON REGISTRATION                        */}
        {/* ============================================================ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant Auto-Email Automation on Student Registration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically deliver customized admission pass + class dates + WhatsApp link when someone registers.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.automation_enabled}
                onChange={(e) =>
                  updateField('automation_enabled', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {formData.automation_enabled && (
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Template to Auto-Send
              </label>
              <select
                value={formData.automation_template_id}
                onChange={(e) =>
                  updateField('automation_template_id', e.target.value)
                }
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 5. INTAKE STATUS & CAPACITY                                  */}
        {/* ============================================================ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                {formData.registration_status === 'OPEN' ? (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-rose-600" />
                )}
                <span>Registration Intake Status & Capacity</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                When closed, students visiting the landing page will see a cohort closed notice.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleRegistrationStatus}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                formData.registration_status === 'OPEN'
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  formData.registration_status === 'OPEN' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                }`}
              />
              <span>Registration: {formData.registration_status}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Available Slots</span>
              </label>
              <input
                type="number"
                value={formData.available_slots || 500}
                onChange={(e) => updateField('available_slots', parseInt(e.target.value) || 500)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total Registered (Live Stored)</span>
              </label>
              <div className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{formData.total_registered || 0} Students</span>
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase">Stored In DB</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Registration Deadline</span>
              </label>
              <input
                type="text"
                value={formData.registration_deadline || ''}
                onChange={(e) => updateField('registration_deadline', e.target.value)}
                placeholder="e.g. September 5, 2026, 7:59 PM"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. FOUNDER'S PHOTOGRAPH                                      */}
        {/* ============================================================ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Founder's Photograph (Landing Page & Passes)</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Live Preview</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            {/* Image Preview */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-900 border-2 border-blue-500/40 shrink-0 shadow-md">
              <img
                src={formData.founder_image_url || defaultMentorPic}
                alt="Founder Preview"
                className="w-full h-full object-cover object-top"
              />
              {isProcessingImage && (
                <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-3 w-full text-center sm:text-left">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Onifade Sulaiman (Mr. Clarity)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload a clear portrait to update the instructor photograph on the landing page and student passes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isProcessingImage ? 'Compressing...' : 'Upload New Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFounderPhotoUpload}
                    disabled={isProcessingImage}
                    className="hidden"
                  />
                </label>

                {formData.founder_image_url && (
                  <button
                    type="button"
                    onClick={handleResetFounderPhoto}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset to Default</span>
                  </button>
                )}
              </div>

              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Or enter direct photo URL (e.g. https://...)"
                  value={formData.founder_image_url || ''}
                  onChange={(e) => updateField('founder_image_url', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 7. CLASS CONTENT & COPY                                      */}
        {/* ============================================================ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Class Information & Landing Page Copy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Class Title</label>
              <input
                type="text"
                value={formData.class_title || formData.class_name}
                onChange={(e) => {
                  updateField('class_title', e.target.value);
                  updateField('class_name', e.target.value);
                }}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={formData.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 8. LINKS & CTA BUTTONS                                       */}
        {/* ============================================================ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Links & CTA Buttons</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CTA Button Text</label>
              <input
                type="text"
                value={formData.cta_button_text || 'RESERVE MY FREE SPOT'}
                onChange={(e) => updateField('cta_button_text', e.target.value)}
                placeholder="RESERVE MY FREE SPOT"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CTA Button Link</label>
              <input
                type="text"
                value={formData.cta_button_link || '#register'}
                onChange={(e) => updateField('cta_button_link', e.target.value)}
                placeholder="#register"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Community Group Link</span>
              </label>
              <input
                type="url"
                value={formData.whatsapp_group_link}
                onChange={(e) => updateField('whatsapp_group_link', e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-purple-600" />
                <span>Live Webinar / Class Room Link</span>
              </label>
              <input
                type="url"
                value={formData.class_link}
                onChange={(e) => updateField('class_link', e.target.value)}
                placeholder="https://meet.google.com/... or Zoom Link"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Live Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings & Synchronize Live</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
