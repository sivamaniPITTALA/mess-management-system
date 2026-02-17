const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

organizationSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

organizationSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Organization', organizationSchema);
