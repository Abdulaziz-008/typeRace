import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home">
      <div className="hero">
        <h1 className="hero-title">
          Type<span className="accent">Race</span>
        </h1>
        <p className="hero-sub">Monkeytype + TypeRacer — ko'p tilli typing o'yini</p>

        <div className="mode-cards">
          <div className="mode-card" onClick={() => navigate('/practice')}>
            <div className="mode-icon">⌨️</div>
            <h3>Solo Practice</h3>
            <p>WPM va aniqligingizni oshiring. Ko'p tilda mashq qiling.</p>
            <button className="btn-primary">Boshlash</button>
          </div>

          <div className="mode-card featured" onClick={() => navigate('/race')}>
            <div className="mode-badge">HOT 🔥</div>
            <div className="mode-icon">🏎️</div>
            <h3>Multiplayer Race</h3>
            <p>Do'stlaringiz bilan musobaqalashing. Real vaqt rejimida!</p>
            <button className="btn-primary">Race!</button>
          </div>
        </div>

        <div className="features">
          <div className="feature">🌍 5 til: O'zbek, English, Русский, Deutsch, Français</div>
          <div className="feature">📊 Real-time WPM va aniqlik</div>
          <div className="feature">🏆 Musobaqа natijalari</div>
          <div className="feature">🔗 Room ID bilan do'stlarni taklif qiling</div>
        </div>
      </div>
    </div>
  );
}
