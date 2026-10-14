const API_CHAT = '/api/chat';

export async function requestAgentReply(messages) {
  const response = await fetch(API_CHAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.error || response.statusText || 'Неизвестная ошибка';
    throw new Error(detail);
  }

  if (!data.message?.content) {
    throw new Error('Сервер вернул ответ без текста');
  }

  return data.message;
}
