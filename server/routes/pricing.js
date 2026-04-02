const express = require('express');
const router = express.Router();
const PriceHistory = require('../models/PriceHistory');

// Get price history for a device/issue combo
router.get('/history', async (req, res) => {
  try {
    const { device, brand, issue } = req.query;
    const query = {};
    if (device) query.device = device.toLowerCase();
    if (brand) query.brand = brand.toLowerCase();
    if (issue) query.issue = issue.toLowerCase();

    const history = await PriceHistory.find(query).sort({ createdAt: 1 }).limit(30);

    // Group by month for chart
    const grouped = {};
    history.forEach(h => {
      const month = h.createdAt.toISOString().slice(0, 7);
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(h.price);
    });

    const chartData = Object.entries(grouped).map(([month, prices]) => ({
      month,
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      min: Math.min(...prices),
      max: Math.max(...prices)
    }));

    res.json({ history, chartData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed price history for demo
router.post('/seed', async (req, res) => {
  try {
    await PriceHistory.deleteMany({});
    const entries = [];
    const devices = ['smartphone', 'laptop'];
    const brands = ['apple', 'samsung', 'dell'];
    const issues = ['screen', 'battery', 'charging_port'];
    const basePrices = { 'smartphone-apple-screen': 110, 'smartphone-samsung-screen': 80, 'laptop-apple-screen': 280, 'laptop-dell-screen': 160 };

    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      devices.forEach(device => {
        brands.forEach(brand => {
          issues.forEach(issue => {
            const key = `${device}-${brand}-${issue}`;
            const base = basePrices[key] || 70;
            entries.push({ device, brand, issue, price: base + Math.round((Math.random() - 0.5) * 20), createdAt: date, source: 'system' });
          });
        });
      });
    }
    await PriceHistory.insertMany(entries);
    res.json({ message: `${entries.length} price history entries seeded` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
