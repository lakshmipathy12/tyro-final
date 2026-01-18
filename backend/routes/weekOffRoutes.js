const express = require('express');
const weekOffController = require('../controllers/weekOffController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('Admin', 'HR_Admin'));

router.get('/', weekOffController.getWeekOffs);
router.post('/', weekOffController.assignWeekOff);
router.delete('/:id', weekOffController.deleteWeekOff);

module.exports = router;
