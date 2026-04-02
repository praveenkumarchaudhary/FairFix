const express = require('express');
const router = express.Router();
const PriceHistory = require('../models/PriceHistory');

// Price prediction data (simulated ML model with realistic pricing)
const priceData = {
  smartphone: {
    apple: { screen: [80, 150], battery: [60, 100], charging_port: [40, 80], camera: [70, 130], water_damage: [100, 200], software: [20, 50] },
    samsung: { screen: [60, 120], battery: [40, 80], charging_port: [30, 60], camera: [60, 110], water_damage: [80, 160], software: [20, 40] },
    google: { screen: [70, 130], battery: [50, 90], charging_port: [35, 65], camera: [65, 120], water_damage: [90, 170], software: [20, 40] },
    oneplus: { screen: [55, 110], battery: [35, 70], charging_port: [25, 55], camera: [55, 100], water_damage: [75, 150], software: [15, 35] },
    xiaomi: { screen: [40, 90], battery: [25, 55], charging_port: [20, 45], camera: [45, 85], water_damage: [60, 120], software: [15, 30] },
    default: { screen: [45, 95], battery: [30, 65], charging_port: [25, 50], camera: [50, 95], water_damage: [70, 140], software: [15, 35] }
  },
  laptop: {
    apple: { screen: [200, 400], battery: [100, 180], keyboard: [80, 150], charging_port: [60, 120], motherboard: [300, 600], software: [40, 80] },
    dell: { screen: [120, 250], battery: [60, 120], keyboard: [50, 100], charging_port: [40, 80], motherboard: [200, 450], software: [30, 60] },
    hp: { screen: [110, 230], battery: [55, 110], keyboard: [45, 90], charging_port: [35, 75], motherboard: [180, 400], software: [30, 60] },
    lenovo: { screen: [100, 220], battery: [50, 100], keyboard: [40, 85], charging_port: [35, 70], motherboard: [170, 380], software: [25, 55] },
    default: { screen: [100, 220], battery: [55, 110], keyboard: [45, 90], charging_port: [40, 80], motherboard: [180, 400], software: [30, 60] }
  },
  tablet: {
    apple: { screen: [150, 300], battery: [80, 140], charging_port: [50, 100], camera: [60, 120], software: [25, 55] },
    samsung: { screen: [100, 200], battery: [60, 110], charging_port: [40, 80], camera: [50, 100], software: [20, 45] },
    default: { screen: [80, 180], battery: [50, 100], charging_port: [35, 70], camera: [45, 90], software: [20, 40] }
  }
};

router.post('/', async (req, res) => {
  try {
    const { device, brand, issue } = req.body;
    if (!device || !brand || !issue) {
      return res.status(400).json({ message: 'Device, brand, and issue are required' });
    }

    const deviceKey = device.toLowerCase();
    const brandKey = brand.toLowerCase();
    const issueKey = issue.toLowerCase().replace(' ', '_');

    const deviceData = priceData[deviceKey] || priceData.smartphone;
    const brandData = deviceData[brandKey] || deviceData.default;
    const issueRange = brandData[issueKey] || brandData[Object.keys(brandData)[0]];

    // Add some variance based on historical data
    let historyAdjustment = 0;
    let historyCount = 0;
    try {
      const history = await PriceHistory.find({ device: deviceKey, brand: brandKey, issue: issueKey }).limit(20);
      historyCount = history.length;
      if (history.length > 0) {
        const histAvg = history.reduce((sum, h) => sum + h.price, 0) / history.length;
        historyAdjustment = (histAvg - (issueRange[0] + issueRange[1]) / 2) * 0.2;
      }
    } catch (e) { /* ignore DB errors */ }

    const min = Math.round(issueRange[0] + historyAdjustment);
    const max = Math.round(issueRange[1] + historyAdjustment);
    const avg = Math.round((min + max) / 2);

    res.json({
      device, brand, issue,
      priceRange: { min, max, avg },
      confidence: historyCount > 5 ? 'high' : 'medium',
      message: `Fair price range for ${brand} ${device} ${issue} repair`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crowd-sourced price update
router.post('/report', async (req, res) => {
  try {
    const { device, brand, issue, price, city } = req.body;
    const entry = new PriceHistory({ device, brand, issue, price, city, source: 'user' });
    await entry.save();
    res.json({ message: 'Price reported successfully. Thank you!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
