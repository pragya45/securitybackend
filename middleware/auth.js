const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user from the database
            req.user = await User.findById(decoded.id).select('-password');

            console.log('Decoded Token:', decoded);
            console.log('Authenticated User:', req.user);

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('Token error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log('No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to check admin role
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

// Middleware to check if the user is either an admin or a regular user
const userOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized' });
    }
};

module.exports = { protect, admin, userOrAdmin };
