const express = require('express');
const router = express.Router();
const { register, verifyOTP, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
// Profile routes: authenticated users can view and update their own profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;