import React, { useState, useEffect } from 'react';
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
  Layers,
  Sparkles,
  Camera,
  Upload,
  RotateCcw,
  Timer,
  Eye,
  Loader2,
} from 'lucide-react';
import { ClassSettings, EmailTemplate } from '../../types';
import { adminApi } from '../../utils/adminApi';
import { safeSetItem, compressImageFile } from '../../utils/storage';
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
  const [formData, setFormData] = useState<ClassSettings>({
    class_name: initialSettings?.class_name || 'Free 3-Day Canva Design Class',
    class_date: initialSettings?.class_date || 'Friday 5th – Sunday 7th September, 2026',
    class_time: initialSettings?.class_time || '8:00 PM – 9:30 PM (WAT)',
    class_link: initialSettings?.class_link || 'https://meet.google.com/cda-canva-live',
    whatsapp_group_link:
      initialSettings?.whatsapp_group_link || 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
    registration_status: initialSettings?.registration_status || 'OPEN',
    automation_enabled: initialSettings?.automation_enabled ?? true,
    automation_template_id: initialSettings?.automation_template_id || 'tmpl_reg_confirmation',
    founder_image_url: initialSettings?.founder_image_url || '',
    countdown_target_date: initialSettings?.countdown_target_date || '2026-09-05T20:00:00',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setFormData({
        ...initialSettings,
        founder_image_url: initialSettings.founder_image_url || '',
        countdown_target_date: initialSettings.countdown_target_date || '2026-09-05T20:00:00',
      });
    }
  }, [initialSettings]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      if (formData.founder_image_url) {
        safeSetItem('cda_mentor_photo', formData.founder_image_url);
        window.dispatchEvent(new Event('storage'));
      }

      const updated = await adminApi.updateClassSettings(formData);
      onSettingsUpdated(updated);
      setFeedback('Class settings, founder photo & countdown updated live successfully!');
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update class settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRegistrationStatus = () => {
    setFormData((prev) => ({
      ...prev,
      registration_status: prev.registration_status === 'OPEN' ? 'CLOSED' : 'OPEN',
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <span>Class Schedule, Founder Picture & Landing Page Settings</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Configure cohort dates, meeting links, founder portrait, live countdown ticker, and intake status.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Founder Photo Management */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
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
                  onChange={(e) => setFormData({ ...formData, founder_image_url: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Registration Intake Switch */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                {formData.registration_status === 'OPEN' ? (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-rose-600" />
                )}
                <span>Registration Intake Status</span>
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
        </div>

        {/* 3. Core Class Details & Countdown Settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-600" />
            <span>Class Schedule & Countdown Ticker Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Class / Cohort Name
              </label>
              <input
                type="text"
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Class Dates (Display Format)
              </label>
              <input
                type="text"
                value={formData.class_date}
                onChange={(e) => setFormData({ ...formData, class_date: e.target.value })}
                placeholder="e.g. Friday 5th – Sunday 7th September, 2026"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Class Time & Timezone
              </label>
              <input
                type="text"
                value={formData.class_time}
                onChange={(e) => setFormData({ ...formData, class_time: e.target.value })}
                placeholder="e.g. 8:00 PM – 9:30 PM (WAT)"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-amber-600" />
                <span>Landing Page Countdown Target (Date & Time)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.countdown_target_date ? formData.countdown_target_date.substring(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, countdown_target_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Synchronizes the live countdown banner at the upper part of the landing page in real-time.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp Community Group Link
              </label>
              <input
                type="url"
                value={formData.whatsapp_group_link}
                onChange={(e) => setFormData({ ...formData, whatsapp_group_link: e.target.value })}
                placeholder="https://chat.whatsapp.com/..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-purple-600" />
                Live Webinar / Class Room Link
              </label>
              <input
                type="url"
                value={formData.class_link}
                onChange={(e) => setFormData({ ...formData, class_link: e.target.value })}
                placeholder="https://meet.google.com/... or Zoom Link"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Automated Confirmation Email */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant Auto-Email on Registration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically deliver confirmation email + WhatsApp link when someone registers on your page.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.automation_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, automation_enabled: e.target.checked })
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
                  setFormData({ ...formData, automation_template_id: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
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

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Class Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
