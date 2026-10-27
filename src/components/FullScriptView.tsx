import React, { useState } from 'react';
import { Copy, Check, Printer, FileText, Sparkles, BookOpen } from 'lucide-react';
import { SCRIPT_SECTIONS } from '../data/businessData';

interface FullScriptViewProps {
  fontFamily: 'nastaliq' | 'arabic';
  fontSizeClass: string;
  onPlaySection: (idx: number) => void;
}

export const FullScriptView: React.FC<FullScriptViewProps> = ({
  fontFamily,
  fontSizeClass,
  onPlaySection,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const fullText = SCRIPT_SECTIONS.map(
    (s) => `--- ${s.titleUrdu} ---\n\n${s.scriptUrdu}\n\n`
  ).join('\n');

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2 font-arabic">
            <BookOpen className="w-3.5 h-3.5" />
            مکمل تحریری متن (Complete Urdu Script)
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-arabic">
            کبھی نہ بند ہونے والے کاروبار - مکمل اردو اسکرپٹ
          </h2>
          <p className="text-slate-300 text-sm mt-1 font-arabic">
            مکمل ویڈیو اسکرپٹ کا اصل اردو متن، ابواب اور حوالہ جات
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="font-arabic">{copied ? 'پورا متن کاپی ہو گیا' : 'مکمل اسکرپٹ کاپی کریں'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow"
          >
            <Printer className="w-4 h-4" />
            <span className="font-arabic">پرنٹ ویو</span>
          </button>
        </div>
      </div>

      {/* Chapters Document Body */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl space-y-10" dir="rtl">
        {SCRIPT_SECTIONS.map((sec, idx) => (
          <article
            key={sec.id}
            className="space-y-4 pb-8 border-b border-slate-800/80 last:border-b-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs font-mono">
                  0{sec.number}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-white font-arabic">
                  {sec.titleUrdu}
                </h3>
              </div>
              <button
                onClick={() => onPlaySection(idx)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20 transition font-arabic flex items-center gap-1.5"
              >
                <span>یہ حصہ سنیں</span>
              </button>
            </div>

            <div
              className={`text-slate-200 leading-relaxed space-y-4 ${
                fontFamily === 'nastaliq' ? 'font-nastaliq' : 'font-arabic'
              } ${fontSizeClass}`}
            >
              {sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-justify leading-loose">
                  {p}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
