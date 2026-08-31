import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  BarChart3,
  Settings,
  MessageCircle,
  History,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  Layers,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { AdminUser, ClassSettings } from '../../types';

export type AdminTab =
  | 'dashboard'
  | 'participants'
  | 'send_email'
  | 'email_templates'
  | 'analytics'
  | 'class_settings'
  | 'whatsapp'
  | 'activity_log'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminUser: AdminUser | null;
  classSettings: ClassSettings | null;
  onLogout: () => void;
  onViewLandingPage: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  adminUser,
  classSettings,
  onLogout,
  onViewLandingPage,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'send_email', label: 'Send Email', icon: Mail },
    { id: 'email_templates', label: 'Email Templates', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'class_settings', label: 'Class Settings', icon: GraduationCap },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'activity_log', label: 'Activity Log', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: AdminTab) => {
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* ----------------- SIDEBAR (Desktop) ----------------- */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-[#0B1528] text-white flex-col shrink-0 border-r border-slate-800 shadow-xl z-20">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
                Clarity Digital Academy
              </h1>
              <p className="text-[11px] text-blue-400 font-medium tracking-wide">
                CRM & Student Control Hub
              </p>
            </div>
          </div>
          <div className="mt-3 inline-block px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-[10px] text-slate-300 font-medium">
            "Learn Skills. Earn Globally."
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as AdminTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Administrator Profile & Quick Action */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070E1B] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                MC
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {adminUser?.name || 'Onifade Sulaiman'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {adminUser?.email || 'ipesolasulaiman@gmail.com'}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onViewLandingPage}
            className="w-full py-2 px-3 bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>View Landing Page</span>
          </button>
        </div>
      </aside>

      {/* ----------------- MOBILE HEADER & DRAWER ----------------- */}
      <div className="md:hidden bg-[#0B1528] text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">Clarity Academy</h2>
            <p className="text-[10px] text-blue-400">Admin CRM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewLandingPage}
            className="px-2.5 py-1.5 bg-slate-800 text-[11px] font-medium text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Landing</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col pt-16">
          <div className="bg-[#0B1528] flex-1 p-4 overflow-y-auto space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/30 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MAIN CONTENT AREA ----------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Operational Header */}
        <header className="bg-white border-b border-slate-200/90 px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 shadow-xs">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{getGreeting()}, Mr. Clarity</span>
              <span className="inline-block animate-wave origin-bottom-right">👋</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Here's what's happening with your Canva Class.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Active Class Badge */}
            <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs flex items-center gap-2">
              <span className="font-bold text-slate-800">
                {classSettings?.class_name || 'Free 3-Day Canva Design Class'}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                  classSettings?.registration_status === 'OPEN'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    classSettings?.registration_status === 'OPEN' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                  }`}
                />
                {classSettings?.registration_status || 'OPEN'}
              </span>
            </div>

            {/* Quick Landing View CTA */}
            <button
              onClick={onViewLandingPage}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>VIEW LANDING PAGE</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto bg-slate-50/70">
          {children}
        </main>
      </div>
    </div>
  );
};
