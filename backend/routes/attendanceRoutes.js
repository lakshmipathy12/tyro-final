const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect); // All routes below are protected

router.get('/today', attendanceController.getTodayAttendance);
router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);

router.get('/daily-report', authMiddleware.restrictTo('Admin', 'HR_Admin'), attendanceController.getDailyReport);

// Admin routes (Placeholder for future)
// router.get('/daily-report', authMiddleware.restrictTo('Admin', 'HR_Admin'), attendanceController.getDailyReport);

module.exports = router;
