import { useNavigate } from 'react-router-dom';
import { Shield, Search, MapPin, TrendingUp, Zap, AlertTriangle, ChevronRight, Sparkles, CheckCircle, Star, DollarSign } from 'lucide-react';

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
      <section style={{ padding: '72px 20px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }} id="hero-grid">

            {/* ── LEFT: Text ── */}
            <div>
              <div className="fade-up" style={{ animationDelay: '0.05s' }}>
                <div className="badge badge-blue" style={{ marginBottom: 22, fontSize: 12, padding: '6px 14px' }}>
                  <Sparkles size={12} /> Transparent Repair Pricing Platform
                </div>
              </div>

              <h1 className="fade-up" style={{ fontSize: 'clamp(34px, 4.5vw, 60px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 22, letterSpacing: '-0.03em', animationDelay: '0.1s' }}>
                Never Get<br />Overcharged<br />
                <span className="gradient-text">on Repairs Again</span>
              </h1>

              <p className="fade-up" style={{ fontSize: 17, color: 'var(--text2)', marginBottom: 36, lineHeight: 1.75, animationDelay: '0.15s', maxWidth: 460 }}>
                FairFix uses smart pricing intelligence to help you find honest repair shops and always pay fair prices.
              </p>

              {/* Trust bullets */}
              <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36, animationDelay: '0.2s' }}>
                {[
                  { icon: <CheckCircle size={15} />, text: 'AI-powered fair price estimates', color: '#34d399' },
                  { icon: <Shield size={15} />,       text: 'Verified trust scores for every shop', color: '#a78bfa' },
                  { icon: <Zap size={15} />,           text: 'Instant overcharge detection', color: '#fbbf24' },
                ].map(b => (
                  <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)' }}>
                    <span style={{ color: b.color, flexShrink: 0 }}>{b.icon}</span>
                    {b.text}
                  </div>
                ))}
              </div>

              <div className="fade-up" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animationDelay: '0.25s' }}>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/predict')}>
                  <Search size={18} /> Check Fair Price <ChevronRight size={16} />
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/shops')}>
                  <MapPin size={18} /> Find Shops
                </button>
              </div>
            </div>

            {/* ── RIGHT: Visual panel ── */}
            <div className="fade-up" style={{ animationDelay: '0.2s', position: 'relative' }} id="hero-visual">

              {/* Main phone mockup card */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 28,
                padding: 28,
                position: 'relative',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(124,58,237,0.1)',
                animation: 'heroFloat 6s ease-in-out infinite',
              }}>
                {/* Phone frame */}
                <div style={{
                  background: 'var(--card-solid)',
                  border: '1px solid var(--border2)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                }}>
                  {/* Phone status bar */}
                  <div style={{ background: 'linear-gradient(135deg, var(--primary), #6d28d9)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={14} color="white" />
                      </div>
                      <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>FairFix</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[...Array(3)].map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />)}
                    </div>
                  </div>

                  {/* App content */}
                  <div style={{ padding: '16px 18px', background: 'var(--bg2)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price Check Result</div>

                    {/* Device info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 12px', background: 'var(--card-solid)', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 24 }}>📱</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>iPhone 14 Pro</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>Screen Replacement</div>
                      </div>
                      <div className="badge badge-blue" style={{ marginLeft: 'auto', fontSize: 10 }}>Apple</div>
                    </div>

                    {/* Price range bars */}
                    {[
                      { label: 'Min', value: '$80', pct: 40, color: '#34d399' },
                      { label: 'Avg', value: '$115', pct: 65, color: '#a78bfa' },
                      { label: 'Max', value: '$150', pct: 85, color: '#fbbf24' },
                    ].map(p => (
                      <div key={p.label} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text2)' }}>{p.label}</span>
                          <span style={{ fontWeight: 700, color: p.color }}>{p.value}</span>
                        </div>
                        <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 3, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    ))}

                    {/* Verdict */}
                    <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={16} color="#34d399" />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>Fair Price Range</div>
                        <div style={{ fontSize: 10, color: 'var(--text2)' }}>Based on 1,240 repairs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card 1 — Overcharge alert */}
              <div style={{
                position: 'absolute', top: -20, right: -20,
                background: 'var(--card-solid)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 14, padding: '10px 14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                animation: 'heroFloat 5s ease-in-out 1s infinite',
                minWidth: 160,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <AlertTriangle size={14} color="#f87171" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>Overcharge Alert!</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>Shop quoted <strong style={{ color: 'var(--text)' }}>$280</strong></div>
                <div style={{ fontSize: 10, color: '#34d399' }}>Fair price: $115 · Save $165</div>
              </div>

              {/* Floating card 2 — Trust score */}
              <div style={{
                position: 'absolute', bottom: 10, left: -24,
                background: 'var(--card-solid)',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 14, padding: '10px 14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                animation: 'heroFloat 5.5s ease-in-out 0.5s infinite',
                minWidth: 150,
              }}>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 6, fontWeight: 600 }}>🏪 TechFix Pro</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '92%', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa' }}>92%</span>
                </div>
                <div style={{ fontSize: 10, color: '#34d399', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Shield size={10} /> Fair Price Badge
                </div>
              </div>

              {/* Floating card 3 — Rating */}
              <div style={{
                position: 'absolute', bottom: -16, right: 20,
                background: 'var(--card-solid)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 14, padding: '10px 14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                animation: 'heroFloat 4.5s ease-in-out 1.5s infinite',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 20 }}>⭐</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>4.8</div>
                    <div style={{ fontSize: 10, color: 'var(--text2)' }}>215 reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            #hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; text-align: center; }
            #hero-grid > div:first-child { align-items: center; display: flex; flex-direction: column; }
            #hero-visual { display: none !important; }
          }
        `}</style>
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
