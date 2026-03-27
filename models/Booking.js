const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'ready', 'completed', 'cancelled'], default: 'pending' },
  trustScoreSnapshot: { type: Number, default: 5 },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

BookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'BK-' + Date.now().toString(36).toUpperCase() + 
                     Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
