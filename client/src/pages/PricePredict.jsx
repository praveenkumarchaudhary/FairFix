import { useState } from "react";
import { Search, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Send, Zap, Shield, ChevronRight, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const API_BASE = "http://localhost:5000/api";

const DEVICES = ["Smartphone", "Laptop", "Tablet"];
const BRANDS = {
  Smartphone: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Other"],
  Laptop: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Other"],
  Tablet: ["Apple", "Samsung", "Lenovo", "Other"],
};
const ISSUES = {
  Smartphone: ["Screen", "Battery", "Charging Port", "Camera", "Water Damage", "Software"],
  Laptop: ["Screen", "Battery", "Keyboard", "Charging Port", "Motherboard", "Software"],
  Tablet: ["Screen", "Battery", "Charging Port", "Camera", "Software"],
};
const DEVICE_ICONS = { Smartphone: "📱", Laptop: "💻", Tablet: "📟" };
const ISSUE_ICONS  = { Screen: "🖥️", Battery: "🔋", "Charging Port": "🔌", Camera: "📷", "Water Damage": "💧", Software: "⚙️", Keyboard: "⌨️", Motherboard: "🔧" };

export default function PricePredict() {
  const [form, setForm]               = useState({ device: "", brand: "", issue: "" });
  const [shopPrice, setShopPrice]     = useState("");
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [chartData, setChartData]     = useState([]);
  const [reportForm, setReportForm]   = useState({ price: "", city: "" });
  const [reportLoading, setReportLoading] = useState(false);

  const canSubmit = form.device && form.brand && form.issue && !loading;

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);
    setChartData([]);
    setShopPrice("");
    try {
      const res = await fetch(API_BASE + "/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
      // fetch price history
      try {
        const hRes = await fetch(
          API_BASE + "/pricing/history?device=" + form.device.toLowerCase() +
          "&brand=" + form.brand.toLowerCase() + "&issue=" + form.issue.toLowerCase()
        );
        const hData = await hRes.json();
        setChartData(hData.chartData || []);
      } catch (_) {}
    } catch (err) {
      toast.error(err.message || "Prediction failed. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportForm.price) return toast.error("Please enter a price");
    setReportLoading(true);
    try {
      const res = await fetch(API_BASE + "/predict/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device: form.device.toLowerCase(), brand: form.brand.toLowerCase(),
          issue: form.issue.toLowerCase(), price: Number(reportForm.price), city: reportForm.city,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Price reported! Thank you.");
      setReportForm({ price: "", city: "" });
    } catch (err) {
      toast.error(err.message || "Failed to report price");
    } finally {
      setReportLoading(false);
    }
  };

  const shopPriceNum     = parseFloat(shopPrice) || 0;
  const isOvercharge     = result && shopPriceNum > result.priceRange.max;
  const isUndercharge    = result && shopPriceNum > 0 && shopPriceNum < result.priceRange.min * 0.7;
  const isFair           = result && shopPriceNum > 0 && !isOvercharge && !isUndercharge;
  const overchargeAmt    = result ? Math.round(shopPriceNum - result.priceRange.avg) : 0;
  const overchargePct    = result && result.priceRange.avg > 0 ? Math.round((overchargeAmt / result.priceRange.avg) * 100) : 0;

  return (
    <div style={{ padding: "36px 16px", minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: 820 }}>

        {/* ── PAGE HEADER ── */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px var(--primary-glow)", flexShrink: 0 }}>
              <DollarSign size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: "clamp(22px,4vw,28px)", fontWeight: 900, letterSpacing: "-0.02em" }}>Price Check</h1>
              <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>Get a fair price estimate before visiting any repair shop</p>
            </div>
          </div>
        </div>

        {/* ── FORM CARD ── */}
        <div className="card card-glow fade-up" style={{ marginBottom: 24, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Search size={16} color="var(--primary-light)" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Enter Repair Details</span>
          </div>

          {/* Step progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {[{ n: 1, label: "Device", done: !!form.device }, { n: 2, label: "Brand", done: !!form.brand }, { n: 3, label: "Issue", done: !!form.issue }].map((s, i) => (
              <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: s.done ? "var(--secondary)" : "var(--text3)", transition: "color 0.3s" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.done ? "var(--secondary)" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "white", transition: "background 0.3s", flexShrink: 0 }}>
                    {s.done ? "✓" : s.n}
                  </div>
                  <span style={{ fontWeight: s.done ? 600 : 400 }}>{s.label}</span>
                </div>
                {i < 2 && <ChevronRight size={12} color="var(--border2)" />}
              </div>
            ))}
          </div>

          <form onSubmit={handlePredict}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Device Type *</label>
                <select className="form-select" value={form.device} onChange={e => setForm({ device: e.target.value, brand: "", issue: "" })}>
                  <option value="">Select device</option>
                  {DEVICES.map(d => <option key={d} value={d}>{DEVICE_ICONS[d]} {d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Brand *</label>
                <select className="form-select" value={form.brand} disabled={!form.device} onChange={e => setForm({ ...form, brand: e.target.value, issue: "" })}>
                  <option value="">Select brand</option>
                  {(BRANDS[form.device] || []).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Issue *</label>
                <select className="form-select" value={form.issue} disabled={!form.brand} onChange={e => setForm({ ...form, issue: e.target.value })}>
                  <option value="">Select issue</option>
                  {(ISSUES[form.device] || []).map(i => <option key={i} value={i}>{ISSUE_ICONS[i] || "🔧"} {i}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button type="submit" className="btn btn-primary" disabled={!canSubmit} style={{ minWidth: 160 }}>
                {loading
                  ? <><span className="spinner" /> Analyzing...</>
                  : <><Zap size={16} /> Get Fair Price</>}
              </button>
              {result && (
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setResult(null); setShopPrice(""); setChartData([]); setForm({ device: "", brand: "", issue: "" }); }}>
                  <RefreshCw size={14} /> Reset
                </button>
              )}
              {!canSubmit && !loading && (
                <span style={{ fontSize: 12, color: "var(--text3)" }}>
                  {!form.device ? "Select a device to start" : !form.brand ? "Now select a brand" : "Now select the issue"}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* ── LOADING STATE ── */}
        {loading && (
          <div className="card fade-in" style={{ marginBottom: 24, padding: "40px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "spin 1s linear infinite" }}>
              <Zap size={22} color="white" />
            </div>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Analyzing market prices...</p>
            <p style={{ fontSize: 13, color: "var(--text2)" }}>Checking {form.brand} {form.device} {form.issue} repair data</p>
          </div>
        )}

        {/* ── RESULTS ── */}
        {result && !loading && (
          <div className="fade-up">

            {/* Price range */}
            <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg, rgba(124,58,237,0.07), rgba(6,182,212,0.04))", border: "1px solid rgba(124,58,237,0.2)", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{DEVICE_ICONS[result.device] || "🔧"}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{result.brand} {result.device}</div>
                    <div style={{ fontSize: 13, color: "var(--text2)" }}>{ISSUE_ICONS[result.issue] || "🔧"} {result.issue} Repair</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="badge badge-blue">Confidence: {result.confidence}</span>
                  <span className="badge badge-green"><Shield size={10} /> Fair Range</span>
                </div>
              </div>

              {/* Price boxes */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 10, marginBottom: 18 }}>
                <div style={{ textAlign: "center", padding: "14px 8px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--text2)", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Min</div>
                  <div style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#34d399" }}>${result.priceRange.min}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>Budget</div>
                </div>
                <div style={{ textAlign: "center", padding: "18px 8px", background: "rgba(124,58,237,0.1)", border: "2px solid rgba(124,58,237,0.3)", borderRadius: 14, position: "relative" }}>
                  <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "var(--primary)", color: "white", fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>FAIR AVG</div>
                  <div style={{ fontSize: 10, color: "var(--text2)", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Average</div>
                  <div style={{ fontSize: "clamp(28px,5vw,40px)", fontWeight: 900, color: "var(--primary-light)" }}>${result.priceRange.avg}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>Market rate</div>
                </div>
                <div style={{ textAlign: "center", padding: "14px 8px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--text2)", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Max</div>
                  <div style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#fbbf24" }}>${result.priceRange.max}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>Premium</div>
                </div>
              </div>

              {/* Gradient bar */}
              <div style={{ height: 6, background: "linear-gradient(90deg, #34d399 0%, #a78bfa 50%, #fbbf24 100%)", borderRadius: 4, opacity: 0.6 }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", marginTop: 5 }}>
                <span>Budget</span><span style={{ color: "var(--primary-light)", fontWeight: 600 }}>← Fair Zone →</span><span>Premium</span>
              </div>
            </div>

            {/* Overcharge detector */}
            <div className="card" style={{ marginBottom: 20, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <AlertTriangle size={16} color="#fbbf24" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Overcharge Detector</span>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ flex: "1 1 180px" }}>
                  <label className="form-label">Shop Quoted Price ($)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontWeight: 700, fontSize: 15 }}>$</span>
                    <input className="form-input" type="number" min="0" placeholder="Enter shop price" style={{ paddingLeft: 26 }}
                      value={shopPrice} onChange={e => setShopPrice(e.target.value)} />
                  </div>
                </div>
                {shopPriceNum > 0 && (
                  <div style={{ flex: "2 1 240px" }}>
                    {isOvercharge && (
                      <div className="alert alert-danger" style={{ borderRadius: 12 }}>
                        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <strong>Overcharge Detected! +{overchargePct}%</strong>
                          <div style={{ fontSize: 12, marginTop: 4 }}>
                            Quoted <strong>${shopPriceNum}</strong> vs fair avg <strong>${result.priceRange.avg}</strong>
                            <br />You could save <strong style={{ color: "#f87171" }}>${overchargeAmt}</strong> — get another quote!
                          </div>
                        </div>
                      </div>
                    )}
                    {isUndercharge && (
                      <div className="alert alert-warning" style={{ borderRadius: 12 }}>
                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                        <div>
                          <strong>Suspiciously Low Price</strong>
                          <div style={{ fontSize: 12, marginTop: 4 }}>This is below market minimum. Verify the quality of parts being used.</div>
                        </div>
                      </div>
                    )}
                    {isFair && (
                      <div className="alert alert-success" style={{ borderRadius: 12 }}>
                        <CheckCircle size={18} style={{ flexShrink: 0 }} />
                        <div>
                          <strong>Fair Price ✓</strong>
                          <div style={{ fontSize: 12, marginTop: 4 }}>${shopPriceNum} is within the fair range (${result.priceRange.min}–${result.priceRange.max})</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="card" style={{ marginBottom: 20, padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <TrendingUp size={16} color="var(--primary-light)" />
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Price History Trend</span>
                </div>
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--text3)" fontSize={11} />
                    <YAxis stroke="var(--text3)" fontSize={11} tickFormatter={v => "$" + v} width={45} />
                    <Tooltip contentStyle={{ background: "var(--card-solid)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: 12 }} formatter={v => ["$" + v, ""]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="avg" stroke="#a78bfa" strokeWidth={2.5} dot={false} name="Avg" />
                    <Line type="monotone" dataKey="min" stroke="#34d399" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Min" />
                    <Line type="monotone" dataKey="max" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Max" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Contribute */}
            <div className="card" style={{ padding: "22px 24px", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Send size={15} color="var(--secondary)" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Contribute Pricing Data</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14 }}>Help the community by reporting what you actually paid.</p>
              <form onSubmit={handleReport}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Price You Paid ($)</label>
                    <input className="form-input" type="number" placeholder="0" value={reportForm.price}
                      onChange={e => setReportForm({ ...reportForm, price: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">City (optional)</label>
                    <input className="form-input" placeholder="e.g. New York" value={reportForm.city}
                      onChange={e => setReportForm({ ...reportForm, city: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-secondary btn-sm" disabled={reportLoading}>
                  {reportLoading ? <><span className="spinner" /> Reporting...</> : <><Send size={13} /> Report Price</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="card fade-up" style={{ textAlign: "center", padding: "52px 20px", background: "transparent", border: "1px dashed var(--border2)" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 17 }}>Ready to check prices</h3>
            <p style={{ fontSize: 14, color: "var(--text2)", maxWidth: 340, margin: "0 auto" }}>
              Select your device, brand, and issue above to get an instant fair price estimate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
