import { useState, useEffect, useCallback } from 'react';
import { useTyping } from '../hooks/useTyping';
import TypingArea from '../components/TypingArea';
import Stats from '../components/Stats';
import RaceProgress from '../components/RaceProgress';
import socket from '../socket';
import type { Players, Language } from '../types';

const LANG_LABELS: Record<Language, string> = {
  en: '🇺🇸 English',
  uz: '🇺🇿 O\'zbek',
  ru: '🇷🇺 Русский',
  de: '🇩🇪 Deutsch',
  fr: '🇫🇷 Français'
};

type Phase = 'lobby' | 'waiting' | 'countdown' | 'racing' | 'finished';

export default function Race() {
  const [phase, setPhase] = useState<Phase>('lobby');
  const [username, setUsername] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [roomId, setRoomId] = useState('');
  const [joinId, setJoinId] = useState('');
  const [text, setText] = useState('');
  const [players, setPlayers] = useState<Players>({});
  const [countdown, setCountdown] = useState(3);
  const [results, setResults] = useState<any[]>([]);
  const [raceStart, setRaceStart] = useState<number | null>(null);

  const onProgress = useCallback((p: number, wpm: number) => {
    if (roomId) socket.emit('progress_update', { roomId, progress: p, wpm });
  }, [roomId]);

  const { input, handleInput, chars, wpm, accuracy, finished, progress, elapsedTime, reset } = useTyping(text, onProgress);

  useEffect(() => {
    socket.on('room_created', ({ roomId: id, text: t, players: p }: any) => {
      setRoomId(id);
      setText(t);
      setPlayers(p);
      setPhase('waiting');
    });
    socket.on('room_joined', ({ roomId: id, text: t, players: p }: any) => {
      setRoomId(id);
      setText(t);
      setPlayers(p);
      setPhase('waiting');
    });
    socket.on('player_joined', ({ players: p }: any) => setPlayers(p));
    socket.on('players_update', ({ players: p }: any) => setPlayers(p));
    socket.on('countdown', ({ count }: any) => { setCountdown(count); setPhase('countdown'); });
    socket.on('race_start', ({ text: t }: any) => {
      setText(t);
      setRaceStart(Date.now());
      setPhase('racing');
      reset();
    });
    socket.on('race_finished', ({ results: r }: any) => {
      setResults(r);
      setPhase('finished');
    });
    socket.on('error', ({ message }: any) => alert(message));

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('player_joined');
      socket.off('players_update');
      socket.off('countdown');
      socket.off('race_start');
      socket.off('race_finished');
      socket.off('error');
    };
  }, [reset]);

  // Notify server when finished
  useEffect(() => {
    if (finished && roomId && raceStart) {
      const time = (Date.now() - raceStart) / 1000;
      socket.emit('player_finished', { roomId, wpm, time });
    }
  }, [finished, roomId, wpm, raceStart]);

  const createRoom = () => {
    if (!username.trim()) return alert('Enter username');
    socket.emit('create_room', { username, lang });
  };

  const joinRoom = () => {
    if (!username.trim()) return alert('Enter username');
    if (!joinId.trim()) return alert('Enter room ID');
    socket.emit('join_room', { roomId: joinId.toUpperCase(), username });
  };

  const startRace = () => {
    socket.emit('start_race', { roomId });
  };

  const goBack = () => {
    setPhase('lobby');
    setRoomId('');
    setText('');
    setPlayers({});
    setResults([]);
    reset();
  };

  if (phase === 'lobby') {
    return (
      <div className="page">
        <div className="page-header"><h2>Multiplayer Race</h2></div>
        <div className="lobby">
          <div className="lobby-form">
            <input
              className="input-field"
              placeholder="Your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <div className="lang-selector">
              {(Object.keys(LANG_LABELS) as Language[]).map(l => (
                <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={createRoom}>Create Room</button>

            <div className="divider">— or join existing —</div>

            <div className="join-row">
              <input
                className="input-field"
                placeholder="Room ID (e.g. ABC123)"
                value={joinId}
                onChange={e => setJoinId(e.target.value)}
                maxLength={6}
                style={{ textTransform: 'uppercase' }}
              />
              <button className="btn-secondary" onClick={joinRoom}>Join</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div className="page">
        <div className="page-header">
          <h2>Waiting Room</h2>
          <button className="btn-ghost" onClick={goBack}>← Back</button>
        </div>
        <div className="waiting-room">
          <div className="room-id-display">
            Room ID: <strong>{roomId}</strong>
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(roomId)}>Copy</button>
          </div>
          <p className="hint">Share this ID with friends to race together!</p>

          <div className="player-list">
            <h3>Players ({Object.keys(players).length})</h3>
            {Object.values(players).map(p => (
              <div key={p.id} className="player-item">
                {p.id === socket.id ? '👑 ' : '👤 '} {p.username}
                {p.id === socket.id ? ' (you)' : ''}
              </div>
            ))}
          </div>

          {Object.keys(players)[0] === socket.id && (
            <button className="btn-primary btn-lg" onClick={startRace}
              disabled={Object.keys(players).length < 1}>
              Start Race 🚀
            </button>
          )}
          {Object.keys(players)[0] !== socket.id && (
            <p className="hint">Waiting for host to start...</p>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="page">
        <div className="countdown-screen">
          <div className="countdown-number">{countdown}</div>
          <p>Get ready!</p>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="page">
        <div className="page-header"><h2>Race Results 🏆</h2></div>
        <div className="results">
          {results.map((p, i) => (
            <div key={p.id} className={`result-row ${i === 0 ? 'winner' : ''}`}>
              <span className="result-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
              <span className="result-name">{p.username} {p.id === socket.id ? '(you)' : ''}</span>
              <span className="result-wpm">{p.wpm} WPM</span>
              <span className="result-time">{p.finishTime?.toFixed(1)}s</span>
            </div>
          ))}
          <div className="result-actions">
            <button className="btn-primary" onClick={() => {
              socket.emit('create_room', { username, lang });
            }}>Qayta boshlash 🔄</button>
            <button className="btn-secondary" onClick={goBack}>Lobby'ga qaytish</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Race! 🏁</h2>
        <span className="room-badge">Room: {roomId}</span>
      </div>

      <RaceProgress players={players} myId={socket.id || ''} />
      <Stats wpm={wpm} accuracy={accuracy} elapsed={elapsedTime} progress={progress} />

      <TypingArea
        chars={chars}
        input={input}
        onInput={handleInput}
        disabled={finished}
        currentIndex={input.length}
      />

      {finished && (
        <div className="result-card">
          <h3>You finished! ⚡</h3>
          <p>Waiting for other players...</p>
          <div className="result-stats">
            <div className="result-stat">
              <span className="result-value">{wpm}</span>
              <span className="result-label">WPM</span>
            </div>
            <div className="result-stat">
              <span className="result-value">{accuracy}%</span>
              <span className="result-label">Accuracy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
