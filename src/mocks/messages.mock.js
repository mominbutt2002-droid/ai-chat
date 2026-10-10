export const MOCK_CONVERSATION_ID = 'mock-conv-1';

export const mockQuickReplies = [
  'Как подключить API?',
  'Стоимость',
  'Связаться с человеком',
  'Часы работы',
];

const baseTime = Date.now() - 1000 * 60 * 45;

function mockId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export const mockInitialMessages = [
  {
    id: 'mock-msg-1',
    conversationId: MOCK_CONVERSATION_ID,
    role: 'assistant',
    content:
      'Добрый день! Вы написали в чат поддержки «ОблакоСервис». Обычно отвечаем в течение пары минут.',
    createdAt: new Date(baseTime).toISOString(),
  },
  {
    id: 'mock-msg-2',
    conversationId: MOCK_CONVERSATION_ID,
    role: 'user',
    content: 'Добрый день! Подскажите, есть ли пробный период?',
    createdAt: new Date(baseTime + 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'mock-msg-3',
    conversationId: MOCK_CONVERSATION_ID,
    role: 'assistant',
    content:
      'Да, пробный период — 14 дней на тарифе «Старт». Карта для активации не нужна. Хотите ссылку на регистрацию?',
    createdAt: new Date(baseTime + 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'mock-msg-4',
    conversationId: MOCK_CONVERSATION_ID,
    role: 'user',
    content: 'Да, пришлите, пожалуйста.',
    createdAt: new Date(baseTime + 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'mock-msg-5',
    conversationId: MOCK_CONVERSATION_ID,
    role: 'assistant',
    content:
      'Регистрация: https://demo.oblako.example/signup — после входа в кабинете откройте раздел «Интеграции» → «Чат». Если что-то пойдёт не так, напишите сюда.',
    createdAt: new Date(baseTime + 1000 * 60 * 6).toISOString(),
  },
];

const KEYWORD_REPLIES = [
  {
    test: /api|интеграц|подключ/i,
    content:
      'Для API: в личном кабинете создайте ключ в разделе «Разработчикам». Документация — https://demo.oblako.example/docs/chat-api. Нужна помощь с конкретным эндпоинтом?',
  },
  {
    test: /стоим|цен|тариф|оплат/i,
    content:
      'Тарифы: «Старт» — 0 ₽ (14 дней), «Бизнес» — 2 490 ₽/мес, «Про» — 5 990 ₽/мес. На «Бизнес» входит до 5 операторов и ИИ-подсказки. Уточнить скидку на год?',
  },
  {
    test: /человек|оператор|менеджер|жив/i,
    content:
      'Передаю запрос коллеге. Оставьте email или телефон — специалист свяжется в рабочее время (пн–пт, 9:00–18:00 МСК).',
  },
  {
    test: /час|работ|время|когда/i,
    content: 'Мы на связи пн–пт с 9:00 до 18:00 по Москве. В нерабочее время ИИ-агент принимает обращения и передаёт их утром.',
  },
];

export function createMockMessage(role, content, overrides = {}) {
  return {
    id: mockId('mock-msg'),
    conversationId: MOCK_CONVERSATION_ID,
    role,
    content,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function getMockAgentReply(userText, _history) {
  const text = (userText || '').trim();
  const match = KEYWORD_REPLIES.find((rule) => rule.test.test(text));
  const content = match
    ? match.content
    : `Спасибо за сообщение! Я зафиксировал: «${text.slice(0, 120)}${text.length > 120 ? '…' : ''}». Уточните, пожалуйста, продукт или задачу — подскажу точнее.`;

  return createMockMessage('assistant', content);
}

export const MOCK_REPLY_DELAY_MS = { min: 800, max: 1200 };

export function getMockReplyDelay() {
  const { min, max } = MOCK_REPLY_DELAY_MS;
  return min + Math.floor(Math.random() * (max - min + 1));
}
