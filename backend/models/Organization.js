const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
  address: {
    type: String
  },
  messParameters: {
    dailyBreakfastRate: {
      type: Number,
      default: 50
    },
    dailyLunchRate: {
      type: Number,
      default: 100
    },
    dailyDinnerRate: {
      type: Number,
      default: 100
    },
    semesterHostelFee: {
      type: Number,
      default: 500
    },
    specialItemRate: {
      type: Number,
      default: 30
    },
    basicMonthlyCharge: {
      type: Number,
      default: 2000
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Organization', organizationSchema);
