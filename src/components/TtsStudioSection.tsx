import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  Download,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  FileText,
  Wand2,
  Check,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { VOICES } from '../data/businessData';

interface TtsStudioSectionProps {
  fontFamily: 'nastaliq' | 'arabic';
  fontSizeClass: string;
}

const PRESET_SCRIPTS = [
  {
    title: 'ٹفن سروس واٹس ایپ پروموشن',
    text: `السلام علیکم! کیا آپ بھی روزانہ ہوٹل کے غیر معیاری اور غیر صحتمندانہ کھانے سے پریشان ہیں؟ اب گھر جیسا خالص، گرما گرم اور لذیذ کھانا آپ کے آفس یا ہاسٹل میں دستیاب ہے۔ صرف 200 روپے میں بھرپور لنچ باکس! آج ہی آرڈر کرنے کے لیے واٹس ایپ پر رابطہ کریں۔`,
    style: 'Warm, inviting, clear Urdu hospitality pitch',
  },
  {
    title: 'موبائل ریپئرنگ شاپ آفر',
    text: `کیا آپ کے فون کی اسکرین ٹوٹ گئی ہے یا بیٹری بار بار ختم ہو جاتی ہے؟ فکر چھوڑیں! ہمارے پاس تمام جدید موبائل فونز کی اوریجنل اسکرینز اور بیٹریاں دستیاب ہیں۔ صرف 30 منٹ میں فوری مرمت مع 7 دن کی وارنٹی۔ تشریف لائیے اور تسلی بخش کام کروائیے۔`,
    style: 'Confident, clear, urgent professional technician tone',
  },
  {
    title: 'ایمرجنسی الیکٹریشن و پلمبر سروس',
    text: `گھر میں وائرنگ کا مسئلہ ہو یا پانی کا پائپ لیک ہو گیا ہو؟ 24 گھنٹے ایمرجنسی خدمات کے لیے ہمیں کال کریں۔ تجربہ کار کاریگر 15 منٹ میں آپ کے دروازے پر۔ مناسب معاوضہ اور معیاری کام کی مکمل ضمانت!`,
    style: 'Direct, dependable, authoritative emergency service tone',
  },
  {
    title: 'ٹیوشن اکیڈمی مفت ٹرائل اشتہار',
    text: `والدین متوجہ ہوں! کیا آپ کا بچہ ریاضی یا انگلش میں کمزور ہے؟ ہمارے پاس مستند اساتذہ کی زیرِ نگرانی خصوصی شام کی کلاسز شروع ہو چکی ہیں۔ پہلے ہفتے کی کلاسز بالکل مفت! ابھی اپنے بچے کا داخلہ یقینی بنائیں اور بہتر نتائج پائیں۔`,
    style: 'Encouraging, respectful, educational mentor tone',
  },
];

