const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');

router.post('/meal', mealController.createMeal);
router.post('/meal/item', mealController.addFoodToMeal);
router.get('/meal/:mealId', mealController.getMeal);
router.get('/meal/today/:userId', mealController.getTodayMeals);

// 🔥 أضيفي هذه الأسطر ضروري جداً لتشغيل صفحة الهوم
router.get('/home-data/:userId', mealController.getHomeData);
router.post('/meal/add-suggested', mealController.addSuggestedMeal);

module.exports = router;