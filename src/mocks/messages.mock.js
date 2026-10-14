import {
  buildWorkshopRedirectMessage,
  supportAgentConfig,
} from '../../shared/supportAgent.config.js';

export const MOCK_CONVERSATION_ID = 'mock-conv-1';

export const mockQuickReplies = [
  'Масло на Hyundai Solaris',
  'Тормозные колодки',
  'Есть ли доставка?',
  'Подбор по VIN',
];

const { shopName, workshopPhone } = supportAgentConfig;

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
      `Добрый день! Чат «${shopName}». Помогу с автотоварами: подбор, наличие, доставка. Для ремонта в сервисе — звоните в мастерскую: ${workshopPhone}.`,
    createdAt: new Date(baseTime).toISOString(),
  },
  {
    id: 'mock-msg-2',
    conversationId: MOCK_CONVERSATION_ID,
    role: 'user',
    content: 'Нужны передние колодки на Kia Rio 2018, бензин 1.6',
    createdAt: new Date(baseTime + 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'mock-msg-3',
    conversationId: MOCK_CONVERSATION_ID,
    role: 'assistant',
    content:
      'Для Rio 2018 1.6 подойдут колодки арт. AD-BP4410 (аналог Mobis 58101-1RA00) — 2 490 ₽, в наличии. Нужны с доставкой или заберёте с пункта на ул. Гаражная, 12?',
    createdAt: new Date(baseTime + 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'mock-msg-4',
    conversationId: MOCK_CONVERSATION_ID,
    role: 'user',
    content: 'А вы стук в подвеске на холодную устраняете?',
    createdAt: new Date(baseTime + 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'mock-msg-5',
    conversationId: MOCK_CONVERSATION_ID,
    role: 'assistant',
    content: buildWorkshopRedirectMessage(),
    createdAt: new Date(baseTime + 1000 * 60 * 6).toISOString(),
  },
];

const AUTO_PRODUCT_PATTERN =
  /масл|фильтр|колодк|тормоз|диск|шин|резин|аккумулятор|акб|свеч|ремн|подшипник|антифриз|омыва|ламп|щётк|дворник|запчаст|детал|vin|вин|артикул|наличи|доставк|оплат|возврат|гарант|аналог|оригинал|подбор|комплект|сайлентблок|амортизатор|стойк|сцеплен|генератор|стартер|салон|коврик|чехол|авто|машин|легков|кроссовер|седан|двигател|кузов|бампер|фара|зеркал|hyundai|kia|toyota|bmw|mercedes|lada|ваз|газ|uaz|nissan|volkswagen|ford|renault|skoda/i;

const KEYWORD_REPLIES = [
  {
    test: /доставк|курьер|почт|сдэк|получ/i,
    content:
      'Доставка по городу — 1–2 дня (от 390 ₽), по России — СДЭК/Почта от 3 дней. Самовывоз с ул. Гаражная, 12. Напишите город и что заказываете — посчитаю срок.',
  },
  {
    test: /vin|вин|артикул|подбор/i,
    content:
      'Пришлите VIN или марку/модель/год и что нужно (например, «масло моторное») — подберу артикулы и аналоги из каталога.',
  },
  {
    test: /масл|motul|castrol|shell|лукойл|зил|sae|0w|5w/i,
    content:
      'Подберу масло по допускам API/ACEA и объёму. Укажите марку, модель, год и тип двигателя (бензин/дизель, объём) — предложу 2–3 варианта в наличии.',
  },
  {
    test: /колодк|тормоз/i,
    content:
      'Нужны марка, модель, год и ось (перед/зад). Могу предложить оригинал и аналоги с ценой и сроком поставки.',
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

export function isAutoProductsQuestion(text) {
  return AUTO_PRODUCT_PATTERN.test((text || '').trim());
}

export function getMockAgentReply(userText, _history) {
  const text = (userText || '').trim();

  if (!isAutoProductsQuestion(text)) {
    return createMockMessage('assistant', buildWorkshopRedirectMessage());
  }

  const match = KEYWORD_REPLIES.find((rule) => rule.test.test(text));
  const content = match
    ? match.content
    : `По автотоварам помогу. Уточните марку, модель, год и что именно нужно (например: «фильтр масляный»). Ваш запрос: «${text.slice(0, 100)}${text.length > 100 ? '…' : ''}».`;

  return createMockMessage('assistant', content);
}

export const MOCK_REPLY_DELAY_MS = { min: 800, max: 1200 };

export function getMockReplyDelay() {
  const { min, max } = MOCK_REPLY_DELAY_MS;
  return min + Math.floor(Math.random() * (max - min + 1));
}
