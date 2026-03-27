const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const auth = require('../middleware/auth');

// Public: Get all active locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort('name');
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all locations (including inactive)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const locations = await Location.find().sort('name');
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create location
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { name, type } = req.body;
    const location = new Location({ name, type });
    await location.save();
    res.json(location);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Update location
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(location);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Delete location
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    await Location.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
