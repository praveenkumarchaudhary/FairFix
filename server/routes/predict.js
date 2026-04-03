const express = require('express');
const router = express.Router();
const PriceHistory = require('../models/PriceHistory');

// ── INR Price Data (device → brand → model tier → issue → [min, max]) ──
// Model tiers: budget / mid / flagship
const modelTiers = {
  smartphone: {
    apple: {
      'iPhone SE': 'budget', 'iPhone 11': 'mid', 'iPhone 12': 'mid',
      'iPhone 13': 'flagship', 'iPhone 14': 'flagship', 'iPhone 15': 'flagship',
      'iPhone 14 Pro': 'flagship', 'iPhone 15 Pro': 'flagship',
    },
    samsung: {
      'Galaxy A14': 'budget', 'Galaxy A34': 'budget', 'Galaxy A54': 'mid',
      'Galaxy S21': 'mid', 'Galaxy S22': 'flagship', 'Galaxy S23': 'flagship',
      'Galaxy S24': 'flagship', 'Galaxy M14': 'budget', 'Galaxy M34': 'budget',
    },
    oneplus: {
      'Nord CE 3': 'budget', 'Nord 3': 'mid', 'OnePlus 11': 'flagship',
      'OnePlus 12': 'flagship', 'OnePlus 12R': 'mid',
    },
    xiaomi: {
      'Redmi 12': 'budget', 'Redmi Note 13': 'budget', 'Redmi Note 13 Pro': 'mid',
      'POCO X6': 'mid', 'POCO F6': 'flagship', 'Mi 14': 'flagship',
    },
    vivo: {
      'Y56': 'budget', 'Y100': 'mid', 'V29': 'mid', 'V30': 'flagship', 'X100': 'flagship',
    },
    oppo: {
      'A78': 'budget', 'A98': 'mid', 'Reno 11': 'mid', 'Find X7': 'flagship',
    },
    realme: {
      'C55': 'budget', 'Narzo 60': 'budget', '11 Pro': 'mid', 'GT 5': 'flagship',
    },
    google: {
      'Pixel 7a': 'mid', 'Pixel 8': 'flagship', 'Pixel 8 Pro': 'flagship',
    },
  },
  laptop: {
    apple: {
      'MacBook Air M1': 'mid', 'MacBook Air M2': 'flagship', 'MacBook Pro M3': 'flagship',
    },
    dell: {
      'Inspiron 15': 'budget', 'Vostro 15': 'budget', 'XPS 13': 'flagship', 'XPS 15': 'flagship',
    },
    hp: {
      'Pavilion 15': 'budget', 'Envy 15': 'mid', 'Spectre x360': 'flagship',
    },
    lenovo: {
      'IdeaPad Slim 3': 'budget', 'IdeaPad Slim 5': 'mid', 'ThinkPad E15': 'mid', 'ThinkPad X1': 'flagship',
    },
    asus: {
      'VivoBook 15': 'budget', 'ZenBook 14': 'mid', 'ROG Strix': 'flagship',
    },
  },
  tablet: {
    apple: {
      'iPad 10th Gen': 'mid', 'iPad Air M1': 'flagship', 'iPad Pro M4': 'flagship',
    },
    samsung: {
      'Galaxy Tab A8': 'budget', 'Galaxy Tab S7': 'mid', 'Galaxy Tab S9': 'flagship',
    },
  },
};

