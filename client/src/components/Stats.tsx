interface Props {
  wpm: number;
  accuracy: number;
  elapsed: number;
  progress: number;
}

export default function Stats({ wpm, accuracy, elapsed, progress }: Props) {
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-value">{wpm}</span>
        <span className="stat-label">WPM</span>
      </div>
      <div className="stat">
        <span className="stat-value">{accuracy}%</span>
        <span className="stat-label">Accuracy</span>
      </div>
      <div className="stat">
        <span className="stat-value">{timeStr}</span>
        <span className="stat-label">Time</span>
      </div>
      <div className="stat">
        <span className="stat-value">{progress}%</span>
        <span className="stat-label">Progress</span>
      </div>
    </div>
  );
}
