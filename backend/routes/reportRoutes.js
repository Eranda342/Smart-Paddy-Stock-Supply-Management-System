const express = require('express');
const { emailReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/email', protect, emailReport);

module.exports = router;
