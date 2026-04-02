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

    // Update shop trust score based on complaints
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

// Get complaints for a shop
router.get('/shop/:shopId', async (req, res) => {
  try {
    const complaints = await Complaint.find({ shop: req.params.shopId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
