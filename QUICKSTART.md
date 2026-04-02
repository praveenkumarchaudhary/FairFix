# FairFix - Quick Start Guide

## ✅ What's Already Done

Both servers are currently running:
- **Backend**: http://localhost:5000 ✓
- **Frontend**: http://localhost:3000 ✓
- **Database**: MongoDB connected ✓
- **Demo Data**: Shops and pricing data seeded ✓

## 🚀 Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## 🎯 Try These Features

### 1. Check Fair Price
1. Click "Price Check" in navigation
2. Select: Device → Brand → Issue
3. Click "Get Fair Price"
4. Enter a shop's quoted price to detect overcharging

### 2. Find Repair Shops
1. Click "Find Shops"
2. Click "Use My Location" OR enter "New York"
3. Browse shops sorted by distance/rating/trust
4. Click "View Details" on any shop

### 3. Submit a Review
1. Open any shop detail page
2. Click "Submit Review"
3. Rate and write your experience
4. Submit (updates shop rating automatically)

### 4. Report a Complaint
1. Open any shop detail page
2. Click "Report Complaint"
3. Select complaint type and describe issue
4. Submit (affects shop trust score)

### 5. Emergency Mode
1. Go to homepage
2. Click "Emergency Mode" button
3. See nearest shops instantly

### 6. Create Account
1. Click "Sign Up" in navigation
2. Fill in your details
3. Start using personalized features

## 🔧 If You Need to Restart

### Stop Servers
```powershell
# Stop backend (if needed)
# Press Ctrl+C in the server terminal

# Stop frontend (if needed)
# Press Ctrl+C in the client terminal
```

### Start Backend
```powershell
cd fairfix/server
node index.js
```

### Start Frontend
```powershell
cd fairfix/client
npm run dev
```

## 📊 Test Data Available

- **5 shops** in New York
- **2 shops** in Los Angeles
- **108 price history entries** for various devices
- All shops have different trust scores and price ranges

## 🎨 Features Showcase

### Price Prediction
- Predicts fair prices based on device, brand, and issue
- Shows min, max, and average prices
- Displays confidence level
- Price history chart

### Overcharge Detection
- Compares shop price to fair range
- Shows percentage overcharge
- Warns about suspiciously low prices

### Smart Recommendations
- Filters shops with Fair Price Badge
- Excludes flagged shops
- Shows top 3 best options

### Trust Score System
- Based on reviews and complaints
- Shops get flagged after 3+ complaints
- Fair Price Badge for trusted shops

### Location Features
- Geolocation detection
- Distance calculation
- Sort by distance/rating/trust

## 🐛 Troubleshooting

### MongoDB Connection Error
If you see "MongoDB connection error", the app will still work but without data persistence. To fix:
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Restart the backend server

### Port Already in Use
If port 3000 or 5000 is busy:
```powershell
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📱 Mobile Testing

The app is fully responsive. To test on mobile:
1. Find your local IP: `ipconfig`
2. Update vite.config.js to add `host: true`
3. Restart frontend
4. Access from mobile: `http://YOUR_IP:3000`

## 🎉 Enjoy!

You now have a fully functional repair pricing platform with:
- ✅ Working price prediction
- ✅ Overcharge detection
- ✅ Shop finder with location
- ✅ Reviews and complaints
- ✅ Trust scores
- ✅ Authentication
- ✅ Responsive design
- ✅ All buttons functional
- ✅ Real backend APIs
- ✅ MongoDB database
