const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  },
  specials: {
    type: Number,
    default: 0
  },
  token: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token'
  },
  rate: {
    type: Number,
    required: true
  },
  specialRate: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meal', mealSchema);
