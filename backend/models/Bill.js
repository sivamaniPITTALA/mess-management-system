const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
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
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  meals: [{
    date: Date,
    mealType: String,
    specials: Number,
    amount: Number
  }],
  mealCount: {
    breakfast: { type: Number, default: 0 },
    lunch: { type: Number, default: 0 },
    dinner: { type: Number, default: 0 }
  },
  specialCount: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  semesterHostelFee: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'PwD'],
    default: 'General'
  },
  isSemesterFeeApplied: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial'],
    default: 'pending'
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    method: String
  }],
  dueAmount: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date
  }
});

module.exports = mongoose.model('Bill', billSchema);
