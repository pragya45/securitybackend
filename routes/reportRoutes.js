const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  updateReportStatus,
  deleteReport,
} = require('../controllers/reportController');
const { protect, admin, userOrAdmin } = require('../middleware/auth');

router.route('/')
  .post(protect, userOrAdmin, createReport)          // POST /api/reports to create a report (accessible by both users and admins)
  .get(protect, getAllReports);  // GET /api/reports to get all reports (admins get all, users get their own reports)

router.route('/:reportId')
  .put(protect, admin, updateReportStatus)  // PUT /api/reports/:reportId to update a report status (admin only)
  .delete(protect, admin, deleteReport);    // DELETE /api/reports/:reportId to delete a report (admin only)

module.exports = router;
