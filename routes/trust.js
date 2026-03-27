const express = require('express');
const router = express.Router();
const Trust = require('../models/Trust');
const auth = require('../middleware/auth');

// Admin only
router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
});

// Get all trust scores
router.get('/', async (req, res) => {
  try {
    const trust = await Trust.find().sort('-score');
    res.json(trust);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset trust score
router.put('/:id/reset', async (req, res) => {
  try {
    const trust = await Trust.findByIdAndUpdate(
      req.params.id,
      { score: 5 },
      { new: true }
    );
    res.json(trust);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
