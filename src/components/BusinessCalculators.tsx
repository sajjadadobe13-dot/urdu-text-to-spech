import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Headphones,
  Sliders,
  Sparkles,
  Calculator,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BUSINESS_IDEAS, BusinessIdea } from '../data/businessData';

interface BusinessCalculatorsProps {
  onPlaySection: (sectionNumber: number) => void;
  fontFamily: 'nastaliq' | 'arabic';
  fontSizeClass: string;
}

export const BusinessCalculators: React.FC<BusinessCalculatorsProps> = ({
  onPlaySection,
  fontFamily,
  fontSizeClass,
}) => {
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(BUSINESS_IDEAS[0].id);
  const [calculatorInputs, setCalculatorInputs] = useState<Record<string, number>>({
    'tiffin-service': 25,
    'mobile-repair': 4,
    'grocery-store': 25000,
    'tuition-skills': 15,
    'local-services': 3,
    'essential-care': 8,
  });

  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(BUSINESS_IDEAS[0].id);

  const activeIdea = BUSINESS_IDEAS.find((i) => i.id === selectedIdeaId) || BUSINESS_IDEAS[0];
  const currentUnits = calculatorInputs[activeIdea.id] ?? activeIdea.calculator.defaultUnits;

  // Calculate earnings for the active idea
  const calc = activeIdea.calculator;
  let dailyGross = 0;
  let monthlyNetProfit = 0;

  if (activeIdea.id === 'grocery-store') {
    // Retail margin
    const dailyVolume = currentUnits;
    dailyGross = dailyVolume * calc.profitPerUnit; // 12%
    const monthlyGross = dailyGross * 26;
    monthlyNetProfit = Math.max(0, monthlyGross - calc.extraFixedCost);
  } else if (activeIdea.id === 'tuition-skills') {
    // Monthly fees per student
    const monthlyGross = currentUnits * calc.profitPerUnit;
    dailyGross = monthlyGross / 26;
    monthlyNetProfit = Math.max(0, monthlyGross - calc.extraFixedCost);
  } else {
    // Daily units
    dailyGross = currentUnits * calc.profitPerUnit;
    const monthlyGross = dailyGross * 26;
    monthlyNetProfit = Math.max(0, monthlyGross - calc.extraFixedCost);
  }

  const handleUnitChange = (ideaId: string, val: number) => {
    setCalculatorInputs((prev) => ({
      ...prev,
      [ideaId]: val,
    }));
  };

  const formatPkCurrency = (amount: number) => {
    return new Intl.NumberFormat('ur-PK', {
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2 font-arabic">
              <TrendingUp className="w-3.5 h-3.5" />
              کبھی نہ بند ہونے والے ۶ ماڈلز
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-arabic">
              کاروباری ماڈلز اور منافع کا لائیو کیلکولیٹر
            </h2>
            <p className="text-slate-300 text-sm mt-1 font-arabic">
              سلائیڈر گھما کر دیکھیں کہ روزانہ کتنے گاہکوں پر آپ کو ماہانہ کتنا خالص منافع حاصل ہو سکتا ہے۔
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Calculator Box */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg font-arabic">
              لائیو منافع تخمینہ کار ({activeIdea.titleUrdu})
            </h3>
          </div>

          {/* Business Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {BUSINESS_IDEAS.map((idea) => (
              <button
                key={idea.id}
                onClick={() => setSelectedIdeaId(idea.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-arabic ${
                  selectedIdeaId === idea.id
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                نمبر {idea.number}: {idea.titleUrdu.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2 font-arabic">
                <label className="text-sm font-semibold text-slate-200">
                  {calc.unitName}:
                </label>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  {currentUnits} {activeIdea.id === 'grocery-store' ? 'روپے' : ''}
                </span>
              </div>
              <input
                type="range"
                min={calc.minUnits}
                max={calc.maxUnits}
                step={calc.step}
                value={currentUnits}
                onChange={(e) => handleUnitChange(activeIdea.id, parseFloat(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono mt-1">
                <span>کم از کم: {calc.minUnits}</span>
                <span>زیادہ سے زیادہ: {calc.maxUnits}</span>
              </div>
            </div>

            {/* Parameters description */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs font-arabic">
              <div className="flex justify-between text-slate-300">
                <span>شرحِ منافع / یونٹ آمدنی:</span>
                <span className="font-bold text-slate-100">
                  {activeIdea.id === 'grocery-store'
                    ? '12% خالص مارجن'
                    : `${calc.profitPerUnit} روپے فی گاہک`}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>ماہانہ فکسڈ اخراجات (پٹرول، پیکنگ، بجلی):</span>
                <span className="font-bold text-amber-400">
                  {formatPkCurrency(calc.extraFixedCost)} روپے
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>کام کے دن:</span>
                <span className="font-bold text-slate-100">۲۶ دن فی ماہ</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                * {calc.explanationUrdu}
              </p>
            </div>
          </div>

          {/* Results Summary Cards (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 shadow-lg text-right">
              <span className="text-xs text-emerald-400 font-semibold font-arabic">
                ماہانہ خالص منافع (Net Profit)
              </span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                {formatPkCurrency(monthlyNetProfit)} <span className="text-sm font-arabic font-normal">روپے</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-arabic">
                تمام اخراجات نکالنے کے بعد آپ کی جیب کا خالص منافع
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-lg text-right">
              <span className="text-xs text-indigo-400 font-semibold font-arabic">
                سالانہ متوقع بچت (Annual Savings)
              </span>
              <div className="text-3xl font-extrabold text-slate-100 mt-2 font-mono">
                {formatPkCurrency(monthlyNetProfit * 12)} <span className="text-sm font-arabic font-normal">روپے</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-arabic">
                اگر ہر ماہ یہ اوسط برقرار رہے
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-lg text-right">
              <span className="text-xs text-amber-400 font-semibold font-arabic">
                مطلوبہ ابتدائی سرمایہ (Startup Capital)
              </span>
              <div className="text-xl font-bold text-slate-100 mt-2 font-arabic">
                {activeIdea.investmentPk.displayUrdu}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-arabic">
                آلات، سامان اور بنیادی سیٹ اپ
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-lg text-right flex flex-col justify-between">
              <div>
                <span className="text-xs text-sky-400 font-semibold font-arabic">
                  رسک اور آسانی
                </span>
                <div className="flex items-center gap-2 mt-2 font-arabic">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    رسک: {activeIdea.riskLevel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                    {activeIdea.difficulty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onPlaySection(activeIdea.number)}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition font-arabic"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>اس کاروبار کی آڈیو سنیں</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cards for All 6 Businesses */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white font-arabic flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          <span>تفصیلی کاروباری روڈ میپ اور فوائد</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {BUSINESS_IDEAS.map((idea) => {
            const isExpanded = expandedIdeaId === idea.id;
            return (
              <div
                key={idea.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition"
              >
                {/* Card Header (Accordion Clickable) */}
                <div
                  onClick={() => setExpandedIdeaId(isExpanded ? null : idea.id)}
                  className="p-5 cursor-pointer hover:bg-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm font-mono">
                      0{idea.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-white font-arabic">
                          {idea.titleUrdu}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-arabic">
                          {idea.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-arabic">
                        {idea.summaryUrdu}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-left sm:text-right hidden sm:block">
                      <span className="text-[11px] text-slate-400 block font-arabic">متوقع ماہانہ بچت:</span>
                      <span className="text-sm font-bold text-emerald-400 font-arabic">
                        {idea.monthlyEarningPk.displayUrdu}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-800/80 space-y-6">
                    {/* Advantages & Launch steps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Key Advantages */}
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <h5 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-1.5 font-arabic">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>یہ کاروبار کبھی بند کیوں نہیں ہوتا؟</span>
                        </h5>
                        <ul className="space-y-2 text-xs text-slate-300 font-arabic text-right" dir="rtl">
                          {idea.advantages.map((adv, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-2">
                              <span className="text-emerald-400 text-sm leading-none">•</span>
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 7-Day Startup Roadmap */}
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <h5 className="text-xs font-bold text-indigo-400 mb-3 flex items-center gap-1.5 font-arabic">
                          <Lightbulb className="w-4 h-4" />
                          <span>آغاز کے لیے فوری اقدامات (Roadmap)</span>
                        </h5>
                        <ul className="space-y-2 text-xs text-slate-300 font-arabic text-right" dir="rtl">
                          {idea.startupSteps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] text-indigo-300 flex items-center justify-center font-mono flex-shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 font-arabic flex items-start gap-2 text-right" dir="rtl">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">کامیابی کا خفیہ فارمولا: </span>
                        {idea.proTips.join(' ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
