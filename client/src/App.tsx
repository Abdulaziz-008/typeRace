import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Race from './pages/Race';
import './App.css';

function Nav() {
  const loc = useLocation();
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Type<span>Race</span></Link>
      <div className="nav-links">
        <Link to="/practice" className={loc.pathname === '/practice' ? 'active' : ''}>Practice</Link>
        <Link to="/race" className={loc.pathname === '/race' ? 'active' : ''}>Race 🏎️</Link>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/race" element={<Race />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
