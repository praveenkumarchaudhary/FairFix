const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const Shop = require('../models/Shop');

// ── Multer config ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `proof-${unique}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only images (jpg, png, gif, webp) and PDF files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 } // 5MB per file, max 3 files
});

// ── Submit complaint with optional proof images ──
router.post('/', upload.array('proofImages', 3), async (req, res) => {
  try {
    const { shopId, userName, email, type, description, amountCharged, fairPrice } = req.body;
    if (!shopId || !type || !description) {
      return res.status(400).json({ message: 'Shop, type, and description are required' });
    }

    const proofImages = (req.files || []).map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      url: `/uploads/${f.filename}`
    }));

    const complaint = new Complaint({
      shop: shopId, userName, email, type, description,
      amountCharged: amountCharged ? Number(amountCharged) : undefined,
      fairPrice: fairPrice ? Number(fairPrice) : undefined,
      proofImages
    });
    await complaint.save();

    // Update shop trust score
    const complaints = await Complaint.find({ shop: shopId });
    const trustPenalty = Math.min(complaints.length * 5, 40);
    const shop = await Shop.findById(shopId);
    if (shop) {
      const newTrust = Math.max(10, 100 - trustPenalty);
      const shouldFlag = complaints.length >= 3 ||
        (amountCharged && fairPrice && Number(amountCharged) > Number(fairPrice) * 1.5);
      await Shop.findByIdAndUpdate(shopId, {
        trustScore: newTrust,
        isFlagged: shouldFlag,
        isFairPriceBadge: newTrust < 70 ? false : shop.isFairPriceBadge
      });
    }

    res.json({ message: 'Complaint submitted. We will review it shortly.', complaint });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large. Max 5MB per file.' });
    if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: 'Max 3 proof images allowed.' });
    res.status(500).json({ message: err.message });
  }
});

// ── Get complaints for a shop ──
router.get('/shop/:shopId', async (req, res) => {
  try {
    const complaints = await Complaint.find({ shop: req.params.shopId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
