const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food.controller');

router.get('/food', foodController.getAllFood);
router.get('/food/search', foodController.searchFood);
router.get('/units', foodController.getUnits);
router.get('/food/:foodId/units', foodController.getFoodUnits);

module.exports = router;