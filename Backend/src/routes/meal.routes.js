const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');

// أضيفي هذا السطر ليعرف السيرفر طريق صفحة التتبع
router.get('/meal/progress/:userId', mealController.getProgressData);
router.post('/meal', mealController.createMeal);
router.post('/meal/item', mealController.addFoodToMeal);

router.get('/meal/today/:userId', mealController.getTodayMeals);


// 🔥 أضيفي هذه الأسطر ضروري جداً لتشغيل صفحة الهوم
router.get('/home-data/:userId', mealController.getHomeData);
router.post('/meal/add-suggested', mealController.addSuggestedMeal);
router.get('/meal/:mealId', mealController.getMeal);

module.exports = router;