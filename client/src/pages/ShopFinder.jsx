import { useState, useEffect } from "react";
import { MapPin, Search, Zap } from "lucide-react";
import API from "../utils/api";
import ShopCard from "../components/ShopCard";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const PUNJAB_DISTRICTS = [
  { name: "Attock",           lat: 33.7667, lng: 72.3667 },
  { name: "Bahawalnagar",     lat: 29.9956, lng: 73.2536 },
  { name: "Bahawalpur",       lat: 29.3956, lng: 71.6836 },
  { name: "Bhakkar",          lat: 31.6276, lng: 71.0648 },
  { name: "Chakwal",          lat: 32.9320, lng: 72.8527 },
  { name: "Chiniot",          lat: 31.7200, lng: 72.9800 },
  { name: "Dera Ghazi Khan",  lat: 30.0500, lng: 70.6333 },
  { name: "Faisalabad",       lat: 31.4504, lng: 73.1350 },
  { name: "Gujranwala",       lat: 32.1877, lng: 74.1945 },
  { name: "Gujrat",           lat: 32.5736, lng: 74.0790 },
  { name: "Hafizabad",        lat: 32.0714, lng: 73.6881 },
  { name: "Jhang",            lat: 31.2681, lng: 72.3181 },
  { name: "Jhelum",           lat: 32.9425, lng: 73.7257 },
  { name: "Kasur",            lat: 31.1167, lng: 74.4500 },
  { name: "Khanewal",         lat: 30.3014, lng: 71.9322 },
  { name: "Khushab",          lat: 32.2989, lng: 72.3527 },
  { name: "Lahore",           lat: 31.5204, lng: 74.3587 },
  { name: "Layyah",           lat: 30.9600, lng: 70.9400 },
  { name: "Lodhran",          lat: 29.5333, lng: 71.6333 },
  { name: "Mandi Bahauddin",  lat: 32.5864, lng: 73.4917 },
  { name: "Mianwali",         lat: 32.5838, lng: 71.5432 },
  { name: "Multan",           lat: 30.1575, lng: 71.5249 },
  { name: "Muzaffargarh",     lat: 30.0736, lng: 71.1924 },
  { name: "Nankana Sahib",    lat: 31.4500, lng: 73.7100 },
  { name: "Narowal",          lat: 32.1000, lng: 74.8700 },
  { name: "Naushehra Virkan", lat: 32.0333, lng: 73.9667 },
  { name: "Okara",            lat: 30.8138, lng: 73.4534 },
  { name: "Pakpattan",        lat: 30.3436, lng: 73.3872 },
  { name: "Rahim Yar Khan",   lat: 28.4202, lng: 70.2952 },
  { name: "Rawalpindi",       lat: 33.5651, lng: 73.0169 },
  { name: "Sahiwal",          lat: 30.6706, lng: 73.1064 },
  { name: "Sargodha",         lat: 32.0836, lng: 72.6711 },
  { name: "Sheikhupura",      lat: 31.7167, lng: 73.9850 },
  { name: "Sialkot",          lat: 32.4945, lng: 74.5229 },
  { name: "Toba Tek Singh",   lat: 30.9667, lng: 72.4833 },
  { name: "Vehari",           lat: 30.0454, lng: 72.3519 },
];

