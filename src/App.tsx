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
import { RegistrationFormData, AdminUser } from './types';
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

  // Activate Real-Time Visitor Heartbeat Telemetry
  useSessionHeartbeat();

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

    // 4. Check current browser path and navigate accordingly
    // Mandatory requirement: Always request for login before entering the Admin dashboard
    if (typeof window !== 'undefined') {
      const checkPath = () => {
        const path = window.location.pathname.toLowerCase();
        const search = window.location.search.toLowerCase();

        if (path.includes('/admin') || path.includes('/login') || search.includes('token=')) {
          // Always present the login / recovery screen first irrespective of how many times logged in or device used
          setCurrentRoute('admin-login');
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
    // Clear session when leaving admin dashboard so returning always requires login
    clearAdminToken();
    setAdminUser(null);
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
      />

      <main className="flex-grow">
        {/* 1. Hero Section */}
        <Hero
          onRegisterClick={scrollToRegister}
          onLearnMoreClick={scrollToLearning}
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
        />

        {/* 11. Official WhatsApp Group Community Banner */}
        <WhatsAppCTA />

        {/* 12. Frequently Asked Questions */}
        <FAQ onRegisterClick={scrollToRegister} />

        {/* 13. High-Conversion Final CTA */}
        <FinalCTA onRegisterClick={scrollToRegister} />
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
