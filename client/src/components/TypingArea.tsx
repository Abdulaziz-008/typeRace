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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  return (
    <div className="typing-container" onClick={() => inputRef.current?.focus()}>
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
            {c.char === ' ' ? ' ' : c.char}
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        className="hidden-input"
        value={input}
        onChange={e => onInput(e.target.value)}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  );
}
