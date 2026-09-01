import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Send,
  Sparkles,
  CheckCircle2,
  Layers,
  ChevronRight,
  Eye,
  AlertCircle,
  X,
} from 'lucide-react';
import { EmailTemplate, ClassSettings } from '../../types';
import { adminApi } from '../../utils/adminApi';

interface EmailTemplatesViewProps {
  templates: EmailTemplate[];
  classSettings: ClassSettings | null;
  onSelectTemplateToCompose: (template: EmailTemplate) => void;
  onRefreshTemplates: () => void;
}

export const EmailTemplatesView: React.FC<EmailTemplatesViewProps> = ({
  templates = [],
  classSettings,
  onSelectTemplateToCompose,
  onRefreshTemplates,
}) => {
  const safeTemplates = templates || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'Class Updates',
    subject: '',
    body: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const categories = ['All', 'Registration', 'Class Reminder', 'Class Link', 'Follow-up', 'Upsell', 'General'];

  const filteredTemplates =
    selectedCategory === 'All'
      ? safeTemplates
      : safeTemplates.filter(
          (t) =>
            t.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            t.name.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  const handleOpenEdit = (t: EmailTemplate) => {
    setEditingTemplate(t);
    setFormData({
      name: t.name,
      category: t.category,
      subject: t.subject,
      body: t.body,
    });
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      category: 'General',
      subject: '',
      body: '',
    });
    setIsCreating(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      alert('Please fill out Name, Subject, and Body.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTemplate) {
        await adminApi.updateEmailTemplate(editingTemplate.id, formData);
        setFeedback('Template updated successfully!');
      } else {
        await adminApi.createEmailTemplate(formData);
        setFeedback('New template created successfully!');
      }
      setEditingTemplate(null);
      setIsCreating(false);
      onRefreshTemplates();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return;
    try {
      await adminApi.deleteEmailTemplate(id);
      onRefreshTemplates();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleDuplicate = async (t: EmailTemplate) => {
    try {
      await adminApi.createEmailTemplate({
        name: `${t.name} (Copy)`,
        category: t.category,
        subject: t.subject,
        body: t.body,
      });
      onRefreshTemplates();
    } catch (err: any) {
      alert('Failed to duplicate template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Email Templates Library</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold">
              {safeTemplates.length} Ready
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Pre-built, high-converting email sequences tailored for your Canva cohort.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Template</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                  {t.category}
                </span>
                {t.is_default && (
                  <span className="text-[10px] font-bold text-slate-400">Default Template</span>
                )}
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                {t.name}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
                <strong>Subject:</strong> {t.subject}
              </p>

              <p className="text-xs text-slate-400 font-mono mt-3 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {t.body}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Template"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDuplicate(t)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Duplicate Template"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {!t.is_default && (
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => onSelectTemplateToCompose(t)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Use Template</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {(isCreating || editingTemplate) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {isCreating ? 'Create New Email Template' : `Edit Template: ${editingTemplate?.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingTemplate(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Masterclass VIP Invitation"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Class Updates"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Subject with tags like {{first_name}}"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={8}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Body content with variables like {{first_name}}, {{class_name}}, {{whatsapp_link}}..."
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
                <span className="font-bold text-slate-700 block">Available Dynamic Variables:</span>
                <code>
                  {'{{first_name}}'}, {'{{full_name}}'}, {'{{email}}'}, {'{{whatsapp}}'},{' '}
                  {'{{class_name}}'}, {'{{class_date}}'}, {'{{class_time}}'}, {'{{whatsapp_link}}'},{' '}
                  {'{{class_link}}'}
                </code>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
