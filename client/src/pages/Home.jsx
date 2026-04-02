import { useNavigate } from 'react-router-dom';
import { Shield, Search, MapPin, TrendingUp, Zap, AlertTriangle, ChevronRight, Sparkles, Star } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: <Search size={22} />, title: 'Price Prediction', desc: 'AI-powered fair price estimates for any repair', color: '#7c3aed', glow: 'rgba(124,58,237,0.3)' },
    { icon: <AlertTriangle size={22} />, title: 'Overcharge Detection', desc: 'Instantly detect if a shop is overcharging you', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
    { icon: <MapPin size={22} />, title: 'Shop Finder', desc: 'Find trusted repair shops near your location', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
    { icon: <Shield size={22} />, title: 'Trust Scores', desc: 'Community-verified ratings and trust scores', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
    { icon: <TrendingUp size={22} />, title: 'Price History', desc: 'Track repair price trends over time', color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
    { icon: <Zap size={22} />, title: 'Emergency Mode', desc: 'Find the nearest open shop instantly', color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
  ];

  const stats = [
    { value: '10K+', label: 'Repairs Tracked', icon: '🔧' },
    { value: '500+', label: 'Verified Shops',  icon: '🏪' },
    { value: '98%',  label: 'Accuracy Rate',   icon: '🎯' },
    { value: '4.8★', label: 'User Rating',     icon: '⭐' },
  ];

  const steps = [
    { step: '01', title: 'Enter Your Device', desc: 'Tell us your device, brand, and what needs fixing', icon: '📱' },
    { step: '02', title: 'Get Fair Price',     desc: 'Our AI predicts the fair market price instantly',   icon: '💰' },
    { step: '03', title: 'Find Trusted Shop',  desc: 'Compare nearby shops and pick the best one',       icon: '🏪' },
  ];

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{ padding: '80px 20px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container">
          <div className="fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="badge badge-blue" style={{ marginBottom: 20, fontSize: 12, padding: '6px 14px' }}>
              <Sparkles size={12} /> Transparent Repair Pricing Platform
            </div>
          </div>

          <h1 className="fade-up" style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em', animationDelay: '0.15s' }}>
            Never Get Overcharged<br />
            <span className="gradient-text">on Repairs Again</span>
          </h1>

          <p className="fade-up" style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7, animationDelay: '0.2s' }}>
            FairFix uses smart pricing intelligence to help you find honest repair shops and always pay fair prices.
          </p>

          <div className="fade-up" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.25s' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/predict')}
              style={{ gap: 10 }}>
              <Search size={18} /> Check Fair Price
              <ChevronRight size={16} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/shops')}>
              <MapPin size={18} /> Find Shops Near Me
            </button>
          </div>

          {/* Floating device mockup */}
          <div className="fade-up" style={{ marginTop: 60, animationDelay: '0.35s' }}>
            <div style={{
              display: 'inline-flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
              padding: '20px 28px',
              background: 'var(--card)',
              border: '1px solid var(--border2)',
              borderRadius: 20,
              backdropFilter: 'blur(12px)',
              animation: 'heroFloat 6s ease-in-out infinite',
            }}>
              {[
                { label: 'iPhone Screen', price: '$80–$150', tag: 'Fair' },
                { label: 'Samsung Battery', price: '$40–$80', tag: 'Fair' },
                { label: 'Laptop Screen', price: '$100–$220', tag: 'Fair' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', padding: '8px 16px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{item.price}</div>
                  <div className="badge badge-green" style={{ marginTop: 4, fontSize: 10 }}>✓ {item.tag}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '0 20px 60px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="stagger">
            {stats.map(s => (
              <div key={s.label} className="card card-glow fade-up" style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 4 }} className="gradient-text">{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:640px){.container > div[style*="repeat(4"]{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '60px 20px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge badge-cyan" style={{ marginBottom: 12 }}>Features</div>
            <h2 className="fade-up" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em' }}>Everything You Need</h2>
            <p style={{ color: 'var(--text2)', fontSize: 16 }}>Smart tools to protect you from unfair repair pricing</p>
          </div>
          <div className="grid-3 stagger">
            {features.map(f => (
              <div key={f.title} className="card card-glow fade-up" style={{ textAlign: 'center', padding: '32px 24px', cursor: 'default' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px', color: f.color,
                  boxShadow: `0 4px 16px ${f.glow}`,
                  transition: 'transform 0.2s',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: 16 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '60px 20px', background: 'var(--bg2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge badge-blue" style={{ marginBottom: 12 }}>Process</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em' }}>How It Works</h2>
          </div>
          <div className="grid-3 stagger">
            {steps.map((item, i) => (
              <div key={item.step} className="card fade-up" style={{ textAlign: 'center', padding: '36px 24px', position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div className="hide-mobile" style={{ position: 'absolute', right: -24, top: '50%', transform: 'translateY(-50%)', color: 'var(--border2)', fontSize: 24, zIndex: 2 }}>→</div>
                )}
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary-light)', letterSpacing: '0.1em', marginBottom: 10 }}>STEP {item.step}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: 17 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMERGENCY CTA ── */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="container">
          <div className="card fade-up" style={{
            maxWidth: 620, margin: '0 auto', padding: '52px 40px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.06))',
            border: '1px solid rgba(124,58,237,0.2)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
            <div style={{ animation: 'float 3s ease-in-out infinite', display: 'inline-block', marginBottom: 20 }}>
              <Zap size={44} color="var(--primary-light)" />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 14, letterSpacing: '-0.02em' }}>Emergency Repair?</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 16, lineHeight: 1.6 }}>
              Need a repair shop right now? Emergency Mode finds the nearest available shop instantly.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/shops?emergency=true')}
              style={{ animation: 'glow 2s ease-in-out infinite' }}>
              <Zap size={18} /> Activate Emergency Mode
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
