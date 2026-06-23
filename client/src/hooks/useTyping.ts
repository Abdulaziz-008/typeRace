import { useState, useEffect, useRef, useCallback } from 'react';

export function useTyping(text: string, onProgress?: (p: number, wpm: number) => void) {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [finished, setFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalErrors = useRef(0);
  const totalTyped = useRef(0);

  const reset = useCallback(() => {
    setInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setFinished(false);
    setElapsedTime(0);
    totalErrors.current = 0;
    totalTyped.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    reset();
  }, [text, reset]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleInput = useCallback((rawValue: string) => {
    if (finished) return;

    // Strip newlines mobile keyboards may inject
    const value = rawValue.replace(/\n/g, '');

    // Only allow typing up to text length
    const capped = value.slice(0, text.length);

    if (!startTime && capped.length > 0) {
      const now = Date.now();
      setStartTime(now);
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - now) / 1000));
      }, 500);
    }

    // Count new errors only when adding characters
    if (capped.length > input.length) {
      for (let i = input.length; i < capped.length; i++) {
        totalTyped.current++;
        if (capped[i] !== text[i]) totalErrors.current++;
      }
    }

    setInput(capped);

    const now = Date.now();
    const elapsed = startTime ? (now - startTime) / 60000 : 0.001;
    const wordsTyped = capped.length / 5;
    const currentWpm = elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0;
    setWpm(currentWpm);

    const correctChars = totalTyped.current - totalErrors.current;
    setAccuracy(totalTyped.current > 0 ? Math.round((correctChars / totalTyped.current) * 100) : 100);

    const progress = Math.min(100, Math.round((capped.length / text.length) * 100));
    onProgress?.(progress, currentWpm);

    if (capped === text) {
      if (timerRef.current) clearInterval(timerRef.current);
      setFinished(true);
    }
  }, [text, input, startTime, finished, onProgress]);

  const chars = text.split('').map((char, i) => {
    if (i >= input.length) return { char, state: 'pending' as const };
    if (input[i] === char) return { char, state: 'correct' as const };
    return { char, state: 'incorrect' as const };
  });

  const progress = text.length > 0 ? Math.min(100, Math.round((input.length / text.length) * 100)) : 0;

  return { input, handleInput, chars, wpm, accuracy, finished, progress, elapsedTime, reset, startTime };
}
