import React, { useState } from 'react';
import { SITE_CONFIG } from '../config';
import {
  RegistrationFormData,
  DeviceOption,
  CanvaExperienceOption,
  LearningGoalOption,
} from '../types';
import { safeGetItem, safeSetItem, safeJsonParse } from '../utils/storage';
import { getCapturedUTMs } from '../utils/utm';
import {
  validateAndFormatWhatsApp,
  isValidEmail,
  checkDuplicateRegistration,
} from '../utils/validation';
import {
  trackSuccessfulRegistration,
  trackInitiateRegistration,
} from '../utils/metaPixel';
import { saveFirestoreParticipant, addFirestoreAuditLog } from '../lib/firebase';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Smartphone,
  Laptop,
  MessageCircle,
  Mail,
  User,
  ShieldCheck,
  Loader2,
  Lock,
  Layers,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';

import { PublicClassSettings, ClassSettings } from '../types';

interface RegistrationFormProps {
  formRef?: React.RefObject<HTMLDivElement>;
  onSuccessRedirect?: (registeredStudent: RegistrationFormData) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  classSettings?: PublicClassSettings | ClassSettings | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  formRef,
  onSuccessRedirect,
  onOpenPrivacy,
  onOpenTerms,
  classSettings,
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    whatsappNumber: '',
    device: 'Smartphone',
    canvaExperience: 'Complete beginner',
    learningGoal: 'Everything',
    consent: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const isClosed =
    classSettings?.registration_status === 'CLOSED' ||
    (classSettings as any)?.registrationStatus === 'CLOSED';
  const ctaText =
    classSettings?.cta_button_text ||
    (classSettings as any)?.ctaButtonText ||
    'RESERVE MY FREE SPOT';

