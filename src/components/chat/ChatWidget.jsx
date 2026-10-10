import { useChatSession } from '../../hooks/useChatSession.js';
import { ChatLauncher } from './ChatLauncher.jsx';
import { ChatPanel } from './ChatPanel.jsx';
import '../../styles/chat-widget.css';

export function ChatWidget() {
  const session = useChatSession();

  return (
    <div className="chat-widget" data-open={isOpenAttr(session.isOpen)}>
      {session.isOpen ? (
        <ChatPanel session={session} />
      ) : (
        <ChatLauncher unreadBadge={session.unreadBadge} onClick={session.open} />
      )}
    </div>
  );
}

function isOpenAttr(open) {
  return open ? 'true' : 'false';
}
