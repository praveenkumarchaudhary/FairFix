import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Menu, X, User, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/predict', label: 'Price Check' },
    { to: '/shops', label: 'Find Shops' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'var(--primary)', borderRadius: 8, padding: '6px 8px', display: 'flex' }}>
            <Shield size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18 }}>Fair<span style={{ color: 'var(--primary)' }}>Fix</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: isActive(link.to) ? 'var(--primary)' : 'var(--text2)',
              background: isActive(link.to) ? 'rgba(99,102,241,0.1)' : 'transparent',
              transition: 'all 0.2s'
            }}>{link.label}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="hide-mobile text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} /> {user.name}
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> <span className="hide-mobile">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-outline btn-sm hide-mobile">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <button className="btn btn-ghost btn-sm" style={{ display: 'none' }} onClick={() => setMenuOpen(!menuOpen)}
            id="mobile-menu-btn">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '12px 20px' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 0', color: isActive(link.to) ? 'var(--primary)' : 'var(--text2)', fontWeight: 500 }}>
              {link.label}
            </Link>
          ))}
          {!user && <Link to="/login" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: 'var(--text2)' }}>Login</Link>}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
