const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register); // Protect this later
router.post('/logout', authController.logout);
router.patch('/update-profile', protect, authController.updateProfile);

module.exports = router;
