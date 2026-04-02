const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const PriceHistory = require('../models/PriceHistory');

// Price data mirror from predict route
const priceData = {
  smartphone: {
    apple:   { screen: [80,150], battery: [60,100], charging_port: [40,80],  camera: [70,130], water_damage: [100,200], software: [20,50] },
    samsung: { screen: [60,120], battery: [40,80],  charging_port: [30,60],  camera: [60,110], water_damage: [80,160],  software: [20,40] },
    google:  { screen: [70,130], battery: [50,90],  charging_port: [35,65],  camera: [65,120], water_damage: [90,170],  software: [20,40] },
    oneplus: { screen: [55,110], battery: [35,70],  charging_port: [25,55],  camera: [55,100], water_damage: [75,150],  software: [15,35] },
    xiaomi:  { screen: [40,90],  battery: [25,55],  charging_port: [20,45],  camera: [45,85],  water_damage: [60,120],  software: [15,30] },
    default: { screen: [45,95],  battery: [30,65],  charging_port: [25,50],  camera: [50,95],  water_damage: [70,140],  software: [15,35] }
  },
  laptop: {
    apple:  { screen: [200,400], battery: [100,180], keyboard: [80,150],  charging_port: [60,120], motherboard: [300,600], software: [40,80] },
    dell:   { screen: [120,250], battery: [60,120],  keyboard: [50,100],  charging_port: [40,80],  motherboard: [200,450], software: [30,60] },
    hp:     { screen: [110,230], battery: [55,110],  keyboard: [45,90],   charging_port: [35,75],  motherboard: [180,400], software: [30,60] },
    lenovo: { screen: [100,220], battery: [50,100],  keyboard: [40,85],   charging_port: [35,70],  motherboard: [170,380], software: [25,55] },
    default:{ screen: [100,220], battery: [55,110],  keyboard: [45,90],   charging_port: [40,80],  motherboard: [180,400], software: [30,60] }
  },
  tablet: {
    apple:   { screen: [150,300], battery: [80,140], charging_port: [50,100], camera: [60,120], software: [25,55] },
    samsung: { screen: [100,200], battery: [60,110], charging_port: [40,80],  camera: [50,100], software: [20,45] },
    default: { screen: [80,180],  battery: [50,100], charging_port: [35,70],  camera: [45,90],  software: [20,40] }
  }
};

function getPriceRange(device, brand, issue) {
  const d = priceData[device?.toLowerCase()] || priceData.smartphone;
  const b = d[brand?.toLowerCase()] || d.default;
  const issueKey = issue?.toLowerCase().replace(/\s+/g, '_');
  const range = b[issueKey] || b[Object.keys(b)[0]];
  return { min: range[0], max: range[1], avg: Math.round((range[0] + range[1]) / 2) };
}

// Intent detection
function detectIntent(msg) {
  const m = msg.toLowerCase();
  if (/\b(hi|hello|hey|howdy|sup)\b/.test(m)) return 'greeting';
  if (/\b(bye|goodbye|thanks|thank you|thx)\b/.test(m)) return 'farewell';
  if (/overcharg|rip.?off|scam|too (much|expensive)|cheat|quoted|quote|they (want|charge|said)|asking for/.test(m)) return 'overcharge';
  if (/best shop|top shop|recommend|suggest|which shop|good shop/.test(m)) return 'recommend';
  if (/nearest|closest|near me|emergency|urgent/.test(m)) return 'nearest';
  if (/trust|reliable|legit|safe|verified/.test(m)) return 'trust';
  if (/complain|report|fraud|fake/.test(m)) return 'complaint';
  if (/review|rating|feedback/.test(m)) return 'review';
  if (/how (much|does|do)|cost|price|charge|fee|rate/.test(m)) return 'price';
  if (/screen|display|crack|broken/.test(m)) return 'price_screen';
  if (/battery|drain|charge|power/.test(m)) return 'price_battery';
  if (/water|wet|liquid|drop/.test(m)) return 'price_water';
  if (/camera|photo|lens/.test(m)) return 'price_camera';
  if (/keyboard|key|type/.test(m)) return 'price_keyboard';
  if (/software|virus|slow|update|os/.test(m)) return 'price_software';
  if (/what (is|are)|help|can you|what do/.test(m)) return 'help';
  return 'unknown';
}

