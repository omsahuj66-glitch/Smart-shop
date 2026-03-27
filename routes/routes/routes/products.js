const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Public: Get products by shop
router.get('/shop/:shopId', async (req, res) => {
  try {
    const products = await Product.find({ shopId: req.params.shopId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seller: Create product
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can add products' });
    }

    const user = await User.findById(req.user.id);
    if (!user.shopId) {
      return res.status(400).json({ error: 'No shop assigned to this seller' });
    }

    const product = new Product({
      ...req.body,
      shopId: user.shopId
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Seller: Update product
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can update products' });
    }

    const product = await Product.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (product.shopId.toString() !== user.shopId.toString()) {
      return res.status(403).json({ error: 'You can only update your own products' });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Seller: Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can delete products' });
    }

    const product = await Product.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (product.shopId.toString() !== user.shopId.toString()) {
      return res.status(403).json({ error: 'You can only delete your own products' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
