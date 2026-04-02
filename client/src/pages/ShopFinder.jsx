import { useState, useEffect } from 'react';
import { MapPin, Search, Filter, Zap, SortAsc, Loader } from 'lucide-react';
import API from '../utils/api';
import ShopCard from '../components/ShopCard';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

export default function ShopFinder() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('distance');
  const [radius, setRadius] = useState(20);
  const [seeding, setSeeding] = useState(false);
  const [searchParams] = useSearchParams();
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
      if (cityVal) url += `&city=${cityVal}`;
      const { data } = await API.get(url);
      setShops(data);
      if (data.length === 0) toast('No shops found. Try seeding demo data.', { icon: 'ℹ️' });
    } catch (err) {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
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
        toast.error('Could not detect location. Enter city manually.');
      }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchShops(location?.lat, location?.lng, city);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await API.post('/shops/seed');
      await API.post('/pricing/seed');
      toast.success('Demo data loaded!');
      fetchShops();
    } catch {
      toast.error('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const sortedShops = [...shops].sort((a, b) => {
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'trust') return b.trustScore - a.trustScore;
    if (sort === 'distance' && a.distance !== null) return a.distance - b.distance;
    return 0;
  });

  const recommended = sortedShops.filter(s => s.isFairPriceBadge && !s.isFlagged).slice(0, 3);

  return (
    <div style={{ padding: '32px 20px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              {isEmergency ? <><Zap size={24} color="var(--warning)" style={{ verticalAlign: 'middle' }} /> Emergency Shop Finder</> : 'Find Repair Shops'}
            </h1>
            <p style={{ color: 'var(--text2)' }}>
              {isEmergency ? 'Finding the nearest available repair shop...' : 'Discover trusted repair shops near you'}
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? <><span className="spinner" /> Loading...</> : '⚡ Load Demo Data'}
          </button>
        </div>

        {/* Search Controls */}
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                <label className="form-label">City / Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Enter city name..."
                    value={city} onChange={e => setCity(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sort By</label>
                <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="distance">Distance</option>
                  <option value="rating">Rating</option>
                  <option value="trust">Trust Score</option>
                  <option value="price">Price</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Radius (km)</label>
                <select className="form-select" value={radius} onChange={e => setRadius(e.target.value)}>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Search size={16} /> Search
              </button>
              <button type="button" className="btn btn-outline" onClick={handleDetectLocation} disabled={locLoading}>
                {locLoading ? <><span className="spinner" /> Detecting...</> : <><MapPin size={16} /> Use My Location</>}
              </button>
            </div>
          </form>
        </div>

        {/* Smart Recommendations */}
        {recommended.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⭐ Smart Recommendations
              <span className="badge badge-green" style={{ fontSize: 11 }}>Best Picks</span>
            </h2>
            <div className="grid-3">
              {recommended.map(shop => <ShopCard key={shop._id} shop={shop} />)}
            </div>
            <div className="divider" />
          </div>
        )}

        {/* All Shops */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            All Shops {shops.length > 0 && <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 14 }}>({shops.length} found)</span>}
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
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <MapPin size={40} color="var(--text3)" style={{ marginBottom: 12 }} />
            <h3 style={{ marginBottom: 8 }}>No shops found</h3>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Try loading demo data or searching a different city.</p>
            <button className="btn btn-primary" onClick={handleSeed} disabled={seeding}>
              {seeding ? 'Loading...' : '⚡ Load Demo Shops'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
