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
  Radio,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { AdminUser, ClassSettings } from '../../types';

export type AdminTab =
  | 'dashboard'
  | 'live_activity'
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
    { id: 'live_activity', label: 'Live Activity', icon: Radio, badge: 'Live' },
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    {item.badge}
                  </span>
                )}
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
      <div className="md:hidden bg-[#0B1528] text-white p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">Clarity Academy</h1>
            <p className="text-[10px] text-blue-400">Admin CRM Portal</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[61px] bg-slate-950/90 backdrop-blur-md z-40 p-4 space-y-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={onViewLandingPage}
              className="w-full py-2.5 px-4 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Go to Landing Page</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 bg-rose-600/20 border border-rose-600/40 text-rose-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MAIN CONTENT AREA ----------------- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
          <div>
            <span className="text-xs text-slate-400 font-medium">{getGreeting()},</span>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{adminUser?.name || 'Mr. Clarity (Onifade Sulaiman)'}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-wide">
                Super Admin
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {classSettings && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                <span
                  className={`w-2 h-2 rounded-full ${
                    classSettings.registration_status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span>Registration: <strong>{classSettings.registration_status}</strong></span>
              </div>
            )}

            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};
