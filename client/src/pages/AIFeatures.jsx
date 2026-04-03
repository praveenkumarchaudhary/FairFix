import { useState, useRef } from 'react';
import { Brain, Upload, TrendingUp, Send, AlertTriangle, CheckCircle, Zap, Shield, Clock, ChevronRight, X, Image, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000/api/ai';
const DEVICES = ['Smartphone', 'Laptop', 'Tablet'];
const BRANDS  = { Smartphone: ['Apple','Samsung','Google','OnePlus','Xiaomi','Other'], Laptop: ['Apple','Dell','HP','Lenovo','Other'], Tablet: ['Apple','Samsung','Other'] };
const ISSUES  = { Smartphone: ['Screen','Battery','Charging Port','Camera','Water Damage','Software'], Laptop: ['Screen','Battery','Keyboard','Charging Port','Motherboard','Software'], Tablet: ['Screen','Battery','Charging Port','Camera','Software'] };
const SEVERITY_COLORS = { low: '#34d399', medium: '#fbbf24', high: '#f87171', critical: '#ef4444' };
const TABS = [
  { id: 'diagnose', label: 'AI Diagnosis',       icon: <Brain size={16} /> },
  { id: 'image',    label: 'Damage Detection',   icon: <Upload size={16} /> },
  { id: 'predict',  label: 'Smart Prediction',   icon: <TrendingUp size={16} /> },
];

// ── Confidence Ring ──
function ConfidenceRing({ value, size = 80 }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 80 ? '#34d399' : value >= 60 ? '#fbbf24' : '#f87171';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px`, fill: color, fontSize: 16, fontWeight: 900, fontFamily: 'Inter' }}>
        {value}%
      </text>
    </svg>
  );
}

// ── Diagnosis Panel ──
function DiagnosePanel() {
  const [symptoms, setSymptoms] = useState('');
  const [device, setDevice]     = useState('');
  const [brand, setBrand]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const quickSymptoms = ['Cracked screen', 'Battery draining fast', 'Not charging', 'Water damage', 'Phone overheating', 'Black screen', 'Camera not working', 'Keeps restarting'];

  const diagnose = async (text) => {
    const msg = text || symptoms;
    if (!msg.trim()) return toast.error('Describe your symptoms first');
    setChatHistory(h => [...h, { role: 'user', text: msg }]);
    setSymptoms('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/diagnose`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: msg, device, brand }),
      });
      const data = await res.json();
      setResult(data);
      setChatHistory(h => [...h, { role: 'ai', data }]);
    } catch { toast.error('Diagnosis failed. Is the server running?'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} id="diag-grid">
      {/* Left: Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Brain size={16} color="var(--primary-light)" />
            <span style={{ fontWeight: 700 }}>Describe Your Problem</span>
          </div>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Device (optional)</label>
              <select className="form-select" value={device} onChange={e => { setDevice(e.target.value); setBrand(''); }}>
                <option value="">Auto-detect</option>
                {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Brand (optional)</label>
              <select className="form-select" value={brand} onChange={e => setBrand(e.target.value)} disabled={!device}>
                <option value="">Any brand</option>
                {(BRANDS[device] || []).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Symptoms *</label>
            <textarea className="form-textarea" style={{ minHeight: 80 }}
              placeholder="e.g. My iPhone screen is cracked and touch is not working..."
              value={symptoms} onChange={e => setSymptoms(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) diagnose(); }} />
          </div>
          <button className="btn btn-primary btn-full" onClick={() => diagnose()} disabled={loading || !symptoms.trim()}>
            {loading ? <><span className="spinner" /> Analyzing...</> : <><Zap size={15} /> Diagnose Issue</>}
          </button>
        </div>

        {/* Quick symptoms */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Select</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {quickSymptoms.map(s => (
              <button key={s} onClick={() => diagnose(s)} style={{
                background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text2)',
                borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}
              >{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Results */}
      <div>
        {loading && (
          <div className="card fade-in" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', animation: 'spin 1s linear infinite' }}>
              <Brain size={22} color="white" />
            </div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>AI is analyzing your symptoms...</p>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Checking repair database</p>
          </div>
        )}

        {result && !loading && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {result.diagnosed ? (
              <>
                {/* Main diagnosis card */}
                <div className="card" style={{ padding: 20, border: `1px solid ${SEVERITY_COLORS[result.severity]}40`, background: `${SEVERITY_COLORS[result.severity]}08` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Diagnosed Issue</div>
                      <div style={{ fontSize: 22, fontWeight: 900 }}>{result.issue}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{result.cause}</div>
                    </div>
                    <ConfidenceRing value={result.confidence} />
                  </div>

                  {result.warning && (
                    <div className="alert alert-danger" style={{ marginBottom: 14 }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                      <strong>{result.warning}</strong>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[
                      { label: 'Severity', value: result.severity, color: SEVERITY_COLORS[result.severity] },
                      { label: 'Repair Time', value: result.repairTime, color: 'var(--accent)' },
                      { label: 'Urgency', value: result.urgencyInfo?.label, color: result.urgencyInfo?.color },
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--bg2)', borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: item.color, textTransform: 'capitalize' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Min</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>${result.priceRange.min}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Fair Avg</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary-light)' }}>${result.priceRange.avg}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Max</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>${result.priceRange.max}</div>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                {result.tips?.length > 0 && (
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>💡 Repair Tips</div>
                    {result.tips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8, fontSize: 13, color: 'var(--text2)' }}>
                        <CheckCircle size={14} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} />
                        {tip}
                      </div>
                    ))}
                  </div>
                )}

                {/* Follow-up questions */}
                {result.followUps?.length > 0 && (
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🤔 Follow-up Questions</div>
                    {result.followUps.map((q, i) => (
                      <button key={i} onClick={() => diagnose(q)} style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
                        padding: '8px 12px', marginBottom: 6, cursor: 'pointer', color: 'var(--text2)',
                        fontSize: 13, fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
                      >
                        <ChevronRight size={13} color="var(--primary-light)" /> {q}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🤔</div>
                <p style={{ fontWeight: 700, marginBottom: 8 }}>Couldn't identify the issue</p>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>{result.message}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {result.suggestions?.map(s => (
                    <button key={s} onClick={() => diagnose(s)} style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: 'var(--primary-light)', borderRadius: 20, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!result && !loading && (
          <div className="card" style={{ padding: 40, textAlign: 'center', border: '1px dashed var(--border2)', background: 'transparent' }}>
            <Brain size={40} color="var(--text3)" style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 700, marginBottom: 6 }}>AI Repair Diagnosis</p>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Describe your device problem and our AI will identify the issue, estimate repair cost, and give you expert tips.</p>
          </div>
        )}
      </div>
      <style>{`@media(max-width:768px){#diag-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