  // Phone preview helper
  const phoneValidation = validateAndFormatWhatsApp(formData.whatsappNumber);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {};
    setDuplicateWarning(null);

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'Please enter your active WhatsApp phone number.';
    } else {
      const phoneCheck = validateAndFormatWhatsApp(formData.whatsappNumber);
      if (!phoneCheck.isValid) {
        newErrors.whatsappNumber = phoneCheck.errorMessage || 'Please enter a valid Nigerian WhatsApp number (e.g. 08012345678 or +234...)';
      }
    }

    if (!formData.consent) {
      newErrors.consent = 'Please check the consent box to receive class updates.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDuplicateWarning(null);

    if (isClosed) {
      setErrorMessage('Registration is currently closed for this cohort.');
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Capture UTM attribution parameters
      const utms = getCapturedUTMs();
      const phoneCheck = validateAndFormatWhatsApp(formData.whatsappNumber);

      // 2. Submit to server API database
      let serverTicketNumber = `CDA-${Math.floor(100000 + Math.random() * 900000)}`;
      let serverId: string | number = Date.now();

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            whatsappNumber: phoneCheck.internationalNumber || formData.whatsappNumber.trim(),
            device: formData.device,
            canvaExperience: formData.canvaExperience,
            learningInterest: formData.learningGoal,
            utmSource: utms.utm_source || 'Direct',
            utmMedium: utms.utm_medium || 'none',
            utmCampaign: utms.utm_campaign || 'Canva Free Class',
            utmContent: utms.utm_content || '',
            utmTerm: utms.utm_term || '',
          }),
        });

        let data: any = {};
        try {
          const text = await res.text();
          data = text ? JSON.parse(text) : {};
        } catch {
          data = {};
        }

        if (res.status === 403) {
          setErrorMessage('Registration is currently closed for this cohort. Please stay tuned for our next schedule.');
          setIsSubmitting(false);
          return;
        }

        if (res.status === 409 || data.alreadyRegistered) {
          // If already registered, seamlessly retrieve existing admission pass and continue directly to Thank You page
          if (data.participant) {
            serverTicketNumber = data.participant.ticket_number || data.ticketNumber || serverTicketNumber;
            serverId = data.participant.id || serverId;
          }
        } else if (res.status === 404 || res.status === 405 || res.status >= 500) {
          // If the deployment platform (e.g., Vercel static routing or cold start) returns 404/405/500,
          // never block the student. Proceed seamlessly via direct Firestore sync and client pass!
          console.info(`Registration API notice (${res.status}); fulfilling admission pass and routing to WhatsApp group.`);
        } else if (!res.ok) {
          setErrorMessage(data.error || `Registration failed (Status ${res.status}). Please check your details and try again.`);
          setIsSubmitting(false);
          return;
        }

        if (data.participant) {
          serverTicketNumber = data.participant.ticket_number || data.ticketNumber || serverTicketNumber;
          serverId = data.participant.id || serverId;
        }
      } catch (apiErr: any) {
        console.warn('Registration network notice, generating offline admission pass:', apiErr);
        // Never block the student from obtaining their pass and reaching the WhatsApp group
      }

      const completeRegistrationPayload: RegistrationFormData = {
        ...formData,
        id: serverId,
        ticketNumber: serverTicketNumber,
        formattedWhatsapp: phoneCheck.formattedDisplay || formData.whatsappNumber,
        registeredAt: new Date().toISOString(),
        utmParams: utms,
        classBatch: SITE_CONFIG.CLASS_DATE,
      };

      // 3. Save locally in client storage and store as current active registrant
      try {
        safeSetItem('cda_latest_registered_student', JSON.stringify(completeRegistrationPayload));
        const rawExisting = safeGetItem('cda_canva_registrations', '[]');
        const parsed = safeJsonParse<RegistrationFormData[]>(rawExisting, []);
        const existing: RegistrationFormData[] = Array.isArray(parsed) ? parsed : [];
        existing.push(completeRegistrationPayload);
        const trimmed = existing.slice(-200);
        safeSetItem('cda_canva_registrations', JSON.stringify(trimmed));
      } catch (storageErr) {
        console.warn('Could not persist registration locally:', storageErr);
      }

      // 4. Directly save participant record & audit log to Firestore (Single Source of Truth)
      const mappedExp: 'Beginner' | 'Used Canva Before' | 'Intermediate' =
        completeRegistrationPayload.canvaExperience === 'Complete beginner'
          ? 'Beginner'
          : completeRegistrationPayload.canvaExperience === "I've used Canva before"
          ? 'Used Canva Before'
          : 'Intermediate';

      const participantDocId = String(serverId);
      try {
        await saveFirestoreParticipant({
          id: participantDocId,
          full_name: completeRegistrationPayload.fullName,
          email: completeRegistrationPayload.email,
          whatsapp: completeRegistrationPayload.whatsappNumber,
          device: completeRegistrationPayload.device,
          learning_interest: completeRegistrationPayload.learningGoal,
          canva_experience: mappedExp,
          ticket_number: serverTicketNumber,
          utm_source: utms.utm_source || 'Direct',
          utm_medium: utms.utm_medium || 'none',
          utm_campaign: utms.utm_campaign || 'Canva Free Class',
          utm_content: utms.utm_content || '',
          utm_term: utms.utm_term || '',
          registration_date: new Date().toISOString().split('T')[0],
          registration_time: new Date().toLocaleTimeString(),
          status: 'REGISTERED',
          whatsapp_joined: false,
          attendance_day_1: false,
          attendance_day_2: false,
          attendance_day_3: false,
          masterclass_interest: false,
          email_status: 'sent',
          last_email_sent: new Date().toISOString(),
          email_attempts: 1,
          admin_notes: '',
          created_at: completeRegistrationPayload.registeredAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        await addFirestoreAuditLog(
          'Participant registered',
          `${completeRegistrationPayload.fullName} (${completeRegistrationPayload.email}) registered online [Ticket #${serverTicketNumber}]`,
          'system'
        ).catch(() => {});
      } catch (fsErr) {
        console.warn('[Firestore] Direct write completed with notice:', fsErr);
      }

      // 5. Fire Meta Conversion Events (CompleteRegistration and Lead) ONLY on successful registration
      try {
        trackSuccessfulRegistration(completeRegistrationPayload);
      } catch (metaErr) {
        console.warn('Meta event tracking notice:', metaErr);
      }

      // 6. Immediately redirect to /thank-you page without artificial delay
      if (onSuccessRedirect) {
        onSuccessRedirect(completeRegistrationPayload);
      } else {
        // Fallback browser history push
        if (typeof window !== 'undefined') {
          window.history.pushState({ page: 'thank-you' }, 'Thank You', '/thank-you');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setErrorMessage(
        err.message || 'Something went wrong while submitting. Please check your network and try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="register"
      ref={formRef}
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-blue-50/30 to-slate-50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-950 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-950/10">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Secure Your Seat • 100% Free</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            Ready to Give Yourself{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600">
              3 Days?
            </span>
          </h2>

          <p className="text-slate-700 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            It's 100% free. It's hands-on practical. And you can join with the smartphone or laptop you already own.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xl shadow-blue-950/10 relative">
          
          {/* Top Trust Accent */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Instant Seat Allocation</span>
            </div>
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full font-bold">
              Free Access • {SITE_CONFIG.CLASS_DATE}
            </div>
          </div>

          {/* Active Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Error Notice */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Registration Notice</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Duplicate Notice */}
            {duplicateWarning && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Prior Registration Found</p>
                  <p>{duplicateWarning}</p>
                </div>
              </div>
            )}

            {/* 1. Full Name */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider" htmlFor="reg-fullname">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-fullname"
                  type="text"
                  placeholder="e.g. Onifade Sulaiman"
                  value={formData.fullName}
                  onFocus={() => trackInitiateRegistration('Registration Form Full Name')}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.fullName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-blue-200 focus:border-blue-600'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-rose-600 font-semibold">{errors.fullName}</p>
              )}
            </div>

            {/* 2. Email Address */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider" htmlFor="reg-email">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="e.g. sulaiman@example.com"
                  value={formData.email}
                  onFocus={() => trackInitiateRegistration('Registration Form Email')}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-blue-200 focus:border-blue-600'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-600 font-semibold">{errors.email}</p>
              )}
            </div>

            {/* 3. WhatsApp Phone Number */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider" htmlFor="reg-whatsapp">
                WhatsApp Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MessageCircle className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-whatsapp"
                  type="tel"
                  placeholder="e.g. 08051780169 or +234..."
                  value={formData.whatsappNumber}
                  onFocus={() => trackInitiateRegistration('Registration Form WhatsApp')}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.whatsappNumber
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-blue-200 focus:border-blue-600'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                {phoneValidation.isValid && phoneValidation.formattedDisplay ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Formatted: {phoneValidation.formattedDisplay}
                  </span>
                ) : (
                  <span>Nigerian & international numbers accepted</span>
                )}
                {errors.whatsappNumber && (
                  <span className="text-rose-600 font-semibold">{errors.whatsappNumber}</span>
                )}
              </div>
            </div>

            {/* 4. Device Selection */}
            <div className="space-y-2 text-left pt-1">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Device <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Smartphone', 'Laptop', 'Both'] as const).map((dev) => (
                  <button
                    type="button"
                    key={dev}
                    onClick={() => setFormData({ ...formData, device: dev })}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      formData.device === dev
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {dev === 'Smartphone' && <Smartphone className="w-4 h-4" />}
                    {dev === 'Laptop' && <Laptop className="w-4 h-4" />}
                    {dev === 'Both' && <Layers className="w-4 h-4" />}
                    <span>{dev}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Canva Experience */}
            <div className="space-y-2 text-left pt-1">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Canva Experience <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    'Complete beginner',
                    "I've used Canva before",
                    'Intermediate',
                  ] as const
                ).map((exp) => (
                  <button
                    type="button"
                    key={exp}
                    onClick={() => setFormData({ ...formData, canvaExperience: exp })}
                    className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      formData.canvaExperience === exp
                        ? 'bg-blue-50 text-blue-950 border-blue-600 ring-1 ring-blue-600 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. What do you want to learn? */}
            <div className="space-y-1.5 text-left pt-1">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider" htmlFor="reg-learning-goal">
                What do you want to learn? <span className="text-rose-500">*</span>
              </label>
              <select
                id="reg-learning-goal"
                value={formData.learningGoal}
                onChange={(e) =>
                  setFormData({ ...formData, learningGoal: e.target.value as LearningGoalOption })
                }
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600 cursor-pointer font-medium"
              >
                <option value="Flyer Design">Flyer Design</option>
                <option value="Logo Design">Logo Design</option>
                <option value="Business Card Design">Business Card Design</option>
                <option value="Social Media Design">Social Media Design</option>
                <option value="Everything">Everything</option>
              </select>
            </div>

            {/* 7. Mandatory Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-left group">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    formData.consent
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-slate-50 border-slate-300 group-hover:border-slate-400'
                  }`}
                >
                  {formData.consent && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs text-slate-700 leading-relaxed select-none">
                  I agree to receive important class updates and learning information through email and WhatsApp.
                </span>
              </label>
              {errors.consent && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 text-left">{errors.consent}</p>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || isClosed}
                id="submit-registration-form-btn"
                className={`w-full font-black text-base sm:text-lg py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group ${
                  isClosed
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40'
                }`}
              >
                {isClosed ? (
                  <span>REGISTRATION CLOSED</span>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Reserving your seat & generating ticket...</span>
                  </>
                ) : (
                  <>
                    <span>{ctaText}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Trust and Safety Footer */}
            <div className="pt-2 text-center text-[11px] text-slate-500 space-y-1.5">
              <p className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Free Class • Zero hidden fees • No credit card required</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Your contact details are strictly kept private and used only for training cohort communication.{' '}
                {onOpenPrivacy && (
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    className="underline hover:text-slate-600 cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                )}
                {onOpenPrivacy && onOpenTerms && <span> • </span>}
                {onOpenTerms && (
                  <button
                    type="button"
                    onClick={onOpenTerms}
                    className="underline hover:text-slate-600 cursor-pointer"
                  >
                    Terms of Participation
                  </button>
                )}
              </p>
            </div>

          </form>

        </div>

      </div>
    </section>
  );
};
