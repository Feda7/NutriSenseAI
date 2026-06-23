const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');

// نحدد المسار الفرعي ليتطابق مع الـ /api المفعّلة في الـ index.js
router.post('/recommendation/generate', recommendationController.generateRecommendation);

module.exports = router;