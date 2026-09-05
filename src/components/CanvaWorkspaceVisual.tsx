import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layout,
  MousePointer,
  Sparkles,
  Layers,
  Smartphone,
  Laptop,
  CheckCircle2,
  Sliders,
  Move,
  Eye,
  Shapes,
  Maximize2
} from 'lucide-react';

export const CanvaWorkspaceVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flyer' | 'social' | 'logo'>('flyer');
  const [activeColor, setActiveColor] = useState('#1E40AF');

  const colorPalettes = [
    { name: 'Navy & Cyan', primary: '#0A192F', secondary: '#0284C7', accent: '#38BDF8' },
    { name: 'Royal & Amber', primary: '#1E3A8A', secondary: '#F59E0B', accent: '#FEF3C7' },
    { name: 'Emerald & Slate', primary: '#064E3B', secondary: '#10B981', accent: '#D1FAE5' },
  ];

  return (
    <div className="relative w-full select-none" id="hero-graphic-composition">
      {/* Background Soft Radial Glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-sky-400/20 rounded-[3rem] blur-2xl -z-10 pointer-events-none" />

      {/* Main Workspace Frame (Laptop Canvas) */}
      <div className="bg-slate-900 text-white rounded-3xl p-3 sm:p-5 border border-slate-800 shadow-2xl shadow-blue-950/40 relative overflow-hidden">
        
        {/* Workspace Top Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex items-center gap-1 ml-1 sm:ml-2 px-2 sm:px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700/50">
              <span className="font-semibold text-sky-400">Canva</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 text-[11px]">Workspace</span>
            </div>
          </div>

          {/* Interactive Project Switcher */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('flyer')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'flyer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Event Flyer
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'social'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Instagram Post
            </button>
            <button
              onClick={() => setActiveTab('logo')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'logo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Brand Logo
            </button>
          </div>
        </div>

        {/* Mobile Tools Quick Strip */}
        <div className="flex sm:hidden items-center justify-between gap-1 overflow-x-auto pb-1 mb-3 text-[10px] text-slate-300 scrollbar-none">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 whitespace-nowrap">
            <Layout className="w-3 h-3 text-blue-400 shrink-0" />
            <span>Templates</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 whitespace-nowrap">
            <Shapes className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Elements</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 whitespace-nowrap">
            <Type className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Fonts</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 whitespace-nowrap">
            <Palette className="w-3 h-3 text-pink-400 shrink-0" />
            <span>Colours</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 whitespace-nowrap">
            <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Layers</span>
          </div>
        </div>

        {/* Workspace Canvas Inner Area */}
        <div className="grid grid-cols-12 gap-3 min-h-[300px] sm:min-h-[360px]">
          
          {/* Left Mini Sidebar (Canva tools) */}
          <div className="hidden sm:flex col-span-2 flex-col gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/80 text-[11px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Tools
            </span>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30">
              <Layout className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="font-medium">Templates</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:bg-slate-800">
              <Shapes className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Elements</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:bg-slate-800">
              <Type className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Typography</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:bg-slate-800">
              <Palette className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>Colours</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:bg-slate-800">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Layers</span>
            </div>

            <div className="mt-auto p-2 bg-blue-950/40 border border-blue-800/40 rounded-xl text-[10px] text-blue-200">
              <p className="font-bold">✨ Live Rule:</p>
              <p className="text-slate-300 mt-0.5">Hierarchy + Alignment = Clarity</p>
            </div>
          </div>

          {/* Center Artboard Area */}
          <div className="col-span-12 sm:col-span-7 bg-slate-950 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-800 relative group">
            
            {/* Design Artboard Simulation */}
            <div className="w-full max-w-[280px] sm:max-w-[310px] bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 relative overflow-hidden transition-all duration-300">
              
              {/* Top Accent Band */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600" />
              
              {/* Dynamic Design Content based on Tab */}
              {activeTab === 'flyer' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Free Masterclass
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">3 DAYS ONLY</span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      MASTER GRAPHIC DESIGN IN CANVA
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-snug">
                      Learn practical typography, colour balance & layout principles.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-blue-700">
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Phone / Laptop</span>
                    </div>
                    <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      ₦0.00 FREE
                    </span>
                  </div>
                  <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-500 font-semibold">
                    <span>Clarity Digital Academy</span>
                    <span className="text-blue-600 font-bold">WhatsApp Live</span>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-3 text-center py-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white mx-auto flex items-center justify-center font-black text-xs">
                    💡
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      Design Tip #04
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">
                      "Don't fill every empty space."
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Whitespace makes your headline 10x easier to read.
                    </p>
                  </div>
                  <div className="bg-blue-50 text-blue-800 text-[10px] font-bold py-1 px-3 rounded-lg inline-block">
                    @claritydigitalacademy
                  </div>
                </div>
              )}

              {activeTab === 'logo' && (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                    <span className="text-2xl font-black tracking-tighter">CDA</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base tracking-tight">
                      CLARITY DIGITAL
                    </h4>
                    <p className="text-[10px] tracking-widest text-slate-500 font-bold uppercase">
                      Learn Skills • Earn Globally
                    </p>
                  </div>
                </div>
              )}

              {/* Canva Element Selection Outline Mockup */}
              <div className="absolute inset-2 border-2 border-blue-500/40 rounded-xl pointer-events-none">
                <span className="absolute -top-2 -left-2 w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                <span className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                <span className="absolute -bottom-2 -left-2 w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                <span className="absolute -bottom-2 -right-2 w-2.5 h-2.5 bg-blue-600 rounded-sm" />
              </div>
            </div>

            {/* Design Mouse Pointer Floating Badge */}
            <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700 text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <MousePointer className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
              <span>Smart Alignment Active</span>
            </div>
          </div>

          {/* Right Mobile Preview & Color Swatches - Visible on all devices */}
          <div className="col-span-12 sm:col-span-3 grid grid-cols-1 sm:grid-cols-1 gap-3 mt-3 sm:mt-0">
            
            {/* Smartphone Companion Mockup */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" /> Phone Canva App
                </span>
                <span className="text-emerald-400 text-[10px] font-bold">Synced</span>
              </div>
              <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 text-center text-xs">
                <div className="w-6 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
                <p className="text-[11px] font-bold text-white leading-tight">
                  Design smoothly from Android or iPhone
                </p>
                <p className="text-[10px] text-slate-400 mt-1">No laptop required to start.</p>
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Touch Gestures</span>
                <span className="text-sky-400 font-bold">100% Practical</span>
              </div>
            </div>

            {/* Live Color Swatch Tool */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-300 mb-2">
                <span className="font-bold flex items-center gap-1 text-slate-200">
                  <Palette className="w-3.5 h-3.5 text-pink-400" /> Colour Theory
                </span>
                <span className="text-[10px] text-slate-500">60-30-10</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="h-7 rounded-lg bg-blue-900 flex items-center justify-center text-[9px] text-white font-bold">
                  Navy 60%
                </div>
                <div className="h-7 rounded-lg bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold">
                  Royal 30%
                </div>
                <div className="h-7 rounded-lg bg-sky-400 flex items-center justify-center text-[9px] text-slate-950 font-black">
                  Cyan 10%
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Banner inside Laptop Frame */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-300">
              3-Day Intensive Class • Onifade Sulaiman (Mr. Clarity)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Beginner Friendly
            </span>
            <span className="flex items-center gap-1 text-slate-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Zero Cost
            </span>
          </div>
        </div>

      </div>

      {/* Floating Design Chips for conversion reinforcement */}
      <div className="absolute -top-3 -right-3 bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl py-2 px-3 flex items-center gap-2 animate-bounce-subtle">
        <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
          👑
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-900 leading-none">Canva Pro NOT Required</p>
          <p className="text-[10px] text-slate-500 font-medium">Learn with Free Canva</p>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-3 bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl py-2 px-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
          📱
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-900 leading-none">Smartphone Ready</p>
          <p className="text-[10px] text-slate-500 font-medium">Design from anywhere</p>
        </div>
      </div>
    </div>
  );
};
