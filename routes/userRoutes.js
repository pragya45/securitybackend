const express = require('express');
const { registerUser, loginUser, getMe, getUsers, changePassword, forgotPassword, renderResetPasswordPage, setNewPassword, verifyTwoFactorCode } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth'); // Ensure 'admin' is imported here

const router = express.Router();

// Register Route
router.post('/register', registerUser);

// Login Route
router.post('/login', loginUser);

// Protected Route to Get User Profile
router.get('/me', protect, getMe);

// Route to get all users (accessible by admin only)
router.get('/', protect, admin, getUsers);

router.post('/verify-2fa', verifyTwoFactorCode);


// Route to change password (protected route)
router.put('/change-password', protect, changePassword);

router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:id/:token', renderResetPasswordPage);
router.post('/reset-password/:id/:token', setNewPassword);

module.exports = router;
