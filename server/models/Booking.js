const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  barberName: String,
  barberImage: String,
  service: String,
  date: String,
  time: String,
  price: Number,
  status: { type: String, enum: ['confirmed', 'completed', 'cancelled'], default: 'confirmed' },
  address: String,
  phone: String,
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
