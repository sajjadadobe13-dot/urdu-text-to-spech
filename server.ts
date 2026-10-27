import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Shared Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Simple in-memory cache for generated TTS audio to ensure snappy replays
const ttsCache = new Map<string, { audioBase64: string; mimeType: string }>();

/**
 * Text-to-Speech endpoint using gemini-3.8-flash-tts as explicitly required.
 */
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', style } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text content is required for speech synthesis.' });
    }

    const cleanText = text.trim();
    const cacheKey = `${voiceName}:${cleanText.slice(0, 150)}:${cleanText.length}:${style || 'default'}`;

    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey)!;
      return res.json({
        ...cached,
        cached: true,
      });
    }

    // Call gemini-3.8-flash-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                speaker: 'Narrator',
                style:
                  style ||
                  'Clear, confident, natural Urdu professional speech, engaging pacing and warm cadence suitable for business and motivational narration',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || 'Kore',
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || 'audio/wav';

    if (!base64Audio) {
      console.warn('Gemini TTS returned no audio data');
      return res.status(502).json({
        error: 'Unable to synthesize audio. Please try again or choose another voice.',
      });
    }

    const result = {
      audioBase64: base64Audio,
      mimeType,
    };

    // Cache up to 100 entries
    if (ttsCache.size > 100) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, result);

    return res.json({
      ...result,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error generating speech with gemini-3.8-flash-tts:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to synthesize speech using Gemini 3.8 Flash TTS.',
    });
  }
});

/**
 * AI Business Consultation endpoint using gemini-3.8-flash
 */
app.post('/api/consultation', async (req, res) => {
  try {
    const { question, businessCategory, budget } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question or query is required.' });
    }

    const prompt = `
آپ ایک تجربہ کار پاکستانی اور جنوبی ایشیائی لوکل بزنس کنسلٹنٹ ہیں۔
صارف کا سوال: "${question}"
کاروباری کیٹیگری: ${businessCategory || 'عام کاروبار'}
دستیاب بجٹ: ${budget || 'عام'}

براہ کرم اردو میں ایک جامع، حقیقت پسندانہ اور حوصلہ افزا گائیڈ پیش کریں۔
جواب میں درج ذیل نکات شامل ہوں:
1. فوری قابلِ عمل اقدامات (Actionable Roadmap)
2. بجٹ کی تقسیم اور بچت کے طریقے (PKR / روپے میں)
3. کسٹمرز حاصل کرنے کی حکمت عملی (واٹس ایپ، لوکل نیٹ ورکنگ، سوشل میڈیا)
4. منافع اور ممکنہ آمدنی کا حقیقت پسندانہ تخمینہ
5. عام غلطیاں جن سے بچنا ضروری ہے

جواب آسان فہم اور پرکشش اردو میں دیں۔
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a premier Urdu business mentor specializing in recession-proof, evergreen local micro-enterprises and small businesses in Pakistan and South Asia. Provide empathetic, realistic, structured advice in high-quality Urdu.',
      },
    });

    return res.json({
      advice: response.text || 'معذرت، مشورہ تیار نہیں ہو سکا۔ دوبارہ کوشش کیجیے۔',
    });
  } catch (error: any) {
    console.error('Error in consultation API:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to get business consultation.',
    });
  }
});

// Setup Vite middleware or static serving
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
