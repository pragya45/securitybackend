const AuditLog = require('../models/auditModel');

// Get All Audit Logs
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ createdAt: -1 }); // Retrieve logs sorted by most recent
        res.status(200).json(logs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
};

// Create a New Audit Log (for manual logging if needed)
const createAuditLog = async (req, res) => {
    const { action, details } = req.body;

    try {
        const log = new AuditLog({
            action,
            details,
            userId: req.user._id, // Assuming req.user is the logged-in user
        });

        const savedLog = await log.save();
        res.status(201).json(savedLog);
    } catch (error) {
        console.error('Error creating audit log:', error);
        res.status(500).json({ message: 'Failed to create audit log' });
    }
};

// Delete an Audit Log (for cleanup purposes)
const deleteAuditLog = async (req, res) => {
    const { id } = req.params;

    try {
        const log = await AuditLog.findByIdAndDelete(id);

        if (!log) {
            return res.status(404).json({ message: 'Audit log not found' });
        }

        res.status(200).json({ message: 'Audit log deleted successfully' });
    } catch (error) {
        console.error('Error deleting audit log:', error);
        res.status(500).json({ message: 'Failed to delete audit log' });
    }
};

// Delete All Audit Logs (for a bulk cleanup if needed)
const deleteAllAuditLogs = async (req, res) => {
    try {
        await AuditLog.deleteMany({});
        res.status(200).json({ message: 'All audit logs deleted successfully' });
    } catch (error) {
        console.error('Error deleting all audit logs:', error);
        res.status(500).json({ message: 'Failed to delete all audit logs' });
    }
};

module.exports = {
    getAuditLogs,
    createAuditLog,
    deleteAuditLog,
    deleteAllAuditLogs,
};
