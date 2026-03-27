const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const auth = require('../middleware/auth');

// Public: Get shops by location
router.get('/location/:locationId', async (req, res) => {
  try {
    const shops = await Shop.find({ 
      locationId: req.params.locationId, 
      isActive: true 
    }).populate('locationId');
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Get single shop
router.get('/:shopId', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId).populate('locationId');
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all shops
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const shops = await Shop.find().populate('locationId');
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create shop
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { name, locationId, phone, upiId, logo } = req.body;
    const shop = new Shop({ name, locationId, phone, upiId, logo });
    await shop.save();
    res.json(shop);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Update shop
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(shop);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Delete shop
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    await Shop.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
