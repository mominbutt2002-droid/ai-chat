import { useCallback, useRef } from 'react';
import { useMicrophonePermission } from '../../hooks/useMicrophonePermission.js';

const MAX_LINES = 4;
const LINE_HEIGHT_PX = 22;

export function ChatComposer({ onSend, disabled }) {
  const textareaRef = useRef(null);
  const voiceBaseRef = useRef('');
  const { state: micState, detail: micDetail, toggleVoiceInput } = useMicrophonePermission();

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
    voiceBaseRef.current = '';
    el.style.height = 'auto';
  }, [onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMicClick = useCallback(() => {
    if (disabled) return;

    if (micState === 'listening') {
      toggleVoiceInput(() => {});
      return;
    }

    const el = textareaRef.current;
    voiceBaseRef.current = el?.value.trim() ?? '';

    toggleVoiceInput((transcript, isFinal) => {
      const field = textareaRef.current;
      if (!field) return;

      const prefix = voiceBaseRef.current;
      field.value = prefix ? `${prefix} ${transcript}` : transcript;
      adjustHeight();

      if (isFinal) {
        voiceBaseRef.current = field.value.trim();
      }
    });
  }, [adjustHeight, disabled, micState, toggleVoiceInput]);

  const micBusy = micState === 'requesting' || micState === 'listening';
  const micDenied = micState === 'denied' || micState === 'unsupported';
  const micLabel =
    micState === 'listening'
      ? 'Остановить запись'
      : micState === 'requesting'
        ? 'Запрос доступа к микрофону'
        : 'Голосовой ввод — запросить микрофон';

  return (
    <div className="chat-composer">
      <div className="chat-composer__field">
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
        {micDetail ? (
          <p
            className={`chat-composer__mic-status${micDenied ? ' chat-composer__mic-status--error' : ''}`}
            role="status"
            aria-live="polite"
          >
            {micDetail}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        className={[
          'chat-composer__mic',
          micState === 'listening' && 'chat-composer__mic--listening',
          micState === 'ready' && 'chat-composer__mic--ready',
          micDenied && 'chat-composer__mic--denied',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={handleMicClick}
        disabled={disabled || micState === 'requesting'}
        aria-label={micLabel}
        aria-pressed={micState === 'listening'}
        title={micDetail || micLabel}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"
          />
        </svg>
      </button>
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
