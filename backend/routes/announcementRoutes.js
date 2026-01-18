const express = require('express');
const announcementController = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', announcementController.getAnnouncements);
router.post('/', authMiddleware.restrictTo('Admin', 'HR_Admin'), announcementController.createAnnouncement);

module.exports = router;
