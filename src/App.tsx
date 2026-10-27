/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { AudioPlayerSection } from './components/AudioPlayerSection';
import { BusinessCalculators } from './components/BusinessCalculators';
import { TtsStudioSection } from './components/TtsStudioSection';
import { AiMentorSection } from './components/AiMentorSection';
import { FullScriptView } from './components/FullScriptView';
import { Headphones, ShieldCheck, Sparkles, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('player');
  const [fontFamily, setFontFamily] = useState<'nastaliq' | 'arabic'>('arabic');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  const fontSizeClassMap = {
    sm: 'text-sm md:text-base',
    base: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
  };

  const handlePlaySectionFromAnywhere = (sectionIdx: number) => {
    setActiveTab('player');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'player' && (
          <AudioPlayerSection
            fontFamily={fontFamily}
            fontSizeClass={fontSizeClassMap[fontSize]}
          />
        )}

        {activeTab === 'models' && (
          <BusinessCalculators
            onPlaySection={handlePlaySectionFromAnywhere}
            fontFamily={fontFamily}
            fontSizeClass={fontSizeClassMap[fontSize]}
          />
        )}

        {activeTab === 'studio' && (
          <TtsStudioSection
            fontFamily={fontFamily}
            fontSizeClass={fontSizeClassMap[fontSize]}
          />
        )}

        {activeTab === 'mentor' && (
          <AiMentorSection
            fontFamily={fontFamily}
            fontSizeClass={fontSizeClassMap[fontSize]}
          />
        )}

        {activeTab === 'full-script' && (
          <FullScriptView
            fontFamily={fontFamily}
            fontSizeClass={fontSizeClassMap[fontSize]}
            onPlaySection={handlePlaySectionFromAnywhere}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-arabic">
              طاقتور صوتی ماڈل: <strong className="text-slate-200">gemini-3.8-flash-tts</strong> (اسٹوڈیو معیار 24kHz)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-center font-arabic">
            <span>ٹفن سروس</span>
            <span>•</span>
            <span>موبائل ریپئرنگ</span>
            <span>•</span>
            <span>کریانہ اسٹور</span>
            <span>•</span>
            <span>ٹیوشن و ہنر</span>
            <span>•</span>
            <span>لوکل سروسز (پلمبر/الیکٹریشن)</span>
            <span>•</span>
            <span>کوئیک آٹو سروس</span>
          </div>

          <div className="text-slate-500 font-latin text-[11px]">
            Evergreen Urdu Business Guide &copy; 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
