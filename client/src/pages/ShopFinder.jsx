import { useState, useEffect } from "react";
import { MapPin, Search, Zap, AlertCircle } from "lucide-react";
import API from "../utils/api";
import ShopCard from "../components/ShopCard";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const PUNJAB_INDIA_DISTRICTS = [
  "Amritsar",
  "Barnala",
  "Bathinda",
  "Faridkot",
  "Fatehgarh Sahib",
  "Firozpur",
  "Gurdaspur",
  "Hoshiarpur",
  "Jalandhar",
  "Kapurthala",
  "Ludhiana",
  "Malerkotla",
  "Mansa",
  "Moga",
  "Mohali (SAS Nagar)",
  "Nawanshahr (Shaheed Bhagat Singh Nagar)",
  "Pathankot",
  "Patiala",
  "Rupnagar (Ropar)",
  "Sangrur",
  "SBS Nagar",
  "Tarn Taran",
];

export default function ShopFinder() {
  const [shops, setShops]                       = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districtError, setDistrictError]       = useState(false);
  const [sort, setSort]                         = useState("rating");
  const [seeding, setSeeding]                   = useState(false);
  const [searchParams]                          = useSearchParams();
  const isEmergency = searchParams.get("emergency") === "true";

  useEffect(() => {
    if (isEmergency) fetchShops("Amritsar");
  }, []);

  const fetchShops = async (district) => {
    setLoading(true);
    setDistrictError(false);
    try {
      const { data } = await API.get("/shops?district=" + encodeURIComponent(district) + "&sort=" + sort);
      setShops(data);
      if (data.length === 0) toast("No shops in " + district + ". Load demo data first.", { icon: "ℹ️" });
    } catch {
      toast.error("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!selectedDistrict) {
      setDistrictError(true);
      toast.error("Please select a district");
      return;
    }
    fetchShops(selectedDistrict);
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setDistrictError(false);
    if (e.target.value) fetchShops(e.target.value);
    else setShops([]);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await API.post("/shops/seed");
      await API.post("/pricing/seed");
      toast.success("Punjab (India) shops loaded!");
      if (selectedDistrict) fetchShops(selectedDistrict);
      else fetchShops("Amritsar");
    } catch { toast.error("Failed to seed data"); }
    finally { setSeeding(false); }
  };

  const sortedShops = [...shops].sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "trust")  return b.trustScore - a.trustScore;
    if (sort === "price")  return (a.priceRange === "budget" ? -1 : 1);
    return 0;
  });

  const recommended = sortedShops.filter(s => s.isFairPriceBadge && !s.isFlagged).slice(0, 3);

  return (
    <div style={{ padding: "32px 20px" }}>
      <div className="container">

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <div className="badge badge-blue" style={{ marginBottom: 10, fontSize: 11 }}>
              📍 Punjab, India
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 6 }}>
              {isEmergency
                ? <><Zap size={22} color="var(--warning)" style={{ verticalAlign: "middle", marginRight: 8 }} />Emergency Shop Finder</>
                : "🏪 Find Repair Shops"}
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>
              Search trusted repair shops across all 22 districts of Punjab, India
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? <><span className="spinner" /> Loading...</> : "⚡ Load Demo Shops"}
          </button>
        </div>

        {/* ── SEARCH CARD ── */}
        <div className="card card-glow fade-up" style={{ marginBottom: 28, padding: "24px" }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 18 }}>

              {/* District dropdown */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={12} /> Select District — Punjab, India *
                </label>
                <select
                  className="form-select"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  style={{
                    borderColor: districtError ? "var(--danger)" : undefined,
                    boxShadow: districtError ? "0 0 0 3px rgba(239,68,68,0.15)" : undefined,
                  }}
                >
                  <option value="">— Select a District —</option>
                  {PUNJAB_INDIA_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {districtError && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 12, color: "var(--danger)", animation: "fadeUp 0.2s ease" }}>
                    <AlertCircle size={13} /> Please select a district
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sort By</label>
                <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="rating">⭐ Rating</option>
                  <option value="trust">🛡️ Trust Score</option>
                  <option value="price">💰 Price</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Searching...</> : <><Search size={15} /> Search Shops</>}
            </button>
          </form>
        </div>

        {/* ── SMART RECOMMENDATIONS ── */}
        {recommended.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              ⭐ Smart Recommendations
              <span className="badge badge-green" style={{ fontSize: 10 }}>Best Picks</span>
            </h2>
            <div className="grid-3">
              {recommended.map(shop => <ShopCard key={shop._id} shop={shop} />)}
            </div>
            <div className="divider" />
          </div>
        )}

        {/* ── ALL SHOPS ── */}
        {selectedDistrict && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>
              Shops in {selectedDistrict}
              {shops.length > 0 && (
                <span style={{ color: "var(--text3)", fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
                  ({shops.length} found)
                </span>
              )}
            </h2>
          </div>
        )}

        {!selectedDistrict && !loading && shops.length === 0 && (
          <div className="card fade-up" style={{ textAlign: "center", padding: "52px 20px", border: "1px dashed var(--border2)" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🗺️</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Select a District to Begin</h3>
            <p style={{ color: "var(--text2)", fontSize: 14, maxWidth: 340, margin: "0 auto 20px" }}>
              Choose a district from Punjab, India above to find repair shops in that area.
            </p>
            <button className="btn btn-primary" onClick={handleSeed} disabled={seeding}>
              {seeding ? "Loading..." : "⚡ Load Demo Shops First"}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 20, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 36 }} />
              </div>
            ))}
          </div>
        ) : selectedDistrict && sortedShops.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {sortedShops.map(shop => <ShopCard key={shop._id} shop={shop} />)}
          </div>
        ) : selectedDistrict && !loading ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 20px", border: "1px dashed var(--border2)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <h3 style={{ marginBottom: 8, fontWeight: 700 }}>No shops in {selectedDistrict}</h3>
            <p style={{ color: "var(--text2)", marginBottom: 20, fontSize: 14 }}>
              Load demo data to populate shops across all Punjab districts.
            </p>
            <button className="btn btn-primary" onClick={handleSeed} disabled={seeding}>
              {seeding ? "Loading..." : "⚡ Load Demo Shops"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
