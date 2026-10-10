export function ChatHeader({ agent, onMinimize, onClose, themeToggle }) {
  const title = `${agent.name}, ${agent.role}`;

  return (
    <header className="chat-header">
      <div className="chat-header__info">
        <div className="chat-header__avatar" aria-hidden="true">
          {agent.initials}
        </div>
        <div className="chat-header__text">
          <span className="chat-header__name">{title}</span>
          <span className="chat-header__status">
            <span className="chat-header__status-dot" aria-hidden="true" />
            {agent.statusLabel}
          </span>
        </div>
      </div>
      <div className="chat-header__actions">
        {themeToggle ? <div className="chat-header__theme">{themeToggle}</div> : null}
        <button
          type="button"
          className="chat-header__btn"
          onClick={onMinimize}
          aria-label="Свернуть чат"
        >
          −
        </button>
        <button
          type="button"
          className="chat-header__btn"
          onClick={onClose}
          aria-label="Закрыть чат"
        >
          ×
        </button>
      </div>
    </header>
  );
}
