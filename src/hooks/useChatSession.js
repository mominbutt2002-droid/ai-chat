import { useCallback, useRef, useState } from 'react';
import { requestAgentReply } from '../api/chat.js';
import { mockAgent } from '../mocks/agent.mock.js';
import {
  getMockAgentReply,
  getMockReplyDelay,
  mockInitialMessages,
  mockQuickReplies,
} from '../mocks/messages.mock.js';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

function toApiHistory(messageList) {
  const forApi = USE_MOCKS
    ? messageList
    : messageList.filter((m) => !String(m.id || '').startsWith('mock-'));
  return forApi.map((m) => ({ role: m.role, content: m.content }));
}

export function useChatSession() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [...mockInitialMessages]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(1);
  const replyTimerRef = useRef(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setHasBeenOpened(true);
    setUnreadBadge(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
    setIsTyping(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const sendMessage = useCallback(
    (rawText) => {
      const text = (rawText || '').trim();
      if (!text || isTyping) return;

      const userMessage = {
        id: `msg-user-${Date.now()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };

      setIsTyping(true);

      setMessages((prev) => {
        const next = [...prev, userMessage];

        if (USE_MOCKS) {
          const delay = getMockReplyDelay();
          replyTimerRef.current = setTimeout(() => {
            setMessages((current) => {
              const reply = getMockAgentReply(text, current);
              return [...current, reply];
            });
            setIsTyping(false);
            replyTimerRef.current = null;
          }, delay);
          return next;
        }

        requestAgentReply(toApiHistory(next))
          .then((assistantMessage) => {
            setMessages((current) => [...current, assistantMessage]);
          })
          .catch((err) => {
            setMessages((current) => {
              const fallback = getMockAgentReply(text, current);
              return [
                ...current,
                {
                  ...fallback,
                  id: `msg-error-${Date.now()}`,
                  content: err.message?.includes('перегружен')
                    ? `${err.message} Пока что: ${fallback.content}`
                    : `Не удалось получить ответ от Gemini (${err.message}). ${fallback.content}`,
                },
              ];
            });
          })
          .finally(() => {
            setIsTyping(false);
          });

        return next;
      });
    },
    [isTyping],
  );

  const ensureGreetingOnFirstOpen = useCallback(() => {
    if (!hasBeenOpened && messages.length === 0) {
      setMessages([
        {
          id: 'mock-msg-greeting',
          role: 'assistant',
          content: mockAgent.greeting,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [hasBeenOpened, messages.length]);

  const handleOpen = useCallback(() => {
    ensureGreetingOnFirstOpen();
    open();
  }, [ensureGreetingOnFirstOpen, open]);

  return {
    agent: mockAgent,
    quickReplies: mockQuickReplies,
    isOpen,
    messages,
    isTyping,
    unreadBadge,
    open: handleOpen,
    close,
    toggle,
    sendMessage,
  };
}
