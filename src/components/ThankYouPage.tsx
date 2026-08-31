import React, { useState, useEffect } from 'react';
import { SITE_CONFIG } from '../config';
import { RegistrationFormData } from '../types';
import { safeGetItem } from '../utils/storage';
import { MentorPortrait } from './MentorPortrait';
import { trackWhatsAppClick } from '../utils/metaPixel';
import {
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
  Copy,
  Check,
  Download,
  HelpCircle,
  ExternalLink,
  ChevronLeft,
  Smartphone,
  Laptop,
  Layers,
  BookOpen,
  Share2,
  UserCheck,
  Users,
  Send,
  BellRing
} from 'lucide-react';

interface ThankYouPageProps {
  onNavigateHome?: () => void;
  registeredStudent?: RegistrationFormData | null;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  onNavigateHome,
  registeredStudent: propStudent,
}) => {
  const [student, setStudent] = useState<RegistrationFormData | null>(propStudent || null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [ticketId, setTicketId] = useState<string>('');
  const [vcfDownloaded, setVcfDownloaded] = useState(false);

  useEffect(() => {
    // Scroll to top when thank you page renders
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!student) {
      try {
        const raw = safeGetItem('cda_canva_registrations', '[]');
        const list: RegistrationFormData[] = JSON.parse(raw || '[]');
        if (list.length > 0) {
          const latest = list[list.length - 1];
          setStudent(latest);
          setTicketId(latest.ticketNumber || `CDA-${Math.floor(100000 + Math.random() * 900000)}`);
        } else {
          setTicketId(`CDA-${Math.floor(100000 + Math.random() * 900000)}`);
        }
      } catch {
        setTicketId(`CDA-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } else {
      setTicketId(student.ticketNumber || `CDA-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [student]);

  const studentName = student?.fullName || 'Student';
  const effectiveTicket = ticketId || student?.ticketNumber || 'CDA-2026';

  // Automated WhatsApp Verification Message to Mr. Clarity
  const automatedWhatsAppMessage = `Hello Mr. Clarity! 👋 My name is ${studentName}. I just registered for the Free 3-Day Canva Design Class (Admission Ticket: #${effectiveTicket}). I have saved your contact number (+234 805 178 0169). Please save my contact and verify my seat in the official WhatsApp Class Group!`;
  const whatsappDmUrl = `https://wa.me/2348051780169?text=${encodeURIComponent(automatedWhatsAppMessage)}`;

  const handleCopyGroupLink = () => {
    navigator.clipboard.writeText(SITE_CONFIG.WHATSAPP_GROUP_LINK);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('+2348051780169');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  // Instant 1-Tap Save Contact to Phone (.vcf Contact File)
  const handleDownloadVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Sulaiman;Onifade;;;
FN:Onifade Sulaiman (Mr. Clarity)
ORG:Clarity Digital Academy
TITLE:Lead Design Instructor & Founder
TEL;TYPE=CELL,VOICE,PREF:+2348051780169
EMAIL:ipesolasulaiman@gmail.com
URL:https://claritydigitalacademy.com
NOTE:Canva Design Class Instructor. Save this number to receive class broadcasts and status updates.
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Onifade_Sulaiman_Mr_Clarity.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setVcfDownloaded(true);
    setTimeout(() => setVcfDownloaded(false), 3000);
  };

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Clarity Digital Academy: Free 3-Day Canva Design Class`);
    const details = encodeURIComponent(
      `Live 3-Day Canva Masterclass hosted by Onifade Sulaiman (Mr. Clarity).\n\nJoin the official WhatsApp Class Group: ${SITE_CONFIG.WHATSAPP_GROUP_LINK}\n\nInstructor Contact: ${SITE_CONFIG.PHONE} | ${SITE_CONFIG.EMAIL}`
    );
    const location = encodeURIComponent(`Live Online (WhatsApp Community & Training Hub)`);
    const now = new Date();
    now.setHours(20, 0, 0, 0); // 8:00 PM WAT
    const startStr = now.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(now.getTime() + 90 * 60 * 1000); // 1.5 hours
    const endStr = end.toISOString().replace(/-|:|\.\d\d\d/g, '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startStr}/${endStr}`;
  };

  const handleDownloadICS = () => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Clarity Digital Academy//Canva Masterclass//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Clarity Digital Academy: Free 3-Day Canva Design Class
DESCRIPTION:Live 3-Day Canva Masterclass with Onifade Sulaiman (Mr. Clarity).\\nWhatsApp Group: ${SITE_CONFIG.WHATSAPP_GROUP_LINK}
LOCATION:WhatsApp Training Room & Live Portal
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Clarity_Canva_Design_Class.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-blue-600 selection:text-white">
      {/* Top Brand Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-xs sm:text-sm transition-colors group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Academy Home</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800">
              Registration Confirmed
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        
        {/* Celebration Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-blue-950/5 text-center relative overflow-hidden mb-8">
          
          {/* Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400" />

          {/* Success Check Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10 mb-5 animate-bounce-short">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Seat Reserved • 100% Free</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
            You're In, {student?.fullName ? student.fullName.split(' ')[0] : 'Champ'}! 🎉
          </h1>

          <p className="mt-3 text-slate-700 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Your registration for the <strong className="text-slate-950 font-black">FREE 3-Day Canva Design Class</strong> has been received and confirmed.
          </p>

          {/* Automated System Notification Banner */}
          <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 max-w-xl mx-auto text-xs sm:text-sm text-emerald-950 font-semibold flex items-center justify-center gap-2.5 shadow-xs">
            <BellRing className="w-4 h-4 text-emerald-700 shrink-0 animate-bounce" />
            <span>
              <strong>Automated Dispatch:</strong> Your admission pass and confirmation email have been sent to <span className="underline font-bold text-slate-950">{student?.email || 'your email'}</span>.
            </span>
          </div>

          {/* Registration Summary Box */}
          {student && (
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-lg mx-auto text-left">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Admission Pass</span>
                <span className="text-xs font-black text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                  #{ticketId}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name</span>
                  <span className="font-bold text-slate-900 text-sm">{student.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">WhatsApp Number</span>
                  <span className="font-bold text-slate-900">{student.formattedWhatsapp || student.whatsappNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Address</span>
                  <span className="font-medium text-slate-900 truncate block">{student.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Learning Device</span>
                  <span className="font-semibold text-slate-900">{student.device}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3 Step Action Roadmap */}
        <div className="space-y-6 mb-10">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <span>Complete These 2 Mandatory Actions Below</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              To ensure you receive live class links, assignments, Canva templates, and certificate verification without missing anything:
            </p>
          </div>

          {/* STEP 1: SAVE MR. CLARITY'S CONTACT & SEND AUTOMATED VERIFICATION MESSAGE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-600/30 shadow-lg shadow-blue-950/5 relative overflow-hidden flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-900/20">
              01
            </div>

            <div className="flex-grow space-y-4 w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Step 1 • Mandatory Contact Save
                </span>
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                  Save Mr. Clarity's WhatsApp Number (+234 805 178 0169)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  WhatsApp broadcast messages, homework reviews, and daily Canva templates can only be received if you have the instructor's contact saved in your phone address book.
                </p>
              </div>

              {/* Contact Card Details & 1-Tap Buttons */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase font-bold text-[10px] block">Instructor Name</span>
                    <span className="text-slate-950 font-bold text-sm">Onifade Sulaiman (Mr. Clarity)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-bold text-[10px] block">WhatsApp Number</span>
                    <span className="text-blue-700 font-extrabold text-sm">{SITE_CONFIG.PHONE}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {/* 1-Tap Save to Phone Address Book (.vcf) */}
                  <button
                    onClick={handleDownloadVCard}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{vcfDownloaded ? 'Contact Saved to Phone!' : '1-Tap Save Contact to Phone (.vcf)'}</span>
                  </button>

                  {/* Copy Phone Number */}
                  <button
                    onClick={handleCopyPhone}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied +2348051780169!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>

                  {/* Send Pre-filled Verification DM */}
                  <a
                    href={whatsappDmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick('Thank You Page - Direct Message Instructor', 'contact')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Verification Message on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: JOIN THE OFFICIAL WHATSAPP CLASS GROUP */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/20 relative overflow-hidden border-2 border-emerald-500/50">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                    02
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-400/30">
                    Step 2 • Join Cohort Room
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Join the Official WhatsApp Class Group
                </h3>

                <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                  All live video classes, Canva template links, homework critiques, and Q&A sessions take place inside the private WhatsApp group. 
                  Click the button below to enter our private cohort room immediately!
                </p>
              </div>

              {/* Action Button & Copy Link */}
              <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
                <a
                  href={SITE_CONFIG.WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('Thank You Page - Admission Pass Button', 'group')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-base rounded-2xl transition-all shadow-xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Users className="w-6 h-6" />
                  <span>JOIN OFFICIAL WHATSAPP GROUP</span>
                  <ArrowRight className="w-5 h-5" />
                </a>

                <button
                  onClick={handleCopyGroupLink}
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold text-emerald-200 hover:text-white transition-colors bg-emerald-950/40 border border-emerald-700/50 py-2 px-3 rounded-xl cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy WhatsApp Invite Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* STEP 3: PREPARATION & CALENDAR */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-5 items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-900/20">
              03
            </div>
            <div className="flex-grow space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  Step 3 • Calendar & Preparation
                </span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Save the class date and come ready to practise
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Class Schedule</span>
                    <span className="text-xs font-bold text-slate-900">{SITE_CONFIG.CLASS_DATE}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Daily Class Time</span>
                    <span className="text-xs font-bold text-slate-900">{SITE_CONFIG.CLASS_TIME}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Download the free <strong>Canva App</strong> from Google Play Store or Apple App Store (or open <a href="https://canva.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Canva.com</a> on your computer). You don't need a paid subscription.
              </p>

              {/* Add to Calendar Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add to Google Calendar</span>
                </a>

                <button
                  onClick={handleDownloadICS}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download .ICS (Apple/Outlook)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Founder Personal Note */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 mb-10 border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="shrink-0">
              <MentorPortrait size="md" />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-800 text-sky-300 text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Message from your instructor</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                "I am looking forward to teaching you in class!"
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you have never touched a design tool or you want to elevate your graphics to professional client-ready standards, 
                this 3-day class will give you clarity, practical confidence, and monetizable skills. See you in the WhatsApp group!
              </p>
              <div className="pt-2 text-xs text-sky-300 font-bold">
                — Onifade Sulaiman (Mr. Clarity), Founder @ Clarity Digital Academy
              </div>
            </div>
          </div>
        </div>

        {/* "Didn't receive an email?" Support Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Need Immediate Assistance?
          </h3>
          
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            As long as you have joined the WhatsApp group via the green button above, you have full access to all live training sessions and files. If you need any assistance, reach out directly:
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
            <a
              href={`https://wa.me/2348051780169?text=${encodeURIComponent(
                `Hello Mr. Clarity, I just registered for the Free 3-Day Canva Class (Ticket: ${ticketId}) and have a question.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('Thank You Page - WhatsApp Support Chat', 'contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Direct ({SITE_CONFIG.PHONE})</span>
            </a>

            <a
              href={`mailto:${SITE_CONFIG.EMAIL}?subject=${encodeURIComponent(
                `Support Inquiry: Free Canva Class Registration (${ticketId})`
              )}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-slate-600" />
              <span>Email: {SITE_CONFIG.EMAIL}</span>
            </a>
          </div>
        </div>

        {/* Back to Home Navigation */}
        <div className="text-center mt-10">
          <button
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                window.location.href = '/';
              }
            }}
            className="text-xs sm:text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Landing Page & Review Curriculum</span>
          </button>
        </div>

      </main>
    </div>
  );
};
