const express = require('express');
const { getAuditLogs, createAuditLog, deleteAuditLog, deleteAllAuditLogs } = require('../controllers/auditController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/audit-logs')
    .get(protect, admin, getAuditLogs)    // Get all audit logs
    .post(protect, admin, createAuditLog); // Create a new audit log (manual)

router.route('/audit-logs/:id')
    .delete(protect, admin, deleteAuditLog); // Delete a specific audit log

router.route('/audit-logs/clear')
    .delete(protect, admin, deleteAllAuditLogs); // Delete all audit logs

module.exports = router;
