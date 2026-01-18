const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('Admin', 'HR_Admin', 'Manager_Admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/employees', adminController.getAllEmployees);
router.patch('/employees/:id', adminController.updateEmployee);
router.delete('/employees/:id', adminController.deleteEmployee);

module.exports = router;
