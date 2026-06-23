import { useRef, useEffect } from 'react';

interface CharState {
  char: string;
  state: 'pending' | 'correct' | 'incorrect';
}

interface Props {
  chars: CharState[];
  input: string;
  onInput: (val: string) => void;
  disabled?: boolean;
  currentIndex: number;
}

export default function TypingArea({ chars, input, onInput, disabled, currentIndex }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="typing-container" onClick={focusInput} onTouchStart={focusInput}>
      <div className="text-display">
        {chars.map((c, i) => (
          <span
            key={i}
            className={[
              'char',
              c.state === 'correct' ? 'correct' : '',
              c.state === 'incorrect' ? 'incorrect' : '',
              i === currentIndex ? 'cursor' : ''
            ].join(' ')}
          >
            {c.char}
          </span>
        ))}
      </div>
      <textarea
        ref={inputRef}
        className="hidden-input"
        value={input}
        onChange={e => onInput(e.target.value)}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        rows={1}
      />
    </div>
  );
}
