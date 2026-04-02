const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Shop = require('../models/Shop');

// Submit complaint
router.post('/', async (req, res) => {
  try {
    const { shopId, userName, email, type, description, amountCharged, fairPrice } = req.body;
    if (!shopId || !type || !description) {
      return res.status(400).json({ message: 'Shop, type, and description are required' });
    }

    const complaint = new Complaint({ shop: shopId, userName, email, type, description, amountCharged, fairPrice });
    await complaint.save();

    // Update shop trust score
    const complaints = await Complaint.find({ shop: shopId });
    const trustPenalty = Math.min(complaints.length * 5, 40);
    const shop = await Shop.findById(shopId);
    if (shop) {
      const newTrust = Math.max(10, 100 - trustPenalty);
      const shouldFlag = complaints.length >= 3 || (amountCharged && fairPrice && amountCharged > fairPrice * 1.5);
      await Shop.findByIdAndUpdate(shopId, {
        trustScore: newTrust,
        isFlagged: shouldFlag,
        isFairPriceBadge: newTrust < 70 ? false : shop.isFairPriceBadge
      });
    }

    res.json({ message: 'Complaint submitted. We will review it shortly.', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all complaints (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('shop', 'name city')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Stats
    const stats = await Complaint.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const statusStats = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ complaints, total, stats, statusStats, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get complaints for a shop
router.get('/shop/:shopId', async (req, res) => {
  try {
    const complaints = await Complaint.find({ shop: req.params.shopId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single complaint
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('shop', 'name city address phone');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update complaint status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ message: 'Status updated', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
