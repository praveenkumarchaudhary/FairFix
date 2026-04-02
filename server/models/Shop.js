const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: String,
  email: String,
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  trustScore: { type: Number, default: 50 },
  isFairPriceBadge: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
  specialties: [String],
  priceRange: { type: String, enum: ['budget', 'mid', 'premium'], default: 'mid' },
  services: [{
    device: String,
    issue: String,
    price: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shop', shopSchema);
