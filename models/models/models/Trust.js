const mongoose = require('mongoose');

const TrustSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  customerName: { type: String },
  score: { type: Number, default: 5, min: 0, max: 10 },
  totalBookings: { type: Number, default: 0 },
  completedBookings: { type: Number, default: 0 },
  noShows: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Trust', TrustSchema);
