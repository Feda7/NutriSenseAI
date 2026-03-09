const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// المسارات الحالية
router.post('/user', userController.createUser);
router.get('/user/:id', userController.getUser);
router.put('/user/:id', userController.updateUser);

// المسار الجديد لتحديث السعرات اليومية بناءً على حسبة النظام
// سيتم استدعاؤه من الفرونت اند عند انتهاء الحسبة
router.put('/update-calories', userController.updateDailyCalories);

module.exports = router;