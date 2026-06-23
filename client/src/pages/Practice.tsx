import { useState, useEffect } from 'react';
import { useTyping } from '../hooks/useTyping';
import TypingArea from '../components/TypingArea';
import Stats from '../components/Stats';
import socket from '../socket';
import type { Language } from '../types';

const LANG_LABELS: Record<Language, string> = {
  en: '🇺🇸 English',
  uz: '🇺🇿 O\'zbek',
  ru: '🇷🇺 Русский',
  de: '🇩🇪 Deutsch',
  fr: '🇫🇷 Français'
};

export default function Practice() {
  const [text, setText] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const { input, handleInput, chars, wpm, accuracy, finished, progress, elapsedTime, reset } = useTyping(text);

  const loadText = (l: Language) => {
    socket.emit('get_text', { lang: l });
  };

  useEffect(() => {
    loadText(lang);
    socket.on('text_result', ({ text: t }: { text: string }) => setText(t));
    return () => { socket.off('text_result'); };
  }, []);

  const changeLang = (l: Language) => {
    setLang(l);
    loadText(l);
  };

  const restart = () => {
    loadText(lang);
    reset();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Solo Practice</h2>
        <div className="lang-selector">
          {(Object.keys(LANG_LABELS) as Language[]).map(l => (
            <button
              key={l}
              className={`lang-btn ${lang === l ? 'active' : ''}`}
              onClick={() => changeLang(l)}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <Stats wpm={wpm} accuracy={accuracy} elapsed={elapsedTime} progress={progress} />

      {text ? (
        <TypingArea
          chars={chars}
          input={input}
          onInput={handleInput}
          disabled={finished}
          currentIndex={input.length}
        />
      ) : (
        <div className="loading">Loading text...</div>
      )}

      {finished && (
        <div className="result-card">
          <h3>Finished! 🎉</h3>
          <div className="result-stats">
            <div className="result-stat">
              <span className="result-value">{wpm}</span>
              <span className="result-label">WPM</span>
            </div>
            <div className="result-stat">
              <span className="result-value">{accuracy}%</span>
              <span className="result-label">Accuracy</span>
            </div>
            <div className="result-stat">
              <span className="result-value">{elapsedTime}s</span>
              <span className="result-label">Time</span>
            </div>
          </div>
          <button className="btn-primary" onClick={restart}>Try Again</button>
        </div>
      )}
    </div>
  );
}
