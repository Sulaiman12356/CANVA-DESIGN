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
} from 'lucide-react';
import { ClassSettings, EmailTemplate } from '../../types';
import { adminApi } from '../../utils/adminApi';

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
    class_date: initialSettings?.class_date || 'Coming Friday – Sunday',
    class_time: initialSettings?.class_time || '8:00 PM (WAT)',
    class_link: initialSettings?.class_link || 'https://meet.google.com/cda-canva-class',
    whatsapp_group_link:
      initialSettings?.whatsapp_group_link || 'https://chat.whatsapp.com/sample-canva-group',
    registration_status: initialSettings?.registration_status || 'OPEN',
    automation_enabled: initialSettings?.automation_enabled ?? true,
    automation_template_id: initialSettings?.automation_template_id || 'tpl-reg-confirm',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setFormData(initialSettings);
    }
  }, [initialSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const updated = await adminApi.updateClassSettings(formData);
      onSettingsUpdated(updated);
      setFeedback('Class settings saved and live updated successfully!');
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
          <span>Class Schedule & Registration Controls</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Configure cohort dates, meeting links, registration intake toggle, and automated confirmations.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Registration Intake Switch */}
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

        {/* 2. Core Class Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Core Class Information</h3>

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
                placeholder="e.g. Coming Friday – Sunday"
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
                placeholder="e.g. 8:00 PM (WAT)"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
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

        {/* 3. Automated Confirmation Email */}
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
