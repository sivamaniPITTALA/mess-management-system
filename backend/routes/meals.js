const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const auth = require('../middleware/auth');

// Get user's meal history
router.get('/my-meals', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user.id };
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const meals = await Meal.find(query)
      .populate('organization', 'name')
      .sort({ timestamp: -1 });

    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get meals by date (admin)
router.get('/by-date', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      timestamp: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .populate('user', 'name studentId category')
    .populate('organization', 'name')
    .sort({ timestamp: -1 });

    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get meal statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const meals = await Meal.find({
      user: req.user.id,
      timestamp: {
        $gte: startDate,
        $lt: endDate
      }
    });

    const stats = {
      totalMeals: meals.length,
      breakfast: meals.filter(m => m.mealType === 'breakfast').length,
      lunch: meals.filter(m => m.mealType === 'lunch').length,
      dinner: meals.filter(m => m.mealType === 'dinner').length,
      totalSpecials: meals.reduce((sum, m) => sum + m.specials, 0),
      totalAmount: meals.reduce((sum, m) => sum + m.totalAmount, 0)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
