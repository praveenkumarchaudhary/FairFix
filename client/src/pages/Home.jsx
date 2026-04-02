import { useNavigate } from 'react-router-dom';
import { Shield, Search, MapPin, TrendingUp, Zap, Star, AlertTriangle, ChevronRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: <Search size={24} />, title: 'Price Prediction', desc: 'AI-powered fair price estimates for any repair', color: '#6366f1' },
    { icon: <AlertTriangle size={24} />, title: 'Overcharge Detection', desc: 'Instantly detect if a shop is overcharging you', color: '#ef4444' },
    { icon: <MapPin size={24} />, title: 'Shop Finder', desc: 'Find trusted repair shops near your location', color: '#10b981' },
    { icon: <Shield size={24} />, title: 'Trust Scores', desc: 'Community-verified ratings and trust scores', color: '#f59e0b' },
    { icon: <TrendingUp size={24} />, title: 'Price History', desc: 'Track repair price trends over time', color: '#8b5cf6' },
    { icon: <Zap size={24} />, title: 'Emergency Mode', desc: 'Find the nearest open shop instantly', color: '#06b6d4' },
  ];

  const stats = [
    { value: '10K+', label: 'Repairs Tracked' },
    { value: '500+', label: 'Verified Shops' },
    { value: '98%', label: 'Accuracy Rate' },
    { value: '4.8★', label: 'User Rating' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%)', padding: '80px 20px', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-blue" style={{ marginBottom: 16, fontSize: 12 }}>
            <Shield size={12} /> Transparent Repair Pricing
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
            Never Get Overcharged<br />
            <span style={{ color: 'var(--primary)' }}>on Repairs Again</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
            FairFix uses smart pricing intelligence to help you find honest repair shops and pay fair prices.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/predict')}>
              <Search size={18} /> Check Fair Price
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/shops')}>
              <MapPin size={18} /> Find Shops Near Me
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '32px 20px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:600px){.container > div{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 20px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Everything You Need</h2>
          <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: 48 }}>Smart tools to protect you from unfair repair pricing</p>
          <div className="grid-3">
            {features.map(f => (
              <div key={f.title} className="card" style={{ textAlign: 'center', padding: 28 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--bg2)', padding: '64px 20px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 48 }}>How It Works</h2>
          <div className="grid-3">
            {[
              { step: '01', title: 'Enter Your Device', desc: 'Tell us your device, brand, and what needs fixing' },
              { step: '02', title: 'Get Fair Price', desc: 'Our AI predicts the fair market price for your repair' },
              { step: '03', title: 'Find Trusted Shop', desc: 'Compare nearby shops and pick the best one' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--border)', marginBottom: 12 }}>{item.step}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 20px', textAlign: 'center' }}>
        <div className="container">
          <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: 48, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.1))' }}>
            <Zap size={40} color="var(--primary)" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Emergency Repair?</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Need a repair shop right now? Use Emergency Mode to find the nearest available shop instantly.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/shops?emergency=true')}>
              <Zap size={18} /> Emergency Mode
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
