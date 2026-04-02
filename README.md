# FairFix – Transparent Repair Pricing Platform

A modern, full-stack web application that helps users find fair repair prices and trusted repair shops using AI-powered price prediction and community-driven trust scores.

## Features

### Core Features
- **Price Prediction**: ML-based fair price estimates for device repairs
- **Overcharge Detection**: Instant alerts when shops charge above fair market rates
- **Location-Based Shop Finder**: Find nearby repair shops with distance calculation
- **Trust Scores**: Community-verified ratings and trust metrics
- **Review System**: Submit and read reviews for repair shops
- **Complaint System**: Report overcharging and fraud
- **Price History**: Track repair price trends over time
- **Emergency Mode**: Quick access to nearest available shops

### Advanced Features
- Fair Price Badge for trusted shops
- Fraud detection and shop flagging
- Crowd-sourced pricing updates
- Smart recommendations (best/cheapest/nearest)
- Responsive design (mobile + desktop)

## Tech Stack

- **Frontend**: React.js + Vite, React Router, Recharts, Axios, React Hot Toast, Lucide Icons
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **ML**: Price prediction algorithm with historical data learning

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)

### Setup

1. **Install MongoDB** (if not installed):
   - Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Backend Setup**:
```bash
cd fairfix/server
npm install
# Update .env if needed (MongoDB URI, JWT secret)
npm start
```

3. **Frontend Setup**:
```bash
cd fairfix/client
npm install
npm run dev
```

4. **Access the app**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Usage

### First Time Setup
1. Open http://localhost:3000
2. Go to "Find Shops" page
3. Click "Load Demo Data" to seed sample shops and pricing data
4. Now you can explore all features!

### Key Workflows

**Check Fair Price**:
1. Go to "Price Check" page
2. Select device, brand, and issue
3. Click "Get Fair Price"
4. Enter shop's quoted price to detect overcharging

**Find Repair Shops**:
1. Go to "Find Shops"
2. Click "Use My Location" or enter city name
3. Browse shops sorted by distance/rating/trust
4. Click "View Details" on any shop

**Submit Review**:
1. Open any shop detail page
2. Click "Submit Review"
3. Rate and write your experience
4. Submit (updates shop rating automatically)

**Report Complaint**:
1. Open shop detail page
2. Click "Report Complaint"
3. Select complaint type and describe issue
4. Submit (affects shop trust score)

**Emergency Mode**:
1. Click "Emergency Mode" on homepage
2. Instantly see nearest shops sorted by distance

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in

### Price Prediction
- `POST /api/predict` - Get fair price estimate
- `POST /api/predict/report` - Report actual price paid

### Shops
- `GET /api/shops` - List shops (with location filtering)
- `GET /api/shops/:id` - Get shop details
- `POST /api/shops/seed` - Seed demo shops

### Reviews
- `GET /api/reviews/shop/:shopId` - Get shop reviews
- `POST /api/reviews` - Submit review

### Complaints
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints/shop/:shopId` - Get shop complaints

### Pricing
- `GET /api/pricing/history` - Get price history
- `POST /api/pricing/seed` - Seed price history

## Project Structure

```
fairfix/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ShopCard.jsx
│   │   │   ├── ReviewModal.jsx
│   │   │   └── ComplaintModal.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── PricePredict.jsx
│   │   │   ├── ShopFinder.jsx
│   │   │   ├── ShopDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── context/       # React context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/         # Utilities
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── server/                # Node.js backend
    ├── models/            # MongoDB models
    │   ├── User.js
    │   ├── Shop.js
    │   ├── Review.js
    │   ├── Complaint.js
    │   └── PriceHistory.js
    ├── routes/            # API routes
    │   ├── auth.js
    │   ├── shops.js
    │   ├── predict.js
    │   ├── reviews.js
    │   ├── complaints.js
    │   └── pricing.js
    ├── middleware/
    │   └── auth.js
    ├── index.js
    ├── .env
    └── package.json
```

## Features Explained

### Price Prediction Algorithm
- Uses historical pricing data from multiple sources
- Considers device type, brand, and issue
- Adjusts predictions based on crowd-sourced reports
- Provides confidence levels based on data availability

### Trust Score System
- Starts at 50% for new shops
- Increases with positive reviews
- Decreases with complaints (5% per complaint)
- Shops with 3+ complaints get flagged
- Shops with trust < 70% lose Fair Price Badge

### Overcharge Detection
- Compares shop price to predicted fair range
- Alerts if price > max fair price
- Shows percentage overcharge
- Warns about suspiciously low prices (possible fake parts)

### Smart Recommendations
- Filters shops with Fair Price Badge
- Excludes flagged shops
- Prioritizes high trust scores
- Shows top 3 best options

## License

MIT License - Free to use and modify
