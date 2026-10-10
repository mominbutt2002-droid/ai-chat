import { ThemeToggle } from '../ThemeToggle.jsx';
import { ChatHeader } from './ChatHeader.jsx';
import { MessageList } from './MessageList.jsx';
import { QuickReplies } from './QuickReplies.jsx';
import { ChatComposer } from './ChatComposer.jsx';

export function ChatPanel({ session }) {
  const { agent, messages, isTyping, quickReplies, sendMessage, close } = session;

  const showQuickReplies = !isTyping && quickReplies.length > 0;

  return (
    <div
      className="chat-panel"
      role="dialog"
      aria-label="Чат с поддержкой"
      aria-modal="false"
    >
      <ChatHeader
        agent={agent}
        onMinimize={close}
        onClose={close}
        themeToggle={<ThemeToggle className="theme-toggle--compact" />}
      />
      <div className="chat-panel__body">
        <MessageList messages={messages} agent={agent} isTyping={isTyping} />
        {showQuickReplies ? (
          <QuickReplies items={quickReplies} onSelect={sendMessage} disabled={isTyping} />
        ) : null}
      </div>
      <ChatComposer onSend={sendMessage} disabled={isTyping} />
    </div>
  );
}
