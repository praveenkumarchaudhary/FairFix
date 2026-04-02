import { useState, useRef, useCallback } from 'react';
import { X, AlertTriangle, Upload, Image, FileText, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000/api';

export default function ComplaintModal({ shopId, shopName, onClose }) {
  const [form, setForm] = useState({
    userName: '', email: '', type: 'overcharge',
    description: '', amountCharged: '', fairPrice: ''
  });
  const [files, setFiles] = useState([]);       // { file, preview, id }
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    const valid = Array.from(incoming).filter(f => {
      if (!allowed.includes(f.type)) { toast.error(`${f.name}: unsupported file type`); return false; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name}: exceeds 5MB limit`); return false; }
      return true;
    });

    const remaining = 3 - files.length;
    if (valid.length > remaining) {
      toast.error(`Max 3 files. Only first ${remaining} added.`);
    }

    const toAdd = valid.slice(0, remaining).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles(prev => [...prev, ...toAdd]);
  }, [files.length]);

  const removeFile = (id) => {
    setFiles(prev => {
      const f = prev.find(f => f.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return toast.error('Please describe the issue');
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('shopId', shopId);
      fd.append('type', form.type);
      fd.append('description', form.description);
      if (form.userName) fd.append('userName', form.userName);
      if (form.email) fd.append('email', form.email);
      if (form.amountCharged) fd.append('amountCharged', form.amountCharged);
      if (form.fairPrice) fd.append('fairPrice', form.fairPrice);
      files.forEach(f => fd.append('proofImages', f.file));

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Complaint submitted successfully!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#f87171" />
            </div>
            <div>
              <h2 className="modal-title" style={{ marginBottom: 2 }}>Report Complaint</h2>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>{shopName}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name + Email */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" placeholder="Anonymous" value={form.userName}
                onChange={e => setForm({ ...form, userName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          {/* Type */}
          <div className="form-group">
            <label className="form-label">Complaint Type *</label>
            <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="overcharge">💸 Overcharging</option>
              <option value="fraud">🚨 Fraud / Scam</option>
              <option value="poor_service">😤 Poor Service</option>
              <option value="fake_parts">⚠️ Fake / Low Quality Parts</option>
              <option value="other">📋 Other</option>
            </select>
          </div>

          {/* Prices */}
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

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" placeholder="Describe what happened in detail..." required
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* ── PROOF UPLOAD ── */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Image size={13} /> Proof / Evidence
              <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                (optional · max 3 files · 5MB each)
              </span>
            </label>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => files.length < 3 && fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--primary-light)' : 'var(--border2)'}`,
                borderRadius: 12,
                padding: '24px 16px',
                textAlign: 'center',
                cursor: files.length < 3 ? 'pointer' : 'not-allowed',
                background: dragging ? 'rgba(124,58,237,0.06)' : 'var(--bg2)',
                transition: 'all 0.2s',
                opacity: files.length >= 3 ? 0.5 : 1,
              }}
            >
              <div style={{ animation: dragging ? 'bounce 0.5s infinite' : 'none', display: 'inline-block', marginBottom: 10 }}>
                <Upload size={28} color={dragging ? 'var(--primary-light)' : 'var(--text3)'} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
                {dragging ? 'Drop files here!' : 'Drag & drop or click to upload'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text3)' }}>
                JPG, PNG, GIF, WEBP, PDF · {files.length}/3 files
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              style={{ display: 'none' }}
              onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
            />

            {/* File previews */}
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {files.map(f => (
                  <div key={f.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10,
                    background: 'var(--bg2)', border: '1px solid var(--border)',
                    animation: 'fadeUp 0.25s ease both',
                  }}>
                    {/* Thumbnail or icon */}
                    {f.preview ? (
                      <img src={f.preview} alt={f.name}
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={20} color="#f87171" />
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{formatSize(f.size)}</div>
                    </div>

                    {/* Ready badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--secondary)', fontSize: 11, flexShrink: 0 }}>
                      <CheckCircle size={13} /> Ready
                    </div>

                    {/* Remove */}
                    <button type="button" onClick={() => removeFile(f.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4, borderRadius: 6, display: 'flex', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-danger btn-full" disabled={loading}>
            {loading
              ? <><span className="spinner" /> Submitting...</>
              : <><AlertTriangle size={16} /> Submit Complaint {files.length > 0 ? `with ${files.length} proof file${files.length > 1 ? 's' : ''}` : ''}</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
