const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Trust = require('../models/Trust');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Customer: Create booking
router.post('/', async (req, res) => {
  try {
    const { shopId, productId, quantity, customerName, phone } = req.body;

    // Get trust score
    let trust = await Trust.findOne({ phone });
    if (!trust) {
      trust = new Trust({ phone, customerName, score: 5 });
      await trust.save();
    } else {
      trust.customerName = customerName;
      await trust.save();
    }

    // Create booking
    const booking = new Booking({
      shopId,
      productId,
      quantity,
      customerName,
      phone,
      trustScoreSnapshot: trust.score,
      expiresAt: new Date(Date.now() + 45 * 60 * 1000)
    });
    await booking.save();

    // Update trust totalBookings
    trust.totalBookings += 1;
    await trust.save();

    res.json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Seller: Get own bookings
router.get('/seller/mine', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id);
    if (!user.shopId) {
      return res.json([]);
    }

    const bookings = await Booking.find({ shopId: user.shopId })
      .populate('productId')
      .sort('-createdAt');
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seller: Update booking status
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    const user = await User.findById(req.user.id);
    if (booking.shopId.toString() !== user.shopId.toString()) {
      return res.status(403).json({ error: 'Not your booking' });
    }

    booking.status = status;
    await booking.save();

    // Update trust score on completion
    if (status === 'completed') {
      const trust = await Trust.findOne({ phone: booking.phone });
      if (trust) {
        trust.completedBookings += 1;
        trust.score = Math.min(10, trust.score + 1);
        await trust.save();
      }
    }

    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Get all bookings
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { status, shopId, limit = 100 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (shopId) filter.shopId = shopId;

    const bookings = await Booking.find(filter)
      .populate('shopId')
      .populate('productId')
      .sort('-createdAt')
      .limit(parseInt(limit));
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'cancelled';
    await booking.save();

    // Update trust (no-show penalty)
    const trust = await Trust.findOne({ phone: booking.phone });
    if (trust && booking.status !== 'completed') {
      trust.noShows += 1;
      trust.score = Math.max(0, trust.score - 2);
      await trust.save();
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
