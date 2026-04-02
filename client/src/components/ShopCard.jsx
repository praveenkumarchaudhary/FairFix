import { useNavigate } from 'react-router-dom';
import { MapPin, Shield, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';

export default function ShopCard({ shop }) {
  const navigate = useNavigate();

  const renderStars = (rating) => [...Array(5)].map((_, i) => (
    <span key={i} style={{ color: i < Math.floor(rating) ? '#fbbf24' : 'var(--border2)', fontSize: 13 }}>★</span>
  ));

  const trustColor = shop.trustScore >= 80 ? '#34d399' : shop.trustScore >= 60 ? '#fbbf24' : '#f87171';
  const trustBg = shop.trustScore >= 80 ? 'rgba(16,185,129,0.1)' : shop.trustScore >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  return (
    <div
      className="card card-glow fade-up"
      style={{ cursor: 'pointer', transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      onClick={() => navigate(`/shop/${shop._id}`)}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text2)' }}>
            <MapPin size={12} />
            <span>{shop.city}</span>
            {shop.distance != null && (
              <span style={{ marginLeft: 4, color: 'var(--accent)', fontWeight: 700 }}>· {shop.distance} km</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0, marginLeft: 8 }}>
          {shop.isFairPriceBadge && (
            <div className="badge badge-green" style={{ fontSize: 10 }}>
              <Shield size={10} /> Fair Price
            </div>
          )}
          {shop.isFlagged && (
            <div className="badge badge-red" style={{ fontSize: 10 }}>
              <AlertTriangle size={10} /> Flagged
            </div>
          )}
        </div>
      </div>

      {/* Rating row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ display: 'flex' }}>{renderStars(shop.rating)}</div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{shop.rating.toFixed(1)}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>({shop.reviewCount})</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: trustBg, borderRadius: 8, padding: '3px 8px',
        }}>
          <TrendingUp size={12} color={trustColor} />
          <span style={{ fontSize: 12, fontWeight: 700, color: trustColor }}>{shop.trustScore}%</span>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ background: 'var(--border)', borderRadius: 4, height: 4, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${shop.trustScore}%`,
          background: `linear-gradient(90deg, ${trustColor}, ${trustColor}aa)`,
          borderRadius: 4,
          transition: 'width 1s ease',
        }} />
      </div>

      {/* Specialties */}
      {shop.specialties?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
          {shop.specialties.map(s => (
            <span key={s} className="badge badge-gray" style={{ textTransform: 'capitalize', fontSize: 10 }}>{s}</span>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        className="btn btn-primary btn-sm btn-full"
        onClick={e => { e.stopPropagation(); navigate(`/shop/${shop._id}`); }}
        style={{ justifyContent: 'center', gap: 6 }}
      >
        View Details <ChevronRight size={14} />
      </button>
    </div>
  );
}
