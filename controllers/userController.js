const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const logActivity = require('../middleware/logActivity');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Strong Password Validation Function
const isStrongPassword = (password) => {
    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/; 
    return strongPasswordPattern.test(password);
};

// Register User
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Username Validation
    if (!/^[A-Za-z]+$/.test(username)) {
        return res.status(400).json({ message: 'Username must contain only letters (no numbers or special characters).' });
    }

    // Email Validation
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password Strength Validation
    if (!isStrongPassword(password)) {
        return res.status(400).json({ message: 'Password must be 8-12 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
        });

        if (user) {
            // Log the user registration activity
            await logActivity('User Registration', `User ${username} registered`, user._id)(req, res, () => { });

            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        await logActivity('Failed Login', `Login attempt failed for email ${email} (user not found)`, null)(req, res, () => { });
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the password is expired
    const passwordAge = Date.now() - user.passwordChangedAt.getTime();
    const maxPasswordAge = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

    if (passwordAge > maxPasswordAge) {
        await logActivity('Failed Login', `Login attempt failed for user ${user.username} due to expired password`, user._id)(req, res, () => { });
        return res.status(403).json({ message: 'Password expired, please reset your password' });
    }

    // Check if the account is locked
    if (user.isLocked()) {
        await logActivity('Failed Login', `Login attempt failed for user ${user.username} due to account lock`, user._id)(req, res, () => { });
        return res.status(403).json({ message: 'Account is locked due to too many failed login attempts. Please try again later.' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= 5) {
            user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // Lock for 2 hours
        }

        await user.save();
        await logActivity('Failed Login', `Login attempt failed for user ${user.username} due to incorrect password`, user._id)(req, res, () => { });
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Generate a new 2FA code and send it via email if 2FA is enabled for the user
    user.twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
    user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
    await user.save();

    // Send the 2FA code via email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Your 2FA Code',
        text: `Your 2FA code is ${user.twoFactorCode}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    await logActivity('2FA Initiated', `2FA code sent to user ${user.username}`, user._id)(req, res, () => { });
    return res.status(200).json({
        userId: user._id,
        message: '2FA code sent to your email. Please verify.',
        twoFactorRequired: true,
    });
};


// Get User Profile
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the activity of viewing the profile
        await logActivity('View Profile', `User ${user.username} viewed their profile`, user._id)(req, res, () => { });

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all users (Admin Only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude the password field

        // Log the activity of an admin viewing all users
        await logActivity('Admin View Users', `Admin ${req.user.username} viewed all users`, req.user._id)(req, res, () => { });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// Change User Password
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the current password is correct
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Check if the new password was used before
        const isPasswordInHistory = await user.isPasswordInHistory(newPassword);
        if (isPasswordInHistory) {
            return res.status(400).json({ message: 'Cannot reuse recent passwords. Please choose a new password.' });
        }

        user.password = newPassword;
        await user.save();

        // Log the activity of changing the password
        await logActivity('Password Change', `User ${user.username} changed password`, user._id)(req, res, () => { });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Please enter email' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET + user.password, { expiresIn: '10m' });
        const resetPasswordExpires = Date.now() + 600000; // 10 minutes

        user.resetPasswordToken = token;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const link = `http://localhost:5000/api/users/reset-password/${user._id}/${token}`;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Link',
            text: `Click the following link to reset your password: ${link}`,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                return res.status(500).json({ message: error.message });
            }

            // Log the activity of initiating a password reset
            await logActivity('Password Reset Initiated', `User ${user.username} requested password reset`, user._id)(req, res, () => { });

            res.status(200).json({ message: 'Password reset link sent successfully' });
        });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Render Reset Password Page
const renderResetPasswordPage = async (req, res) => {
    const { id, token } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const secret = process.env.JWT_SECRET + user.password;
        const isTokenValid = jwt.verify(token, secret);

        if (!isTokenValid || user.resetPasswordToken !== token || Date.now() > user.resetPasswordExpires) {
            return res.status(400).json({ message: 'Password reset link is invalid or has expired' });
        }

        res.render('index', { email: user.email, id, token });

        // Log the activity of viewing the reset password page
        await logActivity('View Reset Password Page', `User ${user.username} viewed reset password page`, user._id)(req, res, () => { });
    } catch (error) {
        console.error('Error rendering reset password page:', error);
        res.status(500).json({ message: 'Password reset link is invalid or has expired' });
    }
};

// Set New Password
const setNewPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password, confirmPassword } = req.body;

    // Log the entire request body to debug
    console.log('Request Body:', req.body);

    // Check if both password and confirmPassword are provided
    if (!password || !confirmPassword) {
        console.log('Password or Confirm Password missing');
        return res.status(400).json({ message: 'Password and confirm password are required' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Verify the token
        const secret = process.env.JWT_SECRET + user.password;
        try {
            jwt.verify(token, secret);
        } catch (err) {
            console.log('Token verification failed:', err);
            return res.status(400).json({ message: 'Password reset link is invalid or has expired' });
        }

        // Hash the new password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Update the user's password and clear the reset token and expiration
        await User.updateOne(
            { _id: id },
            {
                password: encryptedPassword,
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined,
                passwordChangedAt: Date.now() // Update the passwordChangedAt timestamp
            }
        );

        console.log('Password updated successfully');
        // Log the activity of resetting the password
        await logActivity('Password Reset', `User ${user.username} reset their password`, user._id)(req, res, () => { });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error setting new password:', error);
        res.status(500).json({ message: 'Error setting new password' });
    }
};

// Inside your userController.js

// const verifyTwoFactorCode = async (req, res) => {
//     const { userId, twoFactorCode } = req.body;

//     // Find the user by ID
//     const user = await User.findById(userId);

//     if (!user) {
//         return res.status(400).json({ message: 'Invalid user' });
//     }

//     // Check if the 2FA code is correct and not expired
//     if (user.twoFactorExpires < Date.now()) {
//         return res.status(400).json({ message: '2FA code expired' });
//     }

//     if (user.twoFactorCode !== twoFactorCode) {
//         return res.status(400).json({ message: 'Invalid 2FA code' });
//     }

//     // Clear the 2FA code and expiration
//     user.twoFactorCode = undefined;
//     user.twoFactorExpires = undefined;
//     await user.save();

//     // Generate and return a JWT token
//     const token = generateToken(user._id);
//     res.status(200).json({ token, message: 'Login successful' });
// };

const verifyTwoFactorCode = async (req, res) => {
    const { userId, twoFactorCode } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ message: 'Invalid user' });
        }

        // Log the values for debugging
        console.log("Received 2FA Code:", twoFactorCode);
        console.log("Stored 2FA Code:", user.twoFactorCode);
        console.log("Expiry Time:", user.twoFactorExpires);

        // Check if the 2FA code is expired
        if (user.twoFactorExpires < Date.now()) {
            return res.status(400).json({ message: '2FA code expired' });
        }

        // Compare the stored and received 2FA codes as strings
        if (String(user.twoFactorCode) !== String(twoFactorCode)) {
            return res.status(400).json({ message: 'Invalid 2FA code' });
        }

        // Clear the 2FA code and expiration after successful verification
        user.twoFactorCode = undefined;
        user.twoFactorExpires = undefined;
        await user.save();

        // Generate and return a JWT token
        const token = generateToken(user._id);
        res.status(200).json({ token, user, message: 'Login successful' });
    } catch (error) {
        console.error("Error in 2FA verification:", error);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = {
    registerUser,
    loginUser,
    getMe,
    getUsers,
    changePassword,
    forgotPassword,
    renderResetPasswordPage,
    setNewPassword,
    verifyTwoFactorCode
};

