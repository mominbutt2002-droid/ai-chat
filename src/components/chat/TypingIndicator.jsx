export function TypingIndicator({ agent }) {
  return (
    <div className="message-bubble message-bubble--assistant message-bubble--typing" aria-label="Агент печатает">
      <div className="message-bubble__avatar" aria-hidden="true">{agent.initials}</div>
      <div className="message-bubble__content message-bubble__content--typing">
        <span className="typing-dots">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}
