import { useEffect, useRef } from 'react';
import { ChatMessageBackground3D } from './ChatMessageBackground3D.jsx';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';

export function MessageList({ messages, agent, isTyping }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  return (
    <div className="message-list-shell">
      <ChatMessageBackground3D />
      <div className="message-list" role="log" aria-live="polite" aria-relevant="additions">
      {messages.map((msg, index) => {
        const prev = messages[index - 1];
        const showDate = !prev || !sameDay(prev.createdAt, msg.createdAt);
        return (
          <div key={msg.id} className="message-list__group">
            {showDate ? (
              <div className="message-list__date">{formatDateLabel(msg.createdAt)}</div>
            ) : null}
            <MessageBubble message={msg} agent={agent} />
          </div>
        );
      })}
      {isTyping ? <TypingIndicator agent={agent} /> : null}
      <div ref={endRef} className="message-list__anchor" />
      </div>
    </div>
  );
}

function sameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatDateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  if (sameDay(iso, today.toISOString())) return 'Сегодня';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(iso, yesterday.toISOString())) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}
