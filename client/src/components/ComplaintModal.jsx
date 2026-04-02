import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function ComplaintModal({ shopId, shopName, onClose }) {
  const [form, setForm] = useState({ userName: '', email: '', type: 'overcharge', description: '', amountCharged: '', fairPrice: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return toast.error('Please describe the issue');
    setLoading(true);
    try {
      await API.post('/complaints', {
        shopId, ...form,
        amountCharged: form.amountCharged ? Number(form.amountCharged) : undefined,
        fairPrice: form.fairPrice ? Number(form.fairPrice) : undefined
      });
      toast.success('Complaint submitted. We will review it shortly.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="var(--danger)" />
            <h2 className="modal-title">Report Complaint</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          Reporting: <strong>{shopName}</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Your Name (optional)</label>
              <input className="form-input" placeholder="Anonymous" value={form.userName}
                onChange={e => setForm({ ...form, userName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email (optional)</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Complaint Type *</label>
            <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="overcharge">Overcharging</option>
              <option value="fraud">Fraud / Scam</option>
              <option value="poor_service">Poor Service</option>
              <option value="fake_parts">Fake / Low Quality Parts</option>
              <option value="other">Other</option>
            </select>
          </div>

          {form.type === 'overcharge' && (
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Amount Charged ($)</label>
                <input className="form-input" type="number" placeholder="0" value={form.amountCharged}
                  onChange={e => setForm({ ...form, amountCharged: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Fair Price ($)</label>
                <input className="form-input" type="number" placeholder="0" value={form.fairPrice}
                  onChange={e => setForm({ ...form, fairPrice: e.target.value })} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" placeholder="Describe what happened in detail..." required
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <button type="submit" className="btn btn-danger btn-full" disabled={loading}>
            {loading ? <><span className="spinner" /> Submitting...</> : <><AlertTriangle size={16} /> Submit Complaint</>}
          </button>
        </form>
      </div>
    </div>
  );
}
