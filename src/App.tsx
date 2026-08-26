import React, { useState } from 'react';
import { PetControlPanel } from './components/SidePanel/PetControlPanel';
import { Popup } from './popup/Popup';
import { ContentOverlay } from './content/ContentOverlay';
import { Sparkles, Monitor, Layout, Smartphone, Info } from 'lucide-react';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'webpage' | 'room' | 'popup'>('webpage');

  return (
    <div className="min-h-screen bg-[#fdf4f7] font-sans flex flex-col text-cozy-text">
      {/* Top Banner Navigation bar for Preview Mode */}
      <header className="bg-white/80 backdrop-blur-md border-b border-cozy-border-light px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <span className="text-2xl animate-bounce">🐱</span>
          <div>
            <h1 className="font-extrabold text-base tracking-wide text-cozy-text">Virtual Pet Extension</h1>
            <p className="text-xs text-cozy-subtext font-medium">Interactive Chrome Extension Preview</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-2 bg-cozy-pink-light p-1 rounded-full border border-cozy-border-light">
          <button
            onClick={() => setViewMode('webpage')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'webpage'
                ? 'bg-cozy-pink text-white shadow-sm'
                : 'text-cozy-subtext hover:text-cozy-text'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Webpage Overlay View</span>
          </button>

          <button
            onClick={() => setViewMode('room')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'room'
                ? 'bg-cozy-pink text-white shadow-sm'
                : 'text-cozy-subtext hover:text-cozy-text'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Control Panel / Room</span>
          </button>

          <button
            onClick={() => setViewMode('popup')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'popup'
                ? 'bg-cozy-pink text-white shadow-sm'
                : 'text-cozy-subtext hover:text-cozy-text'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Extension Popup</span>
          </button>
        </div>
      </header>

      {/* Main Content Body based on selected View Mode */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Mode 1: Recreating input_file_1.png Cozy Webpage Simulation */}
        {viewMode === 'webpage' && (
          <div className="w-full max-w-4xl bg-white rounded-cozy-lg border-cozy shadow-2xl overflow-hidden relative min-h-[600px] my-4 flex flex-col">
            {/* Simulated Browser Chrome Navigation Bar */}
            <div className="bg-[#f3eaee] px-4 py-2.5 border-b border-cozy-border-light flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block border border-rose-600" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block border border-amber-600" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block border border-emerald-600" />
              </div>

              {/* URL Bar matching Figma screenshot input_file_1.png */}
              <div className="flex-1 mx-8 max-w-xl bg-white/90 px-4 py-1 rounded-full border border-cozy-border-light text-xs font-medium text-cozy-subtext flex items-center justify-between shadow-inner">
                <span className="truncate">https://kawaiiblog.com/how-to-cozy-up-your-room</span>
                <span className="text-cozy-pink font-bold text-[10px]">🔒 SECURE</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-full bg-cozy-pink-light text-cozy-pink text-xs border border-cozy-pink-border">🐾</span>
              </div>
            </div>

            {/* Webpage Content Article matching Figma design input_file_1.png */}
            <div className="p-8 max-w-2xl mx-auto space-y-6 flex-1 text-slate-800 leading-relaxed font-sans">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-cozy-text flex items-center gap-2">
                  <span>How to Cozy Up Your Desk for Peak Warmth</span>
                  <span>🌸</span>
                </h1>
                <p className="text-xs font-bold text-cozy-pink uppercase tracking-widest">
                  COZY LIFE • Written by Mochi Lover
                </p>
              </div>

              <p className="text-base text-slate-600">
                Making your desk space inviting is more than just buying cute mugs. It's about lighting, the tactile feeling of your wood grain, and perhaps having a tiny virtual companion wandering around!
              </p>

              <p className="text-base text-slate-600 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                Just imagine looking down to see a small white cat walking across your paragraphs, leaving soft dotted footprints and showing you hearts when it's happy. It takes the stress away from your busy work day.
              </p>

              <p className="text-base text-slate-600">
                Try adding soft amber desk lights or warm beverage warmers. These small elements build a magical atmosphere that keeps your creativity bubbling over!
              </p>
            </div>

            {/* Injected Content Script Overlay Component */}
            <ContentOverlay />
          </div>
        )}

        {/* Mode 2: Control Panel / Room View matching input_file_2.png & input_file_4.png */}
        {viewMode === 'room' && (
          <div className="w-full max-w-md bg-cozy-pink-light rounded-cozy-lg border-cozy shadow-2xl overflow-hidden my-4">
            <PetControlPanel />
          </div>
        )}

        {/* Mode 3: Extension Popup View matching input_file_3.png */}
        {viewMode === 'popup' && (
          <div className="w-[360px] my-4 shadow-2xl rounded-cozy">
            <Popup />
          </div>
        )}
      </main>
    </div>
  );
};