function extractDevice(msg) {
  const m = msg.toLowerCase();
  if (/iphone|macbook|ipad|apple/.test(m)) return { device: m.includes('macbook') ? 'laptop' : m.includes('ipad') ? 'tablet' : 'smartphone', brand: 'apple' };
  if (/samsung/.test(m)) return { device: m.includes('tab') ? 'tablet' : 'smartphone', brand: 'samsung' };
  if (/pixel|google/.test(m)) return { device: 'smartphone', brand: 'google' };
  if (/dell/.test(m)) return { device: 'laptop', brand: 'dell' };
  if (/hp/.test(m)) return { device: 'laptop', brand: 'hp' };
  if (/lenovo/.test(m)) return { device: 'laptop', brand: 'lenovo' };
  if (/laptop/.test(m)) return { device: 'laptop', brand: 'default' };
  if (/tablet/.test(m)) return { device: 'tablet', brand: 'default' };
  return { device: 'smartphone', brand: 'default' };
}

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    const intent = detectIntent(message);
    const { device, brand } = extractDevice(message);
    let reply = '';
    let suggestions = [];

    switch (intent) {
      case 'greeting':
        reply = `Hey there! 👋 I'm FairFix AI, your repair pricing assistant.\n\nI can help you with:\n• 💰 Fair price estimates for any repair\n• 🔍 Detecting if you're being overcharged\n• 🏪 Finding trusted repair shops\n• ⭐ Shop recommendations\n\nWhat device needs fixing?`;
        suggestions = ['How much is iPhone screen repair?', 'Find best shops near me', 'Am I being overcharged?'];
        break;

      case 'farewell':
        reply = `You're welcome! Hope you get a fair deal on your repair. 🛠️\n\nCome back anytime if you need price checks or shop recommendations!`;
        break;

      case 'help':
        reply = `Here's what I can do for you:\n\n💰 **Price Estimates** — Ask "How much does iPhone battery replacement cost?"\n\n🚨 **Overcharge Check** — Tell me what a shop quoted and I'll compare it to fair market rates\n\n🏪 **Shop Finder** — Ask for the best or nearest repair shops\n\n⭐ **Trust Info** — Ask about shop reliability and trust scores\n\n📋 **Complaints** — Guide you on how to report a bad shop\n\nWhat would you like to know?`;
        suggestions = ['iPhone screen repair cost', 'Best shops near me', 'How to report overcharging'];
        break;

      case 'price':
      case 'price_screen': {
        const issue = intent === 'price_screen' ? 'screen' : 'screen';
        const range = getPriceRange(device, brand, issue);
        const brandLabel = brand === 'default' ? '' : ` ${brand.charAt(0).toUpperCase() + brand.slice(1)}`;
        const deviceLabel = device.charAt(0).toUpperCase() + device.slice(1);
        reply = `💰 **Fair Price Estimate**\n\n${brandLabel} ${deviceLabel} screen repair:\n• Minimum: $${range.min}\n• Average: $${range.avg}\n• Maximum: $${range.max}\n\nIf a shop quotes you more than $${range.max}, that's a red flag! 🚩\n\nWant me to check a specific quote for overcharging?`;
        suggestions = ['Check if my quote is fair', 'Find shops for this repair', 'What about battery replacement?'];
        break;
      }

      case 'price_battery': {
        const range = getPriceRange(device, brand, 'battery');
        const brandLabel = brand === 'default' ? '' : ` ${brand.charAt(0).toUpperCase() + brand.slice(1)}`;
        reply = `🔋 **Battery Replacement Cost**\n\n${brandLabel} ${device} battery:\n• Minimum: $${range.min}\n• Average: $${range.avg}\n• Maximum: $${range.max}\n\nTip: Always ask if they use OEM or third-party batteries. OEM costs more but lasts longer.`;
        suggestions = ['Is $' + (range.max + 30) + ' too much?', 'Find battery repair shops', 'Screen repair cost?'];
        break;
      }

      case 'price_water': {
        const range = getPriceRange(device, brand, 'water_damage');
        reply = `💧 **Water Damage Repair Cost**\n\nThis is one of the trickier repairs:\n• Minimum: $${range.min}\n• Average: $${range.avg}\n• Maximum: $${range.max}\n\n⚠️ Water damage costs vary a lot depending on severity. Get at least 2-3 quotes before committing!`;
        suggestions = ['Find trusted shops', 'What if they quote $250?', 'How to avoid water damage scams'];
        break;
      }

      case 'price_camera': {
        const range = getPriceRange(device, brand, 'camera');
        reply = `📷 **Camera Repair Cost**\n\n${device} camera repair:\n• Minimum: $${range.min}\n• Average: $${range.avg}\n• Maximum: $${range.max}\n\nMake sure they replace with genuine camera modules, not cheap knockoffs.`;
        suggestions = ['Find camera repair shops', 'Check my quote', 'Screen repair cost?'];
        break;
      }

      case 'price_keyboard': {
        const range = getPriceRange('laptop', brand, 'keyboard');
        reply = `⌨️ **Keyboard Repair Cost**\n\nLaptop keyboard repair:\n• Minimum: $${range.min}\n• Average: $${range.avg}\n• Maximum: $${range.max}\n\nSometimes individual key replacement is cheaper than full keyboard — ask the shop!`;
        suggestions = ['Find laptop repair shops', 'Screen repair cost?', 'Battery replacement cost?'];
        break;
      }

      case 'price_software': {
        const range = getPriceRange(device, brand, 'software');
        reply = `💻 **Software Repair Cost**\n\nSoftware issues (virus removal, OS reinstall, etc.):\n• Minimum: $${range.min}\n• Average: $${range.avg}\n• Maximum: $${range.max}\n\n💡 Tip: Many software issues can be fixed for free with online guides. Only pay if it's complex!`;
        suggestions = ['Find software repair shops', 'Hardware repair costs?', 'Find trusted shops'];
        break;
      }

      case 'overcharge': {
        // Try to extract a price from the message
        const priceMatch = message.match(/\$?(\d+)/);
        if (priceMatch) {
          const quotedPrice = parseInt(priceMatch[1]);
          const range = getPriceRange(device, brand, 'screen');
          if (quotedPrice > range.max) {
            const overage = quotedPrice - range.avg;
            reply = `🚨 **Overcharge Alert!**\n\nYou were quoted $${quotedPrice}.\nFair market range: $${range.min}–$${range.max}\n\nYou could be overpaying by ~$${overage}!\n\n✅ What to do:\n1. Get quotes from 2-3 other shops\n2. Use our Shop Finder to find trusted shops\n3. Report this shop if they refuse to negotiate`;
            suggestions = ['Find cheaper shops', 'Report this shop', 'What\'s a fair price?'];
          } else {
            reply = `✅ **Looks Fair!**\n\n$${quotedPrice} is within the fair range ($${range.min}–$${range.max}) for this type of repair.\n\nYou're good to go! Just make sure to ask about warranty on the repair.`;
            suggestions = ['Find shops near me', 'Check another price', 'What warranty should I expect?'];
          }
        } else {
          reply = `🔍 **Overcharge Detection**\n\nTo check if you're being overcharged, tell me:\n1. What device you have (e.g. iPhone, Samsung)\n2. What the repair is (e.g. screen, battery)\n3. What price the shop quoted\n\nExample: "My shop quoted $200 for iPhone screen repair"\n\nOr use the **Price Check** page for a detailed analysis!`;
          suggestions = ['iPhone screen quoted $180', 'Samsung battery quoted $90', 'Go to Price Check page'];
        }
        break;
      }

      case 'recommend': {
        try {
          const shops = await Shop.find({ isFairPriceBadge: true, isFlagged: false }).sort({ trustScore: -1 }).limit(3);
          if (shops.length > 0) {
            reply = `⭐ **Top Recommended Shops**\n\n${shops.map((s, i) => `${i + 1}. **${s.name}** — ${s.city}\n   Trust: ${s.trustScore}% | Rating: ${s.rating}★ | ${s.isFairPriceBadge ? '✅ Fair Price Badge' : ''}`).join('\n\n')}\n\nClick "View Details" on any shop to see full info, reviews, and pricing!`;
          } else {
            reply = `🏪 To find the best shops, head to the **Find Shops** page and:\n• Click "Load Demo Data" to see available shops\n• Sort by Trust Score or Rating\n• Look for the ✅ Fair Price Badge`;
          }
        } catch {
          reply = `Head to the **Find Shops** page to browse trusted repair shops sorted by rating and trust score!`;
        }
        suggestions = ['Find shops near me', 'What is a Fair Price Badge?', 'How are shops rated?'];
        break;
      }

      case 'nearest':
        reply = `📍 **Find Nearest Shops**\n\nTo find the closest repair shop:\n\n1. Go to **Find Shops** page\n2. Click **"Use My Location"** button\n3. Shops will be sorted by distance\n\nOr use **Emergency Mode** on the homepage for instant nearest-shop results! 🚨`;
        suggestions = ['What is Emergency Mode?', 'Best shops in New York', 'Find trusted shops'];
        break;

      case 'trust':
        reply = `🛡️ **Trust Score Explained**\n\nEvery shop has a Trust Score (0–100%) based on:\n\n✅ Positive reviews → score goes up\n❌ Complaints filed → score goes down (-5% each)\n🚩 3+ complaints → shop gets flagged\n🏅 Score ≥ 80% → earns Fair Price Badge\n\nAlways choose shops with 80%+ trust score for the safest experience!`;
        suggestions = ['Find high trust shops', 'How to report a shop?', 'What is Fair Price Badge?'];
        break;

      case 'complaint':
        reply = `📋 **How to Report a Shop**\n\n1. Go to the shop's detail page\n2. Click **"Report Complaint"** button\n3. Select the complaint type:\n   • Overcharging\n   • Fraud / Scam\n   • Poor Service\n   • Fake Parts\n4. Describe what happened\n5. Submit — it affects their trust score immediately!\n\nYour report helps protect other users. 💪`;
        suggestions = ['Find trusted shops instead', 'Check fair prices', 'How trust scores work'];
        break;

      case 'review':
        reply = `⭐ **Leaving a Review**\n\n1. Find the shop on the **Find Shops** page\n2. Click **"View Details"**\n3. Click **"Submit Review"**\n4. Rate 1–5 stars and write your experience\n5. Optionally add device, issue, and price paid\n\nYour review updates the shop's rating instantly and helps others make better decisions!`;
        suggestions = ['Find shops to review', 'Report a bad shop', 'Check fair prices'];
        break;

      default: {
        // Try to give a helpful price response for any unrecognized repair question
        const hasPrice = /\d+/.test(message);
        const range = getPriceRange(device, brand, 'screen');
        if (hasPrice) {
          const priceMatch = message.match(/\$?(\d+)/);
          const quoted = parseInt(priceMatch[1]);
          if (quoted > 10 && quoted < 2000) {
            reply = `🤔 I'm not 100% sure what you're asking, but if you're checking if $${quoted} is fair for a ${brand === 'default' ? '' : brand + ' '}${device} repair — the typical range is $${range.min}–$${range.max}.\n\n${quoted > range.max ? '⚠️ That seems high! Consider getting another quote.' : '✅ That seems reasonable!'}\n\nCan you be more specific about the repair type?`;
          } else {
            reply = `I didn't quite catch that. Could you rephrase? Try asking like:\n• "How much does iPhone screen repair cost?"\n• "Is $150 fair for Samsung battery?"\n• "Find best shops near me"`;
          }
        } else {
          reply = `I'm not sure I understood that. Here are some things I can help with:\n\n💰 Price estimates for repairs\n🚨 Overcharge detection\n🏪 Shop recommendations\n⭐ Trust scores & reviews\n\nTry asking: "How much does a screen repair cost?" or "Find trusted shops near me"`;
        }
        suggestions = ['iPhone screen repair cost', 'Find best shops', 'Am I being overcharged?'];
        break;
      }
    }

    res.json({ reply, suggestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
