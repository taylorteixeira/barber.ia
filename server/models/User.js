const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isBarber: {
    type: Boolean,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    required: false
  },
  barbershop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barbershop',
    required: false, // compatibilidade
  },
  barbershops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barbershop',
    required: false
  }],
  location: {
    type: {
      lat: { type: Number },
      lng: { type: Number }
    },
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
