import { useState } from 'react';
import { X, Star } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function ReviewModal({ shopId, shopName, onClose, onSuccess }) {
  const [form, setForm] = useState({ userName: '', rating: 5, comment: '', device: '', issue: '', pricePaid: '' });
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return toast.error('Please write a comment');
    setLoading(true);
    try {
      await API.post('/reviews', { shopId, ...form, pricePaid: form.pricePaid ? Number(form.pricePaid) : undefined });
      toast.success('Review submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Review {shopName}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Name (optional)</label>
            <input className="form-input" placeholder="Anonymous" value={form.userName}
              onChange={e => setForm({ ...form, userName: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Rating</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28,
                    color: star <= (hover || form.rating) ? 'var(--warning)' : 'var(--border)' }}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setForm({ ...form, rating: star })}>★</button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Device (optional)</label>
              <select className="form-select" value={form.device} onChange={e => setForm({ ...form, device: e.target.value })}>
                <option value="">Select device</option>
                <option value="smartphone">Smartphone</option>
                <option value="laptop">Laptop</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Issue (optional)</label>
              <input className="form-input" placeholder="e.g. Screen repair" value={form.issue}
                onChange={e => setForm({ ...form, issue: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Price Paid ($) (optional)</label>
            <input className="form-input" type="number" placeholder="0" value={form.pricePaid}
              onChange={e => setForm({ ...form, pricePaid: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Your Review *</label>
            <textarea className="form-textarea" placeholder="Share your experience..." required
              value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><span className="spinner" /> Submitting...</> : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
