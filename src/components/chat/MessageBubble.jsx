export function MessageBubble({ message, agent }) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-bubble message-bubble--${isUser ? 'user' : 'assistant'}`}>
      {!isUser ? (
        <div className="message-bubble__avatar" aria-hidden="true">{agent.initials}</div>
      ) : null}
      <div className="message-bubble__content">
        <p className="message-bubble__text">{message.content}</p>
        <time className="message-bubble__time" dateTime={message.createdAt}>
          {formatTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}
