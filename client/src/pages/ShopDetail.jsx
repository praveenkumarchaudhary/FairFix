import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Star, Shield, AlertTriangle, TrendingUp, ChevronLeft, MessageSquare, Flag } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import ReviewModal from '../components/ReviewModal';
import ComplaintModal from '../components/ComplaintModal';

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);

  const fetchData = async () => {
    try {
      const [shopRes, reviewRes] = await Promise.all([
        API.get(`/shops/${id}`),
        API.get(`/reviews/shop/${id}`)
      ]);
      setShop(shopRes.data);
      setReviews(reviewRes.data);
    } catch (err) {
      toast.error('Shop not found');
      navigate('/shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const renderStars = (rating) => [...Array(5)].map((_, i) => (
    <span key={i} style={{ color: i < Math.floor(rating) ? 'var(--warning)' : 'var(--border)', fontSize: 16 }}>★</span>
  ));

  const getTrustColor = (score) => score >= 80 ? 'var(--secondary)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
  const getTrustLabel = (score) => score >= 80 ? 'Highly Trusted' : score >= 60 ? 'Moderate Trust' : 'Low Trust';

  if (loading) return (
    <div style={{ padding: '32px 20px' }}>
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 16, borderRadius: 12 }} />)}
      </div>
    </div>
  );

  if (!shop) return null;

  return (
    <div style={{ padding: '32px 20px' }}>
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate('/shops')}>
          <ChevronLeft size={16} /> Back to Shops
        </button>

        {/* Shop Header */}
        <div className="card fade-in" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800 }}>{shop.name}</h1>
                {shop.isFairPriceBadge && (
                  <div className="badge badge-green"><Shield size={12} /> Fair Price Badge</div>
                )}
                {shop.isFlagged && (
                  <div className="badge badge-red"><AlertTriangle size={12} /> Flagged</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 14 }}>
                <MapPin size={14} /> {shop.address}, {shop.city}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ display: 'flex' }}>{renderStars(shop.rating)}</div>
                <span style={{ fontWeight: 700, fontSize: 18 }}>{shop.rating.toFixed(1)}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{shop.reviewCount} reviews</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            {shop.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text2)' }}>
                <Phone size={14} /> {shop.phone}
              </div>
            )}
            {shop.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text2)' }}>
                <Mail size={14} /> {shop.email}
              </div>
            )}
          </div>

          {/* Trust Score */}
          <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <TrendingUp size={16} color={getTrustColor(shop.trustScore)} />
                Trust Score
              </div>
              <div style={{ fontWeight: 800, fontSize: 20, color: getTrustColor(shop.trustScore) }}>
                {shop.trustScore}%
              </div>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${shop.trustScore}%`, background: getTrustColor(shop.trustScore), borderRadius: 4, transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>{getTrustLabel(shop.trustScore)}</div>
          </div>

          {/* Specialties */}
          {shop.specialties?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {shop.specialties.map(s => (
                <span key={s} className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{s}</span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setShowReview(true)}>
              <MessageSquare size={16} /> Submit Review
            </button>
            <button className="btn btn-danger" onClick={() => setShowComplaint(true)}>
              <Flag size={16} /> Report Complaint
            </button>
          </div>
        </div>

        {/* Services */}
        {shop.services?.length > 0 && (
          <div className="card fade-in" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Services & Pricing</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {shop.services.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8 }}>
                  <div>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{s.device}</span>
                    <span style={{ color: 'var(--text2)', marginLeft: 8, textTransform: 'capitalize' }}>— {s.issue}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 16 }}>${s.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Customer Reviews ({reviews.length})</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setShowReview(true)}>
              <MessageSquare size={14} /> Write Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text2)' }}>
              <Star size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map(review => (
                <div key={review._id} style={{ padding: 16, background: 'var(--bg2)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{review.userName}</span>
                      {review.device && <span className="badge badge-gray" style={{ marginLeft: 8, fontSize: 10 }}>{review.device}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ display: 'flex' }}>{renderStars(review.rating)}</div>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>{review.comment}</p>
                  {review.pricePaid && (
                    <div style={{ fontSize: 12, color: 'var(--secondary)', marginTop: 6 }}>Paid: ${review.pricePaid}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showReview && (
        <ReviewModal shopId={id} shopName={shop.name} onClose={() => setShowReview(false)} onSuccess={fetchData} />
      )}
      {showComplaint && (
        <ComplaintModal shopId={id} shopName={shop.name} onClose={() => setShowComplaint(false)} />
      )}
    </div>
  );
}
