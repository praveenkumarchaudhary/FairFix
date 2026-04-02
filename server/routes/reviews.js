const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Shop = require('../models/Shop');

// Get reviews for a shop
router.get('/shop/:shopId', async (req, res) => {
  try {
    const reviews = await Review.find({ shop: req.params.shopId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a review
router.post('/', async (req, res) => {
  try {
    const { shopId, userName, rating, comment, device, issue, pricePaid } = req.body;
    if (!shopId || !rating || !comment) {
      return res.status(400).json({ message: 'Shop, rating, and comment are required' });
    }

    const review = new Review({ shop: shopId, userName: userName || 'Anonymous', rating, comment, device, issue, pricePaid });
    await review.save();

    // Update shop rating
    const reviews = await Review.find({ shop: shopId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Shop.findByIdAndUpdate(shopId, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: reviews.length
    });

    res.json({ message: 'Review submitted successfully', review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
