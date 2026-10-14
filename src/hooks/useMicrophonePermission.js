import { useCallback, useEffect, useRef, useState } from 'react';

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useMicrophonePermission() {
  const [state, setState] = useState('idle');
  const [detail, setDetail] = useState('');
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
    }
    setState((prev) => (prev === 'listening' ? 'ready' : prev));
  }, []);

  const requestAccess = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      setDetail('Браузер не поддерживает доступ к микрофону (нужен HTTPS или localhost).');
      return false;
    }

    setState('requesting');
    setDetail('');

    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      setState('ready');
      setDetail('Микрофон доступен. Говорите — текст появится в поле ввода.');
      return true;
    } catch (err) {
      stopStream();
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setState('denied');
        setDetail('Разрешите микрофон в настройках браузера и нажмите кнопку снова.');
      } else if (name === 'NotFoundError') {
        setState('denied');
        setDetail('Микрофон не найден. Подключите устройство и повторите попытку.');
      } else {
        setState('denied');
        setDetail(err?.message || 'Не удалось получить доступ к микрофону.');
      }
      return false;
    }
  }, [stopStream]);

  const startListening = useCallback(
    (onTranscript) => {
      const SpeechRecognition = getSpeechRecognition();
      if (!SpeechRecognition) {
        setDetail(
          'Микрофон работает, но распознавание речи в этом браузере недоступно (попробуйте Chrome или Edge).',
        );
        return;
      }

      stopListening();

      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          text += event.results[i][0].transcript;
        }
        if (text.trim()) {
          onTranscript(text.trim(), event.results[event.results.length - 1]?.isFinal);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setState('denied');
          setDetail('Нет разрешения на микрофон для распознавания речи.');
        } else if (event.error !== 'aborted') {
          setDetail(`Ошибка распознавания: ${event.error}`);
        }
        stopListening();
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        setState((prev) => (prev === 'listening' ? 'ready' : prev));
      };

      recognitionRef.current = recognition;
      setState('listening');
      setDetail('Слушаю… Нажмите микрофон ещё раз, чтобы остановить.');

      try {
        recognition.start();
      } catch {
        setDetail('Не удалось запустить распознавание речи.');
        stopListening();
      }
    },
    [stopListening],
  );

  const toggleVoiceInput = useCallback(
    async (onTranscript) => {
      if (state === 'listening') {
        stopListening();
        setDetail('Запись остановлена.');
        return;
      }

      const hasMic =
        state === 'ready' || state === 'listening' ? true : await requestAccess();
      if (!hasMic) return;

      startListening(onTranscript);
    },
    [requestAccess, startListening, state, stopListening],
  );

  useEffect(
    () => () => {
      stopListening();
      stopStream();
    },
    [stopListening, stopStream],
  );

  return {
    state,
    detail,
    requestAccess,
    toggleVoiceInput,
    stopListening,
  };
}
