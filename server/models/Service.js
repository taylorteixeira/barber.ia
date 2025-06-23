const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  barbershopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barbershop' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', ServiceSchema);
