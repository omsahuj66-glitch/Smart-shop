const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Shop = require('../models/Shop');
const Location = require('../models/Location');
const Booking = require('../models/Booking');
const Trust = require('../models/Trust');
const auth = require('../middleware/auth');

// Admin middleware
router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalShops = await Shop.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeLocations = await Location.countDocuments({ isActive: true });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const sellers = await User.countDocuments({ role: 'seller' });
    
    res.json({
      totalShops,
      totalBookings,
      activeLocations,
      pendingBookings,
      sellers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all sellers
router.get('/sellers', async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).populate('shopId');
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create seller
router.post('/sellers', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const seller = new User({ name, email, phone, password, role: 'seller' });
    await seller.save();
    res.json(seller);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Block/Unblock seller
router.put('/sellers/:id/block', async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    seller.isBlocked = !seller.isBlocked;
    await seller.save();
    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign shop to seller
router.put('/sellers/:id/assign-shop', async (req, res) => {
  try {
    const { shopId } = req.body;
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { shopId },
      { new: true }
    ).populate('shopId');
    res.json(seller);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reset seller password
router.put('/sellers/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const seller = await User.findById(req.params.id);
    seller.password = newPassword;
    await seller.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
