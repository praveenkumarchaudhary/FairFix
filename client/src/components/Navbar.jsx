import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, User, LogOut, Shield, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/predict', label: 'Price Check' },
    { to: '/shops', label: 'Find Shops' },
    { to: '/complaints', label: 'Complaints' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: scrolled
          ? theme === 'dark' ? 'rgba(8,8,18,0.85)' : 'rgba(248,250,252,0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        animation: 'navSlide 0.4s ease both',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              borderRadius: 10, padding: '7px 9px', display: 'flex',
              boxShadow: '0 4px 12px var(--primary-glow)',
              animation: 'float 3s ease-in-out infinite',
            }}>
              <Shield size={18} color="white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.02em' }}>
              Fair<span className="gradient-text">Fix</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hide-mobile">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                padding: '7px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                color: isActive(link.to) ? 'var(--primary-light)' : 'var(--text2)',
                background: isActive(link.to) ? 'rgba(124,58,237,0.12)' : 'transparent',
                border: isActive(link.to) ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
                onMouseEnter={e => { if (!isActive(link.to)) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--card2)'; } }}
                onMouseLeave={e => { if (!isActive(link.to)) { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'transparent'; } }}
              >{link.label}</Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className={`theme-toggle ${theme === 'light' ? 'light' : ''}`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              <div className="theme-toggle-thumb">
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
            </button>

            {/* Auth */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="hide-mobile" style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 12px', borderRadius: 10,
                  background: 'var(--card2)', border: '1px solid var(--border)',
                  fontSize: 13, color: 'var(--text2)',
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={12} color="white" />
                  </div>
                  {user.name}
                </div>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  <LogOut size={14} />
                  <span className="hide-mobile">Logout</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn btn-outline btn-sm hide-mobile">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-btn"
              className="btn btn-ghost btn-sm"
              style={{ display: 'none' }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div style={{
          overflow: 'hidden',
          maxHeight: menuOpen ? '300px' : '0',
          transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)',
          background: theme === 'dark' ? 'rgba(8,8,18,0.95)' : 'rgba(248,250,252,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: menuOpen ? '1px solid var(--border)' : 'none',
        }}>
          <div style={{ padding: '12px 20px 16px' }}>
            {navLinks.map((link, i) => (
              <Link key={link.to} to={link.to}
                style={{
                  display: 'flex', alignItems: 'center', padding: '11px 14px',
                  borderRadius: 10, marginBottom: 4,
                  color: isActive(link.to) ? 'var(--primary-light)' : 'var(--text2)',
                  background: isActive(link.to) ? 'rgba(124,58,237,0.1)' : 'transparent',
                  fontWeight: 500, fontSize: 15,
                  animation: menuOpen ? `fadeUp 0.3s ${i * 0.05}s both` : 'none',
                }}>
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link to="/login"
                style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', borderRadius: 10, color: 'var(--text2)', fontWeight: 500, fontSize: 15 }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
