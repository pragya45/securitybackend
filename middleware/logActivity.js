const AuditLog = require('../models/auditModel');

// Middleware for logging audit logs
const logActivity = (action, details, userId = null) => {
    return async (req, res, next) => {
        try {
            const idToUse = userId || (req.user && req.user._id);

            if (!idToUse) {
                throw new Error('User not authenticated or userId not provided');
            }

            await AuditLog.create({
                userId: idToUse, // Use provided userId or req.user._id
                action: action,
                details: details,
                timestamp: Date.now(),
            });

            next();
        } catch (error) {
            console.error('Error logging audit log:', error);
            next(error);
        }
    };
};

module.exports = logActivity;
