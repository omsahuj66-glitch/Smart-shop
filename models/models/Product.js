const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  unit: { type: String, required: true },
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
