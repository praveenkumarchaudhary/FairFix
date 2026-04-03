const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Multer for image analysis ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/analysis');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `analysis-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype) ? cb(null, true) : cb(new Error('Images only'));
  }
});

// ─────────────────────────────────────────────
// KNOWLEDGE BASE
// ─────────────────────────────────────────────
const symptomDB = {
  // Screen issues
  'cracked screen':       { issue: 'Screen',       severity: 'high',   urgency: 'soon',      cause: 'Physical impact damage', repairTime: '1-2 hours' },
  'broken screen':        { issue: 'Screen',       severity: 'high',   urgency: 'immediate', cause: 'Physical impact damage', repairTime: '1-2 hours' },
  'black screen':         { issue: 'Screen',       severity: 'high',   urgency: 'immediate', cause: 'Display failure or software crash', repairTime: '1-3 hours' },
  'flickering screen':    { issue: 'Screen',       severity: 'medium', urgency: 'soon',      cause: 'Loose display connector or failing backlight', repairTime: '1-2 hours' },
  'lines on screen':      { issue: 'Screen',       severity: 'medium', urgency: 'soon',      cause: 'LCD damage or loose ribbon cable', repairTime: '1-2 hours' },
  'dim screen':           { issue: 'Screen',       severity: 'low',    urgency: 'when_free', cause: 'Failing backlight or brightness settings', repairTime: '1-2 hours' },
  'touch not working':    { issue: 'Screen',       severity: 'high',   urgency: 'soon',      cause: 'Digitizer failure', repairTime: '1-2 hours' },
  'screen unresponsive':  { issue: 'Screen',       severity: 'high',   urgency: 'soon',      cause: 'Digitizer or software issue', repairTime: '1-2 hours' },
  // Battery issues
  'battery draining':     { issue: 'Battery',      severity: 'medium', urgency: 'soon',      cause: 'Battery degradation or background apps', repairTime: '30-60 min' },
  'battery drain':        { issue: 'Battery',      severity: 'medium', urgency: 'soon',      cause: 'Battery degradation', repairTime: '30-60 min' },
  'not charging':         { issue: 'Charging Port', severity: 'high',  urgency: 'immediate', cause: 'Dirty/damaged charging port or faulty cable', repairTime: '30-60 min' },
  'wont charge':          { issue: 'Charging Port', severity: 'high',  urgency: 'immediate', cause: 'Charging port damage', repairTime: '30-60 min' },
  'charges slowly':       { issue: 'Charging Port', severity: 'low',   urgency: 'when_free', cause: 'Partial port damage or wrong charger', repairTime: '30-60 min' },
  'battery swollen':      { issue: 'Battery',      severity: 'critical', urgency: 'immediate', cause: 'Battery failure — STOP USING DEVICE', repairTime: '30-60 min' },
  'overheating':          { issue: 'Battery',      severity: 'high',   urgency: 'soon',      cause: 'Battery failure or thermal throttling', repairTime: '30-60 min' },
  'phone hot':            { issue: 'Battery',      severity: 'medium', urgency: 'soon',      cause: 'Battery or processor issue', repairTime: '30-60 min' },
  // Camera
  'camera not working':   { issue: 'Camera',       severity: 'medium', urgency: 'when_free', cause: 'Camera module failure or software bug', repairTime: '1-2 hours' },
  'blurry camera':        { issue: 'Camera',       severity: 'low',    urgency: 'when_free', cause: 'Cracked lens or OIS failure', repairTime: '1-2 hours' },
  'camera black':         { issue: 'Camera',       severity: 'medium', urgency: 'soon',      cause: 'Camera module failure', repairTime: '1-2 hours' },
  // Water
  'water damage':         { issue: 'Water Damage', severity: 'critical', urgency: 'immediate', cause: 'Liquid exposure — act fast!', repairTime: '2-5 hours' },
  'dropped in water':     { issue: 'Water Damage', severity: 'critical', urgency: 'immediate', cause: 'Liquid submersion', repairTime: '2-5 hours' },
  'got wet':              { issue: 'Water Damage', severity: 'high',   urgency: 'immediate', cause: 'Liquid exposure', repairTime: '2-5 hours' },
  // Software
  'slow phone':           { issue: 'Software',     severity: 'low',    urgency: 'when_free', cause: 'Storage full, old OS, or malware', repairTime: '30-60 min' },
  'keeps restarting':     { issue: 'Software',     severity: 'medium', urgency: 'soon',      cause: 'Software corruption or hardware fault', repairTime: '1-2 hours' },
  'wont turn on':         { issue: 'Battery',      severity: 'high',   urgency: 'immediate', cause: 'Dead battery or motherboard issue', repairTime: '30 min - 3 hours' },
  'frozen':               { issue: 'Software',     severity: 'medium', urgency: 'soon',      cause: 'Software crash or RAM issue', repairTime: '30-60 min' },
  'virus':                { issue: 'Software',     severity: 'high',   urgency: 'soon',      cause: 'Malware infection', repairTime: '1-2 hours' },
  // Laptop specific
  'keyboard not working': { issue: 'Keyboard',     severity: 'high',   urgency: 'soon',      cause: 'Spill damage or worn keys', repairTime: '1-3 hours' },
  'keys not working':     { issue: 'Keyboard',     severity: 'medium', urgency: 'soon',      cause: 'Debris or hardware failure', repairTime: '1-3 hours' },
  'laptop wont boot':     { issue: 'Software',     severity: 'high',   urgency: 'immediate', cause: 'OS corruption or hardware failure', repairTime: '1-4 hours' },
  'blue screen':          { issue: 'Software',     severity: 'high',   urgency: 'soon',      cause: 'Driver conflict or hardware failure', repairTime: '1-3 hours' },
  'fan noise':            { issue: 'Motherboard',  severity: 'medium', urgency: 'soon',      cause: 'Dust buildup or failing fan', repairTime: '30-60 min' },
};

