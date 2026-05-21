const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');

// 📊 مسارات صفحة التتبع والإحصائيات
router.get('/meal/progress/:userId', mealController.getProgressData);

// 🍽️ مسارات التحكم بالوجبات والأصناف
router.post('/meal', mealController.createMeal);
router.post('/meal/item', mealController.addFoodToMeal);
router.get('/meal/today/:userId', mealController.getTodayMeals);
router.get('/meal/:mealId', mealController.getMeal);

// 🔥 مسارات صفحة الهوم والمقترحات
router.get('/home-data/:userId', mealController.getHomeData);
router.post('/meal/add-suggested', mealController.addSuggestedMeal);

// 🛠️ المسارات المنقولة من الملف القديم (للوحة التحكم أو العمليات العامة)
router.get('/', mealController.getMeals);          // جلب كل وجبات النظام
router.delete('/:id', mealController.deleteMeal);   // حذف وجبة معينة

module.exports = router;