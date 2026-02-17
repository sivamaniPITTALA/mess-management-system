const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const User = require('../models/User');
const Meal = require('../models/Meal');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

// Generate token for meal
router.post('/generate', auth, async (req, res) => {
  try {
    const { mealType, specials, paymentType } = req.body;
    
    const user = await User.findById(req.user.id).populate('organization', 'messParameters');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isCardActive) {
      return res.status(400).json({ message: 'Card is not active' });
    }

    const org = user.organization;
    const params = org.messParameters;

    // Calculate amount based on meal type
    let rate = 0;
    switch (mealType) {
      case 'breakfast':
        rate = params.dailyBreakfastRate;
        break;
      case 'lunch':
        rate = params.dailyLunchRate;
        break;
      case 'dinner':
        rate = params.dailyDinnerRate;
        break;
    }

    const specialRate = (specials || 0) * params.specialItemRate;
    const totalAmount = rate + specialRate;

    // Generate unique token
    const tokenString = uuidv4();

    const token = new Token({
      token: tokenString,
      user: user._id,
      organization: org._id,
      mealType,
      specials: specials || 0,
      amount: totalAmount,
      paymentStatus: paymentType === 'pay-now' ? 'paid' : 'pending'
    });

    await token.save();

    // Generate QR code
    const qrCode = await QRCode.toDataURL(tokenString);

    res.status(201).json({
      token: token._id,
      tokenString,
      qrCode,
      mealType,
      specials: specials || 0,
      amount: totalAmount,
      paymentStatus: token.paymentStatus,
      expiresAt: token.expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate and use token (admin scan)
router.post('/validate', auth, async (req, res) => {
  try {
    const { tokenString } = req.body;

    const token = await Token.findOne({ token: tokenString })
      .populate('user', 'name studentId category isCardActive')
      .populate('organization', 'name messParameters');

    if (!token) {
      return res.status(404).json({ valid: false, message: 'Token not found' });
    }

    if (token.status === 'used') {
      return res.status(400).json({ 
        valid: false, 
        used: true,
        message: 'Token already used',
        user: token.user,
        mealType: token.mealType,
        usedAt: token.usedAt
      });
    }

    if (token.status === 'expired' || new Date() > token.expiresAt) {
      token.status = 'expired';
      await token.save();
      return res.status(400).json({ valid: false, message: 'Token expired' });
    }

    if (!token.user.isCardActive) {
      return res.status(400).json({ valid: false, message: 'User card is not active' });
    }

    // Mark token as used
    token.status = 'used';
    token.usedAt = new Date();
    await token.save();

    // Record the meal
    const meal = new Meal({
      user: token.user._id,
      organization: token.organization._id,
      mealType: token.mealType,
      specials: token.specials,
      token: token._id,
      rate: token.amount - (token.specials * token.organization.messParameters.specialItemRate),
      specialRate: token.specials * token.organization.messParameters.specialItemRate,
      totalAmount: token.amount
    });

    await meal.save();

    res.json({
      valid: true,
      user: {
        id: token.user._id,
        name: token.user.name,
        studentId: token.user.studentId,
        category: token.user.category
      },
      mealType: token.mealType,
      specials: token.specials,
      amount: token.amount,
      message: 'Token validated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's active tokens
router.get('/my-tokens', auth, async (req, res) => {
  try {
    const tokens = await Token.find({ 
      user: req.user.id,
      status: 'active'
    }).populate('organization', 'name');

    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get token by string (for QR lookup)
router.get('/lookup/:tokenString', async (req, res) => {
  try {
    const token = await Token.findOne({ token: req.params.tokenString })
      .populate('user', 'name studentId category')
      .populate('organization', 'name');

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    res.json({
      token: token.token,
      user: token.user,
      mealType: token.mealType,
      specials: token.specials,
      amount: token.amount,
      status: token.status,
      generatedAt: token.generatedAt,
      expiresAt: token.expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
