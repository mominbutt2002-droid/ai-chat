import { useCallback, useRef, useState } from 'react';
import { mockAgent } from '../mocks/agent.mock.js';
import {
  getMockAgentReply,
  getMockReplyDelay,
  mockInitialMessages,
  mockQuickReplies,
} from '../mocks/messages.mock.js';

const USE_MOCKS = import.meta.env.DEV || !import.meta.env.VITE_API_URL;

export function useChatSession() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() =>
    USE_MOCKS ? [...mockInitialMessages] : [],
  );
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
        id: `mock-msg-user-${Date.now()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      if (USE_MOCKS) {
        const delay = getMockReplyDelay();
        replyTimerRef.current = setTimeout(() => {
          setMessages((prev) => {
            const reply = getMockAgentReply(text, prev);
            return [...prev, reply];
          });
          setIsTyping(false);
          replyTimerRef.current = null;
        }, delay);
      } else {
        setIsTyping(false);
      }
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
