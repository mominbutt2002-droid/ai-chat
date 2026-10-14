/** Модели, снятые с API или недоступные новым ключам — не вызываем. */
export const BLOCKED_MODELS = new Set([
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
]);

const DEFAULT_PRIMARY = 'gemini-3.8-flash';

/** Запасные модели линейки 3.x (без 2.5 / 1.5). */
const DEFAULT_FALLBACKS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash-lite'];

const MAX_ATTEMPTS_PER_MODEL = 4;
const RETRY_DELAYS_MS = [1000, 2000, 4000, 6000];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isRetryableGeminiError(err) {
  const text = `${err?.message ?? ''} ${err?.status ?? ''}`.toLowerCase();
  return (
    text.includes('503') ||
    text.includes('429') ||
    text.includes('unavailable') ||
    text.includes('high demand') ||
    text.includes('resource exhausted') ||
    text.includes('overloaded')
  );
}

export function isUnavailableModelError(err) {
  const text = `${err?.message ?? ''}`.toLowerCase();
  return text.includes('404') || text.includes('no longer available');
}

export function sanitizeModelId(name) {
  const id = (name || '').trim();
  if (!id || BLOCKED_MODELS.has(id)) return null;
  return id;
}

export function parseFallbackModels(envValue) {
  if (!envValue || typeof envValue !== 'string') return [...DEFAULT_FALLBACKS];
  const list = envValue
    .split(',')
    .map((s) => sanitizeModelId(s))
    .filter(Boolean);
  return list.length > 0 ? list : [...DEFAULT_FALLBACKS];
}

export function buildModelChain(primary, fallbacks) {
  const chain = [];
  const seen = new Set();
  const primarySafe = sanitizeModelId(primary) || DEFAULT_PRIMARY;

  for (const name of [primarySafe, ...fallbacks]) {
    const safe = sanitizeModelId(name);
    if (!safe || seen.has(safe)) continue;
    seen.add(safe);
    chain.push(safe);
  }

  if (chain.length === 0) {
    chain.push(DEFAULT_PRIMARY);
  }
  return chain;
}

async function sendWithModel(genAI, modelId, systemInstruction, history, lastUserText) {
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction,
  });
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastUserText);
  return result.response.text()?.trim() ?? '';
}

export async function generateGeminiReply({
  genAI,
  modelChain,
  systemInstruction,
  history,
  lastUserText,
  onAttempt,
}) {
  let lastError = null;

  for (const modelId of modelChain) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt += 1) {
      try {
        onAttempt?.({ modelId, attempt: attempt + 1 });
        const text = await sendWithModel(
          genAI,
          modelId,
          systemInstruction,
          history,
          lastUserText,
        );
        if (!text) {
          throw new Error('Пустой ответ от модели');
        }
        return { text, modelId };
      } catch (err) {
        lastError = err;

        if (isUnavailableModelError(err)) {
          console.warn(`[Gemini] ${modelId}: модель недоступна (404), пропуск`);
          break;
        }

        const retryable = isRetryableGeminiError(err);
        const hasMoreAttempts = attempt < MAX_ATTEMPTS_PER_MODEL - 1;
        if (retryable && hasMoreAttempts) {
          await sleep(RETRY_DELAYS_MS[attempt] ?? 2000);
          continue;
        }
        if (retryable) {
          console.warn(`[Gemini] ${modelId}: перегрузка, следующая модель`);
          break;
        }
        throw err;
      }
    }
  }

  if (lastError && isRetryableGeminiError(lastError)) {
    throw new Error(
      'Сервис Gemini временно перегружен. Подождите 10–30 секунд и отправьте сообщение снова.',
    );
  }
  throw lastError ?? new Error('Не удалось получить ответ от Gemini');
}
