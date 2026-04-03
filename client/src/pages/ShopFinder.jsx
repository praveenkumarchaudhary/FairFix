import { useState, useEffect } from 'react';
import { MapPin, Search, Zap, ChevronDown } from 'lucide-react';
import API from '../utils/api';
import ShopCard from '../components/ShopCard';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

// All 23 districts of Punjab, Pakistan with coordinates
const PUNJAB_DISTRICTS = [
  { name: 'Lahore',        lat: 31.5204, lng: 74.3587 },
  { name: 'Faisalabad',    lat: 31.4504, lng: 73.1350 },
  { name: 'Rawalpindi',    lat: 33.5651, lng: 73.0169 },
  { name: 'Gujranwala',    lat: 32.1877, lng: 74.1945 },
  { name: 'Multan',        lat: 30.1575, lng: 71.5249 },
  { name: 'Bahawalpur',    lat: 29.3956, lng: 71.6836 },
  { name: 'Sargodha',      lat: 32.0836, lng: 72.6711 },
  { name: 'Sialkot',       lat: 32.4945, lng: 74.5229 },
  { name: 'Sheikhupura',   lat: 31.7167, lng: 73.9850 },
  { name: 'Jhang',         lat: 31.2681, lng: 72.3181 },
  { name: 'Rahim Yar Khan',lat: 28.4202, lng: 70.2952 },
  { name: 'Gujrat',        lat: 32.5736, lng: 74.0790 },
  { name: 'Kasur',         lat: 31.1167, lng: 74.4500 },
  { name: 'Okara',         lat: 30.8138, lng: 73.4534 },
  { name: 'Sahiwal',       lat: 30.6706, lng: 73.1064 },
  { name: 'Mianwali',      lat: 32.5838, lng: 71.5432 },
  { name: 'Chiniot',       lat: 31.7200, lng: 72.9800 },
  { name: 'Hafizabad',     lat: 32.0714, lng: 73.6881 },
  { name: 'Nankana Sahib', lat: 31.4500, lng: 73.7100 },
  { name: 'Narowal',       lat: 32.1000, lng: 74.8700 },
  { name: 'Pakpattan',     lat: 30.3436, lng: 73.3872 },
  { name: 'Toba Tek Singh',lat: 30.9667, lng: 72.4833 },
  { name: 'Vehari',        lat: 30.0454, lng: 72.3519 },
];

