import React, { useState, useEffect } from 'react';
import { SITE_CONFIG } from '../config';
import { safeGetItem, safeSetItem, safeRemoveItem, compressImageFile } from '../utils/storage';
import { getCapturedUTMs, UTMParams } from '../utils/utm';
import { RegistrationFormData } from '../types';
import {
  Settings,
  X,
  Upload,
  Calendar,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  MessageCircle,
  FileSpreadsheet,
  Loader2,
  Download,
  Users,
  Target,
  ExternalLink
} from 'lucide-react';

interface ConfigDrawerProps {
  onPhotoUpdated: (url: string | null) => void;
  onPreviewThankYou?: () => void;
}

export const ConfigDrawer: React.FC<ConfigDrawerProps> = ({
  onPhotoUpdated,
  onPreviewThankYou,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState(SITE_CONFIG.WHATSAPP_GROUP_LINK);
  const [classDate, setClassDate] = useState(SITE_CONFIG.CLASS_DATE);
  const [classTime, setClassTime] = useState(SITE_CONFIG.CLASS_TIME);
  const [endpoint, setEndpoint] = useState(SITE_CONFIG.REGISTRATION_ENDPOINT);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [leads, setLeads] = useState<RegistrationFormData[]>([]);
  const [capturedUtms, setCapturedUtms] = useState<UTMParams>({});

  useEffect(() => {
    const savedPhoto = safeGetItem('cda_mentor_photo');
    if (savedPhoto) {
      setCustomPhotoUrl(savedPhoto);
      onPhotoUpdated(savedPhoto);
    }

    if (isOpen) {
      try {
        const raw = safeGetItem('cda_canva_registrations', '[]');
        const parsed = JSON.parse(raw || '[]');
        setLeads(Array.isArray(parsed) ? parsed : []);
      } catch {
        setLeads([]);
      }
      setCapturedUtms(getCapturedUTMs());
    }
  }, [isOpen, onPhotoUpdated]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        // Compress image to ~50KB to safely fit in localStorage without exceeding quotas
        const compressedBase64 = await compressImageFile(file, 600, 0.82);
        setCustomPhotoUrl(compressedBase64);
        safeSetItem('cda_mentor_photo', compressedBase64);
        onPhotoUpdated(compressedBase64);
      } catch (err) {
        console.error('Error processing uploaded image:', err);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleSave = () => {
    SITE_CONFIG.WHATSAPP_GROUP_LINK = whatsappLink;
    SITE_CONFIG.CLASS_DATE = classDate;
    SITE_CONFIG.CLASS_TIME = classTime;
    SITE_CONFIG.REGISTRATION_ENDPOINT = endpoint;

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetPhoto = () => {
    safeRemoveItem('cda_mentor_photo');
    setCustomPhotoUrl(null);
    onPhotoUpdated(null);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert('No student registrations captured in local storage yet.');
      return;
    }

    const headers = [
      'Ticket Number',
      'Full Name',
      'Email Address',
      'WhatsApp Number',
      'Device',
      'Canva Experience',
      'Learning Goal',
      'Consent Given',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'UTM Content',
      'UTM Term',
      'Registered At',
    ];

    const rows = leads.map((lead) => [
      `"${lead.ticketNumber || lead.id || ''}"`,
      `"${(lead.fullName || '').replace(/"/g, '""')}"`,
      `"${(lead.email || '').replace(/"/g, '""')}"`,
      `"${(lead.formattedWhatsapp || lead.whatsappNumber || '').replace(/"/g, '""')}"`,
      `"${lead.device || ''}"`,
      `"${lead.canvaExperience || ''}"`,
      `"${lead.learningGoal || ''}"`,
      `"${lead.consent ? 'Yes' : 'No'}"`,
      `"${lead.utmParams?.utm_source || 'direct'}"`,
      `"${lead.utmParams?.utm_medium || 'organic'}"`,
      `"${lead.utmParams?.utm_campaign || ''}"`,
      `"${lead.utmParams?.utm_content || ''}"`,
      `"${lead.utmParams?.utm_term || ''}"`,
      `"${lead.registeredAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Canva_Class_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Discreet floating admin / config toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-slate-900/90 hover:bg-slate-950 text-white p-3 rounded-full shadow-xl border border-slate-700/80 backdrop-blur-md transition-transform hover:scale-110 flex items-center justify-center cursor-pointer group"
        title="Admin Settings, Leads & UTM Monitor"
        aria-label="Settings & Configuration"
      >
        <Settings className="w-4 h-4 text-sky-400 group-hover:rotate-45 transition-transform" />
      </button>

      {/* Slide-over panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-200">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Class Settings & Lead Hub</h3>
                  <p className="text-xs text-slate-500 font-medium">Clarity Digital Academy Lead Engine</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions Bar */}
              {onPreviewThankYou && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Preview Thank-You Page</span>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onPreviewThankYou();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <span>View /thank-you</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Lead Generation & Export Section */}
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-4.5 rounded-2xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-sky-200">Registered Leads</span>
                  </div>
                  <span className="text-sm font-black bg-blue-800/80 px-2.5 py-0.5 rounded-full text-white">
                    {leads.length} student{leads.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Student registrations stored in local storage with full contact info & ad attribution data.
                </p>
                <button
                  onClick={handleExportCSV}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xs py-2.5 px-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Leads to CSV (Excel)</span>
                </button>
              </div>

              {/* Active UTM Parameters Monitor */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  <span>Live UTM Campaign Attribution</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Automatically extracted from URL parameters (e.g. from Facebook & Instagram ads):
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Source</span>
                    <span className="text-blue-700 font-semibold">{capturedUtms.utm_source || 'direct'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Medium</span>
                    <span className="text-slate-800 font-semibold">{capturedUtms.utm_medium || 'organic'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Campaign</span>
                    <span className="text-slate-800 font-semibold truncate block">
                      {capturedUtms.utm_campaign || 'canva_free_class'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Content / Ad</span>
                    <span className="text-slate-800 font-semibold truncate block">
                      {capturedUtms.utm_content || 'none'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mentor Real Photo Uploader */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Founder Photo Manager</span>
                  </label>
                  {customPhotoUrl && (
                    <button
                      onClick={handleResetPhoto}
                      className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset to Default
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  Update Onifade Sulaiman's real photo. It will update instantly across the entire landing page.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <label
                    className={`cursor-pointer ${
                      isProcessingImage ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5`}
                  >
                    {isProcessingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isProcessingImage ? 'Optimizing Photo...' : 'Choose Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isProcessingImage}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {customPhotoUrl && !isProcessingImage && (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Photo Active
                    </span>
                  )}
                </div>
              </div>

              {/* WhatsApp Group Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Group Invite Link</span>
                </label>
                <input
                  type="url"
                  value={whatsappLink}
                  onChange={(e) => setWhatsappLink(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600 font-mono"
                />
              </div>

              {/* Class Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Cohort Date
                  </label>
                  <input
                    type="text"
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Daily Time
                  </label>
                  <input
                    type="text"
                    value={classTime}
                    onChange={(e) => setClassTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Registration Webhook / Formspree */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Custom Registration Endpoint (Optional)</span>
                </label>
                <input
                  type="url"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="e.g. Formspree, Google Sheets Script URL, Airtable Webhook"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Apply Changes</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
