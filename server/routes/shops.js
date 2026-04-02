const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Haversine distance formula
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Get all shops with optional location filter
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 20, sort = 'distance', city } = req.query;
    let shops = await Shop.find(city ? { city: new RegExp(city, 'i') } : {});

    if (lat && lng) {
      shops = shops.map(shop => ({
        ...shop.toObject(),
        distance: parseFloat(getDistance(parseFloat(lat), parseFloat(lng), shop.location.lat, shop.location.lng).toFixed(1))
      })).filter(s => s.distance <= parseFloat(radius));
    } else {
      shops = shops.map(s => ({ ...s.toObject(), distance: null }));
    }

    if (sort === 'distance' && lat) shops.sort((a, b) => a.distance - b.distance);
    else if (sort === 'rating') shops.sort((a, b) => b.rating - a.rating);
    else if (sort === 'trust') shops.sort((a, b) => b.trustScore - a.trustScore);
    else if (sort === 'price') shops.sort((a, b) => (a.priceRange === 'budget' ? -1 : 1));

    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single shop
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed demo shops (for development)
router.post('/seed', async (req, res) => {
  try {
    await Shop.deleteMany({});
    const shops = [
      { name: 'TechFix Pro', address: '123 Main St', city: 'New York', phone: '555-0101', location: { lat: 40.7128, lng: -74.0060 }, rating: 4.5, reviewCount: 128, trustScore: 92, isFairPriceBadge: true, specialties: ['smartphone', 'laptop'], priceRange: 'mid', services: [{ device: 'smartphone', issue: 'screen', price: 89 }, { device: 'laptop', issue: 'battery', price: 75 }] },
      { name: 'QuickRepair Hub', address: '456 Broadway', city: 'New York', phone: '555-0102', location: { lat: 40.7200, lng: -74.0100 }, rating: 3.8, reviewCount: 64, trustScore: 71, isFairPriceBadge: false, isFlagged: true, specialties: ['smartphone'], priceRange: 'premium', services: [{ device: 'smartphone', issue: 'screen', price: 180 }] },
      { name: 'Budget Fix Center', address: '789 Park Ave', city: 'New York', phone: '555-0103', location: { lat: 40.7050, lng: -73.9950 }, rating: 4.1, reviewCount: 89, trustScore: 85, isFairPriceBadge: true, specialties: ['smartphone', 'tablet'], priceRange: 'budget', services: [{ device: 'smartphone', issue: 'screen', price: 55 }, { device: 'tablet', issue: 'screen', price: 90 }] },
      { name: 'Apple Expert Repairs', address: '321 5th Ave', city: 'New York', phone: '555-0104', location: { lat: 40.7300, lng: -74.0200 }, rating: 4.8, reviewCount: 215, trustScore: 96, isFairPriceBadge: true, specialties: ['smartphone', 'laptop', 'tablet'], priceRange: 'mid', services: [{ device: 'smartphone', issue: 'screen', price: 110 }, { device: 'laptop', issue: 'screen', price: 220 }] },
      { name: 'City Tech Repairs', address: '654 Lexington Ave', city: 'New York', phone: '555-0105', location: { lat: 40.7150, lng: -74.0080 }, rating: 3.5, reviewCount: 42, trustScore: 58, isFairPriceBadge: false, specialties: ['laptop'], priceRange: 'budget', services: [{ device: 'laptop', issue: 'screen', price: 130 }] },
      { name: 'GadgetCare Plus', address: '987 West St', city: 'Los Angeles', phone: '555-0201', location: { lat: 34.0522, lng: -118.2437 }, rating: 4.3, reviewCount: 156, trustScore: 88, isFairPriceBadge: true, specialties: ['smartphone', 'laptop'], priceRange: 'mid', services: [{ device: 'smartphone', issue: 'battery', price: 45 }] },
      { name: 'LA Screen Masters', address: '111 Sunset Blvd', city: 'Los Angeles', phone: '555-0202', location: { lat: 34.0600, lng: -118.2500 }, rating: 4.6, reviewCount: 203, trustScore: 94, isFairPriceBadge: true, specialties: ['smartphone'], priceRange: 'mid', services: [{ device: 'smartphone', issue: 'screen', price: 75 }] }
    ];
    await Shop.insertMany(shops);
    res.json({ message: `${shops.length} shops seeded successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
