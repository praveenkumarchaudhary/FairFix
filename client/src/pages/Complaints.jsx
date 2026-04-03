import { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle, Search, Flag, ChevronDown } from "lucide-react";
import API from "../utils/api";
import toast from "react-hot-toast";

const TYPE_LABELS = {
  overcharge:   { label: "Overcharging",  color: "#fbbf24", bg: "rgba(245,158,11,0.1)",  icon: "💸" },
  fraud:        { label: "Fraud / Scam",  color: "#f87171", bg: "rgba(239,68,68,0.1)",   icon: "🚨" },
  poor_service: { label: "Poor Service",  color: "#94a3b8", bg: "rgba(100,116,139,0.1)", icon: "😤" },
  fake_parts:   { label: "Fake Parts",    color: "#fb923c", bg: "rgba(251,146,60,0.1)",  icon: "⚠️" },
  other:        { label: "Other",         color: "#a78bfa", bg: "rgba(167,139,250,0.1)", icon: "📋" },
};

const STATUS_LABELS = {
  pending:  { label: "Pending",  color: "#fbbf24" },
  reviewed: { label: "Reviewed", color: "#60a5fa" },
  resolved: { label: "Resolved", color: "#34d399" },
};

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const shopsRes = await API.get("/shops");
      const shops = shopsRes.data;
      const all = await Promise.all(
        shops.map(async (shop) => {
          try {
            const res = await API.get("/complaints/shop/" + shop._id);
            return res.data.map(c => ({ ...c, shopName: shop.name, shopCity: shop.city }));
          } catch { return []; }
        })
      );
      setComplaints(all.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter(c => {
    const matchSearch = search === "" ||
      c.shopName?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.userName?.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === "all"   || c.type === filterType;
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const counts = {
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === "pending").length,
    resolved:   complaints.filter(c => c.status === "resolved").length,
    overcharge: complaints.filter(c => c.type === "overcharge").length,
  };

  return (
    <div style={{ padding: "32px 20px", minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: 900 }}>

        <div className="fade-up" style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flag size={20} color="#f87171" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em" }}>Complaints Board</h1>
              <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>Community-reported issues with repair shops</p>
            </div>
          </div>
        </div>

        <div className="grid-4 fade-up" style={{ marginBottom: 28 }}>
          {[
            { label: "Total Reports", value: counts.total,      color: "#a78bfa", icon: "📋" },
            { label: "Pending",       value: counts.pending,    color: "#fbbf24", icon: "⏳" },
            { label: "Resolved",      value: counts.resolved,   color: "#34d399", icon: "✅" },
            { label: "Overcharges",   value: counts.overcharge, color: "#f87171", icon: "💸" },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: "center", padding: "16px 12px" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card fade-up" style={{ marginBottom: 24, padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} />
              <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search shop, description..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ minWidth: 150 }}>
              <option value="all">All Types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ minWidth: 140 }}>
              <option value="all">All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="reviewed">🔍 Reviewed</option>
              <option value="resolved">✅ Resolved</option>
            </select>
            <div style={{ fontSize: 13, color: "var(--text2)", whiteSpace: "nowrap" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 18, width: "40%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: "55%" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card fade-up" style={{ textAlign: "center", padding: "52px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No complaints found</h3>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>
              {complaints.length === 0
                ? "No complaints yet. Load demo data from the Shops page first."
                : "No complaints match your current filters."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((c, i) => {
              const typeInfo   = TYPE_LABELS[c.type]    || TYPE_LABELS.other;
              const statusInfo = STATUS_LABELS[c.status] || STATUS_LABELS.pending;
              const isOpen     = expanded === c._id;
              return (
                <div key={c._id} className="card fade-up" style={{ animationDelay: i * 0.04 + "s", padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14 }}
                    onClick={() => setExpanded(isOpen ? null : c._id)}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: typeInfo.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {typeInfo.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{c.shopName || "Unknown Shop"}</span>
                        <span style={{ fontSize: 11, color: "var(--text3)" }}>{c.shopCity}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: typeInfo.color, background: typeInfo.bg, padding: "2px 8px", borderRadius: 20 }}>
                          {typeInfo.label}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: statusInfo.color, background: statusInfo.color + "20", padding: "2px 8px", borderRadius: 20 }}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isOpen ? "normal" : "nowrap" }}>
                        {c.description}
                      </p>
                      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--text3)", flexWrap: "wrap" }}>
                        <span>By: <strong style={{ color: "var(--text2)" }}>{c.userName || "Anonymous"}</strong></span>
                        <span>{new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                        {c.amountCharged && <span>Charged: <strong style={{ color: "#f87171" }}>${c.amountCharged}</strong></span>}
                        {c.fairPrice && <span>Fair: <strong style={{ color: "#34d399" }}>${c.fairPrice}</strong></span>}
                      </div>
                    </div>
                    <ChevronDown size={16} color="var(--text3)" style={{ flexShrink: 0, marginTop: 4, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s" }} />
                  </div>

                  <div style={{ maxHeight: isOpen ? "400px" : "0", overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
                    <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                      <div style={{ paddingTop: 16 }}>
                        <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 16 }}>{c.description}</p>
                        {c.amountCharged && c.fairPrice && (
                          <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                            <AlertTriangle size={16} />
                            <div>
                              <strong>Overcharge: ${c.amountCharged - c.fairPrice} extra</strong>
                              <div style={{ fontSize: 12, marginTop: 2 }}>
                                Charged ${c.amountCharged} vs fair price ${c.fairPrice}
                                {" "}({Math.round(((c.amountCharged - c.fairPrice) / c.fairPrice) * 100)}% above fair)
                              </div>
                            </div>
                          </div>
                        )}
                        {c.proofImages && c.proofImages.length > 0 && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              📎 Proof Evidence ({c.proofImages.length} file{c.proofImages.length > 1 ? "s" : ""})
                            </div>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              {c.proofImages.map((img, j) => (
                                <a key={j} href={"http://localhost:5000" + img.url} target="_blank" rel="noreferrer"
                                  style={{ display: "block", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border2)", transition: "transform 0.2s" }}
                                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                                  {img.filename && img.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img src={"http://localhost:5000" + img.url} alt={img.originalName}
                                      style={{ width: 90, height: 90, objectFit: "cover", display: "block" }} />
                                  ) : (
                                    <div style={{ width: 90, height: 90, background: "rgba(239,68,68,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                      <span style={{ fontSize: 24 }}>📄</span>
                                      <span style={{ fontSize: 9, color: "var(--text2)", textAlign: "center", padding: "0 4px" }}>{img.originalName}</span>
                                    </div>
                                  )}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
