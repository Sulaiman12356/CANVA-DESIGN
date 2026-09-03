import React, { useRef, useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { WhySection } from './components/WhySection';
import { LearningSection } from './components/LearningSection';
import { Curriculum } from './components/Curriculum';
import { AudienceSection } from './components/AudienceSection';
import { Benefits } from './components/Benefits';
import { MentorSection } from './components/MentorSection';
import { SocialProof } from './components/SocialProof';
import { RegistrationForm } from './components/RegistrationForm';
import { WhatsAppCTA } from './components/WhatsAppCTA';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { MobileStickyCTA } from './components/MobileStickyCTA';
import { ThankYouPage } from './components/ThankYouPage';
import { PrivacyPolicyModal, TermsModal, CookieNotice } from './components/LegalModals';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { RegistrationFormData, AdminUser, PublicClassSettings } from './types';
import { getCapturedUTMs } from './utils/utm';
import { initMetaPixel, trackPageView } from './utils/metaPixel';
import { safeGetItem, safeSetItem } from './utils/storage';
import { adminApi, clearAdminToken } from './utils/adminApi';
import { useSessionHeartbeat } from './utils/useSessionHeartbeat';

export type AppRoute = 'home' | 'thank-you' | 'admin-login' | 'admin-dashboard';

export default function App() {
  const formRef = useRef<HTMLDivElement>(null);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [registeredStudent, setRegisteredStudent] = useState<RegistrationFormData | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [showCookieNotice, setShowCookieNotice] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [classSettings, setClassSettings] = useState<PublicClassSettings | null>(() => {
    try {
      const cached = safeGetItem('cda_cached_class_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.class_name || parsed.className || parsed.class_date || parsed.classDate)) {
          return {
            className: parsed.class_name || parsed.className || 'Free 3-Day Canva Design Class',
            classTitle: parsed.class_title || parsed.classTitle || parsed.class_name || parsed.className || '3-Day Free Canva Design Class',
            classSubtitle: parsed.class_subtitle || parsed.classSubtitle || parsed.subtitle || '',
            subtitle: parsed.class_subtitle || parsed.classSubtitle || parsed.subtitle || '',
            classDescription: parsed.class_description || parsed.classDescription || parsed.description || '',
            description: parsed.class_description || parsed.description || '',
            classDate: parsed.class_date || parsed.classDate || 'Saturday 12th – Monday 14th September, 2026',
            classTime: parsed.class_time || parsed.classTime || '8:00 PM (WAT)',
            classStartTime: parsed.class_start_time || parsed.classStartTime || '8:00 PM',
            startTime: parsed.class_start_time || parsed.startTime || '8:00 PM',
            classEndTime: parsed.class_end_time || parsed.classEndTime || '9:30 PM',
            endTime: parsed.class_end_time || parsed.endTime || '9:30 PM',
            timezone: parsed.timezone || 'WAT (UTC+1)',
            classLink: parsed.class_link || parsed.classLink || 'https://meet.google.com/cda-canva-live',
            whatsappGroupLink: parsed.whatsapp_group_link || parsed.whatsappGroupLink || 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
            registrationStatus: parsed.registration_status || parsed.registrationStatus || 'OPEN',
            registrationDeadline: parsed.registration_deadline || parsed.registrationDeadline || 'September 5, 2026, 7:59 PM',
            availableSlots: parsed.available_slots || parsed.availableSlots || 500,
            registeredCount: parsed.total_registered || parsed.registeredCount || 0,
            ctaButtonText: parsed.cta_button_text || parsed.ctaButtonText || 'RESERVE MY FREE SPOT',
            ctaButtonLink: parsed.cta_button_link || parsed.ctaButtonLink || '#register',
            countdownTargetDate: parsed.countdown_target_date || parsed.countdownTargetDate || '2026-09-10T20:00',
            metaPixelId: parsed.meta_pixel_id || parsed.metaPixelId || '1065001129595286',
          };
        }
      }
    } catch {
      // safe fallback
    }
    return null;
  });

  // Activate Real-Time Visitor Heartbeat Telemetry
  useSessionHeartbeat();

  // Load public class settings from backend with resilient retry and fallback
  useEffect(() => {
    let isSubscribed = true;
    let retryTimer: any = null;

    const loadSettings = async (retryCount = 0) => {
      try {
        const data = await adminApi.getPublicClassSettings();
        if (data && isSubscribed) {
          setClassSettings(data);
          const pixelId = data.meta_pixel_id || (data as any).metaPixelId;
          if (pixelId) {
            safeSetItem('cda_meta_pixel_id', pixelId);
            initMetaPixel();
          }
        }
      } catch {
        if (retryCount < 3 && isSubscribed) {
          retryTimer = setTimeout(() => {
            loadSettings(retryCount + 1);
          }, 1500);
        }
      }
    };

    loadSettings();

    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener('classSettingsUpdated', handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);
    return () => {
      isSubscribed = false;
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener('classSettingsUpdated', handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

  // Initialize Route, UTM capture, and Meta Pixel on mount
  useEffect(() => {
    // 1. Initialize Meta Pixel client script
    initMetaPixel();

    // 2. Capture UTM parameters immediately
    getCapturedUTMs();

    // 3. Check Cookie banner consent
    const consent = safeGetItem('cda_cookie_consent_accepted');
    if (!consent) {
      setShowCookieNotice(true);
    }

    // 4. Check current browser path and synchronize session accordingly
    if (typeof window !== 'undefined') {
      const checkPath = async () => {
        const path = window.location.pathname.toLowerCase();
        const search = window.location.search.toLowerCase();

        // Check if there is an existing authenticated admin session
        const existingToken = adminApi.getAdminToken();
        let authenticatedUser: AdminUser | null = null;
        if (existingToken) {
          try {
            const authUser = await adminApi.checkAuthSession();
            if (authUser) {
              authenticatedUser = authUser;
              setAdminUser(authUser);
            }
          } catch {
            // Invalid session
          }
        }

        if (path.includes('/admin/dashboard') && authenticatedUser) {
          setCurrentRoute('admin-dashboard');
        } else if (path.includes('/admin') || path.includes('/login') || search.includes('token=')) {
          if (authenticatedUser) {
            setCurrentRoute('admin-dashboard');
          } else {
            setCurrentRoute('admin-login');
          }
        } else if (path.includes('/thank-you')) {
          setCurrentRoute('thank-you');
          trackPageView('/thank-you');
        } else {
          setCurrentRoute('home');
          trackPageView('/');
        }
      };

      checkPath();

      const handlePopState = () => {
        checkPath();
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const handleAcceptCookies = () => {
    safeSetItem('cda_cookie_consent_accepted', 'true');
    setShowCookieNotice(false);
  };

  const navigateTo = (route: AppRoute) => {
    // If routing to admin-dashboard without an active verified login in this session, always redirect to login screen
    if (route === 'admin-dashboard' && !adminUser) {
      route = 'admin-login';
    }

    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      let targetUrl = '/';
      if (route === 'thank-you') targetUrl = '/thank-you';
      if (route === 'admin-login') targetUrl = '/admin/login';
      if (route === 'admin-dashboard') targetUrl = '/admin/dashboard';

      window.history.pushState({ page: route }, '', targetUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (route === 'home' || route === 'thank-you') {
        trackPageView(targetUrl);
      }
    }
  };

  const handleRegistrationSuccess = (student: RegistrationFormData) => {
    setRegisteredStudent(student);
    navigateTo('thank-you');
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setCurrentRoute('admin-dashboard');
    if (typeof window !== 'undefined') {
      window.history.pushState({ page: 'admin-dashboard' }, '', '/admin/dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAdminLogout = async () => {
    await adminApi.logout();
    clearAdminToken();
    setAdminUser(null);
    navigateTo('admin-login');
  };

  const handleViewLandingPage = () => {
    adminApi
      .getPublicClassSettings()
      .then((data) => {
        if (data) setClassSettings(data);
      })
      .catch(() => {});
    navigateTo('home');
  };

  const scrollToRegister = () => {
    if (currentRoute !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const element = document.getElementById('register');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToLearning = () => {
    if (currentRoute !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        document.getElementById('what-you-will-learn')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    const element = document.getElementById('what-you-will-learn');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ROUTE 1: Admin Dashboard (Protected)
  if (currentRoute === 'admin-dashboard') {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onNavigateHome={() => navigateTo('home')}
        />
      );
    }
    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
        onViewLandingPage={handleViewLandingPage}
      />
    );
  }

  // ROUTE 2: Admin Login
  if (currentRoute === 'admin-login') {
    return (
      <AdminLogin
        onLoginSuccess={handleAdminLoginSuccess}
        onNavigateHome={() => navigateTo('home')}
      />
    );
  }

  // ROUTE 3: Thank You Page / Admission Pass
  if (currentRoute === 'thank-you') {
    return (
      <div className="min-h-screen bg-white font-sans">
        <ThankYouPage
          onNavigateHome={() => navigateTo('home')}
          registeredStudent={registeredStudent}
        />
        <PrivacyPolicyModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
        />
        <TermsModal
          isOpen={isTermsOpen}
          onClose={() => setIsTermsOpen(false)}
        />
      </div>
    );
  }

  // ROUTE 4: Student Lead Generation Landing Page
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Fixed Navigation Header */}
      <Header
        onRegisterClick={scrollToRegister}
        onAdminClick={() => navigateTo('admin-login')}
        classSettings={classSettings}
      />

      <main className="flex-grow">
        {/* 1. Hero Section */}
        <Hero
          onRegisterClick={scrollToRegister}
          onLearnMoreClick={scrollToLearning}
          classSettings={classSettings}
        />

        {/* 2. The Problem Section */}
        <ProblemSection onRegisterClick={scrollToRegister} />

        {/* 3. Why I Decided To Teach This For Free (Personal Voice) */}
        <WhySection onRegisterClick={scrollToRegister} />

        {/* 4. What You Will Learn (9 Core Modules) */}
        <LearningSection onRegisterClick={scrollToRegister} />

        {/* 5. 3-Day Structured Curriculum */}
        <Curriculum onRegisterClick={scrollToRegister} />

        {/* 6. Who Should Join & Reassurance */}
        <AudienceSection onRegisterClick={scrollToRegister} />

        {/* 7. What Makes This Class Different */}
        <Benefits onRegisterClick={scrollToRegister} />

        {/* 8. Meet Your Mentor (Onifade Sulaiman / Mr. Clarity) */}
        <MentorSection onRegisterClick={scrollToRegister} />

        {/* 9. Genuine Community & Learning Standards */}
        <SocialProof onRegisterClick={scrollToRegister} />

        {/* 10. Functional Lead Generation Registration Form */}
        <RegistrationForm
          formRef={formRef}
          onSuccessRedirect={handleRegistrationSuccess}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenTerms={() => setIsTermsOpen(true)}
          classSettings={classSettings}
        />

        {/* 11. Official WhatsApp Group Community Banner */}
        <WhatsAppCTA whatsappLink={classSettings?.whatsapp_group_link} />

        {/* 12. Frequently Asked Questions */}
        <FAQ onRegisterClick={scrollToRegister} />

        {/* 13. High-Conversion Final CTA */}
        <FinalCTA onRegisterClick={scrollToRegister} classSettings={classSettings} />
      </main>

      {/* 14. Footer with Admin Dashboard Access */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenAdmin={() => navigateTo('admin-login')}
      />

      {/* 15. Mobile Persistent Sticky Register Action */}
      <MobileStickyCTA onRegisterClick={scrollToRegister} />

      {/* 16. Legal Compliance Modals */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* 17. Cookie & Measurement Consent Banner */}
      {showCookieNotice && (
        <CookieNotice
          onAccept={handleAcceptCookies}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
        />
      )}
    </div>
  );
}
