// const Report = require('../models/reportModel');

// // Create a new report
// const createReport = async (req, res) => {
//   try {
//     const { title, description } = req.body;
//     const report = new Report({
//       title,
//       description,
//       createdBy: req.user._id,
//     });
//     await report.save();
//     res.status(201).json(report);
//   } catch (error) {
//     res.status(400).json({ message: 'Failed to create report' });
//   }
// };

// // Get all reports
// const getAllReports = async (req, res) => {
//   try {
//     let reports;

//     if (req.user.role === 'admin') {
//       reports = await Report.find().populate('createdBy', 'name email');
//     } else {
//       reports = await Report.find({ createdBy: req.user._id }).populate('createdBy', 'name email');
//     }

//     res.status(200).json(reports);
//   } catch (error) {
//     res.status(400).json({ message: 'Failed to fetch reports' });
//   }
// };


// // Update report status
// const updateReportStatus = async (req, res) => {
//   try {
//     const { reportId } = req.params;
//     const { status } = req.body;

//     const report = await Report.findById(reportId);
//     if (!report) {
//       return res.status(404).json({ message: 'Report not found' });
//     }

//     report.status = status;
//     await report.save();
//     res.status(200).json(report);
//   } catch (error) {
//     res.status(400).json({ message: 'Failed to update report status' });
//   }
// };

// // Delete a report
// const deleteReport = async (req, res) => {
//   try {
//     const { reportId } = req.params;
//     await Report.findByIdAndDelete(reportId);
//     res.status(200).json({ message: 'Report deleted successfully' });
//   } catch (error) {
//     res.status(400).json({ message: 'Failed to delete report' });
//   }
// };

// module.exports = {
//   createReport,
//   getAllReports,
//   updateReportStatus,
//   deleteReport,
// };
const Report = require('../models/reportModel');
const logActivity = require('../middleware/logActivity'); // Importing the logActivity middleware

// Create a new report
const createReport = async (req, res) => {
  try {
    const { title, description } = req.body;
    const report = new Report({
      title,
      description,
      createdBy: req.user._id,
    });
    await report.save();

    // Log the report creation activity
    await logActivity('Report Created', `Report titled "${title}" was created by ${req.user.username}`, req.user._id)(req, res, () => { });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create report' });
  }
};

// Get all reports
const getAllReports = async (req, res) => {
  try {
    let reports;

    if (req.user.role === 'admin') {
      reports = await Report.find().populate('createdBy', 'username email');
    } else {
      reports = await Report.find({ createdBy: req.user._id }).populate('createdBy', 'username email');
    }

    // Log the activity of fetching all reports
    await logActivity('View Reports', `${req.user.username} viewed their reports`, req.user._id)(req, res, () => { });

    res.status(200).json(reports);
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch reports' });
  }
};

// Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    await report.save();

    // Log the report status update activity
    await logActivity('Report Status Updated', `Report titled "${report.title}" had its status updated to "${status}" by ${req.user.username}`, req.user._id)(req, res, () => { });

    res.status(200).json(report);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update report status' });
  }
};

// Delete a report
const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findByIdAndDelete(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Log the report deletion activity
    await logActivity('Report Deleted', `Report titled "${report.title}" was deleted by ${req.user.username}`, req.user._id)(req, res, () => { });

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete report' });
  }
};

module.exports = {
  createReport,
  getAllReports,
  updateReportStatus,
  deleteReport,
};
