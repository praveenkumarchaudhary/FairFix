const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Haversine distance
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /shops?district=Amritsar&sort=rating
router.get('/', async (req, res) => {
  try {
    const { district, lat, lng, radius = 500, sort = 'rating', city } = req.query;

    // Build filter — district takes priority
    const filter = {};
    if (district) filter.district = new RegExp(district, 'i');
    else if (city) filter.city = new RegExp(city, 'i');

    let shops = await Shop.find(filter);

    // Attach distance if coords provided
    if (lat && lng) {
      shops = shops.map(s => ({
        ...s.toObject(),
        distance: parseFloat(getDistance(parseFloat(lat), parseFloat(lng), s.location.lat, s.location.lng).toFixed(1))
      })).filter(s => s.distance <= parseFloat(radius));
    } else {
      shops = shops.map(s => ({ ...s.toObject(), distance: null }));
    }

    // Sort
    if (sort === 'distance' && lat) shops.sort((a, b) => a.distance - b.distance);
    else if (sort === 'rating')    shops.sort((a, b) => b.rating - a.rating);
    else if (sort === 'trust')     shops.sort((a, b) => b.trustScore - a.trustScore);
    else if (sort === 'price')     shops.sort((a, b) => (a.priceRange === 'budget' ? -1 : 1));

    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /shops/:id
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /shops/seed — Punjab, India districts
router.post('/seed', async (req, res) => {
  try {
    await Shop.deleteMany({});
    const shops = [
      // Amritsar
      { name: 'Golden City Mobile Repair',  address: 'Hall Bazar',          city: 'Amritsar',          district: 'Amritsar',                  phone: '0183-501001', location: { lat: 31.6340, lng: 74.8723 }, rating: 4.8, reviewCount: 312, trustScore: 96, isFairPriceBadge: true,  specialties: ['smartphone','laptop','tablet'], priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 1800 }, { device: 'laptop', issue: 'screen', price: 5500 }] },
      { name: 'iCare Amritsar',             address: 'Lawrence Road',        city: 'Amritsar',          district: 'Amritsar',                  phone: '0183-501002', location: { lat: 31.6280, lng: 74.8650 }, rating: 4.4, reviewCount: 178, trustScore: 87, isFairPriceBadge: true,  specialties: ['smartphone','tablet'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'battery', price: 800 }] },
      { name: 'Quick Fix Amritsar',         address: 'Ranjit Avenue',        city: 'Amritsar',          district: 'Amritsar',                  phone: '0183-501003', location: { lat: 31.6400, lng: 74.8800 }, rating: 3.6, reviewCount: 72,  trustScore: 58, isFairPriceBadge: false, isFlagged: true, specialties: ['smartphone'], priceRange: 'premium', services: [{ device: 'smartphone', issue: 'screen', price: 3500 }] },
      // Ludhiana
      { name: 'Ludhiana Tech Hub',          address: 'Ferozepur Road',       city: 'Ludhiana',          district: 'Ludhiana',                  phone: '0161-502001', location: { lat: 30.9010, lng: 75.8573 }, rating: 4.6, reviewCount: 245, trustScore: 93, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 1700 }, { device: 'laptop', issue: 'battery', price: 3200 }] },
      { name: 'Smart Repair Ludhiana',      address: 'Model Town',           city: 'Ludhiana',          district: 'Ludhiana',                  phone: '0161-502002', location: { lat: 30.9100, lng: 75.8400 }, rating: 4.2, reviewCount: 134, trustScore: 84, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 700 }] },
      { name: 'Mobile Zone Ludhiana',       address: 'Sarabha Nagar',        city: 'Ludhiana',          district: 'Ludhiana',                  phone: '0161-502003', location: { lat: 30.8950, lng: 75.8650 }, rating: 3.9, reviewCount: 88,  trustScore: 72, isFairPriceBadge: false, specialties: ['smartphone','laptop'],         priceRange: 'budget',  services: [{ device: 'laptop', issue: 'screen', price: 4800 }] },
      // Jalandhar
      { name: 'Jalandhar Gadget Care',      address: 'Nakodar Road',         city: 'Jalandhar',         district: 'Jalandhar',                 phone: '0181-503001', location: { lat: 31.3260, lng: 75.5762 }, rating: 4.5, reviewCount: 196, trustScore: 90, isFairPriceBadge: true,  specialties: ['smartphone','laptop','tablet'], priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 1650 }, { device: 'tablet', issue: 'screen', price: 3000 }] },
      { name: 'iRepair Jalandhar',          address: 'Model Town',           city: 'Jalandhar',         district: 'Jalandhar',                 phone: '0181-503002', location: { lat: 31.3350, lng: 75.5650 }, rating: 4.1, reviewCount: 109, trustScore: 81, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 750 }] },
      // Patiala
      { name: 'Patiala Mobile Experts',     address: 'Leela Bhawan',         city: 'Patiala',           district: 'Patiala',                   phone: '0175-504001', location: { lat: 30.3398, lng: 76.3869 }, rating: 4.4, reviewCount: 167, trustScore: 88, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 1750 }] },
      { name: 'Tech Fix Patiala',           address: 'New Lal Bagh',         city: 'Patiala',           district: 'Patiala',                   phone: '0175-504002', location: { lat: 30.3450, lng: 76.3800 }, rating: 3.8, reviewCount: 63,  trustScore: 67, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'charging_port', price: 450 }] },
      // Bathinda
      { name: 'Bathinda Smart Repairs',     address: 'Goniana Road',         city: 'Bathinda',          district: 'Bathinda',                  phone: '0164-505001', location: { lat: 30.2110, lng: 74.9455 }, rating: 4.3, reviewCount: 142, trustScore: 86, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 1600 }] },
      { name: 'Mobile Care Bathinda',       address: 'Thermal Colony',       city: 'Bathinda',          district: 'Bathinda',                  phone: '0164-505002', location: { lat: 30.2200, lng: 74.9500 }, rating: 4.0, reviewCount: 87,  trustScore: 78, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 700 }] },
      // Mohali (SAS Nagar)
      { name: 'Mohali Tech Solutions',      address: 'Phase 7',              city: 'Mohali',            district: 'Mohali (SAS Nagar)',         phone: '0172-506001', location: { lat: 30.7046, lng: 76.7179 }, rating: 4.7, reviewCount: 289, trustScore: 95, isFairPriceBadge: true,  specialties: ['smartphone','laptop','tablet'], priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 1900 }, { device: 'laptop', issue: 'screen', price: 6000 }] },
      { name: 'iZone Mohali',               address: 'Sector 70',            city: 'Mohali',            district: 'Mohali (SAS Nagar)',         phone: '0172-506002', location: { lat: 30.7100, lng: 76.7250 }, rating: 4.5, reviewCount: 201, trustScore: 91, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'laptop', issue: 'battery', price: 3500 }] },
      // Hoshiarpur
      { name: 'Hoshiarpur Mobile Fix',      address: 'Sutheri Road',         city: 'Hoshiarpur',        district: 'Hoshiarpur',                phone: '01882-507001',location: { lat: 31.5143, lng: 75.9115 }, rating: 4.1, reviewCount: 98,  trustScore: 80, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 1500 }] },
      // Gurdaspur
      { name: 'Gurdaspur Gadget Repair',    address: 'Dalhousie Road',       city: 'Gurdaspur',         district: 'Gurdaspur',                 phone: '01874-508001',location: { lat: 32.0396, lng: 75.4058 }, rating: 4.0, reviewCount: 74,  trustScore: 76, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 700 }] },
      // Pathankot
      { name: 'Pathankot Tech Repairs',     address: 'Dhar Road',            city: 'Pathankot',         district: 'Pathankot',                 phone: '0186-509001', location: { lat: 32.2643, lng: 75.6421 }, rating: 4.2, reviewCount: 112, trustScore: 83, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 1600 }] },
      // Firozpur
      { name: 'Firozpur Mobile Center',     address: 'GT Road',              city: 'Firozpur',          district: 'Firozpur',                  phone: '01632-510001',location: { lat: 30.9254, lng: 74.6099 }, rating: 3.9, reviewCount: 56,  trustScore: 70, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 1400 }] },
      // Moga
      { name: 'Moga Smart Fix',             address: 'Ferozepur Road',       city: 'Moga',              district: 'Moga',                      phone: '01636-511001',location: { lat: 30.8170, lng: 75.1683 }, rating: 4.1, reviewCount: 83,  trustScore: 79, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 700 }] },
      // Barnala
      { name: 'Barnala Mobile Repairs',     address: 'Sangrur Road',         city: 'Barnala',           district: 'Barnala',                   phone: '01679-512001',location: { lat: 30.3780, lng: 75.5490 }, rating: 3.8, reviewCount: 47,  trustScore: 68, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 1350 }] },
      // Sangrur
      { name: 'Sangrur Tech Hub',           address: 'Patiala Road',         city: 'Sangrur',           district: 'Sangrur',                   phone: '01672-513001',location: { lat: 30.2453, lng: 75.8441 }, rating: 4.2, reviewCount: 91,  trustScore: 82, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 1550 }] },
      // Kapurthala
      { name: 'Kapurthala Gadget Care',     address: 'Jalandhar Road',       city: 'Kapurthala',        district: 'Kapurthala',                phone: '01822-514001',location: { lat: 31.3808, lng: 75.3800 }, rating: 4.0, reviewCount: 65,  trustScore: 75, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 700 }] },
      // Faridkot
      { name: 'Faridkot Mobile Fix',        address: 'Kotkapura Road',       city: 'Faridkot',          district: 'Faridkot',                  phone: '01639-515001',location: { lat: 30.6740, lng: 74.7570 }, rating: 3.9, reviewCount: 52,  trustScore: 71, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 1400 }] },
      // Fatehgarh Sahib
      { name: 'Fatehgarh Sahib Tech',       address: 'Sirhind Road',         city: 'Fatehgarh Sahib',   district: 'Fatehgarh Sahib',           phone: '01763-516001',location: { lat: 30.6490, lng: 76.3910 }, rating: 4.1, reviewCount: 69,  trustScore: 78, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 700 }] },
      // Rupnagar (Ropar)
      { name: 'Rupnagar Smart Repairs',     address: 'Chandigarh Road',      city: 'Rupnagar',          district: 'Rupnagar (Ropar)',           phone: '01881-517001',location: { lat: 30.9644, lng: 76.5254 }, rating: 4.3, reviewCount: 104, trustScore: 85, isFairPriceBadge: true,  specialties: ['smartphone','laptop'],         priceRange: 'mid',     services: [{ device: 'smartphone', issue: 'screen', price: 1600 }] },
      // Mansa
      { name: 'Mansa Mobile Center',        address: 'Bathinda Road',        city: 'Mansa',             district: 'Mansa',                     phone: '01652-518001',location: { lat: 29.9882, lng: 75.3974 }, rating: 3.8, reviewCount: 44,  trustScore: 66, isFairPriceBadge: false, specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 1300 }] },
      // Nawanshahr (SBS Nagar)
      { name: 'Nawanshahr Tech Repairs',    address: 'Hoshiarpur Road',      city: 'Nawanshahr',        district: 'Nawanshahr (Shaheed Bhagat Singh Nagar)', phone: '01823-519001', location: { lat: 31.1250, lng: 76.1160 }, rating: 4.0, reviewCount: 58, trustScore: 74, isFairPriceBadge: true, specialties: ['smartphone'], priceRange: 'budget', services: [{ device: 'smartphone', issue: 'battery', price: 700 }] },
      // Tarn Taran
      { name: 'Tarn Taran Mobile Fix',      address: 'Amritsar Road',        city: 'Tarn Taran',        district: 'Tarn Taran',                phone: '01852-520001',location: { lat: 31.4519, lng: 74.9270 }, rating: 4.1, reviewCount: 76,  trustScore: 77, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'screen', price: 1450 }] },
      // Malerkotla
      { name: 'Malerkotla Smart Fix',       address: 'Ludhiana Road',        city: 'Malerkotla',        district: 'Malerkotla',                phone: '01675-521001',location: { lat: 30.5310, lng: 75.8790 }, rating: 4.0, reviewCount: 61,  trustScore: 75, isFairPriceBadge: true,  specialties: ['smartphone'],                  priceRange: 'budget',  services: [{ device: 'smartphone', issue: 'battery', price: 700 }] },
    ];
    await Shop.insertMany(shops);
    res.json({ message: `${shops.length} Punjab (India) shops seeded successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
