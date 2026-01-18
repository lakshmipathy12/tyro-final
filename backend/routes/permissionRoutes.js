const express = require('express');
const permissionController = require('../controllers/permissionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

// Employee Routes
router.post('/', permissionController.createPermission);
router.get('/my', permissionController.getMyPermissions);

// Admin Routes
router.get('/all', authMiddleware.restrictTo('Admin', 'HR_Admin'), permissionController.getAllPermissions);
router.patch('/:id/status', authMiddleware.restrictTo('Admin', 'HR_Admin'), permissionController.updatePermissionStatus);

module.exports = router;