export default function ShopFinder() {
  const [shops, setShops]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [location, setLocation]     = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [cityInput, setCityInput]   = useState('');
  const [sort, setSort]             = useState('rating');
  const [radius, setRadius]         = useState(50);
  const [seeding, setSeeding]       = useState(false);
  const [searchParams]              = useSearchParams();
  const isEmergency = searchParams.get('emergency') === 'true';

  useEffect(() => {
    if (isEmergency) handleDetectLocation();
    else fetchShops();
  }, []);

  const fetchShops = async (lat, lng, cityVal) => {
    setLoading(true);
    try {
      let url = `/shops?sort=${sort}&radius=${radius}`;
      if (lat && lng) url += `&lat=${lat}&lng=${lng}`;
      if (cityVal) url += `&city=${encodeURIComponent(cityVal)}`;
      const { data } = await API.get(url);
      setShops(data);
      if (data.length === 0) toast('No shops found. Click "Load Punjab Shops" to seed data.', { icon: 'ℹ️' });
    } catch {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = (e) => {
    const name = e.target.value;
    setSelectedDistrict(name);
    setCityInput(name);
    if (name) {
      const d = PUNJAB_DISTRICTS.find(d => d.name === name);
      if (d) {
        setLocation({ lat: d.lat, lng: d.lng });
        fetchShops(d.lat, d.lng, name);
      }
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLocLoading(false);
        fetchShops(latitude, longitude);
        toast.success('Location detected!');
      },
      () => {
        setLocLoading(false);
        toast.error('Could not detect location. Select a district instead.');
      }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const city = cityInput.trim() || selectedDistrict;
    const d = PUNJAB_DISTRICTS.find(d => d.name.toLowerCase() === city.toLowerCase());
    fetchShops(d?.lat || location?.lat, d?.lng || location?.lng, city);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await API.post('/shops/seed');
      await API.post('/pricing/seed');
      toast.success('Punjab shops loaded successfully!');
      fetchShops();
    } catch {
      toast.error('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const sortedShops = [...shops].sort((a, b) => {
    if (sort === 'rating')   return b.rating - a.rating;
    if (sort === 'trust')    return b.trustScore - a.trustScore;
    if (sort === 'distance' && a.distance != null) return a.distance - b.distance;
    if (sort === 'price')    return (a.priceRange === 'budget' ? -1 : 1);
    return 0;
  });

  const recommended = sortedShops.filter(s => s.isFairPriceBadge && !s.isFlagged).slice(0, 3);

  return (
    <div style={{ padding: '32px 20px' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6 }}>
              {isEmergency
                ? <><Zap size={24} color="var(--warning)" style={{ verticalAlign: 'middle', marginRight: 8 }} />Emergency Shop Finder</>
                : '🏪 Find Repair Shops'}
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>
              {isEmergency ? 'Finding the nearest available repair shop...' : 'Discover trusted repair shops across Punjab, Pakistan'}
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? <><span className="spinner" /> Loading...</> : '⚡ Load Punjab Shops'}
          </button>
        </div>

        {/* ── SEARCH CARD ── */}
        <div className="card card-glow fade-up" style={{ marginBottom: 28, padding: '22px 24px' }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>

              {/* Punjab District Dropdown */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>🗺️</span> Punjab District
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="form-select"
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    style={{ paddingRight: 32 }}
                  >
                    <option value="">All Districts</option>
                    {PUNJAB_DISTRICTS.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Manual city input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Or Type City
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. Lahore, Multan..."
                  value={cityInput}
                  onChange={e => { setCityInput(e.target.value); setSelectedDistrict(''); }}
                />
              </div>

              {/* Sort */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sort By</label>
                <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="rating">⭐ Rating</option>
                  <option value="trust">🛡️ Trust Score</option>
                  <option value="distance">📍 Distance</option>
                  <option value="price">💰 Price</option>
                </select>
              </div>

              {/* Radius */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Radius</label>
                <select className="form-select" value={radius} onChange={e => setRadius(e.target.value)}>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                  <option value={500}>All Punjab</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Search size={15} /> Search Shops
              </button>
              <button type="button" className="btn btn-outline" onClick={handleDetectLocation} disabled={locLoading}>
                {locLoading ? <><span className="spinner" /> Detecting...</> : <><MapPin size={15} /> Use My Location</>}
              </button>
            </div>
          </form>

          {/* District quick-select pills */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Quick Select — Major Cities
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha'].map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSelectedDistrict(city);
                    setCityInput(city);
                    const d = PUNJAB_DISTRICTS.find(d => d.name === city);
                    if (d) { setLocation({ lat: d.lat, lng: d.lng }); fetchShops(d.lat, d.lng, city); }
                  }}
                  style={{
                    padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    background: selectedDistrict === city ? 'rgba(124,58,237,0.15)' : 'var(--bg2)',
                    border: selectedDistrict === city ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--border)',
                    color: selectedDistrict === city ? 'var(--primary-light)' : 'var(--text2)',
                  }}
                  onMouseEnter={e => { if (selectedDistrict !== city) { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)'; } }}
                  onMouseLeave={e => { if (selectedDistrict !== city) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; } }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        {recommended.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>
            All Shops
            {shops.length > 0 && (
              <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
                ({shops.length} found{selectedDistrict ? ` in ${selectedDistrict}` : ''})
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 20, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 36 }} />
              </div>
            ))}
          </div>
        ) : sortedShops.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {sortedShops.map(shop => <ShopCard key={shop._id} shop={shop} />)}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed var(--border2)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <h3 style={{ marginBottom: 8, fontWeight: 700 }}>No shops found</h3>
            <p style={{ color: 'var(--text2)', marginBottom: 20, fontSize: 14 }}>
              {selectedDistrict
                ? `No shops in ${selectedDistrict} yet. Load demo data to get started.`
                : 'Select a Punjab district or load demo data.'}
            </p>
            <button className="btn btn-primary" onClick={handleSeed} disabled={seeding}>
              {seeding ? 'Loading...' : '⚡ Load Punjab Shops'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
