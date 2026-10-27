import React from 'react';
import {
  Headphones,
  Calculator,
  Mic,
  Bot,
  FileText,
  Sparkles,
  Type,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export type ActiveTab = 'player' | 'models' | 'studio' | 'mentor' | 'full-script';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  fontFamily: 'nastaliq' | 'arabic';
  setFontFamily: (font: 'nastaliq' | 'arabic') => void;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
}) => {
  const tabs: { id: ActiveTab; labelUrdu: string; icon: React.ReactNode }[] = [
    { id: 'player', labelUrdu: 'آڈیو اسکرپٹ پلیئر', icon: <Headphones className="w-4 h-4" /> },
    { id: 'models', labelUrdu: 'کاروباری ماڈلز و منافع', icon: <Calculator className="w-4 h-4" /> },
    { id: 'studio', labelUrdu: 'اردو TTS اسٹوڈیو', icon: <Mic className="w-4 h-4" /> },
    { id: 'mentor', labelUrdu: 'اے آئی مشیر', icon: <Bot className="w-4 h-4" /> },
    { id: 'full-script', labelUrdu: 'مکمل تحریر', icon: <FileText className="w-4 h-4" /> },
  ];

  const handleZoomIn = () => {
    if (fontSize === 'sm') setFontSize('base');
    else if (fontSize === 'base') setFontSize('lg');
    else if (fontSize === 'lg') setFontSize('xl');
  };

  const handleZoomOut = () => {
    if (fontSize === 'xl') setFontSize('lg');
    else if (fontSize === 'lg') setFontSize('base');
    else if (fontSize === 'base') setFontSize('sm');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 p-0.5 shadow-lg shadow-emerald-950/50">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white font-arabic tracking-wide">
                  کاروباری راہنما
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  TTS Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-arabic">
                کبھی نہ بند ہونے والے ۶ کاروباری آئیڈیاز مع Gemini Flash TTS
              </p>
            </div>
          </div>

          {/* Controls: Font Switch & Font Size */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {/* Font Family Switch */}
            <button
              onClick={() => setFontFamily(fontFamily === 'nastaliq' ? 'arabic' : 'nastaliq')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                fontFamily === 'nastaliq'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="خط تبدیل کریں"
            >
              {fontFamily === 'nastaliq' ? 'خطِ نستعلیق' : 'خطِ نسخ'}
            </button>

            {/* Font Size Adjusters */}
            <div className="flex items-center gap-1 border-r border-slate-800 pr-1 mr-1">
              <button
                onClick={handleZoomOut}
                disabled={fontSize === 'sm'}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                title="فونٹ چھوٹا کریں"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={fontSize === 'xl'}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                title="فونٹ بڑا کریں"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-2.5 no-scrollbar border-t border-slate-900/80">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition font-arabic ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.labelUrdu}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