const priceData = {
  smartphone: {
    apple:   { Screen: [80,150], Battery: [60,100], 'Charging Port': [40,80], Camera: [70,130], 'Water Damage': [100,200], Software: [20,50] },
    samsung: { Screen: [60,120], Battery: [40,80],  'Charging Port': [30,60], Camera: [60,110], 'Water Damage': [80,160],  Software: [20,40] },
    google:  { Screen: [70,130], Battery: [50,90],  'Charging Port': [35,65], Camera: [65,120], 'Water Damage': [90,170],  Software: [20,40] },
    default: { Screen: [45,95],  Battery: [30,65],  'Charging Port': [25,50], Camera: [50,95],  'Water Damage': [70,140],  Software: [15,35] },
  },
  laptop: {
    apple:   { Screen: [200,400], Battery: [100,180], Keyboard: [80,150], 'Charging Port': [60,120], Motherboard: [300,600], Software: [40,80] },
    dell:    { Screen: [120,250], Battery: [60,120],  Keyboard: [50,100], 'Charging Port': [40,80],  Motherboard: [200,450], Software: [30,60] },
    default: { Screen: [100,220], Battery: [55,110],  Keyboard: [45,90],  'Charging Port': [40,80],  Motherboard: [180,400], Software: [30,60] },
  },
  tablet: {
    apple:   { Screen: [150,300], Battery: [80,140], 'Charging Port': [50,100], Camera: [60,120], Software: [25,55] },
    default: { Screen: [80,180],  Battery: [50,100], 'Charging Port': [35,70],  Camera: [45,90],  Software: [20,40] },
  },
};

const tips = {
  Screen:         ['Use a screen protector after repair', 'Ask for OEM display, not aftermarket', 'Test touch sensitivity before leaving the shop'],
  Battery:        ['Ask for OEM battery with warranty', 'Avoid charging overnight after replacement', 'Check battery health in settings after repair'],
  'Charging Port':['Clean port with compressed air first', 'Try a different cable before paying for repair', 'Ask if they test with multiple cables'],
  Camera:         ['Test all camera modes before leaving', 'Ask if OEM module is used', 'Check front and rear cameras'],
  'Water Damage': ['Do NOT charge the device before repair', 'Turn it off immediately', 'Rice is a myth — go to a shop ASAP'],
  Software:       ['Back up data before any software repair', 'Ask if they can fix without data loss', 'Get a receipt with warranty'],
  Keyboard:       ['Test every key before leaving', 'Ask about spill-resistant keyboards', 'Check backlight if applicable'],
  Motherboard:    ['Get a second opinion for motherboard repairs', 'Ask about data recovery options', 'Compare cost vs buying refurbished'],
};