export default function ShopFinder() {
  const [shops, setShops]                   = useState([]);
  const [loading, setLoading]               = useState(false);
  const [locLoading, setLocLoading]         = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [sort, setSort]                     = useState("rating");
  const [seeding, setSeeding]               = useState(false);
  const [searchParams]                      = useSearchParams();
  const isEmergency = searchParams.get("emergency") === "true";

  useEffect(() => {
    if (isEmergency) handleDetectLocation();
    else fetchShops();
  }, []);

  const fetchShops = async (lat, lng, city) => {
    setLoading(true);
    try {
      let url = "/shops?sort=" + sort + "&radius=500";
      if (lat && lng) url += "&lat=" + lat + "&lng=" + lng;
      if (city)       url += "&city=" + encodeURIComponent(city);
      const { data } = await API.get(url);
      setShops(data);
      if (data.length === 0) toast("No shops found. Click Load Punjab Shops.", { icon: "ℹ️" });
    } catch {
      toast.error("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = (e) => {
    const name = e.target.value;
    setSelectedDistrict(name);
    if (!name) { fetchShops(); return; }
    const d = PUNJAB_DISTRICTS.find(d => d.name === name);
    if (d) fetchShops(d.lat, d.lng, name);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocLoading(false);
        fetchShops(pos.coords.latitude, pos.coords.longitude);
        toast.success("Location detected!");
      },
      () => { setLocLoading(false); toast.error("Could not detect location."); }
    );
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await API.post("/shops/seed");
      await API.post("/pricing/seed");
      toast.success("Punjab shops loaded!");
      fetchShops();
    } catch { toast.error("Failed to seed data"); }
    finally { setSeeding(false); }
  };

  const sortedShops = [...shops].sort((a, b) => {
    if (sort === "rating")   return b.rating - a.rating;
    if (sort === "trust")    return b.trustScore - a.trustScore;
    if (sort === "distance" && a.distance != null) return a.distance - b.distance;
    return 0;
  });

  const recommended = sortedShops.filter(s => s.isFairPriceBadge && !s.isFlagged).slice(0, 3);

  return (
    <div style={{ padding: "32px 20px" }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 6 }}>
              {isEmergency
                ? <><Zap size={24} color="var(--warning)" style={{ verticalAlign: "middle", marginRight: 8 }} />Emergency Shop Finder</>
                : "🏪 Find Repair Shops"}
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>
              Discover trusted repair shops across all districts of Punjab, Pakistan
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? <><span className="spinner" /> Loading...</> : "⚡ Load Punjab Shops"}
          </button>
        </div>

        {/* ── SEARCH CARD ── */}
        <div className="card card-glow fade-up" style={{ marginBottom: 28, padding: "22px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>

            {/* District dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                🗺️ Select District — Punjab, Pakistan
              </label>
              <select
                className="form-select"
                value={selectedDistrict}
                onChange={handleDistrictChange}
              >
                <option value="">All Districts (36)</option>
                {PUNJAB_DISTRICTS.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sort By</label>
              <select className="form-select" value={sort} onChange={e => { setSort(e.target.value); }}>
                <option value="rating">⭐ Rating</option>
                <option value="trust">🛡️ Trust Score</option>
                <option value="distance">📍 Distance</option>
                <option value="price">💰 Price</option>
              </select>
            </div>
          </div>

          <button className="btn btn-outline btn-sm" onClick={handleDetectLocation} disabled={locLoading}>
            {locLoading ? <><span className="spinner" /> Detecting...</> : <><MapPin size={14} /> Use My Location</>}
          </button>
        </div>

        {/* Smart Recommendations */}
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

        {/* All Shops */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>
            All Shops
            {shops.length > 0 && (
              <span style={{ color: "var(--text3)", fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
                ({shops.length} found{selectedDistrict ? " in " + selectedDistrict : " across Punjab"})
              </span>
            )}
          </h2>
        </div>

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
        ) : sortedShops.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {sortedShops.map(shop => <ShopCard key={shop._id} shop={shop} />)}
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "48px 20px", border: "1px dashed var(--border2)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <h3 style={{ marginBottom: 8, fontWeight: 700 }}>No shops found</h3>
            <p style={{ color: "var(--text2)", marginBottom: 20, fontSize: 14 }}>
              {selectedDistrict
                ? "No shops in " + selectedDistrict + " yet. Load demo data first."
                : "Load Punjab shops to get started."}
            </p>
            <button className="btn btn-primary" onClick={handleSeed} disabled={seeding}>
              {seeding ? "Loading..." : "⚡ Load Punjab Shops"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
