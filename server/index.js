import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  buildModelChain,
  generateGeminiReply,
  parseFallbackModels,
  sanitizeModelId,
} from './geminiChat.js';
import { buildSystemInstruction } from './systemPrompt.js';

dotenv.config({ override: true });

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const apiKey = process.env.GEMINI_API_KEY;

const DEFAULT_MODEL = 'gemini-3.8-flash';
const rawModel = (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim();
const modelName = sanitizeModelId(rawModel) || DEFAULT_MODEL;
const fallbackModels = parseFallbackModels(process.env.GEMINI_MODEL_FALLBACKS);
const modelChain = buildModelChain(modelName, fallbackModels);

if (rawModel !== modelName) {
  console.warn(`[Gemini] Модель "${rawModel}" недоступна, используем "${modelName}"`);
}

app.use(cors({ origin: true }));
app.use(express.json({ limit: '512kb' }));

/** История для startChat: с user, чередование user/model, последняя — model. */
function buildGeminiHistory(sanitized) {
  const prior = sanitized.slice(0, -1);
  let start = 0;
  while (start < prior.length && prior[start].role !== 'user') {
    start += 1;
  }

  const turns = [];
  let expectedRole = 'user';

  for (let i = start; i < prior.length; i += 1) {
    const m = prior[i];
    if (m.role !== expectedRole) continue;
    turns.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    });
    expectedRole = expectedRole === 'user' ? 'assistant' : 'user';
  }

  if (turns.length > 0 && turns[turns.length - 1].role === 'user') {
    turns.pop();
  }

  return turns;
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(apiKey),
    model: modelName,
    modelChain,
  });
});

app.post('/api/chat', async (req, res) => {
  if (!apiKey) {
    res.status(503).json({
      error: 'Сервер не настроен: добавьте GEMINI_API_KEY в файл .env',
    });
    return;
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Ожидается массив messages с хотя бы одним сообщением' });
    return;
  }

  const sanitized = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, 8000),
    }))
    .filter((m) => m.content.length > 0);

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== 'user') {
    res.status(400).json({ error: 'Последнее сообщение должно быть от пользователя (role: user)' });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const history = buildGeminiHistory(sanitized);
    const lastUserText = sanitized[sanitized.length - 1].content;
    const systemInstruction = buildSystemInstruction();

    const { text: replyText, modelId: usedModel } = await generateGeminiReply({
      genAI,
      modelChain,
      systemInstruction,
      history,
      lastUserText,
      onAttempt: ({ modelId, attempt }) => {
        if (attempt > 1) {
          console.log(`[Gemini] повтор ${attempt} для ${modelId}`);
        }
      },
    });

    res.json({
      message: {
        id: `gemini-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        createdAt: new Date().toISOString(),
      },
      meta: { model: usedModel },
    });
  } catch (err) {
    console.error('[api/chat]', err);
    const message = err?.message || 'Ошибка при обращении к Gemini';
    const status = message.includes('перегружен') ? 503 : 500;
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}`);
  if (apiKey) {
    console.log(`Gemini: основная модель ${modelName}`);
    console.log(`Gemini: цепочка моделей → ${modelChain.join(' → ')}`);
  } else {
    console.log('Gemini: ключ GEMINI_API_KEY не задан');
  }
});