// INR prices per tier per issue
const inrPrices = {
  smartphone: {
    budget: {
      screen: [1200, 2500], battery: [600, 1200], charging_port: [400, 900],
      camera: [800, 1800], water_damage: [1500, 4000], software: [300, 800],
    },
    mid: {
      screen: [2500, 5000], battery: [1000, 2000], charging_port: [700, 1500],
      camera: [1500, 3500], water_damage: [3000, 7000], software: [500, 1200],
    },
    flagship: {
      screen: [5000, 12000], battery: [2000, 4000], charging_port: [1200, 2500],
      camera: [3000, 8000], water_damage: [6000, 15000], software: [800, 2000],
    },
  },
  laptop: {
    budget: {
      screen: [3500, 7000], battery: [2000, 4000], keyboard: [1500, 3500],
      charging_port: [1000, 2500], motherboard: [8000, 18000], software: [800, 2000],
    },
    mid: {
      screen: [6000, 12000], battery: [3500, 7000], keyboard: [2500, 5500],
      charging_port: [1800, 4000], motherboard: [14000, 30000], software: [1200, 3000],
    },
    flagship: {
      screen: [10000, 25000], battery: [6000, 12000], keyboard: [4000, 9000],
      charging_port: [3000, 7000], motherboard: [25000, 60000], software: [2000, 5000],
    },
  },
  tablet: {
    budget: {
      screen: [2500, 5500], battery: [1500, 3000], charging_port: [800, 2000],
      camera: [1200, 3000], software: [500, 1200],
    },
    mid: {
      screen: [4500, 9000], battery: [2500, 5000], charging_port: [1500, 3500],
      camera: [2000, 5000], software: [800, 2000],
    },
    flagship: {
      screen: [8000, 18000], battery: [4000, 8000], charging_port: [2500, 6000],
      camera: [3500, 8000], software: [1200, 3000],
    },
  },
};

function getTier(device, brand, model) {
  if (!model) return 'mid';
  const brandTiers = modelTiers[device?.toLowerCase()]?.[brand?.toLowerCase()] || {};
  // Exact match
  if (brandTiers[model]) return brandTiers[model];
  // Fuzzy match
  const modelLower = model.toLowerCase();
  for (const [key, tier] of Object.entries(brandTiers)) {
    if (modelLower.includes(key.toLowerCase()) || key.toLowerCase().includes(modelLower)) return tier;
  }
  // Keyword-based fallback
  if (/pro|ultra|plus|max|prime/i.test(model)) return 'flagship';
  if (/lite|mini|go|e\b|a1[0-9]\b/i.test(model)) return 'budget';
  return 'mid';
}

function getPriceRange(device, brand, model, issue) {
  const deviceKey = device?.toLowerCase() || 'smartphone';
  const tier = getTier(deviceKey, brand, model);
  const issueKey = issue?.toLowerCase().replace(/\s+/g, '_') || 'screen';
  const tierData = inrPrices[deviceKey]?.[tier] || inrPrices.smartphone.mid;
  const range = tierData[issueKey] || tierData[Object.keys(tierData)[0]];
  return { min: range[0], max: range[1], avg: Math.round((range[0] + range[1]) / 2), tier };
}

// POST /api/predict
router.post('/', async (req, res) => {
  try {
    const { device, brand, model, issue } = req.body;
    if (!device || !brand || !issue) {
      return res.status(400).json({ message: 'Device, brand, and issue are required' });
    }
    if (!model || !model.trim()) {
      return res.status(400).json({ message: 'Please enter or select a model' });
    }

    const { min, max, avg, tier } = getPriceRange(device, brand, model, issue);

    // Adjust from historical data
    let historyCount = 0;
    try {
      const history = await PriceHistory.find({
        device: device.toLowerCase(), brand: brand.toLowerCase(), issue: issue.toLowerCase()
      }).limit(20);
      historyCount = history.length;
      if (history.length > 0) {
        const histAvg = history.reduce((s, h) => s + h.price, 0) / history.length;
        const baseAvg = avg;
        const adj = (histAvg - baseAvg) * 0.15;
        // small adjustment, keep within ±10%
      }
    } catch (_) {}

    res.json({
      device, brand, model, issue, tier,
      priceRange: { min, max, avg },
      currency: 'INR',
      symbol: '₹',
      confidence: historyCount > 5 ? 'high' : 'medium',
      label: `${brand} ${model} — ${issue} Repair`,
      message: `Fair price range for ${brand} ${model} ${issue} repair`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/predict/report
router.post('/report', async (req, res) => {
  try {
    const { device, brand, model, issue, price, city } = req.body;
    const entry = new PriceHistory({
      device: device?.toLowerCase(),
      brand: brand?.toLowerCase(),
      issue: issue?.toLowerCase(),
      price: Number(price),
      city,
      source: 'user',
    });
    await entry.save();
    res.json({ message: 'Price reported successfully. Thank you!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export helpers for use in other routes
module.exports = router;
module.exports.modelTiers = modelTiers;
module.exports.getPriceRange = getPriceRange;
