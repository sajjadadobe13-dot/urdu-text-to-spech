import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Volume2,
  Bot,
  User,
  Lightbulb,
  Check,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { BUSINESS_IDEAS } from '../data/businessData';

interface AiMentorSectionProps {
  fontFamily: 'nastaliq' | 'arabic';
  fontSizeClass: string;
}

interface Message {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  audioBase64?: string;
  isSynthesizingAudio?: boolean;
}

const QUICK_QUESTIONS = [
  'میرا بجٹ صرف 10 سے 15 ہزار روپے ہے، میں نوکری کے ساتھ کون سا کام شروع کر سکتا ہوں؟',
  'ٹفن سروس کے لیے پہلے 20 مستقل گاہک کیسے تلاش کروں؟',
  'موبائل ریپئرنگ کا ہنر 2 ماہ میں آسانی سے کیسے سیکھا جائے؟',
  'سروس بیسڈ لوکل بزنس (الیکٹریشن/پلمبر) کے لیے وزٹنگ کارڈ اور گوگل پر کیسے تشہیر کریں؟',
];

export const AiMentorSection: React.FC<AiMentorSectionProps> = ({
  fontFamily,
  fontSizeClass,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'mentor',
      text: `خوش آمدید! میں آپ کا کاروباری مشیر ہوں۔ آپ نے جو چھ کبھی نہ بند ہونے والے کاروباری ماڈلز دیکھے ہیں (ٹفن سروس، موبائل ریپئرنگ، کریانہ اسٹور، ٹیوشن، لوکل سروسز پلمبر و الیکٹریشن، یا کوئیک آٹو سروس)، آپ اپنے شہر، بجٹ یا فارغ وقت کے حساب سے مجھ سے عملی رہنمائی حاصل کر سکتے ہیں۔ آپ کیا پوچھنا چاہتے ہیں؟`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('تمام کاروبار');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend.trim(),
          businessCategory: selectedCategory,
        }),
      });

      if (!res.ok) {
        throw new Error('مشورے کی فراہمی میں مسئلہ پیش آیا۔');
      }

      const data = await res.json();
      const mentorMsg: Message = {
        id: `mentor-${Date.now()}`,
        sender: 'mentor',
        text: data.advice || 'معذرت، مشورہ موصول نہیں ہو سکا۔',
      };

      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err: any) {
      console.error('Mentor error:', err);
      const errMsg: Message = {
        id: `mentor-${Date.now()}`,
        sender: 'mentor',
        text: 'معذرت، سرور سے رابطہ نہیں ہو سکا۔ براہ کرم دوبارہ کوشش کیجیے۔',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = async (msg: Message) => {
    if (playingAudioId === msg.id && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlayingAudioId(null);
      return;
    }

    try {
      // If audio already exists on message
      if (msg.audioBase64) {
        if (audioRef.current) {
          audioRef.current.src = `data:audio/wav;base64,${msg.audioBase64}`;
          audioRef.current.play();
          setPlayingAudioId(msg.id);
        }
        return;
      }

      // Synthesize via gemini-3.8-flash-tts
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isSynthesizingAudio: true } : m))
      );

      // Take first 350 chars of advice to keep TTS concise and instant
      const textToSpeak = msg.text.slice(0, 450);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voiceName: 'Kore',
          style: 'Empathetic, clear, wise and encouraging Urdu business mentor',
        }),
      });

      if (!res.ok) throw new Error('TTS Failed');

      const data = await res.json();
      if (!data.audioBase64) throw new Error('No audio data');

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? { ...m, audioBase64: data.audioBase64, isSynthesizingAudio: false }
            : m
        )
      );

      if (audioRef.current) {
        audioRef.current.src = `data:audio/wav;base64,${data.audioBase64}`;
        audioRef.current.onended = () => setPlayingAudioId(null);
        await audioRef.current.play();
        setPlayingAudioId(msg.id);
      }
    } catch (err) {
      console.error('Audio playback error:', err);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isSynthesizingAudio: false } : m))
      );
    }
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} />

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2 font-arabic">
              <Bot className="w-3.5 h-3.5" />
              ذاتی بزنس کنسلٹنٹ (Gemini 3.8 Flash)
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-arabic">
              اے آئی کاروباری مشیر و آواز گائیڈ
            </h2>
            <p className="text-slate-300 text-sm mt-1 font-arabic">
              اپنے بجٹ، شہر یا ہنر کے بارے میں سوال پوچھیں اور فوری جواب کے ساتھ Gemini TTS آواز سنیں۔
            </p>
          </div>
        </div>
      </div>

      {/* Quick Question Pills */}
      <div className="flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="text-right px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition font-arabic flex items-center gap-1.5 disabled:opacity-50"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[520px]">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4" dir="rtl">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isPlayingThis = playingAudioId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isUser ? 'flex-row' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-emerald-600 text-slate-950 font-bold'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-right shadow-md ${
                    isUser
                      ? 'bg-indigo-950/60 border border-indigo-500/30 text-slate-100'
                      : 'bg-slate-950/70 border border-slate-800 text-slate-200'
                  }`}
                >
                  <p
                    className={`whitespace-pre-line leading-relaxed ${
                      fontFamily === 'nastaliq' ? 'font-nastaliq' : 'font-arabic'
                    } ${fontSizeClass}`}
                  >
                    {msg.text}
                  </p>

                  {!isUser && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => handlePlayVoice(msg)}
                        disabled={msg.isSynthesizingAudio}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition font-arabic"
                      >
                        {msg.isSynthesizingAudio ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>آواز تیار ہو رہی ہے...</span>
                          </>
                        ) : isPlayingThis ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>آواز روکیں</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>یہ مشورہ سنیں (Gemini TTS)</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-slate-500 font-mono">
                        gemini-3.8-flash-tts
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span className="text-xs text-slate-300 font-arabic">
                مشیر مشورہ تیار کر رہا ہے...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-3 border-t border-slate-800"
          dir="rtl"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="مثال: میرے پاس 50 ہزار روپے ہیں، کون سا کام بہتر رہے گا؟"
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 font-arabic"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50 flex items-center gap-2 shadow font-arabic"
          >
            <span>ارسال</span>
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
