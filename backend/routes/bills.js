const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Meal = require('../models/Meal');
const User = require('../models/User');
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');

router.get('/my-bills', auth, async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user.id })
      .populate('organization', 'name')
      .sort({ generatedAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/current', auth, async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const bill = await Bill.findOne({ 
      user: req.user.id,
      month,
      year
    }).populate('organization', 'name messParameters');

    if (!bill) {
      const user = await User.findById(req.user.id).populate('organization', 'messParameters');
      const meals = await Meal.find({
        user: req.user.id,
        timestamp: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1)
        }
      });

      const newBill = await generateBill(user, meals, month, year);
      return res.json(newBill);
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/generate/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;
    const user = await User.findById(req.user.id).populate('organization', 'messParameters');
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const meals = await Meal.find({
      user: req.user.id,
      timestamp: {
        $gte: startDate,
        $lt: endDate
      }
    });

    const bill = await generateBill(user, meals, parseInt(month), parseInt(year));
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/pay', auth, async (req, res) => {
  try {
    const { billId, amount, method } = req.body;
    
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    bill.paymentHistory.push({
      amount,
      date: new Date(),
      method
    });

    const totalPaid = bill.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    
    if (totalPaid >= bill.total) {
      bill.paymentStatus = 'paid';
      bill.paidAt = new Date();
    } else {
      bill.paymentStatus = 'partial';
    }

    bill.dueAmount = bill.total - totalPaid;
    await bill.save();

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    
    if (month && year) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    }

    const bills = await Bill.find(query)
      .populate('user', 'name studentId category')
      .populate('organization', 'name')
      .sort({ generatedAt: -1 });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function generateBill(user, meals, month, year) {
  const org = user.organization;
  const params = org.messParameters;

  let mealCount = { breakfast: 0, lunch: 0, dinner: 0 };
  let specialCount = 0;
  let subtotal = 0;

  meals.forEach(meal => {
    if (meal.mealType === 'breakfast') mealCount.breakfast++;
    if (meal.mealType === 'lunch') mealCount.lunch++;
    if (meal.mealType === 'dinner') mealCount.dinner++;
    specialCount += meal.specials;
    subtotal += meal.totalAmount;
  });

  // Check if 6th month - apply semester hostel fee
  const currentMonth = month;
  let semesterHostelFee = 0;
  let isSemesterFeeApplied = false;

  const semesterMonths = [6, 12];
  const category = user.category;

  if (semesterMonths.includes(currentMonth)) {
    if (category === 'General' || category === 'OBC') {
      semesterHostelFee = params.semesterHostelFee;
      isSemesterFeeApplied = true;
    } else if (category === 'SC' || category === 'ST' || category === 'PwD') {
      semesterHostelFee = 0;
      isSemesterFeeApplied = true;
    }
  }

  const total = subtotal + semesterHostelFee;

  // Check if bill already exists
  let bill = await Bill.findOne({
    user: user._id,
    month,
    year
  });

  if (bill) {
    bill.meals = meals.map(m => ({
      date: m.timestamp,
      mealType: m.mealType,
      specials: m.specials,
      amount: m.totalAmount
    }));
    bill.mealCount = mealCount;
    bill.specialCount = specialCount;
    bill.subtotal = subtotal;
    bill.semesterHostelFee = semesterHostelFee;
    bill.total = total;
    bill.isSemesterFeeApplied = isSemesterFeeApplied;
    bill.category = category;
  } else {
    bill = new Bill({
      user: user._id,
      organization: org._id,
      month,
      year,
      meals: meals.map(m => ({
        date: m.timestamp,
        mealType: m.mealType,
        specials: m.specials,
        amount: m.totalAmount
      })),
      mealCount,
      specialCount,
      subtotal,
      semesterHostelFee,
      total,
      category,
      isSemesterFeeApplied,
      dueAmount: total
    });
  }

  await bill.save();
  return bill;
}

module.exports = router;
