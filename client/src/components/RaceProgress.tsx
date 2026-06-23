import type { Players } from '../types';

const COLORS = ['#6C63FF', '#FF6584', '#43E97B', '#F7971E', '#4facfe'];

interface Props {
  players: Players;
  myId: string;
}

export default function RaceProgress({ players, myId }: Props) {
  const list = Object.values(players);

  return (
    <div className="race-progress">
      {list.map((player, idx) => (
        <div key={player.id} className="player-lane">
          <div className="player-info">
            <span className="player-name" style={{ color: COLORS[idx % COLORS.length] }}>
              {player.username} {player.id === myId ? '(you)' : ''}
            </span>
            <span className="player-wpm">{player.wpm} WPM</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-car"
              style={{
                left: `calc(${player.progress}% - 28px)`,
                color: COLORS[idx % COLORS.length]
              }}
            >
              🏎️
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${player.progress}%`,
                  background: COLORS[idx % COLORS.length]
                }}
              />
            </div>
          </div>
          {player.finished && (
            <span className="finished-badge">✓ {player.finishTime ? `${player.finishTime.toFixed(1)}s` : ''}</span>
          )}
        </div>
      ))}
    </div>
  );
}