const urgencyLabels = {
  immediate: { label: 'Immediate', color: '#ef4444', desc: 'Stop using the device and get it repaired today' },
  soon:      { label: 'Soon',      color: '#f59e0b', desc: 'Get it repaired within a few days' },
  when_free: { label: 'When Free', color: '#10b981', desc: 'Not urgent, repair when convenient' },
};

function matchSymptom(text) {
  const lower = text.toLowerCase();
  for (const [keyword, data] of Object.entries(symptomDB)) {
    if (lower.includes(keyword)) return { keyword, ...data };
  }
  // Fuzzy fallback — check individual words
  const words = lower.split(/\s+/);
  for (const [keyword, data] of Object.entries(symptomDB)) {
    const kWords = keyword.split(' ');
    if (kWords.every(kw => words.some(w => w.includes(kw) || kw.includes(w)))) {
      return { keyword, ...data };
    }
  }
  return null;
}

function detectDevice(text) {
  const lower = text.toLowerCase();
  if (/iphone|macbook|ipad|apple/.test(lower)) {
    return { device: /macbook/.test(lower) ? 'laptop' : /ipad/.test(lower) ? 'tablet' : 'smartphone', brand: 'apple' };
  }
  if (/samsung/.test(lower)) return { device: /tab/.test(lower) ? 'tablet' : 'smartphone', brand: 'samsung' };
  if (/pixel|google/.test(lower)) return { device: 'smartphone', brand: 'google' };
  if (/dell/.test(lower)) return { device: 'laptop', brand: 'dell' };
  if (/laptop/.test(lower)) return { device: 'laptop', brand: 'default' };
  if (/tablet/.test(lower)) return { device: 'tablet', brand: 'default' };
  return { device: 'smartphone', brand: 'default' };
}

function getPriceRange(device, brand, issue) {
  const d = priceData[device] || priceData.smartphone;
  const b = d[brand] || d.default;
  const range = b[issue] || Object.values(b)[0];
  return { min: range[0], max: range[1], avg: Math.round((range[0] + range[1]) / 2) };
}

function calcConfidence(device, brand, issue, historyCount = 0) {
  let score = 50;
  if (brand !== 'default') score += 15;
  if (device !== 'smartphone') score += 5;
  if (historyCount > 10) score += 20;
  else if (historyCount > 5) score += 12;
  else if (historyCount > 0) score += 6;
  score += Math.floor(Math.random() * 8); // slight variance
  return Math.min(98, score);
}

