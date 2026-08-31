import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Mail,
  Share2,
  Database,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Code,
  Zap,
} from 'lucide-react';
import { AdminUser } from '../../types';
import { getActiveMetaPixelId, isValidPixelId } from '../../utils/metaPixel';
import { safeSetItem } from '../../utils/storage';

interface AdminSettingsViewProps {
  adminUser: AdminUser | null;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ adminUser }) => {
  const [pixelId, setPixelId] = useState('');
  const [copiedBase, setCopiedBase] = useState(false);
  const [copiedLead, setCopiedLead] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const currentId = getActiveMetaPixelId();
    if (currentId && !currentId.includes('INSERT')) {
      setPixelId(currentId);
    }
  }, []);

  const handleSavePixelId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = pixelId.trim();
    safeSetItem('cda_meta_pixel_id', cleanId);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const activeIdForSnippet = pixelId.trim() || 'YOUR_META_PIXEL_ID';

  const metaBaseCode = `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${activeIdForSnippet}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${activeIdForSnippet}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;

  const metaLeadEventCode = `<!-- Meta Standard Lead Event Trigger -->
<script>
fbq('track', 'Lead', {
  content_name: '3-Day Free Canva Design Class',
  content_category: 'Graphic Design Training',
  currency: 'USD',
  value: 0.00,
  status: 'Registered'
});
</script>`;

  const copyToClipboard = (text: string, type: 'base' | 'lead') => {
    navigator.clipboard.writeText(text);
    if (type === 'base') {
      setCopiedBase(true);
      setTimeout(() => setCopiedBase(false), 2500);
    } else {
      setCopiedLead(true);
      setTimeout(() => setCopiedLead(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Security & Integration Credentials</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          System configurations, database integrity, email delivery providers, and Meta Ads CAPI status.
        </p>
      </div>

      {/* 1. Meta Ads Pixel & Conversions Tracking Hub */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Meta Ads Pixel & Conversion Tracking
              </h3>
              <p className="text-xs text-slate-500">
                Track Facebook & Instagram Ads leads, conversions, and ROI
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
            Auto-Tracking Active
          </span>
        </div>

        {/* Pixel ID Config Form */}
        <form onSubmit={handleSavePixelId} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Your Meta Pixel ID (From Meta Events Manager / Ads Manager)
            </label>
            {pixelId && isValidPixelId(pixelId) && (
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                ✓ Valid Pixel ID Format
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="e.g. 123456789012345"
              className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Save Pixel ID
            </button>
          </div>

          {saveSuccess && (
            <p className="text-[11px] text-emerald-700 font-bold animate-in fade-in">
              ✓ Meta Pixel ID saved and activated in live application!
            </p>
          )}
        </form>

        {/* Snippet 1: Base Pixel Code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-slate-500" />
              1. Meta Base Pixel Code (Paste in Facebook Ads / Website &lt;head&gt;)
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(metaBaseCode, 'base')}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedBase ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Base Code!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Base Pixel Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {metaBaseCode}
          </pre>
        </div>

        {/* Snippet 2: Lead Event Code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              2. Meta Standard "Lead" Event Code (Fires Automatically On Registration Form Submit)
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(metaLeadEventCode, 'lead')}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLead ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Lead Code!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Lead Event</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {metaLeadEventCode}
          </pre>
        </div>

        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            How to Set Up in Meta Ads Manager (Facebook & Instagram Ads):
          </p>
          <ol className="list-decimal list-inside text-[11px] text-blue-800/90 space-y-0.5 pl-1">
            <li>Go to <strong>Meta Events Manager</strong> &rarr; Select your Data Source (Pixel).</li>
            <li>Copy your numeric <strong>Pixel ID</strong> and paste it into the box above to activate tracking on this landing page.</li>
            <li>When creating your Facebook/Instagram Ad Campaign, choose <strong>"Leads"</strong> as your campaign objective.</li>
            <li>In the Ad Set, select <strong>"Website"</strong> as conversion location and choose the <strong>"Lead"</strong> standard event.</li>
          </ol>
        </div>
      </div>

      {/* 2. Admin Authentication & Role */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Administrator Access Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Admin Name</span>
            <span className="font-bold text-slate-900">{adminUser?.name || 'Onifade Sulaiman (Mr. Clarity)'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Admin Email</span>
            <span className="font-bold text-slate-900">{adminUser?.email || 'ipesolasulaiman@gmail.com'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Security Level</span>
            <span className="font-bold text-emerald-700 uppercase">Super Admin (Confidential)</span>
          </div>
        </div>
      </div>

      {/* 3. Email Delivery Engine */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-600" />
            <span>Email Delivery Engine</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
            Active
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The email dispatch subsystem supports <strong>Resend API</strong>, <strong>SendGrid</strong>, or high-speed dispatch. To deliver live transactional emails via your custom domain, add <code>RESEND_API_KEY</code> or <code>SENDGRID_API_KEY</code> to your environment variables.
        </p>
      </div>

      {/* 4. Persistence Database */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Storage & Database Architecture</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
            Synchronized
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The server stores participant records, custom email templates, and class schedules in a transactional database with atomic backups.
        </p>
      </div>
    </div>
  );
};