export const TtsStudioSection: React.FC<TtsStudioSectionProps> = ({
  fontFamily,
  fontSizeClass,
}) => {
  const [inputText, setInputText] = useState<string>(PRESET_SCRIPTS[0].text);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [stylePrompt, setStylePrompt] = useState<string>(
    'Natural, clear, articulate Urdu narrator with realistic cadence and engaging delivery'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerateTts = async () => {
    if (!inputText.trim()) {
      setErrorMsg('براہ کرم آواز میں تبدیل کرنے کے لیے کوئی متن درج کیجیے۔');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMsg(null);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          voiceName: selectedVoice,
          style: stylePrompt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'آواز بنانے میں ناکامی ہوئی۔');
      }

      const result = await res.json();
      if (!result.audioBase64) {
        throw new Error('آڈیو ڈیٹا موصول نہیں ہوا۔');
      }

      const src = `data:${result.mimeType || 'audio/wav'};base64,${result.audioBase64}`;
      setAudioUrl(src);

      // Setup audio element
      if (audioRef.current) {
        audioRef.current.src = src;
        audioRef.current.onended = () => setIsPlaying(false);
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error('TTS Generation error:', err);
      setErrorMsg(err?.message || 'آڈیو بناتے وقت خرابی واقع ہوئی۔');
      setIsPlaying(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleInsertTag = (tag: string) => {
    setInputText((prev) => `${prev} ${tag}`);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `urdu-tts-${selectedVoice}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Gemini 3.8 Flash TTS Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-arabic">
              اردو ٹیکسٹ ٹو اسپیچ اسٹوڈیو (Urdu TTS Studio)
            </h2>
            <p className="text-slate-300 text-sm mt-1 font-arabic">
              کوئی بھی اردو تحریر لکھیں یا پیسٹ کریں اور Gemini 3.8 Flash TTS سے قدرتی انسانی آواز حاصل کریں۔
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs border border-slate-700 font-mono">
              24,000 Hz WAV
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Preset Templates & Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Presets card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="font-semibold text-slate-200 text-sm mb-3 flex items-center gap-2 font-arabic">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>ریڈی میڈ کاروباری اسکرپٹس</span>
            </h3>
            <div className="space-y-2">
              {PRESET_SCRIPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(preset.text);
                    setStylePrompt(preset.style);
                  }}
                  className="w-full text-right p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition font-arabic flex items-center justify-between"
                >
                  <span className="font-semibold">{preset.title}</span>
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Voice & Persona Selection */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2 font-arabic">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>صوتی کنفیگریشن (Voice Persona)</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-arabic">
                ماڈل آواز:
              </label>
              <div className="space-y-2">
                {VOICES.map((v) => (
                  <label
                    key={v.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      selectedVoice === v.id
                        ? 'bg-indigo-950/70 border-indigo-500/60 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="voice"
                        value={v.id}
                        checked={selectedVoice === v.id}
                        onChange={() => setSelectedVoice(v.id)}
                        className="text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="font-bold font-arabic">{v.nameUrdu}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-arabic">
                      {v.gender}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Natural burst helpers */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-arabic">
                قدرتی اظہار ٹیگز (Gemini Flash TTS Tags):
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleInsertTag('<breath>')}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
                  title="سانس کا قدرتی وقفہ"
                >
                  + &lt;breath&gt;
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTag('|yeah|')}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
                  title="اثباتی تائید"
                >
                  + |yeah|
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTag('|mhm|')}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
                  title="قدرتی ہم آہنگی"
                >
                  + |mhm|
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTag('<laugh>')}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
                  title="ہلکی مسکراہٹ"
                >
                  + &lt;laugh&gt;
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTag('...')}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
                  title="مختصر وقفہ"
                >
                  + ... (وقفہ)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Text Editor & Audio Player (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 font-arabic">
                اردو متن درج کیجیے:
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span>{inputText.length} حروف</span>
                <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} الفاظ</span>
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs text-right font-arabic">
                {errorMsg}
              </div>
            )}

            {/* Urdu Textarea */}
            <textarea
              dir="rtl"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              placeholder="یہاں اپنی کاروباری تحریر یا اعلان لکھیں..."
              className={`w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 leading-relaxed transition ${
                fontFamily === 'nastaliq' ? 'font-nastaliq' : 'font-arabic'
              } ${fontSizeClass}`}
            />

            {/* Style Prompt Override */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-arabic">
                لہجہ و انداز (Voice Style Directive):
              </label>
              <input
                type="text"
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-indigo-500 font-latin"
                placeholder="e.g. Inspiring Urdu business narrator, energetic and confident"
              />
            </div>

            {/* Generate Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleGenerateTts}
                disabled={isGenerating || !inputText.trim()}
                className="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center gap-2.5 transition shadow-lg shadow-indigo-950/50 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-arabic">Gemini 3.8 Flash TTS آواز بنا رہا ہے...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-arabic">آواز بنائیں (Generate Speech)</span>
                  </>
                )}
              </button>

              {audioUrl && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayback}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    <span className="font-arabic">{isPlaying ? 'وقفہ' : 'پلے آڈیو'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>WAV فائل</span>
                  </button>
                </div>
              )}
            </div>

            {/* Audio waveform card if generated */}
            {audioUrl && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-slate-200 font-arabic">
                    آڈیو کامیابی سے تیار ہو چکی ہے ({selectedVoice})
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">24kHz PCM / WAV</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
