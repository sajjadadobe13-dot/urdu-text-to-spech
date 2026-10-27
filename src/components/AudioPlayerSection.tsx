import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronLeft,
  FastForward,
  Bookmark,
  Share2,
  Check,
  Headphones,
  Sliders,
  Type,
} from 'lucide-react';
import { SCRIPT_SECTIONS, VOICES } from '../data/businessData';

interface AudioPlayerProps {
  onSelectBusiness?: (id: string) => void;
  fontFamily: 'nastaliq' | 'arabic';
  fontSizeClass: string;
}

export const AudioPlayerSection: React.FC<AudioPlayerProps> = ({
  fontFamily,
  fontSizeClass,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [autoNext, setAutoNext] = useState<boolean>(true);
  const [narratorStyle, setNarratorStyle] = useState<string>(
    'Clear, confident, natural Urdu professional speech, engaging pacing and warm cadence'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(0);

  // Audio element reference & Cache of base64 audio per section
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  const currentSection = SCRIPT_SECTIONS[currentSectionIndex];

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && audio.duration > 0) {
        setDuration(audio.duration);
        // Estimate active paragraph based on time progress
        const fraction = audio.currentTime / audio.duration;
        const totalParas = currentSection.paragraphs.length;
        const pIndex = Math.min(Math.floor(fraction * totalParas), totalParas - 1);
        setActiveParagraphIndex(pIndex);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (autoNext && currentSectionIndex < SCRIPT_SECTIONS.length - 1) {
        setCurrentSectionIndex((prev) => prev + 1);
      }
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsLoadingAudio(false);
      setErrorMessage('آڈیو چلانے میں مسئلہ پیش آیا۔ دوبارہ پلے کریں۔');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentSectionIndex, autoNext, currentSection]);

  // Adjust audio playback speed & volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [audioSpeed, volume, isMuted]);

  // When switching section, reset states and optionally auto-play if previously playing
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setActiveParagraphIndex(0);
    setErrorMessage(null);

    if (isPlaying) {
      loadAndPlaySection(currentSectionIndex);
    }
  }, [currentSectionIndex]);

  const getCacheKey = (sectionIdx: number, voice: string) => {
    return `${sectionIdx}-${voice}-${narratorStyle}`;
  };

  const loadAndPlaySection = async (sectionIdx: number) => {
    const section = SCRIPT_SECTIONS[sectionIdx];
    const cacheKey = getCacheKey(sectionIdx, selectedVoice);

    try {
      setIsLoadingAudio(true);
      setErrorMessage(null);

      let audioDataUrl = audioCacheRef.current.get(cacheKey);

      if (!audioDataUrl) {
        // Fetch TTS from server endpoint using gemini-3.8-flash-tts
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: section.scriptUrdu,
            voiceName: selectedVoice,
            style: narratorStyle,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'TTS آواز تیار کرنے میں ناکامی۔');
        }

        const data = await res.json();
        if (!data.audioBase64) {
          throw new Error('سرور سے آڈیو موصول نہیں ہوئی۔');
        }

        audioDataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        audioCacheRef.current.set(cacheKey, audioDataUrl);
      }

      if (audioRef.current) {
        audioRef.current.src = audioDataUrl;
        audioRef.current.playbackRate = audioSpeed;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error('Play section error:', err);
      setErrorMessage(err?.message || 'آڈیو لوڈ کرنے میں خرابی ہوئی۔ انٹرنیٹ یا کنفیگریشن چیک کیجیے۔');
      setIsPlaying(false);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.src && audioRef.current.src !== '') {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        loadAndPlaySection(currentSectionIndex);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleDownload = () => {
    const cacheKey = getCacheKey(currentSectionIndex, selectedVoice);
    const audioSrc = audioCacheRef.current.get(cacheKey) || audioRef.current?.src;
    if (!audioSrc) {
      loadAndPlaySection(currentSectionIndex);
      return;
    }
    const a = document.createElement('a');
    a.href = audioSrc;
    a.download = `urdu-business-${currentSection.id}-${selectedVoice}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(currentSection.scriptUrdu);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Gemini 3.8 Flash TTS Badge */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-indigo-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                ماڈل: gemini-3.8-flash-tts
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Headphones className="w-3 h-3" />
                24kHz اسٹوڈیو ساؤنڈ
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide font-arabic">
              {currentSection.titleUrdu}
            </h2>
            <p className="text-slate-300 text-sm mt-1 font-arabic">
              {currentSection.subtitleUrdu}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition shadow-sm"
              title="اردو اسکرپٹ کاپی کریں"
            >
              {copiedScript ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedScript ? 'کاپی ہو گیا' : 'اسکرپٹ کاپی'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950/40"
              title="آڈیو ڈاؤن لوڈ کریں"
            >
              <Download className="w-4 h-4" />
              <span>ڈاؤن لوڈ WAV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Player & Chapters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chapters / Sections Navigator (4 cols on lg) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <h3 className="font-semibold text-slate-200 text-base flex items-center gap-2 font-arabic">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>فہرست ابواب و آئیڈیاز</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {SCRIPT_SECTIONS.length} حصے
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {SCRIPT_SECTIONS.map((sec, idx) => {
              const isCurrent = currentSectionIndex === idx;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setCurrentSectionIndex(idx);
                    loadAndPlaySection(idx);
                  }}
                  className={`w-full text-right p-3 rounded-xl transition border text-sm flex items-start justify-between gap-3 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-emerald-950/70 to-indigo-950/40 border-emerald-500/50 text-white shadow-md'
                      : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {sec.number}
                      </span>
                      <span className="font-bold text-slate-200 font-arabic">
                        {sec.titleUrdu}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 font-arabic">
                      {sec.subtitleUrdu}
                    </p>
                  </div>
                  {isCurrent && isPlaying && (
                    <div className="flex items-end gap-0.5 h-4 self-center">
                      <span className="w-1 bg-emerald-400 rounded-full soundwave-bar" style={{ animationDelay: '0s' }} />
                      <span className="w-1 bg-emerald-400 rounded-full soundwave-bar" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1 bg-emerald-400 rounded-full soundwave-bar" style={{ animationDelay: '0.4s' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Voice & Narrator Controls */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-arabic">
                آواز منتخب کریں (Gemini TTS Voice):
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  if (isPlaying) {
                    loadAndPlaySection(currentSectionIndex);
                  }
                }}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nameUrdu} - {v.desc}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer font-arabic">
                <input
                  type="checkbox"
                  checked={autoNext}
                  onChange={(e) => setAutoNext(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>اگلا باب خودکار پلے کریں</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Audio Console & Synchronized Script Display (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Audio Console Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
            {/* Visualizer & Section Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="text-right sm:text-right w-full sm:w-auto">
                <span className="text-xs font-semibold text-emerald-400 font-arabic">
                  فی الوقت فعال:
                </span>
                <h4 className="text-lg font-bold text-white font-arabic">
                  {currentSection.titleUrdu}
                </h4>
              </div>

              {/* Sound Wave Bars Simulation */}
              <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
                {[4, 12, 22, 16, 28, 14, 20, 8, 24, 10, 18, 6].map((height, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isPlaying
                        ? 'bg-gradient-to-t from-emerald-500 to-indigo-400'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(4, (height * (currentTime % 3 + 1)) % 32)}px` : '4px',
                    }}
                  />
                ))}
                <span className="text-xs text-slate-400 font-mono mr-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Error notification if any */}
            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs text-right font-arabic">
                {errorMessage}
              </div>
            )}

            {/* Seek Bar */}
            <div className="space-y-1.5 mb-5">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={duration === 0 || isLoadingAudio}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono px-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{isLoadingAudio ? 'Gemini TTS سے لوڈ ہو رہا ہے...' : formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Playback Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              {/* Previous / Play / Next */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (currentSectionIndex > 0) {
                      setCurrentSectionIndex((prev) => prev - 1);
                    }
                  }}
                  disabled={currentSectionIndex === 0 || isLoadingAudio}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
                  title="پچھلا حصہ"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>

                <button
                  onClick={togglePlay}
                  disabled={isLoadingAudio}
                  className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2.5 transition shadow-lg ${
                    isPlaying
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/40'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                  } disabled:opacity-50`}
                >
                  {isLoadingAudio ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-arabic">آواز تیار ہو رہی ہے...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span className="text-sm font-arabic">وقفہ (Pause)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span className="text-sm font-arabic">سنیں (Play Audio)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (currentSectionIndex < SCRIPT_SECTIONS.length - 1) {
                      setCurrentSectionIndex((prev) => prev + 1);
                    }
                  }}
                  disabled={currentSectionIndex === SCRIPT_SECTIONS.length - 1 || isLoadingAudio}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
                  title="اگلا حصہ"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={handleRestart}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                  title="شروع سے سنیں"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed & Volume Controls */}
              <div className="flex items-center gap-3">
                {/* Speed buttons */}
                <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700/60 text-xs font-mono">
                  {[0.8, 1.0, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setAudioSpeed(spd)}
                      className={`px-2 py-1 rounded-lg transition ${
                        audioSpeed === spd
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-1.5 bg-slate-800/70 px-2.5 py-1.5 rounded-xl border border-slate-700/60">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-400 hover:text-white"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Synchronized Script Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 font-arabic">
                <Sparkles className="w-3.5 h-3.5" />
                بالمشافہ اسکرپٹ (Synchronized Urdu Transcript)
              </span>
              <span className="text-xs text-slate-400 font-arabic">
                کسی بھی پیراگراف پر کلک کر کے اسکرپٹ پڑھیں
              </span>
            </div>

            <div
              dir="rtl"
              className={`space-y-4 text-right overflow-y-auto max-h-[380px] pr-2 ${
                fontFamily === 'nastaliq' ? 'font-nastaliq' : 'font-arabic'
              } ${fontSizeClass}`}
            >
              {currentSection.paragraphs.map((para, pIdx) => {
                const isActive = isPlaying && activeParagraphIndex === pIdx;
                return (
                  <div
                    key={pIdx}
                    onClick={() => setActiveParagraphIndex(pIdx)}
                    className={`p-3.5 rounded-xl transition-all cursor-pointer leading-relaxed ${
                      isActive
                        ? 'bg-emerald-950/60 border border-emerald-500/50 text-white shadow-inner scale-[1.01]'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    {para}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
