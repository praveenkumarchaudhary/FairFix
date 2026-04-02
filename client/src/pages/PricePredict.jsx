import { useState } from 'react';
import { Search, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Send } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DEVICES = ['Smartphone', 'Laptop', 'Tablet'];
const BRANDS = {
  Smartphone: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Other'],
  Laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Other'],
  Tablet: ['Apple', 'Samsung', 'Lenovo', 'Other'],
};
const ISSUES = {
  Smartphone: ['Screen', 'Battery', 'Charging Port', 'Camera', 'Water Damage', 'Software'],
  Laptop: ['Screen', 'Battery', 'Keyboard', 'Charging Port', 'Motherboard', 'Software'],
  Tablet: ['Screen', 'Battery', 'Charging Port', 'Camera', 'Software'],
};

export default function PricePredict() {
  const [form, setForm] = useState({ device: '', brand: '', issue: '' });
  const [shopPrice, setShopPrice] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [reportForm, setReportForm] = useState({ price: '', city: '' });
  const [reportLoading, setReportLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!form.device || !form.brand || !form.issue) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const { data } = await API.post('/predict', form);
      setResult(data);
      // Fetch price history
      const hist = await API.get(`/pricing/history?device=${form.device.toLowerCase()}&brand=${form.brand.toLowerCase()}&issue=${form.issue.toLowerCase()}`);
      setChartData(hist.data.chartData || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportForm.price) return toast.error('Please enter a price');
    setReportLoading(true);
    try {
      await API.post('/predict/report', {
        device: form.device.toLowerCase(),
        brand: form.brand.toLowerCase(),
        issue: form.issue.toLowerCase(),
        price: Number(reportForm.price),
        city: reportForm.city
      });
      toast.success('Price reported! Thank you for contributing.');
      setReportForm({ price: '', city: '' });
    } catch (err) {
      toast.error('Failed to report price');
    } finally {
      setReportLoading(false);
    }
  };

  const shopPriceNum = parseFloat(shopPrice);
  const isOvercharge = result && shopPriceNum > result.priceRange.max;
  const isUndercharge = result && shopPriceNum > 0 && shopPriceNum < result.priceRange.min * 0.7;
  const overchargePercent = result && shopPriceNum > 0 ? Math.round(((shopPriceNum - result.priceRange.avg) / result.priceRange.avg) * 100) : 0;

  return (
    <div style={{ padding: '32px 20px' }}>
      <div className="container">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Price Prediction</h1>
          <p style={{ color: 'var(--text2)', marginBottom: 32 }}>Get a fair price estimate for your repair before visiting any shop.</p>

          {/* Prediction Form */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={18} color="var(--primary)" /> Enter Repair Details
            </h2>
            <form onSubmit={handlePredict}>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Device Type *</label>
                  <select className="form-select" value={form.device}
                    onChange={e => setForm({ device: e.target.value, brand: '', issue: '' })}>
                    <option value="">Select device</option>
                    {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <select className="form-select" value={form.brand} disabled={!form.device}
                    onChange={e => setForm({ ...form, brand: e.target.value, issue: '' })}>
                    <option value="">Select brand</option>
                    {(BRANDS[form.device] || []).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Issue *</label>
                  <select className="form-select" value={form.issue} disabled={!form.brand}
                    onChange={e => setForm({ ...form, issue: e.target.value })}>
                    <option value="">Select issue</option>
                    {(ISSUES[form.device] || []).map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" /> Predicting...</> : <><Search size={16} /> Get Fair Price</>}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div className="fade-in">
              <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.05))' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={18} color="var(--secondary)" /> Fair Price Range
                </h2>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
                  <div style={{ textAlign: 'center', flex: 1, minWidth: 100 }}>
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Minimum</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--secondary)' }}>${result.priceRange.min}</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, minWidth: 100, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: '0 20px' }}>
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Average</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)' }}>${result.priceRange.avg}</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, minWidth: 100 }}>
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Maximum</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>${result.priceRange.max}</div>
                  </div>
                </div>
                <div className="badge badge-blue">
                  Confidence: {result.confidence}
                </div>
              </div>

              {/* Overcharge Checker */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={18} color="var(--warning)" /> Overcharge Detector
                </h2>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Shop's Quoted Price ($)</label>
                    <input className="form-input" type="number" placeholder="Enter shop price"
                      value={shopPrice} onChange={e => setShopPrice(e.target.value)} />
                  </div>
                </div>
                {shopPriceNum > 0 && (
                  <div style={{ marginTop: 16 }}>
                    {isOvercharge ? (
                      <div className="alert alert-danger">
                        <AlertTriangle size={18} />
                        <div>
                          <strong>Overcharge Detected!</strong>
                          <div style={{ fontSize: 13, marginTop: 4 }}>
                            This shop is charging ${shopPriceNum} — that's {overchargePercent}% above the fair average of ${result.priceRange.avg}.
                            You could save <strong>${Math.round(shopPriceNum - result.priceRange.avg)}</strong>.
                          </div>
                        </div>
                      </div>
                    ) : isUndercharge ? (
                      <div className="alert alert-warning">
                        <AlertTriangle size={18} />
                        <div>
                          <strong>Suspiciously Low Price</strong>
                          <div style={{ fontSize: 13, marginTop: 4 }}>This price is unusually low. Verify the quality of parts being used.</div>
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-success">
                        <CheckCircle size={18} />
                        <div>
                          <strong>Fair Price!</strong>
                          <div style={{ fontSize: 13, marginTop: 4 }}>
                            ${shopPriceNum} is within the fair range (${result.priceRange.min}–${result.priceRange.max}).
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price History Chart */}
              {chartData.length > 0 && (
                <div className="card" style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={18} color="var(--primary)" /> Price History
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--text3)" fontSize={12} />
                      <YAxis stroke="var(--text3)" fontSize={12} tickFormatter={v => `$${v}`} />
                      <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }}
                        formatter={(v) => [`$${v}`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="avg" stroke="var(--primary)" strokeWidth={2} dot={false} name="Avg Price" />
                      <Line type="monotone" dataKey="min" stroke="var(--secondary)" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Min" />
                      <Line type="monotone" dataKey="max" stroke="var(--warning)" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Max" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Crowd-source report */}
              <div className="card">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Send size={18} color="var(--secondary)" /> Contribute Pricing Data
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Help others by reporting what you actually paid.</p>
                <form onSubmit={handleReport}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Price You Paid ($)</label>
                      <input className="form-input" type="number" placeholder="0" value={reportForm.price}
                        onChange={e => setReportForm({ ...reportForm, price: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City (optional)</label>
                      <input className="form-input" placeholder="e.g. New York" value={reportForm.city}
                        onChange={e => setReportForm({ ...reportForm, city: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-secondary btn-sm" disabled={reportLoading}>
                    {reportLoading ? <><span className="spinner" /> Reporting...</> : <><Send size={14} /> Report Price</>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
