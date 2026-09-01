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
  Lock,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AdminUser } from '../../types';
import { getActiveMetaPixelId, isValidPixelId } from '../../utils/metaPixel';
import { safeSetItem } from '../../utils/storage';
import { adminApi } from '../../utils/adminApi';

interface AdminSettingsViewProps {
  adminUser: AdminUser | null;
  onAccountUpdated?: (user: AdminUser) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  adminUser,
  onAccountUpdated,
}) => {
  // Meta Pixel state
  const [pixelId, setPixelId] = useState('');
  const [copiedBase, setCopiedBase] = useState(false);
  const [copiedLead, setCopiedLead] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Admin Account Settings State
  const [name, setName] = useState(adminUser?.name || 'Onifade Sulaiman (Mr. Clarity)');
  const [email, setEmail] = useState(adminUser?.email || 'ipesolasulaiman@gmail.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const currentId = getActiveMetaPixelId();
    if (currentId && !currentId.includes('INSERT')) {
      setPixelId(currentId);
    }
    if (adminUser) {
      setName(adminUser.name);
      setEmail(adminUser.email);
    }
  }, [adminUser]);

  const handleSavePixelId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = pixelId.trim();
    safeSetItem('cda_meta_pixel_id', cleanId);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFeedback(null);

    if (newPassword && newPassword.length < 8) {
      setAccountFeedback({
        type: 'error',
        message: 'New password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setAccountFeedback({
        type: 'error',
        message: 'New password and confirmation do not match.',
      });
      return;
    }

    if (newPassword && !currentPassword) {
      setAccountFeedback({
        type: 'error',
        message: 'You must provide your current password to set a new password.',
      });
      return;
    }

    setIsUpdatingAccount(true);

    try {
      const res = await adminApi.updateAccount({
        name: name.trim(),
        email: email.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      setAccountFeedback({
        type: 'success',
        message: res.message || 'Administrator account details updated securely.',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (onAccountUpdated && res.user) {
        onAccountUpdated(res.user);
      }
    } catch (err: any) {
      setAccountFeedback({
        type: 'error',
        message: err.message || 'Failed to update administrator account.',
      });
    } finally {
      setIsUpdatingAccount(false);
    }
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
          Manage administrator account credentials, database integrity, email delivery providers, and Meta Ads tracking.
        </p>
      </div>

      {/* 1. Admin Account & Password Management (Requirement 32) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Administrator Account & Security Profile
              </h3>
              <p className="text-xs text-slate-500">
                Update authorized administrator Gmail, display name, and confidential password.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
            PBKDF2-SHA512 Encrypted
          </span>
        </div>

        {accountFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              accountFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {accountFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium">{accountFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleUpdateAccount} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Administrator Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Authorized Admin Gmail Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                This exact email is required for the "Forgot Password" recovery flow.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                Change Password (Leave blank to keep current password)
              </span>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPasswords ? 'Hide' : 'Show'} Inputs</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required if changing password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingAccount}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isUpdatingAccount ? 'Updating Account...' : 'Save Account Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Meta Ads Pixel & Conversions Tracking Hub */}
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
          The server stores participant records, custom email templates, and class schedules in a transactional database with atomic backups and Firestore synchronization.
        </p>
      </div>
    </div>
  );
};
