const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'Anonymous' },
  email: String,
  type: {
    type: String,
    enum: ['overcharge', 'fraud', 'poor_service', 'fake_parts', 'other'],
    required: true
  },
  description: { type: String, required: true },
  amountCharged: Number,
  fairPrice: Number,
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);
