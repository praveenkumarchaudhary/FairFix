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

// Seed demo shops — all Punjab districts
router.post('/seed', async (req, res) => {
  try {
    await Shop.deleteMany({});
    const shops = [
      // Lahore
      { name: 'TechFix Pro Lahore',      address: 'Mall Road',          city: 'Lahore',         phone: '042-1110001', location: { lat: 31.5204, lng: 74.3587 }, rating: 4.8, reviewCount: 312, trustScore: 96, isFairPriceBadge: true,  specialties: ['smartphone','laptop','tablet'], priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 3500 }, { device: 'laptop', issue: 'screen', price: 8000 }] },
      { name: 'iRepair Lahore',           address: 'Gulberg III',        city: 'Lahore',         phone: '042-1110002', location: { lat: 31.5100, lng: 74.3400 }, rating: 4.5, reviewCount: 198, trustScore: 89, isFairPriceBadge: true,  specialties: ['smartphone','tablet'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'battery', price: 1800 }] },
      { name: 'Quick Mobile Lahore',      address: 'Liberty Market',     city: 'Lahore',         phone: '042-1110003', location: { lat: 31.5250, lng: 74.3450 }, rating: 3.7, reviewCount: 87,  trustScore: 62, isFairPriceBadge: false, isFlagged: true, specialties: ['smartphone'], priceRange: 'premium', services: [{ device: 'smartphone', issue: 'screen', price: 6500 }] },
      // Faisalabad
      { name: 'Faisalabad Tech Hub',      address: 'D Ground',           city: 'Faisalabad',     phone: '041-2220001', location: { lat: 31.4504, lng: 73.1350 }, rating: 4.4, reviewCount: 145, trustScore: 88, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 3200 }, { device: 'laptop', issue: 'battery', price: 4500 }] },
      { name: 'Mobile Care Faisalabad',   address: 'Kohinoor City',      city: 'Faisalabad',     phone: '041-2220002', location: { lat: 31.4600, lng: 73.1200 }, rating: 4.1, reviewCount: 92,  trustScore: 80, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 1500 }] },
      // Rawalpindi
      { name: 'Pindi Gadget Repair',      address: 'Saddar Bazar',       city: 'Rawalpindi',     phone: '051-3330001', location: { lat: 33.5651, lng: 73.0169 }, rating: 4.6, reviewCount: 221, trustScore: 93, isFairPriceBadge: true,  specialties: ['smartphone','laptop','tablet'], priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 3800 }, { device: 'laptop', issue: 'screen', price: 9000 }] },
      { name: 'Tech Zone Rawalpindi',     address: 'Raja Bazar',         city: 'Rawalpindi',     phone: '051-3330002', location: { lat: 33.5700, lng: 73.0250 }, rating: 3.9, reviewCount: 64,  trustScore: 70, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'charging_port', price: 900 }] },
      // Gujranwala
      { name: 'Gujranwala Mobile Fix',    address: 'GT Road',            city: 'Gujranwala',     phone: '055-4440001', location: { lat: 32.1877, lng: 74.1945 }, rating: 4.3, reviewCount: 118, trustScore: 85, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 3000 }] },
      { name: 'Smart Repair Gujranwala',  address: 'Satellite Town',     city: 'Gujranwala',     phone: '055-4440002', location: { lat: 32.1950, lng: 74.2000 }, rating: 4.0, reviewCount: 76,  trustScore: 78, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 1400 }] },
      // Multan
      { name: 'Multan Tech Repairs',      address: 'Hussain Agahi',      city: 'Multan',         phone: '061-5550001', location: { lat: 30.1575, lng: 71.5249 }, rating: 4.5, reviewCount: 167, trustScore: 91, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 3300 }, { device: 'laptop', issue: 'keyboard', price: 3500 }] },
      { name: 'iCare Multan',             address: 'Gulgasht Colony',    city: 'Multan',         phone: '061-5550002', location: { lat: 30.1650, lng: 71.5150 }, rating: 4.2, reviewCount: 89,  trustScore: 83, isFairPriceBadge: true,  specialties: ['smartphone','tablet'],         priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 1600 }] },
      // Bahawalpur
      { name: 'Bahawalpur Mobile Center', address: 'Model Town A',       city: 'Bahawalpur',     phone: '062-6660001', location: { lat: 29.3956, lng: 71.6836 }, rating: 4.1, reviewCount: 94,  trustScore: 82, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 2800 }] },
      { name: 'Tech World Bahawalpur',    address: 'Circular Road',      city: 'Bahawalpur',     phone: '062-6660002', location: { lat: 29.4000, lng: 71.6900 }, rating: 3.8, reviewCount: 52,  trustScore: 68, isFairPriceBadge: false, specialties: ['smartphone','laptop'],         priceRange: 'budget',  services: [{ device: 'laptop', issue: 'battery', price: 4000 }] },
      // Sargodha
      { name: 'Sargodha Repair Hub',      address: 'University Road',    city: 'Sargodha',       phone: '048-7770001', location: { lat: 32.0836, lng: 72.6711 }, rating: 4.3, reviewCount: 108, trustScore: 86, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 3100 }] },
      // Sialkot
      { name: 'Sialkot Tech Solutions',   address: 'Cantt Area',         city: 'Sialkot',        phone: '052-8880001', location: { lat: 32.4945, lng: 74.5229 }, rating: 4.6, reviewCount: 183, trustScore: 92, isFairPriceBadge: true,  specialties: ['smartphone','laptop','tablet'], priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 3400 }, { device: 'laptop', issue: 'screen', price: 8500 }] },
      { name: 'Mobile Expert Sialkot',    address: 'Paris Road',         city: 'Sialkot',        phone: '052-8880002', location: { lat: 32.5000, lng: 74.5300 }, rating: 4.0, reviewCount: 71,  trustScore: 77, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 1700 }] },
      // Sheikhupura
      { name: 'Sheikhupura Mobile Fix',   address: 'Main Bazar',         city: 'Sheikhupura',    phone: '056-9990001', location: { lat: 31.7167, lng: 73.9850 }, rating: 4.0, reviewCount: 63,  trustScore: 79, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 2700 }] },
      // Jhang
      { name: 'Jhang Gadget Care',        address: 'Clock Tower Chowk',  city: 'Jhang',          phone: '047-1010001', location: { lat: 31.2681, lng: 72.3181 }, rating: 3.9, reviewCount: 48,  trustScore: 72, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 2500 }] },
      // Rahim Yar Khan
      { name: 'RYK Mobile Repairs',       address: 'Saddar Road',        city: 'Rahim Yar Khan', phone: '068-1020001', location: { lat: 28.4202, lng: 70.2952 }, rating: 4.2, reviewCount: 87,  trustScore: 84, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 2900 }] },
      // Gujrat
      { name: 'Gujrat Tech Repair',       address: 'Jinnah Road',        city: 'Gujrat',         phone: '053-1030001', location: { lat: 32.5736, lng: 74.0790 }, rating: 4.1, reviewCount: 79,  trustScore: 80, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 3000 }] },
      // Kasur
      { name: 'Kasur Mobile Center',      address: 'GT Road Kasur',      city: 'Kasur',          phone: '049-1040001', location: { lat: 31.1167, lng: 74.4500 }, rating: 3.8, reviewCount: 41,  trustScore: 69, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 1300 }] },
      // Okara
      { name: 'Okara Smart Repairs',      address: 'Cantt Bazar',        city: 'Okara',          phone: '044-1050001', location: { lat: 30.8138, lng: 73.4534 }, rating: 4.0, reviewCount: 55,  trustScore: 76, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 2600 }] },
      // Sahiwal
      { name: 'Sahiwal Tech Hub',         address: 'Farid Town',         city: 'Sahiwal',        phone: '040-1060001', location: { lat: 30.6706, lng: 73.1064 }, rating: 4.2, reviewCount: 68,  trustScore: 82, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 2800 }] },
      // Mianwali
      { name: 'Mianwali Mobile Fix',      address: 'Circular Road',      city: 'Mianwali',       phone: '0459-107001', location: { lat: 32.5838, lng: 71.5432 }, rating: 3.9, reviewCount: 37,  trustScore: 71, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 2400 }] },
      // Chiniot
      { name: 'Chiniot Gadget Repair',    address: 'Bhawana Road',       city: 'Chiniot',        phone: '047-1080001', location: { lat: 31.7200, lng: 72.9800 }, rating: 4.0, reviewCount: 44,  trustScore: 75, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 1400 }] },
      // Hafizabad
      { name: 'Hafizabad Mobile Care',    address: 'Main Bazar',         city: 'Hafizabad',      phone: '0547-109001', location: { lat: 32.0714, lng: 73.6881 }, rating: 3.8, reviewCount: 32,  trustScore: 67, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 2300 }] },
      // Nankana Sahib
      { name: 'Nankana Tech Repairs',     address: 'Gurdwara Road',      city: 'Nankana Sahib',  phone: '056-1100001', location: { lat: 31.4500, lng: 73.7100 }, rating: 4.1, reviewCount: 49,  trustScore: 78, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 2500 }] },
      // Narowal
      { name: 'Narowal Mobile Hub',       address: 'Shakargarh Road',    city: 'Narowal',        phone: '0542-111001', location: { lat: 32.1000, lng: 74.8700 }, rating: 3.9, reviewCount: 38,  trustScore: 70, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 1300 }] },
      // Pakpattan
      { name: 'Pakpattan Smart Fix',      address: 'Darbar Road',        city: 'Pakpattan',      phone: '0457-112001', location: { lat: 30.3436, lng: 73.3872 }, rating: 4.0, reviewCount: 42,  trustScore: 74, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 2400 }] },
      // Toba Tek Singh
      { name: 'TTS Mobile Repairs',       address: 'Faisalabad Road',    city: 'Toba Tek Singh', phone: '046-1130001', location: { lat: 30.9667, lng: 72.4833 }, rating: 4.1, reviewCount: 53,  trustScore: 77, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 2600 }] },
      // Vehari
      { name: 'Vehari Tech Center',       address: 'Multan Road',        city: 'Vehari',         phone: '067-1140001', location: { lat: 30.0454, lng: 72.3519 }, rating: 3.9, reviewCount: 36,  trustScore: 69, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 1200 }] },
    ];
    await Shop.insertMany(shops);
    res.json({ message: `${shops.length} Punjab shops seeded successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
