const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.login);
// مسار إعادة إرسال الكود المرتبط بزر Sent Again
router.post('/resend-otp', authController.resendOTP);
module.exports = router;