import { useCallback, useRef } from 'react';

const MAX_LINES = 4;
const LINE_HEIGHT_PX = 22;

export function ChatComposer({ onSend, disabled }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = LINE_HEIGHT_PX * MAX_LINES + 16;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  const handleSubmit = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const value = el.value.trim();
    if (!value) return;
    onSend(value);
    el.value = '';
    el.style.height = 'auto';
  }, [onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-composer">
      <textarea
        ref={textareaRef}
        className="chat-composer__input"
        rows={1}
        placeholder="Напишите сообщение…"
        disabled={disabled}
        onInput={adjustHeight}
        onKeyDown={handleKeyDown}
        aria-label="Сообщение"
      />
      <button
        type="button"
        className="chat-composer__send"
        onClick={handleSubmit}
        disabled={disabled}
        aria-label="Отправить"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
}
