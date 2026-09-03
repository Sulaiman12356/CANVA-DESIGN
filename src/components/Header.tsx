import React, { useState, useEffect } from 'react';
import { SITE_CONFIG } from '../config';
import { trackInitiateRegistration } from '../utils/metaPixel';
import { Menu, X, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { CountdownBanner } from './CountdownBanner';

import { ClassSettings, PublicClassSettings } from '../types';

interface HeaderProps {
  onRegisterClick: () => void;
  onAdminClick?: () => void;
  classSettings?: PublicClassSettings | ClassSettings | null;
}

export const Header: React.FC<HeaderProps> = ({
  onRegisterClick,
  onAdminClick,
  classSettings,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: "What You'll Learn", href: '#what-you-will-learn' },
    { label: '3-Day Curriculum', href: '#curriculum' },
    { label: 'Why Free?', href: '#why-free' },
    { label: 'About the Mentor', href: '#mentor' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Upper Landing Page Countdown Banner */}
      <CountdownBanner onRegisterClick={onRegisterClick} classSettings={classSettings as any} />

      <div
        className={`${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-3'
            : 'bg-white py-3 sm:py-4 border-b border-slate-100/60 shadow-xs'
        } transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <a
            href="#hero"
            className="flex items-center gap-3 group text-left focus:outline-none"
            id="brand-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-tight">
                  CLARITY
                </span>
                <span className="text-xs font-bold text-blue-600 tracking-wider">
                  DIGITAL ACADEMY
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-tight flex items-center gap-1">
                <span>Learn</span>
                <span className="text-blue-700 font-bold">Skills.</span>
                <span>Earn</span>
                <span className="text-amber-500 font-bold">Globally.</span>
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-blue-600 after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {onAdminClick && (
              <button
                type="button"
                onClick={onAdminClick}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Admin Dashboard Portal"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            <div className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>100% Free Registration</span>
            </div>

            <button
              onClick={() => {
                trackInitiateRegistration('Header Desktop Button');
                onRegisterClick();
              }}
              id="header-register-btn"
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/30 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Register Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => {
                trackInitiateRegistration('Header Mobile Top Button');
                onRegisterClick();
              }}
              className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm"
            >
              Join Free
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-blue-700 py-2 border-b border-slate-100"
              >
                {link.label}
              </a>
            ))}

            {onAdminClick && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAdminClick();
                }}
                className="text-xs font-bold text-slate-500 hover:text-blue-600 text-left py-2 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Dashboard Login</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                trackInitiateRegistration('Header Mobile Drawer Button');
                onRegisterClick();
              }}
              className="w-full bg-blue-600 text-white font-bold text-sm py-3 rounded-xl shadow-md text-center flex items-center justify-center gap-2 mt-2"
            >
              <span>Claim Free 3-Day Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
