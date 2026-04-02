import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Shield, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ShopCard({ shop }) {
  const navigate = useNavigate();

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'star' : 'star star-empty'}>★</span>
    ));
  };

  return (
    <div className="card fade-in" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      onClick={() => navigate(`/shop/${shop._id}`)}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{shop.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text2)' }}>
            <MapPin size={13} />
            <span>{shop.city}</span>
            {shop.distance !== null && shop.distance !== undefined && (
              <span style={{ marginLeft: 4, color: 'var(--primary)', fontWeight: 600 }}>• {shop.distance} km</span>
            )}
          </div>
        </div>
        {shop.isFairPriceBadge && (
          <div className="badge badge-green" style={{ fontSize: 10 }}>
            <Shield size={11} /> Fair Price
          </div>
        )}
        {shop.isFlagged && (
          <div className="badge badge-red" style={{ fontSize: 10 }}>
            <AlertTriangle size={11} /> Flagged
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div className="stars">{renderStars(shop.rating)}</div>
          <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 4 }}>{shop.rating.toFixed(1)}</span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>({shop.reviewCount})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendingUp size={13} color={shop.trustScore >= 80 ? 'var(--secondary)' : shop.trustScore >= 60 ? 'var(--warning)' : 'var(--danger)'} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Trust: {shop.trustScore}%</span>
        </div>
      </div>

      {shop.specialties && shop.specialties.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {shop.specialties.map(s => (
            <span key={s} className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{s}</span>
          ))}
        </div>
      )}

      <button className="btn btn-primary btn-sm btn-full" onClick={(e) => { e.stopPropagation(); navigate(`/shop/${shop._id}`); }}>
        View Details
      </button>
    </div>
  );
}
