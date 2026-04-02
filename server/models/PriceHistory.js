const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  device: { type: String, required: true },
  brand: { type: String, required: true },
  issue: { type: String, required: true },
  price: { type: Number, required: true },
  source: { type: String, enum: ['user', 'shop', 'system'], default: 'user' },
  city: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
