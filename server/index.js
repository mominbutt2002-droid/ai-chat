import dotenv from 'dotenv';
import { sanitizeModelId } from './geminiChat.js';
import { createApp } from './createApp.js';

dotenv.config({ override: true });

const PORT = Number(process.env.PORT) || 3001;
const apiKey = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = 'gemini-3.8-flash';
const rawModel = (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim();
const modelName = sanitizeModelId(rawModel) || DEFAULT_MODEL;

if (rawModel !== modelName) {
  console.warn(`[Gemini] Модель "${rawModel}" недоступна, используем "${modelName}"`);
}

const app = createApp();

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}`);
  if (apiKey) {
    console.log(`Gemini: основная модель ${modelName}`);
  } else {
    console.log('Gemini: ключ GEMINI_API_KEY не задан');
  }
});
