import { OperatorLauncherAvatar } from './OperatorLauncherAvatar.jsx';

export function ChatLauncher({ unreadBadge, onClick }) {
  return (
    <button
      type="button"
      className="chat-launcher"
      onClick={onClick}
      aria-label="Открыть чат поддержки"
    >
      <OperatorLauncherAvatar />
      {unreadBadge > 0 ? (
        <span className="chat-launcher__badge" aria-label={`Непрочитанных: ${unreadBadge}`}>
          {unreadBadge}
        </span>
      ) : null}
    </button>
  );
}