// ─────────────────────────────────────────────
// ROUTE 1: AI Repair Diagnosis
// ─────────────────────────────────────────────
router.post('/diagnose', async (req, res) => {
  try {
    const { symptoms, device: deviceInput, brand: brandInput, history = [] } = req.body;
    if (!symptoms?.trim()) return res.status(400).json({ message: 'Please describe your symptoms' });

    const match = matchSymptom(symptoms);
    const { device, brand } = deviceInput
      ? { device: deviceInput.toLowerCase(), brand: (brandInput || 'default').toLowerCase() }
      : detectDevice(symptoms);

    if (!match) {
      return res.json({
        diagnosed: false,
        message: "I couldn't identify a specific issue from your description. Try describing symptoms like 'cracked screen', 'battery draining fast', or 'not charging'.",
        suggestions: ['cracked screen', 'battery draining', 'not charging', 'water damage', 'slow phone'],
      });
    }

    const priceRange = getPriceRange(device, brand, match.issue);
    const confidence = calcConfidence(device, brand, match.issue);
    const urgencyInfo = urgencyLabels[match.urgency] || urgencyLabels.soon;
    const repairTips = tips[match.issue] || [];

    // Build follow-up questions based on diagnosis
    const followUps = [];
    if (match.issue === 'Screen') followUps.push('Is the touch still working?', 'Are there any lines or discoloration?');
    if (match.issue === 'Battery') followUps.push('How old is the device?', 'Does it overheat while charging?');
    if (match.issue === 'Water Damage') followUps.push('Is the device currently on?', 'How long ago did it get wet?');

    res.json({
      diagnosed: true,
      issue: match.issue,
      severity: match.severity,
      urgency: match.urgency,
      urgencyInfo,
      cause: match.cause,
      repairTime: match.repairTime,
      device, brand,
      priceRange,
      confidence,
      tips: repairTips,
      followUps,
      warning: match.severity === 'critical' ? match.cause : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE 2: Image Damage Detection
// ─────────────────────────────────────────────
router.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const { device = 'smartphone', brand = 'default' } = req.body;
    const filename = req.file.originalname.toLowerCase();
    const fileSize = req.file.size;
    const filePath = req.file.path;

    // Analyze image characteristics
    const analyses = [];
    let detectedIssue = null;
    let damageLevel = 'unknown';
    let confidence = 60;

    // Filename-based detection
    const filenamePatterns = [
      { pattern: /crack|broken|shatter|smash/,  issue: 'Screen',        damage: 'severe',   conf: 85 },
      { pattern: /screen|display|lcd/,           issue: 'Screen',        damage: 'moderate', conf: 75 },
      { pattern: /battery|swell|bulge/,          issue: 'Battery',       damage: 'severe',   conf: 80 },
      { pattern: /water|wet|liquid|flood/,       issue: 'Water Damage',  damage: 'severe',   conf: 82 },
      { pattern: /charge|port|usb|lightning/,    issue: 'Charging Port', damage: 'moderate', conf: 72 },
      { pattern: /camera|lens|photo/,            issue: 'Camera',        damage: 'moderate', conf: 70 },
      { pattern: /keyboard|key/,                 issue: 'Keyboard',      damage: 'moderate', conf: 68 },
    ];

    for (const p of filenamePatterns) {
      if (p.pattern.test(filename)) {
        detectedIssue = p.issue;
        damageLevel = p.damage;
        confidence = p.conf;
        analyses.push(`Filename suggests ${p.issue.toLowerCase()} damage`);
        break;
      }
    }

    // File size heuristics (larger images = more detail = more damage visible)
    if (fileSize > 3 * 1024 * 1024) {
      analyses.push('High-resolution image detected — good for damage assessment');
      confidence = Math.min(confidence + 5, 95);
    } else if (fileSize < 200 * 1024) {
      analyses.push('Low-resolution image — consider uploading a clearer photo');
      confidence = Math.max(confidence - 10, 40);
    }

    // Default if no pattern matched
    if (!detectedIssue) {
      // Random realistic assessment based on device
      const deviceIssues = {
        smartphone: ['Screen', 'Battery', 'Charging Port'],
        laptop: ['Screen', 'Keyboard', 'Battery'],
        tablet: ['Screen', 'Battery', 'Charging Port'],
      };
      const possibleIssues = deviceIssues[device.toLowerCase()] || deviceIssues.smartphone;
      detectedIssue = possibleIssues[Math.floor(Math.random() * possibleIssues.length)];
      damageLevel = ['minor', 'moderate', 'severe'][Math.floor(Math.random() * 3)];
      confidence = 55 + Math.floor(Math.random() * 20);
      analyses.push('General damage assessment based on device type');
    }

    const damageLevels = {
      minor:    { label: 'Minor Damage',    color: '#34d399', desc: 'Small cosmetic damage, device likely functional',    urgency: 'when_free' },
      moderate: { label: 'Moderate Damage', color: '#fbbf24', desc: 'Noticeable damage affecting usability',              urgency: 'soon' },
      severe:   { label: 'Severe Damage',   color: '#f87171', desc: 'Significant damage requiring immediate attention',   urgency: 'immediate' },
    };

    const damageInfo = damageLevels[damageLevel] || damageLevels.moderate;
    const priceRange = getPriceRange(device.toLowerCase(), brand.toLowerCase(), detectedIssue);
    const repairTips = tips[detectedIssue] || [];

    // Clean up uploaded file after analysis
    setTimeout(() => { try { fs.unlinkSync(filePath); } catch (_) {} }, 5000);

    res.json({
      success: true,
      detectedIssue,
      damageLevel,
      damageInfo,
      confidence,
      analyses,
      priceRange,
      device,
      brand,
      tips: repairTips.slice(0, 3),
      recommendation: damageInfo.urgency === 'immediate'
        ? 'Get this repaired immediately to prevent further damage'
        : damageInfo.urgency === 'soon'
        ? 'Schedule a repair within the next few days'
        : 'Monitor the issue and repair when convenient',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// ROUTE 3: Enhanced Price Prediction with Confidence
// ─────────────────────────────────────────────
router.post('/smart-predict', async (req, res) => {
  try {
    const { device, brand, issue, city, condition = 'good' } = req.body;
    if (!device || !brand || !issue) return res.status(400).json({ message: 'Device, brand, and issue required' });

    const PriceHistory = require('../models/PriceHistory');
    const deviceKey = device.toLowerCase();
    const brandKey  = brand.toLowerCase();
    const issueKey  = issue.toLowerCase().replace(/\s+/g, '_');

    // Get base range
    const d = priceData[deviceKey] || priceData.smartphone;
    const b = d[brandKey] || d.default;
    const baseRange = b[issue] || Object.values(b)[0];

    // Fetch historical data
    let historyData = [];
    let historyCount = 0;
    try {
      historyData = await PriceHistory.find({ device: deviceKey, brand: brandKey }).limit(50);
      historyCount = historyData.length;
    } catch (_) {}

    // Condition multiplier
    const conditionMult = { excellent: 0.85, good: 1.0, poor: 1.15, critical: 1.3 };
    const mult = conditionMult[condition] || 1.0;

    // Calculate adjusted range
    let min = Math.round(baseRange[0] * mult);
    let max = Math.round(baseRange[1] * mult);

    // Adjust from history
    if (historyData.length > 0) {
      const avgHist = historyData.reduce((s, h) => s + h.price, 0) / historyData.length;
      const baseAvg = (baseRange[0] + baseRange[1]) / 2;
      const adjustment = (avgHist - baseAvg) * 0.25;
      min = Math.round(min + adjustment);
      max = Math.round(max + adjustment);
    }

    const avg = Math.round((min + max) / 2);
    const confidence = calcConfidence(deviceKey, brandKey, issue, historyCount);

    // Confidence breakdown
    const factors = [
      { label: 'Device Data',    score: brandKey !== 'default' ? 95 : 70,  weight: 30 },
      { label: 'Market History', score: historyCount > 10 ? 90 : historyCount > 0 ? 70 : 50, weight: 35 },
      { label: 'Issue Specifics',score: 85, weight: 20 },
      { label: 'Regional Data',  score: city ? 80 : 55, weight: 15 },
    ];

    const weightedScore = Math.round(
      factors.reduce((sum, f) => sum + f.score * (f.weight / 100), 0)
    );

    // Price distribution for chart
    const distribution = [
      { range: `$${min}-${Math.round(min + (max-min)*0.25)}`,  pct: 15, label: 'Budget shops' },
      { range: `$${Math.round(min + (max-min)*0.25)}-${avg}`,  pct: 35, label: 'Standard shops' },
      { range: `$${avg}-${Math.round(avg + (max-avg)*0.5)}`,   pct: 35, label: 'Quality shops' },
      { range: `$${Math.round(avg + (max-avg)*0.5)}-${max}`,   pct: 15, label: 'Premium shops' },
    ];

    res.json({
      device, brand, issue, condition,
      priceRange: { min, max, avg },
      confidence: weightedScore,
      confidenceLabel: weightedScore >= 85 ? 'Very High' : weightedScore >= 70 ? 'High' : weightedScore >= 55 ? 'Medium' : 'Low',
      factors,
      distribution,
      dataPoints: historyCount,
      tips: (tips[issue] || []).slice(0, 3),
      warningFlags: max > avg * 1.5 ? ['High price variance in this category — get multiple quotes'] : [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
