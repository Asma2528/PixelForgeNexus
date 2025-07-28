const express = require('express');
const router = express.Router(); 
const {
  verifyToken,
  authorizeRoles,
} = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');
const {
  registerUser,
  loginUser,
  verifyOtp,
  getAllUsers,
  updateUser,
  requestPasswordReset, resetPassword 
} = require('../controllers/authController');

// Admin registers new users
router.post('/register', registerUser);

// User login
router.post('/login', loginLimiter, loginUser);

// OTP verification
router.post('/verify-otp', verifyOtp);

// Admin routes to get all users and update user details
router.get('/users', verifyToken, authorizeRoles('admin'), getAllUsers);

router.put('/users/:userId', verifyToken, authorizeRoles('admin'), updateUser);

// Request password reset
router.post('/request-password-reset', requestPasswordReset); 

// Reset password using token
router.post('/reset-password', resetPassword); 

module.exports = router;
