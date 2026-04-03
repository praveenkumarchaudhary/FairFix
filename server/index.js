const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/predict', require('./routes/predict'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/ai', require('./routes/ai'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Start server anyway for demo purposes
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} (no DB)`);
    });
  });

module.exports = app;
